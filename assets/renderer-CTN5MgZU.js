const Ee=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,Le=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uPose;      // yaw, pitch, roll (radians)
uniform float uBob;
uniform float uPop;
uniform float uEdge;
uniform int uSteps;
uniform int uShadowSteps;

uniform sampler2D uObvAlb;
uniform sampler2D uObvHgt;
uniform sampler2D uObvEmi;
uniform sampler2D uRevAlb;
uniform sampler2D uRevHgt;
uniform sampler2D uRevEmi;
uniform sampler2D uTitle;

const float R = 1.62;
const float HALF_T = 0.145;
// Conservative bound of every displaced feature: relief and lettering rise at
// most ~0.103 above the face, reeds and wire rings push the rim out ~0.018, and
// the rounded chamfer adds 0.014.
const float BOUND_R = R + 0.05;
const float BOUND_Z = HALF_T + 0.14;
const float FOCAL = 1.35;
const vec3 CAM = vec3(0.0, 0.0, 4.9);
const float FLOOR_Y = -1.78;
const float DISC_R = 1.55;
const float EPS = 0.0008;
const float ALB_SIZE = 1024.0;

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0, -s, 0, 1, 0, s, 0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1, 0, 0, 0, c, -s, 0, s, c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, -s, 0, s, c, 0, 0, 0, 1); }

float gauss(float x) { return exp(-(x * x)); }

float sdCappedCyl(vec3 p, float rad, float halfH) {
  vec2 d = vec2(length(p.xy) - rad, abs(p.z) - halfH);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float reliefFront(vec2 uv) {
  float baseH = textureLod(uObvHgt, uv, 1.5).r;
  float tv = textureLod(uTitle, uv, 0.0).r;
  return (baseH - 0.35) * 0.085 + tv * 0.048 * uPop;
}

float reliefBack(vec2 uv) {
  vec2 buv = vec2(1.0 - uv.x, uv.y);
  float baseH = textureLod(uRevHgt, buv, 1.5).r;
  float tv = textureLod(uTitle, buv, 0.0).r;
  return (baseH - 0.35) * 0.085 + tv * 0.048 * uPop;
}

// Signed distance to the sculpted medallion in local coin space.
float mapCoin(vec3 p) {
  float r = length(p.xy);
  float az = abs(p.z);

  // Far from the coin: distance to a capped cylinder that contains every
  // displaced feature. Always a lower bound, so it never oversteps.
  if (r - R > 0.12 || az > HALF_T + 0.16) {
    return sdCappedCyl(p, R + 0.035, HALF_T + 0.125);
  }

  vec2 uv = p.xy / (2.0 * R) + 0.5;
  float disp = 0.0;
  if (r <= R) {
    float taper = 1.0 - smoothstep(R - 0.045, R, r);
    disp = (p.z >= 0.0 ? reliefFront(uv) : reliefBack(uv)) * taper;
  }

  // Edge knurling (144 reeds), equatorial trench, and wire rings.
  float ang = atan(p.y, p.x);
  float reedBand = smoothstep(0.032, 0.046, az) * (1.0 - smoothstep(HALF_T - 0.018, HALF_T, az));
  float reeds = sin(ang * 144.0) * 0.0085 * reedBand;
  float trench = -gauss(p.z / 0.026) * 0.018;
  float wireRings = gauss((az - 0.034) / 0.007) * 0.009;

  float effR = R + reeds + trench + wireRings;
  vec2 q = vec2(r - effR, az - (HALF_T + disp));
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - 0.014;
}

// Tetrahedral 4-tap gradient.
vec3 calcNormal(vec3 p) {
  const float h = 0.0022;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * mapCoin(p + k.xyy * h) +
    k.yyx * mapCoin(p + k.yyx * h) +
    k.yxy * mapCoin(p + k.yxy * h) +
    k.xxx * mapCoin(p + k.xxx * h));
}

float softShadow(vec3 ro, vec3 rd) {
  float res = 1.0;
  float t = 0.02;
  for (int i = 0; i < 18; i++) {
    if (i >= uShadowSteps) break;
    float h = mapCoin(ro + rd * t);
    res = min(res, 9.0 * h / t);
    t += clamp(h, 0.012, 0.06);
    if (res < 0.05 || t > 0.7) break;
  }
  return clamp(res, 0.12, 1.0);
}

vec3 studioEnv(vec3 dir) {
  float v = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(vec3(0.02, 0.018, 0.016), vec3(0.07, 0.06, 0.05), gauss((v - 0.5) / 0.16));
  // Overhead champagne softbox
  col += vec3(1.65, 1.28, 0.88) * pow(max(0.0, dot(dir, normalize(vec3(-0.35, 0.82, 0.45)))), 7.0);
  // Crisp copper side strip
  col += vec3(1.45, 0.86, 0.44) * pow(max(0.0, dot(dir, normalize(vec3(0.82, 0.18, 0.54)))), 14.0);
  // Cool silver rim strip
  col += vec3(0.62, 0.84, 1.10) * pow(max(0.0, dot(dir, normalize(vec3(-0.85, 0.28, -0.45)))), 10.0);
  // Warm amber bounce
  col += vec3(0.95, 0.46, 0.14) * pow(max(0.0, dot(dir, normalize(vec3(0.1, -0.78, 0.60)))), 8.0);
  return col;
}

vec3 shadeCoin(vec3 p, vec3 nLocal, mat3 coinToWorld, vec3 rdWorld, float t) {
  float r = length(p.xy);
  float az = abs(p.z);
  vec2 uv = p.xy / (2.0 * R) + 0.5;

  vec3 N = normalize(coinToWorld * nLocal);
  vec3 V = -rdWorld;
  float NoV = max(dot(N, V), 0.001);

  // Explicit LOD from the pixel footprint on the face (albedo/title are 1024,
  // emissive maps are 512, so they sit one level lower).
  float footprint = t / (uRes.y * FOCAL);
  float texels = footprint / (2.0 * R) * ALB_SIZE / max(NoV, 0.25);
  float lodA = max(log2(max(texels, 1e-4)), 0.0);
  float lodE = max(lodA - 1.0, 0.0);

  vec3 albedo = vec3(0.72, 0.43, 0.21);
  float metal = 0.94;
  float rough = 0.20;
  float marble = 0.0;
  vec3 emiss = vec3(0.0);

  float faceRimMask = (1.0 - smoothstep(R - 0.018, R - 0.004, r)) * smoothstep(HALF_T - 0.028, HALF_T - 0.008, az);
  if (faceRimMask > 0.001) {
    float tv;
    float hSample;
    if (p.z > 0.0) {
      albedo = pow(textureLod(uObvAlb, uv, lodA).rgb, vec3(2.2));
      emiss  = pow(textureLod(uObvEmi, uv, lodE).rgb, vec3(2.0)) * 1.45;
      hSample = textureLod(uObvHgt, uv, 0.5).r;
      tv = textureLod(uTitle, uv, lodA).r;
    } else {
      vec2 buv = vec2(1.0 - uv.x, uv.y);
      albedo = pow(textureLod(uRevAlb, buv, lodA).rgb, vec3(2.2));
      emiss  = pow(textureLod(uRevEmi, buv, lodE).rgb, vec3(2.0)) * 1.45;
      hSample = textureLod(uRevHgt, buv, 0.5).r;
      tv = textureLod(uTitle, buv, lodA).r;
    }
    float lum = dot(albedo, vec3(0.299, 0.587, 0.114));
    // Normalized chromaticity is stable across the marble's lit and shadowed
    // veins. On the reverse face, height-assisted feathering prevents dark
    // background texel bleed at the sharp outer tips of the white marble wings.
    float sat = (albedo.r - albedo.b) / max(max(albedo.r, albedo.g), 0.045);
    float stoneH = (p.z < 0.0) ? smoothstep(0.56, 0.78, hSample) * (1.0 - smoothstep(0.32, 0.52, sat)) : 0.0;
    float warmMetal = smoothstep(0.28, 0.38, sat) * smoothstep(0.018, 0.075, lum) * (1.0 - stoneH * 0.85);
    marble = max((1.0 - smoothstep(0.28, 0.38, sat)) * smoothstep(0.035, 0.20, lum), stoneH);
    metal = mix(mix(0.18, 0.93, warmMetal), 0.04, marble);
    rough = mix(mix(0.52, 0.21, warmMetal), 0.24, marble);
    // Preserve Carrara grey veins while lifting anti-aliased wing-tip edges cleanly.
    vec3 stoneTint = mix(albedo * vec3(1.025, 1.01, 0.98) + vec3(0.018), max(albedo, vec3(0.58, 0.56, 0.52)), stoneH * 0.65);
    albedo = mix(albedo, stoneTint, marble);

    // Raised "THE HARNESS LAB" lettering with a chiselled shadow halo.
    float shadowHalo = smoothstep(0.02, 0.28, tv) * (1.0 - smoothstep(0.28, 0.55, tv));
    albedo *= (1.0 - 0.72 * shadowHalo);
    emiss += vec3(0.45, 0.16, 0.02) * shadowHalo * uPop * 0.55;
    if (tv > 0.30) {
      float faceMask = smoothstep(0.30, 0.72, tv);
      vec3 letterCol = mix(vec3(0.95, 0.42, 0.12), vec3(1.00, 0.78, 0.34), smoothstep(0.55, 0.90, tv));
      albedo = mix(albedo, letterCol, faceMask);
      metal = mix(metal, 0.99, faceMask);
      rough = mix(rough, 0.08, faceMask);
      marble *= 1.0 - faceMask;
      emiss += letterCol * 0.18 * uPop * faceMask;
    }
    // Smoothly blend the outer face edge into the machined copper rim bevel.
    albedo = mix(vec3(0.86, 0.52, 0.22), albedo, faceRimMask);
    metal = mix(0.97, metal, faceRimMask);
    rough = mix(0.13, rough, faceRimMask);
    marble *= faceRimMask;
    emiss *= faceRimMask;
  } else {
    // Machined edge: chamfer rings, reeds, and the glowing equatorial trench.
    float ang = atan(p.y, p.x);
    if (az < 0.028) {
      albedo = vec3(0.03, 0.03, 0.035);
      metal = 0.4; rough = 0.35;
      float seg = pow(max(0.0, cos(ang * 18.0)), 8.0);
      float pulse = 0.55 + 0.65 * (0.5 + 0.5 * sin(ang * 2.0 - uTime * 3.2));
      bool sapphireNode = mod(floor((ang + 3.14159265) / (6.2831853 / 36.0) + 0.5), 9.0) < 0.5;
      // Sapphire #8FD3FF in linear light, slightly boosted; copper otherwise.
      vec3 glowCol = sapphireNode ? vec3(0.32, 0.78, 1.15) : vec3(1.35, 0.55, 0.09);
      emiss = glowCol * seg * pulse * uEdge * 1.4;
    } else {
      albedo = vec3(0.86, 0.52, 0.22);
      metal = 0.97; rough = 0.13;
    }
  }

  vec3 Rdir = reflect(-V, N);
  vec3 L1 = normalize(vec3(-0.55, 0.64, 0.54));
  vec3 L1Local = normalize(transpose(coinToWorld) * L1);
  float sh = softShadow(p + nLocal * 0.005, L1Local);
  // Broad subsurface fill on Carrara, without flattening the metal's cavities.
  sh = mix(sh, 0.72 + 0.28 * sh, marble);
  vec3 L2 = normalize(vec3(0.72, 0.35, -0.60));
  vec3 L3 = normalize(vec3(sin(uTime * 1.1) * 0.55, -0.52, 0.65)); // grazing glint

  vec3 F0 = mix(vec3(0.04), albedo, metal);
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - NoV, 5.0);

  vec3 envSpec = studioEnv(Rdir) * mix(1.25, 0.45, rough);
  vec3 diffAmb = mix(vec3(0.10, 0.085, 0.075), vec3(0.19, 0.18, 0.16), marble) * albedo * (1.0 - metal);

  float specPow = mix(180.0, 14.0, rough * rough);
  vec3 H1 = normalize(L1 + V);
  float NoL1 = max(dot(N, L1), 0.0) * sh;
  float wrapL1 = max((dot(N, L1) + 0.42) / 1.42, 0.0) * mix(0.45, 1.0, sh);
  vec3 dir1 = (1.0 - metal) * albedo * 0.62 * vec3(2.5, 2.25, 1.95) * wrapL1
            + F * pow(max(dot(N, H1), 0.0), specPow) * 1.8 * vec3(2.4, 2.05, 1.65) * NoL1;

  vec3 H2 = normalize(L2 + V);
  float NoL2 = max(dot(N, L2), 0.0);
  vec3 dir2 = ((1.0 - metal) * albedo * 0.25 + F * pow(max(dot(N, H2), 0.0), specPow * 0.7) * 1.4)
            * vec3(0.95, 1.20, 1.45) * NoL2;

  vec3 H3 = normalize(L3 + V);
  float NoL3 = max(dot(N, L3), 0.0);
  vec3 dir3 = F * pow(max(dot(N, H3), 0.0), specPow * 1.1) * vec3(1.65, 1.10, 0.55) * NoL3;

  vec3 velvet = marble * vec3(0.10, 0.095, 0.085) * pow(1.0 - NoV, 2.0) * (0.4 + 0.6 * wrapL1);
  return diffAmb + envSpec * F + dir1 + dir2 + dir3 + velvet + emiss;
}

// Clip the ray to the coin's bounding cylinder and z slab.
bool boundCoin(vec3 ro, vec3 rd, out float t0, out float t1) {
  float tc0 = -1e6, tc1 = 1e6;
  float a = dot(rd.xy, rd.xy);
  float c = dot(ro.xy, ro.xy) - BOUND_R * BOUND_R;
  if (a > 1e-8) {
    float b = dot(ro.xy, rd.xy);
    float h = b * b - a * c;
    if (h < 0.0) return false;
    h = sqrt(h);
    tc0 = (-b - h) / a;
    tc1 = (-b + h) / a;
  } else if (c > 0.0) {
    return false;
  }
  float tz0 = -1e6, tz1 = 1e6;
  if (abs(rd.z) > 1e-8) {
    float ta = (-BOUND_Z - ro.z) / rd.z;
    float tb = (BOUND_Z - ro.z) / rd.z;
    tz0 = min(ta, tb);
    tz1 = max(ta, tb);
  } else if (abs(ro.z) > BOUND_Z) {
    return false;
  }
  t0 = max(max(tc0, tz0), 0.0);
  t1 = min(tc1, tz1);
  return t1 > t0;
}

// Returns true on a hit. On a miss, minRatio/tMin describe the closest
// approach (smallest distance / t) for silhouette coverage.
bool marchCoin(vec3 ro, vec3 rd, out float tHit, out float minRatio, out float tMin) {
  tHit = 0.0;
  minRatio = 1e6;
  tMin = 0.0;
  float t0, t1;
  if (!boundCoin(ro, rd, t0, t1)) return false;
  float t = t0;
  float tPrev = t0;
  for (int i = 0; i < 128; i++) {
    if (i >= uSteps) break;
    float d = mapCoin(ro + rd * t);
    float ratio = d / max(t, 1e-3);
    if (ratio < minRatio) { minRatio = ratio; tMin = t; }
    if (d < EPS) {
      float lo = tPrev, hi = t;
      for (int k = 0; k < 4; k++) {
        float m = 0.5 * (lo + hi);
        if (mapCoin(ro + rd * m) > EPS) lo = m; else hi = m;
      }
      tHit = hi;
      return true;
    }
    tPrev = t;
    t += d * 0.5;
    if (t > t1) break;
  }
  return false;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 rd = normalize(vec3(uv, -FOCAL));
  float pixAng = 1.0 / (uRes.y * FOCAL);

  mat3 coinToWorld = rotX(uPose.y) * rotZ(uPose.z) * rotY(uPose.x);
  mat3 worldToCoin = transpose(coinToWorld);
  vec3 coinCenter = vec3(0.0, uBob, 0.0);

  vec3 roL = worldToCoin * (CAM - coinCenter);
  vec3 rdL = worldToCoin * rd;

  float tHit, minRatio, tMin;
  bool hit = marchCoin(roL, rdL, tHit, minRatio, tMin);

  float cov = 0.0;
  vec3 col = vec3(0.0);
  if (hit) {
    vec3 pL = roL + rdL * tHit;
    col = shadeCoin(pL, calcNormal(pL), coinToWorld, rd, tHit);
    cov = 1.0;
  } else {
    // Rays that graze the silhouette within one pixel footprint take partial
    // coverage and are shaded at their closest approach.
    cov = clamp(1.0 - minRatio / pixAng, 0.0, 1.0);
    if (cov > 0.0) {
      vec3 pL = roL + rdL * tMin;
      col = shadeCoin(pL, calcNormal(pL), coinToWorld, rd, tMin);
    }
  }

  // ACES filmic tone map + gamma, then premultiply by coverage.
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  vec4 coin = vec4(col * cov, cov);

  // Bounded dark contact disc on the floor beneath the coin. It fades to zero
  // well inside the canvas so it can never draw a seam at the canvas edge.
  vec4 disc = vec4(0.0);
  if (cov < 1.0 && rd.y < -0.01) {
    float tf = (FLOOR_Y - CAM.y) / rd.y;
    vec3 pf = CAM + rd * tf;
    float dr = length(pf.xz) / DISC_R;
    vec2 s = gl_FragCoord.xy / uRes;
    float edge = smoothstep(0.0, 0.12, s.y) * smoothstep(0.0, 0.12, s.x) * smoothstep(0.0, 0.12, 1.0 - s.x);
    float a = 0.55 * (1.0 - smoothstep(0.1, 1.0, dr)) * edge;
    disc = vec4(vec3(0.010, 0.007, 0.005) * a, a);
  }

  fragColor = coin + disc * (1.0 - coin.a);
}
`,me=[["uObvAlb","/medallion/obvAlb.jpg"],["uObvHgt","/medallion/obvHgt.jpg"],["uObvEmi","/medallion/obvEmi.jpg"],["uRevAlb","/medallion/revAlb.jpg"],["uRevHgt","/medallion/revHgt.jpg"],["uRevEmi","/medallion/revEmi.jpg"],["uTitle","/medallion/title.png"]],O=[{steps:128,shadow:18,scale:1},{steps:96,shadow:12,scale:.85},{steps:72,shadow:8,scale:.7}],ye=2,I=Math.PI*2,Ae=72*Math.PI/180,Te=1e3,Z=800,Pe=Math.PI/12,_e=280,ue={yaw:-.62,pitch:.2},Me=2,j=5.5,de=.45,Se=l=>1-(1-l)**3,Ce=l=>l<.5?4*l*l*l:1-(-2*l+2)**3/2,k=(l,y,A)=>Math.min(A,Math.max(y,l));function pe(l,y,A){const c=l.createShader(y);return l.shaderSource(c,A),l.compileShader(c),c}function He(l,{onReady:y,onFail:A}={}){let c=!1,p=!1,h=!1,D=!1,K=!0,$=document.hidden,v=0,w=0,S=0,f=0,u=0,C=0,H=0,g=0,R=0;const a={yaw:ue.yaw,pitch:ue.pitch,yawVel:0,pitchVel:0};let i=null,B=!1,E=-1,s=null;const r={ema:0,base:1/0,slow:0,fast:0,warm:30,changedAt:0,drops:[0,0,0]};let e=null,m=null,T=null,N=null;const U=[];let d={};const J=new AbortController;let V=null,Y=null;function L(t){p||c||(p=!0,G(),queueMicrotask(()=>{c||A?.(t)}))}const Q=()=>{L("context-lost")},ee=()=>{$=document.hidden,F()};if(e=l.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0}),!e||typeof createImageBitmap!="function")return L("unsupported"),ce();l.addEventListener("webglcontextlost",Q);const te=pe(e,e.VERTEX_SHADER,Ee),oe=pe(e,e.FRAGMENT_SHADER,Le);m=e.createProgram(),e.attachShader(m,te),e.attachShader(m,oe),e.linkProgram(m);const ae=e.getExtension("KHR_parallel_shader_compile");T=e.createVertexArray(),e.bindVertexArray(T),N=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,N),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),re(),V=new ResizeObserver(([t])=>{const o=t.contentBoxSize?.[0];C=o?o.inlineSize:t.contentRect.width,H=o?o.blockSize:t.contentRect.height,W()&&M()}),V.observe(l),Y=new IntersectionObserver(([t])=>{K=t.isIntersecting,F()}),Y.observe(l),document.addEventListener("visibilitychange",ee),be();async function he(){if(ae){for(;!e.getProgramParameter(m,ae.COMPLETION_STATUS_KHR);)if(await new Promise(t=>requestAnimationFrame(t)),c||p)return!1}return!!e.getProgramParameter(m,e.LINK_STATUS)}async function ve(){return Promise.all(me.map(async([,t])=>{const o=await fetch(t,{signal:J.signal,credentials:"same-origin"});if(!o.ok)throw new Error(`${t}: ${o.status}`);const n=await o.blob();return createImageBitmap(n,{imageOrientation:"flipY",premultiplyAlpha:"none",colorSpaceConversion:"none"})}))}async function be(){let t=null;try{const[o,n]=await Promise.all([he(),ve()]);if(t=n,c||p)return;if(!o)return L("compile");e.deleteShader(te),e.deleteShader(oe),e.useProgram(m);const b=e.getAttribLocation(m,"aPos");e.bindVertexArray(T),e.enableVertexAttribArray(b),e.vertexAttribPointer(b,2,e.FLOAT,!1,0,0),d={};for(const x of["uRes","uTime","uPose","uBob","uPop","uEdge","uSteps","uShadowSteps"])d[x]=e.getUniformLocation(m,x);if(e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.NONE),me.forEach(([x],q)=>{const fe=e.createTexture();U.push(fe),e.activeTexture(e.TEXTURE0+q),e.bindTexture(e.TEXTURE_2D,fe),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE,t[q]),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.uniform1i(e.getUniformLocation(m,x),q)}),e.getError()!==e.NO_ERROR)return L("texture");e.uniform1f(d.uPop,1),e.uniform1f(d.uEdge,1),ie(),await xe()}catch{c||L("texture")}finally{t?.forEach(o=>o.close())}}async function xe(){for(;!W()&&(g===0||R===0);){if(await new Promise(o=>requestAnimationFrame(o)),c||p)return;re()}_()||we(),X();const t=new Uint8Array(4);if(e.readPixels(g>>1,R>>1,1,1,e.RGBA,e.UNSIGNED_BYTE,t),e.getError()!==e.NO_ERROR||e.isContextLost()||t[3]<200)return L("invalid-frame");h=!0,y?.(),F()}function re(){const t=l.getBoundingClientRect();C=t.width,H=t.height}function W(){if(!e||p||c)return!1;const t=Math.min(window.devicePixelRatio||1,ye)*O[u].scale,o=Math.max(1,Math.round(C*t)),n=Math.max(1,Math.round(H*t));return C===0||H===0||o===g&&n===R?!1:(g=l.width=o,R=l.height=n,!0)}function ie(){e.uniform1i(d.uSteps,O[u].steps),e.uniform1i(d.uShadowSteps,O[u].shadow)}function le(t){u=t,ie(),W(),r.slow=0,r.fast=0,r.warm=20,r.ema=0,r.changedAt=f}function ge(t){if(r.warm>0){r.warm-=1;return}r.base=Math.max(4,Math.min(r.base,t)),r.ema=r.ema?r.ema+(t-r.ema)*.08:t;const o=Math.max(r.base*1.35,20);r.ema>o?(r.slow+=1,r.fast=0):r.ema<r.base*1.12?(r.fast+=1,r.slow=0):(r.slow=Math.max(0,r.slow-1),r.fast=0),r.slow>45&&u<O.length-1?(r.drops[u]+=1,le(u+1)):r.fast>300&&u>0&&r.drops[u-1]<2&&f-r.changedAt>10&&le(u-1)}function z(t,o,n,b=Ce){if(a.yawVel=0,a.pitchVel=0,E=-1,!_()){i=null,a.yaw=t,a.pitch=o,P(),M();return}i={fromYaw:a.yaw,toYaw:t,fromPitch:a.pitch,toPitch:o,start:f,dur:n/1e3,ease:b}}function we(){B=!0,i?.settle&&(i=null),a.yaw=0,a.pitch=0}function P(){const t=Math.round(a.yaw/I);a.yaw-=t*I}function Re(t){if(B||(B=!0,i={fromYaw:a.yaw,toYaw:0,fromPitch:a.pitch,toPitch:0,start:f,dur:Te/1e3,ease:Se,settle:!0}),!s){if(i){const o=k((f-i.start)/i.dur,0,1),n=i.ease(o);a.yaw=i.fromYaw+(i.toYaw-i.fromYaw)*n,a.pitch=i.fromPitch+(i.toPitch-i.fromPitch)*n,o>=1&&(i=null,P());return}if(E>=0){a.yaw+=a.yawVel*t,a.yawVel*=Math.exp(-3.4*t);const o=-j*j*a.pitch-2*j*a.pitchVel;a.pitchVel+=o*t,a.pitch+=a.pitchVel*t,f-E>=Me&&(a.yawVel=0,a.pitchVel=0,a.pitch=0,E=-1,P())}}}function X(){if(!e||p||c||g===0)return;const t=k((f-.6)/1.6,0,1),o=t*t*(3-2*t),n=a.pitch+Math.sin(f*.63)*.07*o,b=Math.sin(f*.47)*.035*o,x=Math.sin(f*1.05)*.03*o;e.viewport(0,0,g,R),e.disable(e.BLEND),e.uniform2f(d.uRes,g,R),e.uniform1f(d.uTime,f),e.uniform3f(d.uPose,a.yaw,n,b),e.uniform1f(d.uBob,x),e.drawArrays(e.TRIANGLES,0,3)}function ne(t){if(v=0,!_())return;const o=S?t-S:16.7;S=t;const n=Math.min(o,50)/1e3;f+=n,Re(n),X(),ge(o),v=requestAnimationFrame(ne)}function _(){return!c&&!p&&K&&!$&&!D}function F(){h&&_()?v||(S=0,r.warm=Math.max(r.warm,10),v=requestAnimationFrame(ne)):G()}function G(){v&&cancelAnimationFrame(v),v=0}function M(){!h||v||w||p||c||(w=requestAnimationFrame(()=>{w=0,X()}))}function se(){return Math.round(a.yaw/Math.PI)*Math.PI}function ce(){return{setHold(t){D=!!t,D&&i&&(a.yaw=i.toYaw,a.pitch=i.toPitch,i=null,P(),M()),F()},flip(){h&&z(se()+Math.PI,0,Z)},inspectEdge(){h&&z(se()+Ae,0,Z)},reset(){h&&z(Math.round(a.yaw/I)*I,0,Z)},nudge(t){if(!h)return;const o=i?i.toYaw:a.yaw;z(o+t*Pe,0,_e)},pointerDown(t){if(!h||s||t.pointerType==="mouse"&&t.button!==0)return;const o=t.currentTarget;o.setPointerCapture?.(t.pointerId),i=null,E=-1,a.yawVel=0,a.pitchVel=0,s={id:t.pointerId,x:t.clientX,y:t.clientY,ts:t.timeStamp,width:Math.max(1,o.clientWidth),vel:0}},pointerMove(t){if(!s||t.pointerId!==s.id)return;const o=Math.PI/s.width,n=t.clientX-s.x,b=t.clientY-s.y,x=Math.max(1,t.timeStamp-s.ts)/1e3;a.yaw+=n*o,a.pitch=k(a.pitch-b*o*.6,-de,de),s.vel=s.vel*.6+n*o/x*.4,s.x=t.clientX,s.y=t.clientY,s.ts=t.timeStamp,M()},pointerUp(t){if(!s||t.pointerId!==s.id)return;const n=t.timeStamp-s.ts>80?0:k(s.vel,-8,8);t.currentTarget.releasePointerCapture?.(t.pointerId),s=null,_()?(a.yawVel=n,a.pitchVel=0,E=f):(a.pitch=0,P(),M())},dispose(){c||(c=!0,G(),w&&cancelAnimationFrame(w),w=0,J.abort(),V?.disconnect(),Y?.disconnect(),document.removeEventListener("visibilitychange",ee),l.removeEventListener("webglcontextlost",Q),e&&!e.isContextLost()&&(U.forEach(t=>e.deleteTexture(t)),N&&e.deleteBuffer(N),T&&e.deleteVertexArray(T),m&&e.deleteProgram(m),e.getExtension("WEBGL_lose_context")?.loseContext()),U.length=0,e=null)}}}return ce()}export{He as createMedallionRenderer};
