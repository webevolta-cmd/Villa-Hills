// Hero "The Real Hills" — real elevation data around Ptghni drawn as gold contour lines.
import * as THREE from "./vendor/three.module.min.js";

const CAPTURE = new URLSearchParams(location.search).has("capture");
if (CAPTURE) document.body.classList.add("capture");
const $ = (id) => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------------ data */
const dem = await (await fetch("data/ptghni-dem.json")).json();
const GW = dem.w, GH = dem.h, G = dem.data;
const UNIT = 100, EXAG = 3.0;               // 1 world unit = 100 m, heights x3
const base = dem.ptghni.elev;
const toX = (gx) => (gx - dem.ptghni.gx) / (GW - 1) * dem.width_m / UNIT;
const toZ = (gy) => (gy - dem.ptghni.gy) / (GH - 1) * dem.height_m / UNIT;
const toY = (e) => (e - base) / UNIT * EXAG;
const RMAX = 0.5 * Math.min(dem.width_m, dem.height_m) / UNIT;   // circular fade radius
$("mkElev").textContent = Math.round(base).toLocaleString("en-US") + " m";

/* --------------------------------------------- contour lines (marching squares) */
const STEP = 10, HOVER_LEVEL = 1400;
const pos = [], aLevel = [], aIndex = [], aR = [];
const hoverPts = [];
const lmin = dem.min, lmax = dem.max;
for (let L = Math.ceil(lmin / STEP) * STEP; L <= lmax; L += STEP) {
  const y = toY(L), nl = (L - lmin) / (lmax - lmin), isIdx = L % 50 === 0 ? 1 : 0;
  for (let j = 0; j < GH - 1; j++) {
    for (let i = 0; i < GW - 1; i++) {
      const a = G[j * GW + i], b = G[j * GW + i + 1], c = G[(j + 1) * GW + i + 1], d = G[(j + 1) * GW + i];
      let code = 0;
      if (a > L) code |= 8; if (b > L) code |= 4; if (c > L) code |= 2; if (d > L) code |= 1;
      if (code === 0 || code === 15) continue;
      const f = (v1, v2) => (L - v1) / (v2 - v1);
      const T = () => [i + f(a, b), j], R = () => [i + 1, j + f(b, c)], B = () => [i + f(d, c), j + 1], Lf = () => [i, j + f(a, d)];
      let segs;
      switch (code) {
        case 1: case 14: segs = [[Lf(), B()]]; break;
        case 2: case 13: segs = [[B(), R()]]; break;
        case 3: case 12: segs = [[Lf(), R()]]; break;
        case 4: case 11: segs = [[T(), R()]]; break;
        case 5: segs = [[Lf(), T()], [B(), R()]]; break;
        case 6: case 9: segs = [[T(), B()]]; break;
        case 7: case 8: segs = [[Lf(), T()]]; break;
        case 10: segs = [[T(), R()], [Lf(), B()]]; break;
      }
      for (const [p, q] of segs) {
        for (const g of [p, q]) {
          const x = toX(g[0]), z = toZ(g[1]);
          pos.push(x, y, z); aLevel.push(nl); aIndex.push(isIdx); aR.push(Math.hypot(x, z) / RMAX);
        }
        if (L === HOVER_LEVEL) hoverPts.push(new THREE.Vector3((toX(p[0]) + toX(q[0])) / 2, y, (toZ(p[1]) + toZ(q[1])) / 2));
      }
    }
  }
}
const HOVER_N = (HOVER_LEVEL - lmin) / (lmax - lmin);

/* ------------------------------------------------------------------ three */
const canvas = $("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(CAPTURE ? 1 : Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x070a09, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 2000);

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
geo.setAttribute("aLevel", new THREE.Float32BufferAttribute(aLevel, 1));
geo.setAttribute("aIndex", new THREE.Float32BufferAttribute(aIndex, 1));
geo.setAttribute("aR", new THREE.Float32BufferAttribute(aR, 1));
const uniforms = {
  uRise: { value: 0 }, uDraw: { value: 0 }, uHover: { value: -1 }, uHoverAmt: { value: 0 }, uDim: { value: 1 },
  uFogNear: { value: 60 }, uFogFar: { value: 260 },
};
const mat = new THREE.ShaderMaterial({
  uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `
    attribute float aLevel; attribute float aIndex; attribute float aR;
    uniform float uRise; uniform float uDraw; uniform float uHover;
    varying float vA; varying float vIdx; varying float vR; varying float vDepth; varying float vHover; varying float vLevel;
    void main() {
      vec3 p = position; p.y *= uRise;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      vDepth = -mv.z; vIdx = aIndex; vR = aR; vLevel = aLevel;
      vA = 1.0 - smoothstep(uDraw - 0.06, uDraw, aLevel);
      vHover = 1.0 - smoothstep(0.0, 0.002, abs(aLevel - uHover));
    }`,
  fragmentShader: `
    uniform float uFogNear; uniform float uFogFar; uniform float uDim; uniform float uHoverAmt;
    varying float vA; varying float vIdx; varying float vR; varying float vDepth; varying float vHover; varying float vLevel;
    void main() {
      float fog = 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
      float edge = 1.0 - smoothstep(0.72, 1.0, vR);
      vec3 gold = mix(vec3(0.62, 0.48, 0.27), vec3(0.95, 0.83, 0.58), vIdx * 0.6 + vLevel * 0.35);
      float a = vA * fog * edge * mix(0.30, 0.85, vIdx) * uDim;
      float h = vHover * uHoverAmt * vA * edge;
      vec3 col = mix(gold, vec3(1.0, 0.97, 0.88), h);
      a = max(a, h * 0.95);
      gl_FragColor = vec4(col * a, a);
    }`,
});
scene.add(new THREE.LineSegments(geo, mat));

/* marker: Ptghni */
function glowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,248,225,1)"); r.addColorStop(.18, "rgba(255,220,150,.85)"); r.addColorStop(.5, "rgba(230,180,100,.22)"); r.addColorStop(1, "rgba(230,180,100,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
const glowTex = glowTexture();
const marker = new THREE.Group(); scene.add(marker);
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
glow.scale.set(5, 5, 1); marker.add(glow);
const beamGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 7, 0)]);
beamGeo.setAttribute("color", new THREE.Float32BufferAttribute([1, .9, .7, .0, .0, .0], 3));
const beam = new THREE.Line(beamGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending }));
marker.add(beam);
const rings = [0, 1, 2].map(() => {
  const pts = []; for (let k = 0; k <= 64; k++) { const t = k / 64 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t), 0.05, Math.sin(t))); }
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xE6CD98, transparent: true, blending: THREE.AdditiveBlending }));
  marker.add(l); return l;
});
const cityDot = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: .5 }));
cityDot.scale.set(2.2, 2.2, 1); scene.add(cityDot);
const cityPos = new THREE.Vector3(toX(dem.yerevan.gx), 0, toZ(dem.yerevan.gy));
const cityY = toY(dem.yerevan.elev);

/* ------------------------------------------------------------------ live clock (Ptghni, UTC+4) */
const rad = Math.PI / 180, dayMs = 864e5, J1970 = 2440588, J2000 = 2451545, ecl = rad * 23.4397;
function sunsetUTC(date, lat, lng) {
  const lw = rad * -lng, phi = rad * lat, d = date.valueOf() / dayMs - .5 + J1970 - J2000;
  const n = Math.round(d - .0009 - lw / (2 * Math.PI)), ds = .0009 + lw / (2 * Math.PI) + n;
  const M = rad * (357.5291 + .98560028 * ds), C = rad * (1.9148 * Math.sin(M) + .02 * Math.sin(2 * M) + .0003 * Math.sin(3 * M));
  const L = M + C + rad * 102.9372 + Math.PI, dec = Math.asin(Math.sin(ecl) * Math.sin(L));
  const w = Math.acos((Math.sin(-.833 * rad) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
  const a = .0009 + (w + lw) / (2 * Math.PI) + n;
  return new Date((J2000 + a + .0053 * Math.sin(M) - .0069 * Math.sin(2 * L) + .5 - J1970) * dayMs);
}
const hm = (d) => { const t = new Date(d.valueOf() + 4 * 3600e3); return String(t.getUTCHours()).padStart(2, "0") + ":" + String(t.getUTCMinutes()).padStart(2, "0"); };
function updateClock() {
  const now = new Date(), ss = sunsetUTC(now, 40.2555, 44.5831);
  $("clock").textContent = `${hm(now)} in Ptghni · sunset ${hm(ss)}`;
}
updateClock(); setInterval(updateClock, 30000);

/* ------------------------------------------------------------------ layout helpers */
const W = () => innerWidth, H = () => innerHeight;
function resize() { renderer.setSize(W(), H(), false); camera.aspect = W() / H(); camera.updateProjectionMatrix(); }
addEventListener("resize", resize); resize();
const v3 = new THREE.Vector3();
function toScreen(p) { v3.copy(p).project(camera); return [(v3.x + 1) / 2 * W(), (1 - v3.y) / 2 * H(), v3.z]; }
const set = (el, css) => Object.assign(el.style, css);

/* ------------------------------------------------------------------ frame */
const camFar = new THREE.Vector3(), camNear = new THREE.Vector3(), look = new THREE.Vector3();
let mouse = { x: 0.5, y: 0.5 }, hoverOn = 0, hoverLevelN = -1, hoverPoint = null;

function frame(t, dive) {
  // intro timings (seconds)
  const rise = easeOut(prog(t, 0.3, 3.8));
  uniforms.uRise.value = 0.03 + 0.97 * rise;
  uniforms.uDraw.value = prog(t, 0.2, 3.3) * 1.12;
  const appear = easeOut(prog(t, 2.6, 3.6));
  const logoIn = easeOut(prog(t, 2.4, 3.8)), headIn = easeOut(prog(t, 3.2, 4.4)), sideIn = easeOut(prog(t, 3.8, 4.8));

  // camera: slow orbit from the south (Yerevan side), dolly in during intro, dive toward Ptghni on scroll
  const theta = -0.30 + t * 0.022 + (mouse.x - 0.5) * 0.12;
  const R = lerp(128, 88, easeOut(prog(t, 0, 4.6))), Hh = lerp(46, 25, easeOut(prog(t, 0, 4.6))) + (0.5 - mouse.y) * 5;
  camFar.set(Math.sin(theta) * R, Hh, Math.cos(theta) * R);
  camNear.set(Math.sin(theta) * 7, 3.2, Math.cos(theta) * 7);
  const d = easeInOut(dive);
  camera.position.lerpVectors(camFar, camNear, d);
  look.set(0, lerp(10, 0.6, d), 0);
  camera.lookAt(look);
  uniforms.uDim.value = 1 - d * 0.35;
  uniforms.uFogFar.value = lerp(260, 120, d);

  // marker
  marker.position.y = 0;
  glow.material.opacity = appear;
  beam.material.opacity = appear * (1 - d);
  rings.forEach((r, k) => { const ph = ((t * 0.45 + k / 3) % 1); r.scale.setScalar(0.6 + ph * 7); r.material.opacity = appear * (1 - ph) * 0.8 * (1 - d); });
  cityDot.position.set(cityPos.x, cityY * uniforms.uRise.value, cityPos.z);
  cityDot.material.opacity = 0.5 * appear * (1 - d);

  // hover highlight (one real contour line + its real elevation)
  uniforms.uHover.value = hoverLevelN; uniforms.uHoverAmt.value = hoverOn;

  renderer.render(scene, camera);

  // DOM overlays
  const fadeOut = 1 - easeOut(prog(dive, 0, 0.3));
  set($("heroLogo"), { opacity: logoIn * fadeOut, transform: `translateY(${(1 - logoIn) * 14 - (1 - fadeOut) * 40}px) scale(${0.97 + 0.03 * logoIn})`, filter: `blur(${(1 - logoIn) * 8}px)` });
  set($("headline"), { opacity: headIn * fadeOut, transform: `translateY(${(1 - headIn) * 22 - (1 - fadeOut) * 30}px)` });
  set($("hy"), { opacity: headIn * fadeOut });
  set($("navLogo"), { opacity: easeOut(prog(dive, 0.15, 0.4)) });
  ["coords", "source", "cue"].forEach((id) => set($(id), { opacity: sideIn * fadeOut }));

  const [mx, my] = toScreen(marker.position);
  set($("mkLabel"), { left: mx + "px", top: my + "px", opacity: appear * (1 - easeOut(prog(dive, 0, 0.25))) });
  const [cx, cy] = toScreen(cityDot.position);
  set($("cityLabel"), { left: cx + "px", top: cy + "px", opacity: 0.9 * appear * fadeOut });

  // arch window opening onto the real Open Hall photo
  const a = easeInOut(prog(dive, 0.5, 1.0));
  const aw = a <= 0 ? 0 : lerp(26, Math.max(W(), H()) * 2.6, Math.pow(a, 1.6));
  const ah = aw * 1.3;
  const ax = lerp(mx, W() / 2, a), ay = lerp(my, H() * 0.62, a);
  const left = ax - aw / 2, top = ay - ah * 0.62;
  set($("arch"), { left: left + "px", top: top + "px", width: aw + "px", height: ah + "px", borderRadius: `${aw / 2}px ${aw / 2}px 0 0`, opacity: a > 0 ? 1 : 0, boxShadow: `0 0 0 1px rgba(230,205,152,${0.9 * (1 - a)}), 0 0 40px rgba(230,205,152,${0.35 * (1 - a)})` });
  set($("archImg"), { left: -left + "px", top: -top + "px", width: W() + "px", height: H() + "px" });
  const ohIn = easeOut(prog(dive, 0.88, 1.0));
  set($("oh"), { opacity: ohIn, transform: `translateY(${(1 - ohIn) * 24}px)` });
  set($("ohShade"), { opacity: ohIn });
}

/* ------------------------------------------------------------------ hover helpers */
function nearestHoverPoint(sx, sy) {
  let best = null, bd = 1e9;
  for (const p of hoverPts) { const [x, y, z] = toScreen(p); if (z > 1) continue; const dd = (x - sx) ** 2 + (y - sy) ** 2; if (dd < bd) { bd = dd; best = [x, y]; } }
  return best ? { x: best[0], y: best[1], d: Math.sqrt(bd) } : null;
}

/* ------------------------------------------------------------------ capture mode: deterministic timeline */
// 0–4.8s intro · 5–9s cursor traces a real contour · 9.4–14s dive into the Open Hall · to 16s hold
if (CAPTURE) {
  window.renderAt = (t) => {
    const dive = easeInOut(prog(t, 9.4, 14.2));
    // simulated cursor travelling along the real 1,400 m contour
    const cur = $("cursor"), tag = $("hoverTag");
    const hv = prog(t, 5.0, 5.5) * (1 - prog(t, 8.8, 9.2));
    hoverOn = hv; hoverLevelN = HOVER_N;
    frame(t, dive); // render once to set camera, then position cursor on the contour
    if (hv > 0) {
      const u = easeInOut(prog(t, 5.0, 8.8));
      const target = { x: lerp(470, 980, u), y: lerp(700, 640, u) + Math.sin(u * 6) * 8 };
      const hp = nearestHoverPoint(target.x, target.y) || target;
      set(cur, { left: hp.x + "px", top: hp.y + "px", opacity: hv });
      set(tag, { left: hp.x + "px", top: hp.y + "px", opacity: hv });
      tag.textContent = HOVER_LEVEL.toLocaleString("en-US") + " m";
    } else { set(cur, { opacity: 0 }); set(tag, { opacity: 0 }); }
    frame(t, dive);
  };
  window.heroReady = true;
} else {
  /* live mode: real time, real mouse, real scroll */
  addEventListener("mousemove", (e) => {
    mouse = { x: e.clientX / W(), y: e.clientY / H() };
    set($("cursor"), { left: e.clientX + "px", top: e.clientY + "px", opacity: 1 });
  });
  const t0 = performance.now();
  const raycaster = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  function sampleElev(x, z) {
    const gx = x / (dem.width_m / UNIT) * (GW - 1) + dem.ptghni.gx, gy = z / (dem.height_m / UNIT) * (GH - 1) + dem.ptghni.gy;
    if (gx < 0 || gy < 0 || gx > GW - 1 || gy > GH - 1) return null;
    return G[Math.round(gy) * GW + Math.round(gx)];
  }
  (function loop() {
    const t = (performance.now() - t0) / 1000;
    const dive = clamp(scrollY / (H() * 2.2));
    // hover: elevation under the cursor (real DEM sample), snapped to the 20 m contour
    raycaster.setFromCamera(new THREE.Vector2(mouse.x * 2 - 1, -(mouse.y * 2 - 1)), camera);
    let e = null; if (raycaster.ray.intersectPlane(plane, hit)) e = sampleElev(hit.x, hit.z);
    if (e != null && t > 4.8 && dive < 0.05) {
      const L = Math.round(e / STEP) * STEP; hoverLevelN = (L - lmin) / (lmax - lmin); hoverOn = Math.min(1, hoverOn + 0.08);
      $("hoverTag").textContent = L.toLocaleString("en-US") + " m";
      set($("hoverTag"), { left: mouse.x * W() + "px", top: mouse.y * H() + "px", opacity: hoverOn });
    } else { hoverOn = Math.max(0, hoverOn - 0.08); set($("hoverTag"), { opacity: hoverOn }); }
    frame(t, dive);
    requestAnimationFrame(loop);
  })();
}
