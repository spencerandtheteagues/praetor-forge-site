const Ae=`#version 300 es
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
uniform sampler2D uObvHgt; // R: relief height, G: 2D silhouette SDF, B: specular mask
uniform sampler2D uObvEmi;
uniform sampler2D uRevAlb;
uniform sampler2D uRevHgt;
uniform sampler2D uRevEmi;

// R = 1.602 projects to 91.0% of canvas height at CAM.z = 4.9, matching UV_RIM = 0.455
// in harness-lab-hero-aligned.webp to within 0.03% for a zero-jump static -> WebGL handoff.
const float R = 1.602;
const float UV_RIM = 0.455;
const float UV_SPAN = R / UV_RIM;
const float HALF_T = 0.145;
const float BOUND_R = 1.82;
const float BOUND_Z = HALF_T + 0.15;
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

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdCappedCyl(vec3 p, float rad, float halfH) {
  vec2 d = vec2(length(p.xy) - rad, abs(p.z) - halfH);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// Signed distance to the sculpted medallion + protruding 3D wing feather tips.
float mapCoin(vec3 p) {
  float r = length(p.xy);
  float az = abs(p.z);

  // Conservative outer cylinder bound containing coin + protruding wing tip.
  if (r > 1.79 || az > HALF_T + 0.14) {
    return sdCappedCyl(p, 1.765, HALF_T + 0.115);
  }

  vec2 uv = clamp(p.xy / UV_SPAN + 0.5, 0.001, 0.999);
  vec2 buv = vec2(1.0 - uv.x, uv.y);

  vec3 hF = textureLod(uObvHgt, uv, 0.5).rgb;
  vec3 hB = textureLod(uRevHgt, buv, 0.5).rgb;

  float dispF = (hF.r - 0.32) * 0.082 * uPop;
  float dispB = (hB.r - 0.32) * 0.082 * uPop;

  float disp = 0.0;
  if (r <= R) {
    float taper = 1.0 - smoothstep(R - 0.042, R, r);
    disp = (p.z >= 0.0 ? dispF : dispB) * taper;
  }

  // Edge knurling (144 reeds), equatorial trench, and wire rings.
  float ang = atan(p.y, p.x);
  float reedBand = smoothstep(0.032, 0.046, az) * (1.0 - smoothstep(HALF_T - 0.018, HALF_T, az));
  float reeds = sin(ang * 144.0) * 0.0085 * reedBand;
  float trench = -gauss(p.z / 0.026) * 0.018;
  float wireRings = gauss((az - 0.034) / 0.007) * 0.009;

  float effR = R + reeds + trench + wireRings;
  vec2 qCoin = vec2(r - effR, az - (HALF_T + disp));
  float d = min(max(qCoin.x, qCoin.y), 0.0) + length(max(qCoin, 0.0)) - 0.013;

  // Protruding 3D carved wing tips (extending past the upper-left bezel at ~10:30).
  // Each face's protruding feather tip is active when that face is oriented toward
  // the viewer, so the opposite face never pokes a mirrored nub out at ~1:15, and
  // the blade tapers razor-thin at its crest for a clean oblique edge profile.
  if (r > R - 0.045) {
    float frontVis = smoothstep(-0.05, 0.42, cos(uPose.x));
    float backVis  = smoothstep(-0.05, 0.42, -cos(uPose.x));
    float tipTaper = 1.0 - smoothstep(R, R * 1.09, r) * 0.55;

    if (frontVis > 0.01 && hF.g > 0.12) {
      float dSilF = ((0.5 - hF.g) / 14.0) * UV_SPAN + (1.0 - frontVis) * 0.12;
      float zMidF = HALF_T + dispF * 0.42;
      float zHalfF = 0.016 * tipTaper;
      vec2 qWF = vec2(dSilF, abs(p.z - zMidF) - zHalfF);
      float dWF = min(max(qWF.x, qWF.y), 0.0) + length(max(qWF, 0.0)) - 0.005;
      d = smin(d, dWF, 0.007);
    }
    if (backVis > 0.01 && hB.g > 0.12) {
      float dSilB = ((0.5 - hB.g) / 14.0) * UV_SPAN + (1.0 - backVis) * 0.12;
      float zMidB = -(HALF_T + dispB * 0.42);
      float zHalfB = 0.016 * tipTaper;
      vec2 qWB = vec2(dSilB, abs(p.z - zMidB) - zHalfB);
      float dWB = min(max(qWB.x, qWB.y), 0.0) + length(max(qWB, 0.0)) - 0.005;
      d = smin(d, dWB, 0.007);
    }
  }

  return d;
}

vec3 calcNormal(vec3 p) {
  const float h = 0.0026;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * mapCoin(p + k.xyy * h) +
    k.yyx * mapCoin(p + k.yyx * h) +
    k.yxy * mapCoin(p + k.yxy * h) +
    k.xxx * mapCoin(p + k.xxx * h));
}

float softShadow(vec3 ro, vec3 rd) {
  float res = 1.0;
  float t = 0.022;
  for (int i = 0; i < 18; i++) {
    if (i >= uShadowSteps) break;
    float h = mapCoin(ro + rd * t);
    res = min(res, 10.0 * h / t);
    t += clamp(h, 0.014, 0.06);
    if (res < 0.08 || t > 0.65) break;
  }
  return clamp(res, 0.22, 1.0);
}

vec3 studioEnv(vec3 dir) {
  float v = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(vec3(0.02, 0.018, 0.016), vec3(0.075, 0.064, 0.052), gauss((v - 0.5) / 0.16));
  col += vec3(1.65, 1.28, 0.88) * pow(max(0.0, dot(dir, normalize(vec3(-0.35, 0.82, 0.45)))), 7.0);
  col += vec3(1.45, 0.86, 0.44) * pow(max(0.0, dot(dir, normalize(vec3(0.82, 0.18, 0.54)))), 14.0);
  col += vec3(0.62, 0.84, 1.10) * pow(max(0.0, dot(dir, normalize(vec3(-0.85, 0.28, -0.45)))), 10.0);
  col += vec3(0.95, 0.46, 0.14) * pow(max(0.0, dot(dir, normalize(vec3(0.1, -0.78, 0.60)))), 8.0);
  return col;
}

vec3 acesTonemap(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec3 shadeCoin(vec3 p, vec3 nLocal, mat3 coinToWorld, vec3 rdWorld, float t) {
  float r = length(p.xy);
  float az = abs(p.z);
  vec2 uv = clamp(p.xy / UV_SPAN + 0.5, 0.001, 0.999);
  vec2 buv = vec2(1.0 - uv.x, uv.y);

  vec3 N = normalize(coinToWorld * nLocal);
  vec3 V = -rdWorld;
  float NoV = max(dot(N, V), 0.001);
  vec3 Rdir = reflect(-V, N);

  vec3 L1 = normalize(vec3(-0.52, 0.64, 0.56));
  vec3 L2 = normalize(vec3(0.72, 0.35, -0.60));
  vec3 L3 = normalize(vec3(sin(uTime * 1.05) * 0.58, -0.48, 0.66));

  float footprint = t / (uRes.y * FOCAL);
  float texels = footprint / UV_SPAN * ALB_SIZE / max(NoV, 0.25);
  float lodA = max(log2(max(texels, 1e-4)), 0.0);
  float lodE = max(lodA - 0.5, 0.0);

  vec2 fuv = p.z >= 0.0 ? uv : buv;
  vec3 hData = p.z >= 0.0 ? textureLod(uObvHgt, fuv, 0.5).rgb : textureLod(uRevHgt, fuv, 0.5).rgb;

  // Determine whether this hit sits on the sculpted obverse/reverse face (including
  // the protruding 3D wing feather blade!) vs the machined 144-reed cylinder rim.
  float inWingTip = smoothstep(0.42, 0.52, hData.g) * smoothstep(R - 0.015, R + 0.006, r) * smoothstep(HALF_T - 0.035, HALF_T - 0.010, az);
  float inCoinFace = (1.0 - smoothstep(R - 0.020, R - 0.004, r)) * smoothstep(HALF_T - 0.028, HALF_T - 0.008, az);
  float faceMask = clamp(max(inCoinFace, inWingTip), 0.0, 1.0);

  // Machined 144-reed bronze/gold edge + sapphire/copper equatorial trench (HDR -> ACES).
  vec3 edgeLinear = vec3(0.0);
  if (faceMask < 0.999) {
    float ang = atan(p.y, p.x);
    vec3 eAlb = vec3(0.74, 0.44, 0.19);
    float eMetal = 0.96;
    float eRough = 0.15;
    vec3 eEmiss = vec3(0.0);
    if (az < 0.028 && r <= R + 0.03) {
      eAlb = vec3(0.03, 0.03, 0.035);
      eMetal = 0.42;
      eRough = 0.34;
      float seg = pow(max(0.0, cos(ang * 18.0)), 8.0);
      float pulse = 0.55 + 0.65 * (0.5 + 0.5 * sin(ang * 2.0 - uTime * 3.2));
      bool sapphireNode = mod(floor((ang + 3.14159265) / (6.2831853 / 36.0) + 0.5), 9.0) < 0.5;
      vec3 glowCol = sapphireNode ? vec3(0.32, 0.78, 1.15) : vec3(1.35, 0.55, 0.09);
      eEmiss = glowCol * seg * pulse * uEdge * 1.35;
    }
    vec3 F0 = mix(vec3(0.04), eAlb, eMetal);
    vec3 F = F0 + (1.0 - F0) * pow(1.0 - NoV, 5.0);
    float specPow = mix(180.0, 14.0, eRough * eRough);
    vec3 envS = studioEnv(Rdir) * mix(1.25, 0.45, eRough) * F;
    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);
    vec3 H3 = normalize(L3 + V);
    vec3 d1 = F * pow(max(dot(N, H1), 0.0), specPow) * 1.85 * vec3(2.4, 2.05, 1.65) * max(dot(N, L1), 0.0);
    vec3 d2 = F * pow(max(dot(N, H2), 0.0), specPow * 0.7) * 1.35 * vec3(0.95, 1.20, 1.45) * max(dot(N, L2), 0.0);
    vec3 d3 = F * pow(max(dot(N, H3), 0.0), specPow * 1.1) * vec3(1.65, 1.10, 0.55) * max(dot(N, L3), 0.0);
    vec3 amb = vec3(0.09, 0.075, 0.06) * eAlb * (1.0 - eMetal);
    edgeLinear = acesTonemap(amb + envS + d1 + d2 + d3 + eEmiss);
  }

  if (faceMask <= 0.001) {
    return edgeLinear;
  }

  // Authentic Title-Desk Copper-Marble Obverse & Black-Marble Reverse Shading:
  // Preserves 100% of the intricate filigree, marble veining, starry cosmos, citadel,
  // and engraved THE HARNESS LAB lettering at rest while adding physical 3D relief
  // shading, soft shadows, and moving metallic/stone specular glints as it turns.
  vec3 texSrgb = p.z >= 0.0 ? textureLod(uObvAlb, uv, lodA).rgb : textureLod(uRevAlb, buv, lodA).rgb;
  vec3 emiSrgb = p.z >= 0.0 ? textureLod(uObvEmi, uv, lodE).rgb : textureLod(uRevEmi, buv, lodE).rgb;
  vec3 baseLin = pow(texSrgb, vec3(2.2));
  vec3 emissLin = pow(emiSrgb, vec3(2.0));

  float specMask = hData.b; // 0.85..1.0 on gold/bronze filigree & rim; ~0.20 on marble; ~0.0 on cosmos

  vec3 L1Local = normalize(transpose(coinToWorld) * L1);
  float sh = softShadow(p + nLocal * 0.005, L1Local);

  // Differential 3D relief shading relative to rest face normal so rest pose preserves
  // 100% photographic fidelity to title-desk.com while breathing/turning modulates relief.
  vec3 faceWorld = normalize(coinToWorld * vec3(0.0, 0.0, p.z >= 0.0 ? 1.0 : -1.0));
  float flatL1 = max(dot(vec3(0.0, 0.0, 1.0), L1), 0.35);
  float curL1 = max((dot(N, L1) + 0.38) / 1.38, 0.0) * mix(0.76, 1.0, sh);
  float reliefRatio = clamp(curL1 / (flatL1 * 0.92), 0.52, 1.24);
  float turnAmt = clamp((1.0 - abs(faceWorld.z)) * 1.65 + 0.26, 0.26, 1.0);
  float shadeMult = mix(1.0, reliefRatio, turnAmt);

  // Anisotropic-feel metallic & polished-marble specular glints driven by 3D relief normals.
  vec3 specTint = mix(vec3(0.95, 0.93, 0.90), max(baseLin * 1.65, vec3(0.72, 0.46, 0.20)), smoothstep(0.22, 0.65, specMask));
  float rough = mix(0.32, 0.17, smoothstep(0.25, 0.80, specMask));
  float specPow = mix(42.0, 115.0, smoothstep(0.25, 0.85, specMask));
  vec3 F0 = mix(vec3(0.035), specTint * 0.55, smoothstep(0.22, 0.80, specMask));
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - NoV, 5.0);

  vec3 H1 = normalize(L1 + V);
  vec3 H2 = normalize(L2 + V);
  vec3 H3 = normalize(L3 + V);

  // Specular highlights wake up strongly on tilted relief facets and grazing motion glints.
  float facetTilt = clamp(length(nLocal.xy) * 1.45 + (1.0 - abs(faceWorld.z)) * 1.2, 0.08, 1.0);
  vec3 specAdd = specMask * (
    studioEnv(Rdir) * F * (0.28 + 0.55 * (1.0 - abs(faceWorld.z))) +
    specTint * pow(max(dot(N, H1), 0.0), specPow) * 0.42 * sh * facetTilt +
    vec3(0.75, 0.92, 1.12) * F * pow(max(dot(N, H2), 0.0), specPow * 0.65) * 0.55 * max(dot(N, L2), 0.0) +
    specTint * pow(max(dot(N, H3), 0.0), specPow * 0.9) * 0.52 * max(dot(N, L3), 0.0) * facetTilt
  );
  specAdd = specAdd / (1.0 + 0.85 * specAdd);

  // Subtle living pulse on citadel amber bars & circuit nodes.
  float emiPulse = 0.22 + 0.16 * (0.5 + 0.5 * sin(uTime * 1.8));
  vec3 faceLinear = clamp(baseLin * shadeMult + specAdd + emissLin * emiPulse * uPop, 0.0, 1.0);

  return mix(edgeLinear, faceLinear, faceMask);
}

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
    cov = clamp(1.0 - minRatio / pixAng, 0.0, 1.0);
    if (cov > 0.0) {
      vec3 pL = roL + rdL * tMin;
      col = shadeCoin(pL, calcNormal(pL), coinToWorld, rd, tMin);
    }
  }

  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  vec4 coin = vec4(col * cov, cov);

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
`,de=[["uObvAlb","/medallion/obvAlb.webp"],["uObvHgt","/medallion/obvHgt.png"],["uObvEmi","/medallion/obvEmi.webp"],["uRevAlb","/medallion/revAlb.webp"],["uRevHgt","/medallion/revHgt.png"],["uRevEmi","/medallion/revEmi.webp"]],B=[{steps:128,shadow:18,scale:1},{steps:96,shadow:12,scale:.85},{steps:72,shadow:8,scale:.7}],Ee=2,D=Math.PI*2,Te=72*Math.PI/180,ye=1e3,Z=800,Pe=Math.PI/12,_e=280,ue={yaw:-.62,pitch:.2},Se=2,K=5.5,me=.45,Me=n=>1-(1-n)**3,Fe=n=>n<.5?4*n*n*n:1-(-2*n+2)**3/2,V=(n,E,T)=>Math.min(T,Math.max(E,n));function pe(n,E,T){const c=n.createShader(E);return n.shaderSource(c,T),n.compileShader(c),c}function ze(n,{onReady:E,onFail:T}={}){let c=!1,p=!1,h=!1,k=!1,j=!0,$=document.hidden,v=0,w=0,M=0,f=0,u=0,F=0,z=0,b=0,R=0;const a={yaw:ue.yaw,pitch:ue.pitch,yawVel:0,pitchVel:0};let r=null,I=!1,A=-1,s=null;const i={ema:0,base:1/0,slow:0,fast:0,warm:30,changedAt:0,drops:[0,0,0]};let e=null,d=null,y=null,C=null;const O=[];let m={};const J=new AbortController;let U=null,W=null;function L(t){p||c||(p=!0,G(),queueMicrotask(()=>{c||T?.(t)}))}const Q=()=>{L("context-lost")},ee=()=>{$=document.hidden,N()};if(e=n.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0}),!e||typeof createImageBitmap!="function")return L("unsupported"),ce();n.addEventListener("webglcontextlost",Q);const te=pe(e,e.VERTEX_SHADER,Ae),oe=pe(e,e.FRAGMENT_SHADER,Le);d=e.createProgram(),e.attachShader(d,te),e.attachShader(d,oe),e.linkProgram(d);const ae=e.getExtension("KHR_parallel_shader_compile");y=e.createVertexArray(),e.bindVertexArray(y),C=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,C),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),ie(),U=new ResizeObserver(([t])=>{const o=t.contentBoxSize?.[0];F=o?o.inlineSize:t.contentRect.width,z=o?o.blockSize:t.contentRect.height,q()&&S()}),U.observe(n),W=new IntersectionObserver(([t])=>{j=t.isIntersecting,N()}),W.observe(n),document.addEventListener("visibilitychange",ee),ge();async function he(){if(ae){for(;!e.getProgramParameter(d,ae.COMPLETION_STATUS_KHR);)if(await new Promise(t=>requestAnimationFrame(t)),c||p)return!1}return!!e.getProgramParameter(d,e.LINK_STATUS)}async function ve(){return Promise.all(de.map(async([,t])=>{const o=await fetch(t,{signal:J.signal,credentials:"same-origin"});if(!o.ok)throw new Error(`${t}: ${o.status}`);const l=await o.blob();return createImageBitmap(l,{imageOrientation:"flipY",premultiplyAlpha:"none",colorSpaceConversion:"none"})}))}async function ge(){let t=null;try{const[o,l]=await Promise.all([he(),ve()]);if(t=l,c||p)return;if(!o)return L("compile");e.deleteShader(te),e.deleteShader(oe),e.useProgram(d);const g=e.getAttribLocation(d,"aPos");e.bindVertexArray(y),e.enableVertexAttribArray(g),e.vertexAttribPointer(g,2,e.FLOAT,!1,0,0),m={};for(const x of["uRes","uTime","uPose","uBob","uPop","uEdge","uSteps","uShadowSteps"])m[x]=e.getUniformLocation(d,x);if(e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.NONE),de.forEach(([x],X)=>{const fe=e.createTexture();O.push(fe),e.activeTexture(e.TEXTURE0+X),e.bindTexture(e.TEXTURE_2D,fe),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE,t[X]),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.uniform1i(e.getUniformLocation(d,x),X)}),e.getError()!==e.NO_ERROR)return L("texture");e.uniform1f(m.uPop,1),e.uniform1f(m.uEdge,1),re(),await xe()}catch{c||L("texture")}finally{t?.forEach(o=>o.close())}}async function xe(){for(;!q()&&(b===0||R===0);){if(await new Promise(o=>requestAnimationFrame(o)),c||p)return;ie()}_()||we(),Y();const t=new Uint8Array(4);if(e.readPixels(b>>1,R>>1,1,1,e.RGBA,e.UNSIGNED_BYTE,t),e.getError()!==e.NO_ERROR||e.isContextLost()||t[3]<200)return L("invalid-frame");h=!0,E?.(),N()}function ie(){const t=n.getBoundingClientRect();F=t.width,z=t.height}function q(){if(!e||p||c)return!1;const t=Math.min(window.devicePixelRatio||1,Ee)*B[u].scale,o=Math.max(1,Math.round(F*t)),l=Math.max(1,Math.round(z*t));return F===0||z===0||o===b&&l===R?!1:(b=n.width=o,R=n.height=l,!0)}function re(){e.uniform1i(m.uSteps,B[u].steps),e.uniform1i(m.uShadowSteps,B[u].shadow)}function ne(t){u=t,re(),q(),i.slow=0,i.fast=0,i.warm=20,i.ema=0,i.changedAt=f}function be(t){if(i.warm>0){i.warm-=1;return}i.base=Math.max(4,Math.min(i.base,t)),i.ema=i.ema?i.ema+(t-i.ema)*.08:t;const o=Math.max(i.base*1.35,20);i.ema>o?(i.slow+=1,i.fast=0):i.ema<i.base*1.12?(i.fast+=1,i.slow=0):(i.slow=Math.max(0,i.slow-1),i.fast=0),i.slow>45&&u<B.length-1?(i.drops[u]+=1,ne(u+1)):i.fast>300&&u>0&&i.drops[u-1]<2&&f-i.changedAt>10&&ne(u-1)}function H(t,o,l,g=Fe){if(a.yawVel=0,a.pitchVel=0,A=-1,!_()){r=null,a.yaw=t,a.pitch=o,P(),S();return}r={fromYaw:a.yaw,toYaw:t,fromPitch:a.pitch,toPitch:o,start:f,dur:l/1e3,ease:g}}function we(){I=!0,r?.settle&&(r=null),a.yaw=0,a.pitch=0}function P(){const t=Math.round(a.yaw/D);a.yaw-=t*D}function Re(t){if(I||(I=!0,r={fromYaw:a.yaw,toYaw:0,fromPitch:a.pitch,toPitch:0,start:f,dur:ye/1e3,ease:Me,settle:!0}),!s){if(r){const o=V((f-r.start)/r.dur,0,1),l=r.ease(o);a.yaw=r.fromYaw+(r.toYaw-r.fromYaw)*l,a.pitch=r.fromPitch+(r.toPitch-r.fromPitch)*l,o>=1&&(r=null,P());return}if(A>=0){a.yaw+=a.yawVel*t,a.yawVel*=Math.exp(-3.4*t);const o=-K*K*a.pitch-2*K*a.pitchVel;a.pitchVel+=o*t,a.pitch+=a.pitchVel*t,f-A>=Se&&(a.yawVel=0,a.pitchVel=0,a.pitch=0,A=-1,P())}}}function Y(){if(!e||p||c||b===0)return;const t=V((f-.6)/1.6,0,1),o=t*t*(3-2*t),l=a.pitch+Math.sin(f*.63)*.07*o,g=Math.sin(f*.47)*.035*o,x=Math.sin(f*1.05)*.03*o;e.viewport(0,0,b,R),e.disable(e.BLEND),e.uniform2f(m.uRes,b,R),e.uniform1f(m.uTime,f),e.uniform3f(m.uPose,a.yaw,l,g),e.uniform1f(m.uBob,x),e.drawArrays(e.TRIANGLES,0,3)}function le(t){if(v=0,!_())return;const o=M?t-M:16.7;M=t;const l=Math.min(o,50)/1e3;f+=l,Re(l),Y(),be(o),v=requestAnimationFrame(le)}function _(){return!c&&!p&&j&&!$&&!k}function N(){h&&_()?v||(M=0,i.warm=Math.max(i.warm,10),v=requestAnimationFrame(le)):G()}function G(){v&&cancelAnimationFrame(v),v=0}function S(){!h||v||w||p||c||(w=requestAnimationFrame(()=>{w=0,Y()}))}function se(){return Math.round(a.yaw/Math.PI)*Math.PI}function ce(){return{setHold(t){k=!!t,k&&r&&(a.yaw=r.toYaw,a.pitch=r.toPitch,r=null,P(),S()),N()},flip(){h&&H(se()+Math.PI,0,Z)},inspectEdge(){h&&H(se()+Te,0,Z)},reset(){h&&H(Math.round(a.yaw/D)*D,0,Z)},nudge(t){if(!h)return;const o=r?r.toYaw:a.yaw;H(o+t*Pe,0,_e)},pointerDown(t){if(!h||s||t.pointerType==="mouse"&&t.button!==0)return;const o=t.currentTarget;o.setPointerCapture?.(t.pointerId),r=null,A=-1,a.yawVel=0,a.pitchVel=0,s={id:t.pointerId,x:t.clientX,y:t.clientY,ts:t.timeStamp,width:Math.max(1,o.clientWidth),vel:0}},pointerMove(t){if(!s||t.pointerId!==s.id)return;const o=Math.PI/s.width,l=t.clientX-s.x,g=t.clientY-s.y,x=Math.max(1,t.timeStamp-s.ts)/1e3;a.yaw+=l*o,a.pitch=V(a.pitch-g*o*.6,-me,me),s.vel=s.vel*.6+l*o/x*.4,s.x=t.clientX,s.y=t.clientY,s.ts=t.timeStamp,S()},pointerUp(t){if(!s||t.pointerId!==s.id)return;const l=t.timeStamp-s.ts>80?0:V(s.vel,-8,8);t.currentTarget.releasePointerCapture?.(t.pointerId),s=null,_()?(a.yawVel=l,a.pitchVel=0,A=f):(a.pitch=0,P(),S())},dispose(){c||(c=!0,G(),w&&cancelAnimationFrame(w),w=0,J.abort(),U?.disconnect(),W?.disconnect(),document.removeEventListener("visibilitychange",ee),n.removeEventListener("webglcontextlost",Q),e&&!e.isContextLost()&&(O.forEach(t=>e.deleteTexture(t)),C&&e.deleteBuffer(C),y&&e.deleteVertexArray(y),d&&e.deleteProgram(d),e.getExtension("WEBGL_lose_context")?.loseContext()),O.length=0,e=null)}}}return ce()}export{ze as createMedallionRenderer};
