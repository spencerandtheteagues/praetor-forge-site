// GLSL ES 3.00 sources for the raymarched Harness Lab medallion.
//
// Changes from the reference shader (MASTER-PLAN-2027 Chapter I):
//  1. smoothstep bounds are always ascending; inverted ramps are written as
//     1.0 - smoothstep(lo, hi, x).
//  2. All texture fetches use explicit LODs (implicit derivatives are undefined
//     inside divergent rays). JPEG relief is filtered at mip 1.5; lossless raised
//     lettering stays at mip 0 so smoothing stone never erases the inscription.
//  3. No backdrop and no motes. Misses are transparent, silhouette coverage comes
//     from the closest approach of the ray, and the output is premultiplied
//     vec4(col * a, a). The pedestal is a bounded dark contact disc with alpha.
//  4. One texture convention: every texture is uploaded as an ImageBitmap decoded
//     with imageOrientation:'flipY', so uv (0,0) is the bottom-left of each image
//     and the ad-hoc 1 - uv.y flips are gone. The reverse face mirrors u only.
//  5. The march is clipped to a ray-cylinder/slab bound, hits are refined with
//     four bisection steps, and normals use a tetrahedral 4-tap.
//  Also: pow(x, 2.0) with a negative x is undefined in GLSL, so the reference's
//  Gaussian bands are written as exp(-(x * x)).

export const VERTEX_SHADER = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAGMENT_SHADER = `#version 300 es
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
`;
