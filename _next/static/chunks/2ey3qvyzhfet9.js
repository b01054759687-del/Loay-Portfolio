(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,29703,e=>{"use strict";var t=e.i(43476),r=e.i(71645),o=e.i(75056),a=e.i(94800),i=e.i(90072),n=e.i(12725);let l={time:0,dt:.016,ppu:100,vw:1,vh:1,scroll:0,reduced:!1,warp:0,pointer:{x:0,y:0,nx:0,ny:0},anchors:new Map,loop:{x:0,y:0,r:1,vis:0}};function u(e,t,r){let o=Math.min(1,Math.max(0,(r-e)/(t-e)));return o*o*(3-2*o)}let s=`
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
`,v=`
float hash21(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
vec3 hash33(vec3 p3){ p3=fract(p3*vec3(.1031,.1030,.0973)); p3+=dot(p3,p3.yxz+33.33); return fract((p3.xxy+p3.yxx)*p3.zyx); }
`,c=`
${s}
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
`,f=`
varying vec3 vColor; varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = pow(smoothstep(0.5, 0.0, d), 1.6);
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
}
`,p=`
${s}
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
`,d=`
${s}
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
`,m=`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`,x=`
uniform vec3 uColor; uniform float uIntensity;
varying vec2 vUv;
void main(){
  float d = length(vUv - 0.5) * 2.0;
  float a = exp(-d * d * 4.2) * uIntensity * smoothstep(1.0, 0.7, d);
  gl_FragColor = vec4(uColor * a, 1.0);
}
`,h=`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`,y=`
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
`,g=`
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
`,w=`
${v}
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
`;function M({count:e}){let o=(0,r.useRef)(null),{positions:n,data:u,sizes:s,colors:v,args:p}=(0,r.useMemo)(()=>{let t,r=(t=11,()=>{let e=Math.imul((t=t+0x6d2b79f5|0)^t>>>15,1|t);return(((e=e+Math.imul(e^e>>>7,61|e)^e)^e>>>14)>>>0)/0x100000000}),o=new Float32Array(3*e),a=new Float32Array(4*e),n=new Float32Array(e),l=new Float32Array(3*e);for(let t=0;t<e;t++){o[3*t]=(r()-.5)*46,o[3*t+1]=(r()-.5)*26,o[3*t+2]=-14+18*r(),a[4*t]=r(),a[4*t+1]=r(),a[4*t+2]=r()*Math.PI*2,a[4*t+3]=2*r()-1,n[t]=.6+r()*r()*2.2;let e=.1>r(),i=.75+.25*r();l[3*t]=e?.84:.62*i,l[3*t+1]=e?.64:.72*i,l[3*t+2]=e?.31:+i}return{positions:o,data:a,sizes:n,colors:l,args:[{vertexShader:c,fragmentShader:f,transparent:!0,depthWrite:!1,blending:i.AdditiveBlending,uniforms:{uTime:{value:0},uScroll:{value:0},uWarp:{value:0},uMorph:{value:0},uPx:{value:1},uRingR:{value:1},uPointerOn:{value:1},uH:{value:26},uPointer:{value:[0,0]},uRingC:{value:[0,0,0]}}}]}},[e]);return(0,a.useFrame)(({gl:e})=>{let t=o.current?.uniforms;t&&(t.uTime.value=l.time,t.uScroll.value=l.scroll,t.uWarp.value=l.warp,t.uMorph.value=l.loop.vis,t.uPx.value=e.getPixelRatio(),t.uRingR.value=l.loop.r,t.uPointerOn.value=+!l.reduced,t.uPointer.value=[l.pointer.x,l.pointer.y],t.uRingC.value=[l.loop.x,l.loop.y,0])}),(0,t.jsxs)("points",{frustumCulled:!1,children:[(0,t.jsxs)("bufferGeometry",{children:[(0,t.jsx)("bufferAttribute",{attach:"attributes-position",args:[n,3]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aData",args:[u,4]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aSize",args:[s,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aColor",args:[v,3]})]}),(0,t.jsx)("shaderMaterial",{ref:o,args:p})]})}let b=new i.Color("#4f6bff"),j=new i.Color("#7a5cff"),C=new i.Color("#d7a44f");function z(){let e=(0,r.useRef)(null),o=(0,r.useRef)(null),u=(0,r.useRef)(null),s=(0,r.useRef)(.3),v=(0,r.useRef)(0),c=(0,r.useRef)(0),{coreArgs:f,haloArgs:h}=(0,r.useMemo)(()=>({coreArgs:[{vertexShader:p,fragmentShader:d,uniforms:{uTime:{value:0},uEnergy:{value:.3},uOpacity:{value:1},uBlue:{value:b},uViolet:{value:j},uGold:{value:C}}}],haloArgs:[{vertexShader:m,fragmentShader:x,transparent:!0,depthWrite:!1,blending:i.AdditiveBlending,uniforms:{uColor:{value:new i.Color("#4f6bff")},uIntensity:{value:.6}}}]}),[]);return(0,a.useFrame)(()=>{let t=e.current;if(!t)return;let r=0,a=0,i=0,f=0,p=0;for(let e of["core","mid","loop"]){let t=l.anchors.get(e);if(!t)continue;let o=1/(t.dyn*t.dyn+.05),n=Number(t.el.dataset.coreScale??.35);r+=o,a+=t.x*o,i+=t.y*o,f+=Math.min(t.w,t.h)*n*o,p=Math.max(p,Math.exp(-t.dyn*t.dyn*2.2))}if(!r){t.visible=!1;return}a/=r,i/=r,f/=r;let d=l.anchors.get("loop"),m=d?Math.exp(-d.dyn*d.dyn*3):0;n.universe.loopStep!==c.current&&(c.current=n.universe.loopStep,v.current=1),v.current*=Math.exp(-(2.2*l.dt));let x=.25+.35*m+.9*v.current+1.2*l.warp+.1*!!n.universe.hovered;s.current+=(x-s.current)*(1-Math.exp(-(4*l.dt))),t.visible=!0,t.position.set(a,i,0),t.scale.setScalar(f*(.55+.45*p)),t.rotation.y+=(.5*l.pointer.nx-t.rotation.y)*Math.min(1,2.5*l.dt),t.rotation.x+=(-(.3*l.pointer.ny)-t.rotation.x)*Math.min(1,2.5*l.dt);let h=o.current?.uniforms;h&&(h.uTime.value=l.time,h.uEnergy.value=s.current,h.uOpacity.value=.35+.65*p);let y=u.current?.uniforms;y&&(y.uIntensity.value=(.45+.5*s.current)*(.4+.6*p),y.uColor.value.copy(b).lerp(C,Math.min(1,1.4*Math.max(0,s.current-.55))))}),(0,t.jsxs)("group",{ref:e,visible:!1,children:[(0,t.jsxs)("mesh",{children:[(0,t.jsx)("sphereGeometry",{args:[1,96,96]}),(0,t.jsx)("shaderMaterial",{ref:o,args:f})]}),(0,t.jsxs)("mesh",{position:[0,0,-.6],renderOrder:-1,children:[(0,t.jsx)("planeGeometry",{args:[6.2,6.2]}),(0,t.jsx)("shaderMaterial",{ref:u,args:h})]})]})}let P=new i.Color("#4f6bff"),T=new i.Color("#d7a44f"),R=new i.Color("#2a3266"),S=new i.Color("#dfe6ff"),V=[{x:0,y:1},{x:1,y:0},{x:0,y:-1},{x:-1,y:0}];function G({index:e,progress:o}){let n=(0,r.useRef)(null),s=(0,r.useRef)(null),v=(0,r.useRef)(null),c=(0,r.useRef)(0),f=V[e],p=3===e,d=(0,r.useMemo)(()=>[{vertexShader:m,fragmentShader:x,transparent:!0,depthWrite:!1,blending:i.AdditiveBlending,uniforms:{uColor:{value:new i.Color(p?"#d7a44f":"#4f6bff")},uIntensity:{value:0}}}],[p]);return(0,a.useFrame)(()=>{let t=o.current??0,r=u(e/4-.01,e/4+.02,t),a=+(Math.min(3,Math.floor(4*t))===e);c.current+=(r*(.55+.45*a)-c.current)*(1-Math.exp(-(8*l.dt)));let i=l.reduced?1:.9+.1*Math.sin(3*l.time+e),f=(.03+.03*c.current)*i;n.current&&n.current.scale.setScalar(f/.03),s.current&&s.current.color.copy(R).lerp(p?T:S,c.current);let d=v.current?.uniforms;d&&(d.uIntensity.value=1.15*c.current*l.loop.vis)}),(0,t.jsxs)("group",{position:[f.x,f.y,.02],children:[(0,t.jsxs)("mesh",{ref:n,children:[(0,t.jsx)("sphereGeometry",{args:[.03,24,24]}),(0,t.jsx)("meshBasicMaterial",{ref:s,color:"#2a3266",toneMapped:!1})]}),(0,t.jsxs)("mesh",{position:[0,0,-.02],children:[(0,t.jsx)("planeGeometry",{args:[.55,.55]}),(0,t.jsx)("shaderMaterial",{ref:v,args:d})]})]})}function A(){let e=(0,r.useRef)(null),o=(0,r.useRef)(null),u=(0,r.useRef)(null),s=(0,r.useRef)(0),[v,c]=(0,r.useMemo)(()=>{let e=e=>[{vertexShader:h,fragmentShader:y,transparent:!0,depthWrite:!1,blending:i.AdditiveBlending,uniforms:{uProgress:{value:0},uTime:{value:0},uVis:{value:0},uGlow:{value:e},uBlue:{value:P},uGold:{value:T}}}];return[e(0),e(1)]},[]);return(0,a.useFrame)(()=>{let t=e.current;if(!t)return;let r=l.anchors.get("loop");if(!r||l.loop.vis<.002){t.visible=!1;return}for(let e of(t.visible=!0,t.position.set(r.x,r.y,0),t.scale.setScalar(l.loop.r),t.rotation.y=.16*l.pointer.nx,t.rotation.x=-(.1*l.pointer.ny),s.current+=(n.universe.loopProgress-s.current)*(1-Math.exp(-(6*l.dt))),[o.current,u.current])){let t=e?.uniforms;t&&(t.uProgress.value=s.current,t.uTime.value=l.time,t.uVis.value=l.loop.vis)}}),(0,t.jsxs)("group",{ref:e,visible:!1,children:[(0,t.jsxs)("mesh",{children:[(0,t.jsx)("torusGeometry",{args:[1,.0075,8,320]}),(0,t.jsx)("shaderMaterial",{ref:o,args:v})]}),(0,t.jsxs)("mesh",{children:[(0,t.jsx)("torusGeometry",{args:[1,.05,8,320]}),(0,t.jsx)("shaderMaterial",{ref:u,args:c})]}),V.map((e,r)=>(0,t.jsx)(G,{index:r,progress:s},r))]})}let D=new i.Color("#d7a44f");function F({slug:e}){let o=n.worldVisuals[e],u=(0,r.useRef)(null),s=(0,r.useRef)(null),v=(0,r.useRef)(null),c=(0,r.useRef)(null),f=(0,r.useRef)(null),p=(0,r.useRef)(0),d=(0,r.useMemo)(()=>(function(e){let t=0;for(let r=0;r<e.length;r++)t=(31*t+e.charCodeAt(r))%997;return t/997})(e),[e]),{planetArgs:h,haloArgs:y}=(0,r.useMemo)(()=>{let e=new i.Color(o.color[0],o.color[1],o.color[2]);return{planetArgs:[{vertexShader:g,fragmentShader:w,uniforms:{uTime:{value:0},uHover:{value:0},uSeed:{value:6.28*d},uDim:{value:+!o.live},uKind:{value:o.kind},uColor:{value:e},uGoldC:{value:D}}}],haloArgs:[{vertexShader:m,fragmentShader:x,transparent:!0,depthWrite:!1,blending:i.AdditiveBlending,uniforms:{uColor:{value:e},uIntensity:{value:.5}}}]}},[o,d]);return(0,a.useFrame)(()=>{let t=u.current;if(!t)return;let r=l.anchors.get(`world:${e}`);if(!r||r.enter<.001||Math.abs(r.dyn)>1.5){t.visible=!1;return}t.visible=!0,p.current+=((n.universe.hovered===e)-p.current)*(1-Math.exp(-(6*l.dt)));let a=.44*Math.min(r.w,r.h),i=l.reduced?0:.04*Math.sin(.7*l.time+6.28*d)*a;t.position.set(r.x,r.y+i,0),t.scale.setScalar(a*(.6+.4*r.enter)*(1+.09*p.current)),t.rotation.y+=(.3*l.pointer.nx-t.rotation.y)*Math.min(1,2*l.dt),t.rotation.x+=(-(.2*l.pointer.ny)-t.rotation.x)*Math.min(1,2*l.dt);let m=c.current?.uniforms;m&&(m.uTime.value=l.time+40*d,m.uHover.value=p.current);let x=f.current?.uniforms;if(x&&(x.uIntensity.value=((o.live?.6:.3)+.55*p.current)*r.enter),s.current&&(s.current.rotation.y=.15*l.time),v.current){let e=.5*l.time+10*d;v.current.position.set(1.38*Math.cos(e),0,1.38*Math.sin(e))}}),(0,t.jsxs)("group",{ref:u,visible:!1,children:[(0,t.jsxs)("mesh",{children:[1===o.kind?(0,t.jsx)("icosahedronGeometry",{args:[1,2]}):(0,t.jsx)("sphereGeometry",{args:[1,72,72]}),(0,t.jsx)("shaderMaterial",{ref:c,args:h})]}),(0,t.jsxs)("mesh",{position:[0,0,-.7],renderOrder:-1,children:[(0,t.jsx)("planeGeometry",{args:[3.4,3.4]}),(0,t.jsx)("shaderMaterial",{ref:f,args:y})]}),(0,t.jsx)("group",{rotation:[1.25,0,.35+d],children:(0,t.jsxs)("group",{ref:s,children:[(0,t.jsxs)("mesh",{children:[(0,t.jsx)("torusGeometry",{args:[1.38,.006,6,160]}),(0,t.jsx)("meshBasicMaterial",{color:o.live?"#d7a44f":"#4f6bff",transparent:!0,opacity:.28,toneMapped:!1})]}),(0,t.jsxs)("mesh",{ref:v,children:[(0,t.jsx)("sphereGeometry",{args:[.045,16,16]}),(0,t.jsx)("meshBasicMaterial",{color:o.live?"#f6d8a0":"#a9b8ff",toneMapped:!1})]})]})})]})}function B(){return(0,t.jsx)(t.Fragment,{children:Object.keys(n.worldVisuals).map(e=>(0,t.jsx)(F,{slug:e},e))})}function _(){try{let e=document.createElement("canvas");return!!(e.getContext("webgl2")??e.getContext("webgl"))}catch{return!1}}function O(){return(0,r.useEffect)(()=>{n.universe.warpTarget=0,l.warp=0,l.time=0;let e=e=>{n.universe.pointerPx.x=e.clientX,n.universe.pointerPx.y=e.clientY};return window.addEventListener("pointermove",e,{passive:!0}),()=>{window.removeEventListener("pointermove",e),l.anchors.clear()}},[]),(0,a.useFrame)(({camera:e,size:t},r)=>{let o=Math.min(r,.05);l.dt=o,l.reduced||(l.time+=o);let a=2*Math.tan(i.MathUtils.degToRad(17.5))*10;l.ppu=t.height/a,l.vw=t.width,l.vh=t.height,l.scroll=window.scrollY/l.ppu,l.warp+=(n.universe.warpTarget-l.warp)*(1-Math.exp(-(5*o))),e.position.z=10-5.5*l.warp;let s=1-Math.exp(-(6*o)),v=n.universe.pointerPx.x/t.width,c=n.universe.pointerPx.y/t.height;l.pointer.nx+=(2*v-1-l.pointer.nx)*s,l.pointer.ny+=(-(2*c-1)-l.pointer.ny)*s,l.pointer.x=l.pointer.nx*(t.width/2/l.ppu),l.pointer.y=l.pointer.ny*(t.height/2/l.ppu);let f=(0,n.getAnchors)();for(let e of l.anchors.keys())f.has(e)||l.anchors.delete(e);f.forEach((e,r)=>{let o=e.getBoundingClientRect();if(0===o.width||0===o.height)return void l.anchors.delete(r);let a=l.anchors.get(r);a||(a={el:e,x:0,y:0,w:0,h:0,dyn:0,top:0,enter:0},l.anchors.set(r,a)),a.el=e;let i=o.left+o.width/2,n=o.top+o.height/2;a.x=(i-t.width/2)/l.ppu,a.y=-(n-t.height/2)/l.ppu,a.w=o.width/l.ppu,a.h=o.height/l.ppu,a.dyn=(n-t.height/2)/t.height,a.top=o.top,a.enter=1-u(.72*t.height,1.02*t.height,o.top)});let p=l.anchors.get("loop");p?(l.loop.x=p.x,l.loop.y=p.y,l.loop.r=.4*Math.min(p.w,p.h),l.loop.vis=1-u(.35,1.15,Math.abs(p.dyn))):l.loop.vis=0}),null}e.s(["default",0,function(){let[e]=(0,r.useState)(_),[a]=(0,r.useState)(()=>window.matchMedia("(max-width: 767px)").matches);return((0,r.useEffect)(()=>(l.reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e&&(document.documentElement.dataset.universe="on"),()=>{delete document.documentElement.dataset.universe}),[e]),e)?(0,t.jsxs)(o.Canvas,{frameloop:"always",dpr:[1,a?1.5:1.75],camera:{position:[0,0,10],fov:35,near:.1,far:60},gl:{antialias:!0,alpha:!1,powerPreference:"high-performance"},children:[(0,t.jsx)("color",{attach:"background",args:["#0a0a0c"]}),(0,t.jsx)(O,{}),(0,t.jsx)(M,{count:a?6e3:11e3}),(0,t.jsx)(z,{}),(0,t.jsx)(A,{}),(0,t.jsx)(B,{})]}):null}],29703)},57773,function(e){e.n(e.i(29703))}]);