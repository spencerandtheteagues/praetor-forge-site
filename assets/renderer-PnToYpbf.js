const ye=`#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,Pe=`#version 300 es
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
uniform sampler2D uEdgeTex; // R: V-groove depth, G: crisp glyph mask, B: bevel highlight

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

// Sample cylindrical rim engraving (4 quadrants around circumference: -90, 0, +90, 180 deg).
vec3 sampleEdgeEngraving(vec3 p, float lod) {
  float ang = atan(p.y, p.x);
  float u = fract((ang / 1.57079632679) + 0.5);
  float v = clamp((p.z / 0.104) * 0.5 + 0.5, 0.0, 1.0);
  float band = 1.0 - smoothstep(0.097, 0.105, abs(p.z));
  return textureLod(uEdgeTex, vec2(u, v), lod).rgb * band;
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

  // Numismatic rim: outer 144-reed collars, twin gold guard fillets, and 3D V-cut edge inscription.
  float ang = atan(p.y, p.x);
  float reedBand = smoothstep(0.107, 0.115, az) * (1.0 - smoothstep(HALF_T - 0.015, HALF_T - 0.004, az));
  float reeds = sin(ang * 144.0) * 0.0065 * reedBand;
  float wireRings = gauss((az - 0.104) / 0.0042) * 0.0065;
  float engraveCut = 0.0;
  if (r > R - 0.045 && az < 0.104) {
    engraveCut = -sampleEdgeEngraving(p, 0.5).r * 0.0105;
  }

  float effR = R + reeds + wireRings + engraveCut;
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
  float inWingTip = smoothstep(0.42, 0.52, hData.g) * smoothstep(R - 0.015, R + 0.006, r) * smoothstep(HALF_T - 0.032, HALF_T - 0.010, az);
  float inCoinFace = (1.0 - smoothstep(R - 0.026, R - 0.011, r)) * smoothstep(HALF_T - 0.016, HALF_T - 0.004, az);
  float faceMask = clamp(max(inCoinFace, inWingTip), 0.0, 1.0);

  // Numismatic bronze rim + 24k gold V-cut edge inscription Easter egg (HDR -> ACES).
  vec3 edgeLinear = vec3(0.0);
  if (faceMask < 0.999) {
    float ang = atan(p.y, p.x);
    vec3 eng = az < 0.105 ? sampleEdgeEngraving(p, 0.0) : vec3(0.0);
    float inBand = 1.0 - smoothstep(0.100, 0.107, az);
    float guardRail = gauss((az - 0.104) / 0.0045);

    // Rich patinated bronze inscription band framed by bright 24k gold guard rails & outer reeds
    vec3 bandAlb = vec3(0.30, 0.17, 0.075);
    vec3 collarAlb = vec3(0.78, 0.49, 0.21);
    vec3 eAlb = mix(collarAlb, bandAlb, inBand);
    eAlb = mix(eAlb, vec3(0.96, 0.74, 0.32), clamp(guardRail * 0.85, 0.0, 1.0));

    float eMetal = mix(0.96, 0.88, inBand);
    float eRough = mix(0.14, 0.27, inBand);

    // Chiseled 24k gold leaf V-cut lettering + dark bevel shadow shoulder
    float strokeMask = smoothstep(0.22, 0.72, eng.g);
    float bevelRim = clamp(eng.b * 1.15, 0.0, 1.0);
    eAlb = mix(eAlb, vec3(0.06, 0.035, 0.015), clamp(bevelRim * 0.65, 0.0, 1.0));
    eAlb = mix(eAlb, vec3(1.0, 0.80, 0.36), strokeMask);
    eMetal = mix(eMetal, 0.99, strokeMask);
    eRough = mix(eRough, 0.11, strokeMask);

    float sweep = 0.32 + 0.30 * (0.5 + 0.5 * sin(ang * 2.0 - uTime * 1.7));
    vec3 eEmiss = vec3(1.05, 0.74, 0.26) * strokeMask * sweep * uEdge;

    vec3 F0 = mix(vec3(0.04), eAlb, eMetal);
    vec3 F = F0 + (1.0 - F0) * pow(1.0 - NoV, 5.0);
    float specPow = mix(180.0, 14.0, eRough * eRough);
    vec3 envS = studioEnv(Rdir) * mix(1.30, 0.52, eRough) * F;
    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);
    vec3 H3 = normalize(L3 + V);
    vec3 d1 = F * pow(max(dot(N, H1), 0.0), specPow) * 1.85 * vec3(2.4, 2.05, 1.65) * max(dot(N, L1), 0.0);
    vec3 d2 = F * pow(max(dot(N, H2), 0.0), specPow * 0.7) * 1.35 * vec3(0.95, 1.20, 1.45) * max(dot(N, L2), 0.0);
    vec3 d3 = F * pow(max(dot(N, H3), 0.0), specPow * 1.1) * vec3(1.65, 1.10, 0.55) * max(dot(N, L3), 0.0);
    vec3 amb = vec3(0.14, 0.10, 0.06) * eAlb;
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
`,ae=[["uObvAlb","/medallion/obvAlb.webp"],["uObvHgt","/medallion/obvHgt.png"],["uObvEmi","/medallion/obvEmi.webp"],["uRevAlb","/medallion/revAlb.webp"],["uRevHgt","/medallion/revHgt.png"],["uRevEmi","/medallion/revEmi.webp"]],G=[{steps:128,shadow:18,scale:1},{steps:96,shadow:12,scale:.85},{steps:72,shadow:8,scale:.7}],_e=2,Z=Math.PI*2,Se=Z/28,Me=Math.PI/12,Ce=280,ze=1.8,q=1.38,ge=6;async function Fe(){try{document.fonts?.ready&&await Promise.race([document.fonts.ready,new Promise(f=>setTimeout(f,900))])}catch{}const l=2048,g=256,h=3020,b=256,d=f=>{const v=document.createElement("canvas");v.width=l,v.height=g;const i=v.getContext("2d",{willReadFrequently:!0});return i.fillStyle="#000",i.fillRect(0,0,l,g),i.save(),i.scale(l/h,1),f>0&&(i.filter=`blur(${f}px)`),i.fillStyle="#fff",i.strokeStyle="#fff",i.textAlign="center",i.textBaseline="middle",i.lineWidth=2.4,i.globalAlpha=.55,i.beginPath(),i.moveTo(0,22),i.lineTo(h,22),i.moveTo(0,b-22),i.lineTo(h,b-22),i.stroke(),i.globalAlpha=.9,i.font='700 42px "Cinzel", Georgia, serif',i.fillText("✦",0,b*.5),i.fillText("✦",h,b*.5),i.globalAlpha=1,"letterSpacing"in i&&(i.letterSpacing="4.8px"),i.font='800 58px "Cinzel", Georgia, serif',i.fillText("SPENCER ALLEN TEAGUE · STARTED THE JOURNEY IN 2020",h*.5,94),"letterSpacing"in i&&(i.letterSpacing="5.8px"),i.font='700 52px "Cinzel", Georgia, serif',i.fillText("AND FOUNDED THE HARNESS LAB IN 2025",h*.5,170),i.restore(),i.getImageData(0,0,l,g)},x=d(0),R=d(3.2),P=new ImageData(l,g),N=x.data,k=R.data,m=P.data;for(let f=0;f<N.length;f+=4){const v=N[f],i=k[f];m[f]=Math.min(255,Math.round(i*.62+v*.48)),m[f+1]=v,m[f+2]=Math.min(255,Math.max(0,Math.round(Math.abs(i-v)*2.1))),m[f+3]=255}const u=document.createElement("canvas");return u.width=l,u.height=g,u.getContext("2d").putImageData(P,0,0),createImageBitmap(u,{imageOrientation:"flipY",premultiplyAlpha:"none",colorSpaceConversion:"none"})}const De=l=>l<.5?4*l*l*l:1-(-2*l+2)**3/2,D=(l,g,h)=>Math.min(h,Math.max(g,l));function xe(l,g,h){const b=l.createShader(g);return l.shaderSource(b,h),l.compileShader(b),b}function Ne(l,{onReady:g,onFail:h,onInteractiveChange:b}={}){let d=!1,x=!1,R=!1,P=!1,N=!0,k=document.hidden,m=!1,u=0,f=0,v=0,i=0,_=0,E=0,U=0,V=0,y=0,S=0;const o={yaw:0,pitch:0,yawVel:0,pitchVel:0};let c=null,w=-1,s=null;const r={ema:0,base:1/0,slow:0,fast:0,warm:30,changedAt:0,drops:[0,0,0]};let e=null,p=null,B=null,O=null;const W=[];let T={};const oe=new AbortController;let K=null,j=null;function M(t){x||d||(x=!0,ee(),queueMicrotask(()=>{d||h?.(t)}))}const ie=()=>{M("context-lost")},re=()=>{k=document.hidden,L()};if(e=l.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!0}),!e||typeof createImageBitmap!="function")return M("unsupported"),ue();l.addEventListener("webglcontextlost",ie);const ne=xe(e,e.VERTEX_SHADER,ye),le=xe(e,e.FRAGMENT_SHADER,Pe);p=e.createProgram(),e.attachShader(p,ne),e.attachShader(p,le),e.linkProgram(p);const se=e.getExtension("KHR_parallel_shader_compile");B=e.createVertexArray(),e.bindVertexArray(B),O=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,O),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),ce(),K=new ResizeObserver(([t])=>{const a=t.contentBoxSize?.[0];U=a?a.inlineSize:t.contentRect.width,V=a?a.blockSize:t.contentRect.height,$()&&z()}),K.observe(l),j=new IntersectionObserver(([t])=>{N=t.isIntersecting,L()}),j.observe(l),document.addEventListener("visibilitychange",re),Te();async function be(){if(se){for(;!e.getProgramParameter(p,se.COMPLETION_STATUS_KHR);)if(await new Promise(t=>requestAnimationFrame(t)),d||x)return!1}return!!e.getProgramParameter(p,e.LINK_STATUS)}async function Ee(){return Promise.all(ae.map(async([,t])=>{const a=await fetch(t,{signal:oe.signal,credentials:"same-origin"});if(!a.ok)throw new Error(`${t}: ${a.status}`);const n=await a.blob();return createImageBitmap(n,{imageOrientation:"flipY",premultiplyAlpha:"none",colorSpaceConversion:"none"})}))}async function Te(){let t=null,a=null;try{const[n,A,F]=await Promise.all([be(),Ee(),Fe()]);if(t=A,a=F,d||x)return;if(!n)return M("compile");e.deleteShader(ne),e.deleteShader(le),e.useProgram(p);const I=e.getAttribLocation(p,"aPos");e.bindVertexArray(B),e.enableVertexAttribArray(I),e.vertexAttribPointer(I,2,e.FLOAT,!1,0,0),T={};for(const Y of["uRes","uTime","uPose","uBob","uPop","uEdge","uSteps","uShadowSteps"])T[Y]=e.getUniformLocation(p,Y);e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.NONE),ae.forEach(([Y],te)=>{const ve=e.createTexture();W.push(ve),e.activeTexture(e.TEXTURE0+te),e.bindTexture(e.TEXTURE_2D,ve),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE,t[te]),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.uniform1i(e.getUniformLocation(p,Y),te)});const pe=ae.length,he=e.createTexture();if(W.push(he),e.activeTexture(e.TEXTURE0+pe),e.bindTexture(e.TEXTURE_2D,he),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,e.RGBA,e.UNSIGNED_BYTE,a),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.uniform1i(e.getUniformLocation(p,"uEdgeTex"),pe),e.getError()!==e.NO_ERROR)return M("texture");e.uniform1f(T.uPop,1),e.uniform1f(T.uEdge,1),fe(),await Re()}catch{d||M("texture")}finally{t?.forEach(n=>n.close()),a?.close()}}async function Re(){for(;!$()&&(y===0||S===0);){if(await new Promise(a=>requestAnimationFrame(a)),d||x)return;ce()}J();const t=new Uint8Array(4);if(e.readPixels(y>>1,S>>1,1,1,e.RGBA,e.UNSIGNED_BYTE,t),e.getError()!==e.NO_ERROR||e.isContextLost()||t[3]<200)return M("invalid-frame");R=!0,g?.(),L()}function ce(){const t=l.getBoundingClientRect();U=t.width,V=t.height}function $(){if(!e||x||d)return!1;const t=Math.min(window.devicePixelRatio||1,_e)*G[E].scale,a=Math.max(1,Math.round(U*t)),n=Math.max(1,Math.round(V*t));return U===0||V===0||a===y&&n===S?!1:(y=l.width=a,S=l.height=n,!0)}function fe(){e.uniform1i(T.uSteps,G[E].steps),e.uniform1i(T.uShadowSteps,G[E].shadow)}function me(t){E=t,fe(),$(),r.slow=0,r.fast=0,r.warm=20,r.ema=0,r.changedAt=i}function we(t){if(r.warm>0){r.warm-=1;return}r.base=Math.max(4,Math.min(r.base,t)),r.ema=r.ema?r.ema+(t-r.ema)*.08:t;const a=Math.max(r.base*1.35,20);r.ema>a?(r.slow+=1,r.fast=0):r.ema<r.base*1.12?(r.fast+=1,r.slow=0):(r.slow=Math.max(0,r.slow-1),r.fast=0),r.slow>45&&E<G.length-1?(r.drops[E]+=1,me(E+1)):r.fast>300&&E>0&&r.drops[E-1]<2&&i-r.changedAt>10&&me(E-1)}function C(t){const a=!!t;m!==a&&(m=a,c=null,w=-1,o.yawVel=0,o.pitchVel=0,b?.(m),L(),z())}function Ae(t,a,n,A=De){if(o.yawVel=0,o.pitchVel=0,w=-1,!X()){c=null,o.yaw=t,o.pitch=a,H(),z();return}c={fromYaw:o.yaw,toYaw:t,fromPitch:o.pitch,toPitch:a,start:i,dur:n/1e3,ease:A}}function H(){const t=Math.round(o.yaw/Z);o.yaw-=t*Z}function Le(t){if(!s){if(c){const a=D((i-c.start)/c.dur,0,1),n=c.ease(a);o.yaw=c.fromYaw+(c.toYaw-c.fromYaw)*n,o.pitch=c.fromPitch+(c.toPitch-c.fromPitch)*n,a>=1&&(c=null,H());return}if(!m){_+=t,o.yaw+=Se*t,o.yaw>Math.PI&&(o.yaw-=Z),o.pitch*=Math.exp(-3.2*t),Math.abs(o.pitch)<5e-4&&(o.pitch=0);return}if(w>=0){o.yaw+=o.yawVel*t,o.pitch=D(o.pitch+o.pitchVel*t,-q,q);const a=Math.exp(-3.6*t);o.yawVel*=a,o.pitchVel*=a,(i-w>=ze||Math.abs(o.yawVel)<.002&&Math.abs(o.pitchVel)<.002)&&(o.yawVel=0,o.pitchVel=0,w=-1,H())}}}function J(){if(!e||x||d||y===0)return;const t=D(_/1.4,0,1),a=t*t*(3-2*t),n=o.pitch+Math.sin(_*.55)*.045*a,A=Math.sin(_*.42)*.025*a,F=Math.sin(_*.92)*.022*a;e.viewport(0,0,y,S),e.disable(e.BLEND),e.uniform2f(T.uRes,y,S),e.uniform1f(T.uTime,_),e.uniform3f(T.uPose,o.yaw,n,A),e.uniform1f(T.uBob,F),e.drawArrays(e.TRIANGLES,0,3)}function Q(){return!m||!!c||w>=0}function X(){return!d&&!x&&N&&!k&&!P}function de(t){if(u=0,!X()||!Q())return;const a=v?t-v:16.7;v=t;const n=Math.min(a,50)/1e3;i+=n,Le(n),J(),we(a),Q()&&(u=requestAnimationFrame(de))}function L(){R&&X()&&Q()?u||(v=0,r.warm=Math.max(r.warm,10),u=requestAnimationFrame(de)):ee()}function ee(){u&&cancelAnimationFrame(u),u=0}function z(){!R||u||f||x||d||(f=requestAnimationFrame(()=>{f=0,J()}))}function ue(){return{setHold(t){P=!!t,P&&c&&(o.yaw=c.toYaw,o.pitch=c.toPitch,c=null,H(),z()),L()},toggleInteractive(){R&&C(!m)},resumeSpin(){R&&C(!1)},nudge(t){if(!R)return;C(!0);const a=c?c.toYaw:o.yaw;Ae(a+t*Me,o.pitch,Ce),L()},pointerDown(t){if(!R||s||t.pointerType==="mouse"&&t.button!==0)return;const a=t.currentTarget,n=m;t.pointerType==="mouse"&&!m&&C(!0),(m||t.pointerType==="mouse")&&a.setPointerCapture?.(t.pointerId),c=null,w=-1,o.yawVel=0,o.pitchVel=0,s={id:t.pointerId,pointerType:t.pointerType,startX:t.clientX,startY:t.clientY,x:t.clientX,y:t.clientY,maxDist:0,ts:t.timeStamp,width:Math.max(1,a.clientWidth),velYaw:0,velPitch:0,wasInteractive:n}},pointerMove(t){if(!s||t.pointerId!==s.id)return;const a=Math.hypot(t.clientX-s.startX,t.clientY-s.startY);if(a>s.maxDist&&(s.maxDist=a),!m)return;const n=Math.PI/s.width,A=t.clientX-s.x,F=t.clientY-s.y,I=Math.max(1,t.timeStamp-s.ts)/1e3;o.yaw+=A*n,o.pitch=D(o.pitch-F*n*.72,-q,q),s.velYaw=s.velYaw*.6+A*n/I*.4,s.velPitch=s.velPitch*.6+-F*n*.72/I*.4,s.x=t.clientX,s.y=t.clientY,s.ts=t.timeStamp,z()},pointerUp(t){if(!s||t.pointerId!==s.id)return;const a=s;if(s=null,t.currentTarget.hasPointerCapture?.(t.pointerId)&&t.currentTarget.releasePointerCapture?.(t.pointerId),t.type==="pointercancel")return;const n=a.maxDist<(a.pointerType==="mouse"?ge:12);if(!a.wasInteractive&&!m&&n){C(!0);return}if(a.wasInteractive&&n){C(!1);return}m&&(!(t.timeStamp-a.ts>80)&&X()&&a.maxDist>=ge?(o.yawVel=D(a.velYaw,-6,6),o.pitchVel=D(a.velPitch,-4,4),w=i,L()):(o.yawVel=0,o.pitchVel=0,w=-1,H(),L(),z()))},dispose(){d||(d=!0,ee(),f&&cancelAnimationFrame(f),f=0,oe.abort(),K?.disconnect(),j?.disconnect(),document.removeEventListener("visibilitychange",re),l.removeEventListener("webglcontextlost",ie),e&&!e.isContextLost()&&(W.forEach(t=>e.deleteTexture(t)),O&&e.deleteBuffer(O),B&&e.deleteVertexArray(B),p&&e.deleteProgram(p),e.getExtension("WEBGL_lose_context")?.loseContext()),W.length=0,e=null)}}}return ue()}export{Ne as createMedallionRenderer};
