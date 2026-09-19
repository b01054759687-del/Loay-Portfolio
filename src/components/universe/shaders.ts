// GLSL for the Growth Universe. Everything is procedural: no textures, no
// external assets, so the whole scene costs a few KB of shader text.

export const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

export const HASH = /* glsl */ `
float hash21(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
vec3 hash33(vec3 p3){ p3=fract(p3*vec3(.1031,.1030,.0973)); p3+=dot(p3,p3.yxz+33.33); return fract((p3.xxy+p3.yxx)*p3.zyx); }
`;

// ---------------------------------------------------------------- starfield
// A parallax dust field that (a) drifts on curl-ish noise, (b) parts around
// the cursor, (c) gathers into the Loop ring as that section comes into view,
// and (d) streams toward the camera when a world is entered.
export const starVert = /* glsl */ `
${NOISE}
uniform float uTime; uniform float uScroll; uniform float uWarp; uniform float uMorph;
uniform float uPx; uniform float uRingR; uniform float uPointerOn; uniform float uH;
uniform vec2 uPointer; uniform vec3 uRingC;
attribute vec4 aData; attribute float aSize; attribute vec3 aColor;
varying vec3 vColor; varying float vAlpha;
void main(){
  vec3 p = position;
  float depth = clamp((p.z + 14.0) / 18.0, 0.0, 1.0);
  p.y = mod(p.y - uScroll * (0.05 + depth * 0.85) + uH * 0.5, uH) - uH * 0.5;

  vec3 drift = vec3(
    snoise(vec3(p.xy * 0.18, uTime * 0.04)),
    snoise(vec3(p.yx * 0.18 + 7.3, uTime * 0.04)),
    snoise(vec3(p.xy * 0.18 + 3.1, uTime * 0.03))
  );
  p += drift * 0.55;

  vec2 pw = uPointer * ((10.0 - p.z) / 10.0);
  vec2 d = p.xy - pw;
  float f = exp(-dot(d, d) * 0.9) * uPointerOn;
  p.xy += (d / (length(d) + 0.001)) * f * 0.55 * (0.3 + depth);

  float a = aData.z + uTime * 0.06;
  float rr = uRingR + aData.w * 0.24;
  vec3 target = uRingC + vec3(cos(a) * rr, sin(a) * rr, aData.w * 0.35);
  float mask = step(aData.x, 0.42);
  float m = smoothstep(aData.x * 0.3, aData.x * 0.3 + 0.6, uMorph) * mask;
  p = mix(p, target, m);

  float wz = uWarp * (14.0 + aData.x * 24.0);
  p.z = mod(p.z + wz + 14.0, 18.0) - 14.0;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float sz = aSize * uPx * (20.0 / -mv.z) * (1.0 + uWarp * 2.2 + m * 0.6);
  gl_PointSize = clamp(sz, 1.4 * uPx, 11.0 * uPx);

  float tw = 0.6 + 0.4 * sin(uTime * (0.6 + aData.x * 1.4) + aData.y * 6.2831);
  float nearFade = smoothstep(1.5, 4.0, -mv.z);
  vAlpha = tw * (0.45 + depth * 0.9) * (1.0 + m * 1.6) * nearFade;
  vColor = mix(aColor, vec3(0.84, 0.64, 0.31), m * 0.55);
}
`;

export const starFrag = /* glsl */ `
varying vec3 vColor; varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = pow(smoothstep(0.5, 0.0, d), 1.6);
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
}
`;

// --------------------------------------------------------------------- core
export const coreVert = /* glsl */ `
${NOISE}
uniform float uTime; uniform float uEnergy;
varying vec3 vN; varying vec3 vPos; varying vec3 vView; varying float vDisp;
void main(){
  vec3 p = position;
  float n = snoise(p * 1.25 + vec3(uTime * 0.22, uTime * 0.17, 0.0));
  float n2 = snoise(p * 2.7 - vec3(uTime * 0.31));
  float disp = (n * 0.04 + n2 * 0.015 * (0.5 + uEnergy)) * (0.7 + uEnergy * 0.9);
  p += normal * disp;
  vDisp = disp; vPos = p;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const coreFrag = /* glsl */ `
${NOISE}
uniform vec3 uBlue; uniform vec3 uViolet; uniform vec3 uGold;
uniform float uTime; uniform float uEnergy; uniform float uOpacity;
varying vec3 vN; varying vec3 vPos; varying vec3 vView; varying float vDisp;
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(vView);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);
  float n1 = snoise(vPos * 1.6 + vec3(0.0, uTime * 0.12, 0.0));
  float n2 = snoise(vPos * 3.4 - vec3(uTime * 0.2, 0.0, uTime * 0.1));
  float swirl = snoise(vec3(vPos.xy * 1.2 + n1 * 0.8, vPos.z + uTime * 0.1));

  vec3 col = mix(vec3(0.10, 0.13, 0.5), uBlue * 1.25, smoothstep(-0.6, 0.6, n1));
  col = mix(col, uViolet * 1.35, smoothstep(0.1, 0.9, swirl * 0.6 + fres * 0.6 + 0.25));
  col = mix(col, uGold * 1.15, smoothstep(0.55, 0.95, swirl * 0.5 + fres * 0.9 + n2 * 0.25) * (0.7 + uEnergy * 0.5));
  col += vec3(1.0, 0.92, 0.8) * pow(fres, 4.0) * 1.1;
  col += uBlue * 0.4 * (0.6 + 0.4 * n1) * (1.0 - fres);
  col *= (0.95 + uEnergy * 0.6) * uOpacity;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const haloVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

export const haloFrag = /* glsl */ `
uniform vec3 uColor; uniform float uIntensity;
varying vec2 vUv;
void main(){
  float d = length(vUv - 0.5) * 2.0;
  float a = exp(-d * d * 4.2) * uIntensity * smoothstep(1.0, 0.7, d);
  gl_FragColor = vec4(uColor * a, 1.0);
}
`;

// --------------------------------------------------------------- loop ring
export const ringVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

// s = 0 at the top of the ring, increasing clockwise: the Diagnose node sits
// at s=0 and the four nodes at 0, .25, .5, .75.
export const ringFrag = /* glsl */ `
uniform float uProgress; uniform float uTime; uniform float uVis; uniform float uGlow;
uniform vec3 uBlue; uniform vec3 uGold;
varying vec2 vUv;
void main(){
  float s = fract(0.25 - vUv.x);
  float lit = step(s, uProgress);
  vec3 base = mix(uBlue * 0.32, mix(uBlue, uGold, smoothstep(0.7, 1.0, s)), lit);
  float head = exp(-abs(s - uProgress) * 60.0);
  float travel = exp(-mod(uTime * 0.11 - s, 1.0) * 14.0);
  vec3 col = base * (0.6 + lit * 0.9) + uGold * head * 1.6 + vec3(1.0) * travel * 0.55;
  col *= uVis * (uGlow > 0.5 ? 0.16 : 1.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

// ------------------------------------------------------------------ planets
export const planetVert = /* glsl */ `
uniform float uTime; uniform float uHover; uniform float uSeed;
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
void main(){
  float ang = uTime * 0.12 * (1.0 + uHover * 1.5) + uSeed;
  float c = cos(ang); float s = sin(ang);
  vObj = vec3(c * position.x + s * position.z, position.y, -s * position.x + c * position.z);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

// One shader, five visual languages selected by uKind — each planet reads as
// its own business world, not a recolored copy:
//   0 PlanSee   : lit-window architecture on a survey grid (interior finishing)
//   1 Markmerce : faceted crystal with a scanning band (creative testing)
//   2 Amlaak    : tile wall with a workflow signal running through it
//   3 Agentic AI: a Voronoi neural mesh with pulses travelling the edges
//   4 Harer     : dormant bands re-igniting into gold (reactivation)
export const planetFrag = /* glsl */ `
${HASH}
uniform float uTime; uniform float uHover; uniform float uDim; uniform float uKind;
uniform vec3 uColor; uniform vec3 uGoldC;
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
const float PI = 3.14159265;

float gridLine(float v, float w){ float f = abs(fract(v) - 0.5) * 2.0; return smoothstep(1.0 - w, 1.0, f); }

vec2 vor(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x);
  float d1 = 8.0; float d2 = 8.0;
  for (int a = -1; a <= 1; a++) for (int b = -1; b <= 1; b++) for (int c = -1; c <= 1; c++) {
    vec3 g = vec3(float(a), float(b), float(c));
    vec3 o = hash33(i + g);
    o = 0.5 + 0.5 * sin(uTime * 0.4 + 6.2831 * o);
    vec3 r = g + o - f;
    float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  return vec2(sqrt(d1), sqrt(d2));
}

void main(){
  vec3 p = normalize(vObj);
  float lon = atan(p.z, p.x) / (2.0 * PI) + 0.5;
  float lat = asin(clamp(p.y, -1.0, 1.0)) / PI + 0.5;
  vec3 N = normalize(vN); vec3 V = normalize(vView);
  float ndv = max(dot(N, V), 0.0);
  float fres = pow(1.0 - ndv, 2.2);
  vec3 L = normalize(vec3(-0.5, 0.55, 0.75));
  float diff = max(dot(N, L), 0.0);
  vec3 col = vec3(0.0);
  float shade = 0.5 + 0.5 * diff;

  if (uKind < 0.5) {
    vec3 base = mix(vec3(0.05, 0.035, 0.02), vec3(0.17, 0.115, 0.05), lat);
    float grid = max(gridLine(lon * 36.0, 0.07), gridLine(lat * 18.0, 0.07));
    vec2 g = vec2(lon * 36.0, lat * 18.0);
    vec2 cell = floor(g); vec2 f = fract(g);
    float r = hash21(cell);
    float win = step(0.12, f.x) * step(f.x, 0.88) * step(0.14, f.y) * step(f.y, 0.86);
    float lit = step(0.76, r) * win * (0.55 + 0.45 * sin(uTime * 0.7 + r * 40.0));
    col = base + uColor * grid * 0.32 + uColor * 1.25 * lit;
  } else if (uKind < 1.5) {
    vec3 fn = normalize(cross(dFdx(vView), dFdy(vView)));
    float fl = 0.3 + 0.7 * max(dot(fn, L), 0.0);
    float band = exp(-pow((fract(lat * 1.0 - uTime * 0.12) - 0.5) * 8.0, 2.0));
    col = uColor * 0.55 * fl + uColor * 1.3 * band * fl + vec3(0.7, 0.8, 1.0) * band * 0.3;
    shade = 1.0;
  } else if (uKind < 2.5) {
    vec2 g = vec2(lon * 28.0, lat * 14.0);
    vec2 cell = floor(g); vec2 f = fract(g);
    float mortar = 1.0 - smoothstep(0.0, 0.09, min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)));
    float r = hash21(cell);
    vec3 tile = mix(vec3(0.02, 0.03, 0.07), uColor * 0.42, r * 0.7 + 0.1);
    float seq = cell.x + cell.y * 5.0;
    float d = mod(uTime * 5.0 - seq, 140.0);
    float trail = exp(-d * 0.35) * step(d, 20.0);
    col = tile * (1.0 - mortar) + uGoldC * trail * (1.0 - mortar) * 1.7 + uColor * 0.08 * mortar;
  } else if (uKind < 3.5) {
    vec2 v = vor(p * 3.2);
    float edge = 1.0 - smoothstep(0.0, 0.09, v.y - v.x);
    float node = 1.0 - smoothstep(0.0, 0.16, v.x);
    float pulse = smoothstep(0.7, 1.0, sin(dot(p, vec3(1.0, 0.6, 0.3)) * 5.0 - uTime * 1.4));
    col = vec3(0.01, 0.02, 0.06) + uColor * edge * (0.5 + 1.3 * pulse) + uColor * node * 0.9 + vec3(node) * 0.25;
  } else {
    float front = 0.5 + 0.5 * sin(uTime * 0.35);
    float act = 1.0 - smoothstep(front - 0.08, front + 0.08, lat);
    float st = 0.5 + 0.5 * sin(lat * 70.0 + sin(lon * 6.2831 * 3.0) * 0.6 - uTime * 0.6);
    vec3 dormant = vec3(0.10, 0.12, 0.18) * (0.4 + 0.6 * st);
    vec3 awake = mix(uColor, uGoldC, smoothstep(0.0, 1.0, st)) * (0.6 + 0.7 * st);
    col = mix(dormant, awake, act);
  }

  col *= mix(1.0, shade, 0.85);
  vec3 rim = uColor * fres * 1.3 + vec3(1.0) * pow(fres, 6.0) * 0.35;
  col += rim * (1.0 + uHover);
  col *= 1.0 + uHover * 0.45;
  float lum = dot(col, vec3(0.3, 0.59, 0.11));
  col = mix(col, vec3(lum), uDim * 0.35) * (1.0 - uDim * 0.5);
  gl_FragColor = vec4(col, 1.0);
}
`;
