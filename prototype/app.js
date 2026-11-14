/* Villa Hills — prototype scene builder */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------------- scene switching (clock HUD, nav theme, cursor) ---------------- */
  function setScene(sec) {
    const b = document.body;
    b.dataset.nav = sec.dataset.nav || "light";
    b.dataset.hud = sec.dataset.hud || (sec.dataset.time ? "on" : "off");
    if (sec.dataset.time) {
      $("#hudTime").textContent = sec.dataset.time;
      $("#hudMeta").textContent = sec.dataset.meta || "Ptghni";
      const p = parseFloat(sec.dataset.sun || "0");
      const a = Math.PI - p * Math.PI;
      const sun = $("#hudSun");
      sun.setAttribute("cx", 37 + 34 * Math.cos(a));
      sun.setAttribute("cy", 34 - 30 * Math.sin(a));
      sun.setAttribute("fill", p > .55 && p < .99 ? "#dfe6f5" : "#E6CD98");
    }
    const c = $("#cursor"), cur = (sec.dataset.cursor || "none").split(",");
    c.className = "cursor";
    const trail = $("#trail"); trail.innerHTML = "";
    if (cur[0] === "none") { c.classList.add("none"); return; }
    const x = +cur[0], y = +cur[1], st = cur[2];
    c.style.left = x + "px"; c.style.top = y + "px";
    if (st === "drag") { c.classList.add("drag"); $("#cursorLabel").textContent = "DRAG"; }
    if (st === "open") { c.classList.add("open"); $("#cursorLabel").textContent = "OPEN"; }
    if (st === "ff" && sec.dataset.trail) {
      for (let i = 1; i <= 16; i++) {
        const d = document.createElement("div"); d.className = "trail";
        const s = Math.max(1.5, 7 - i * .38);
        const tx = x - i * 13, ty = y + Math.sin(i / 2.6) * 18 + i * 4;
        Object.assign(d.style, { left: tx - s / 2 + "px", top: ty - s / 2 + "px", width: s + "px", height: s + "px", opacity: (1 - i / 17) * .9 });
        trail.appendChild(d);
      }
    }
  }
  window.setScene = (id) => setScene(document.getElementById(id));
  const io = new IntersectionObserver((es) => es.forEach(e => e.isIntersecting && setScene(e.target)), { threshold: .55 });
  document.querySelectorAll(".scene").forEach(s => io.observe(s));

  document.querySelectorAll(".scene.oh").forEach(sec => { const d = document.createElement("div"); d.className = "oh-shade"; sec.querySelector(".frame43").after(d); });

  /* ---------------- preloader pen tip ---------------- */
  (function () {
    const main = $("#preMain"); if (!main) return;
    const draw = (p, frac) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L * (1 - frac); return L; };
    const L = draw(main, .82); draw($("#preL2"), .55); draw($("#preL3"), .28);
    const pt = main.getPointAtLength(L * .82);
    ["#preTip", "#preTipHalo"].forEach(s => { $(s).setAttribute("cx", pt.x); $(s).setAttribute("cy", pt.y); });
  })();

  /* ---------------- timeline ---------------- */
  const moments = [["Arrival", "17:00", 0], ["Ceremony", "18:00", 1 / 7], ["Dinner", "19:30", 2.5 / 7], ["First dance", "21:00", 4 / 7], ["The show", "22:30", 5.5 / 7], ["Fireworks", "00:00", 1]];
  document.querySelectorAll(".timeline").forEach(t => {
    const f = parseFloat(t.dataset.fill);
    t.innerHTML = `<div class="track"></div><div class="fill" style="width:${f * 100}%"></div>`;
    let nowIdx = 0; moments.forEach((m, i) => { if (m[2] <= f) nowIdx = i; });
    moments.forEach((m, i) => {
      const d = document.createElement("div");
      d.className = "tick" + (m[2] <= f ? " done" : "") + (i === nowIdx ? " now" : "");
      d.style.left = m[2] * 100 + "%";
      d.innerHTML = `${m[0]}<small>${m[1]}</small>`;
      t.appendChild(d);
    });
  });

  /* ---------------- night: string lights, candles, fireflies, stars ---------------- */
  (function () {
    const svg = $("#nightLights"); if (!svg) return;
    const defs = el("defs", {}, svg);
    const g = el("radialGradient", { id: "bulb" }, defs);
    el("stop", { offset: "0", "stop-color": "#fff6dc" }, g); el("stop", { offset: ".35", "stop-color": "rgba(255,210,140,.9)" }, g); el("stop", { offset: "1", "stop-color": "rgba(255,180,90,0)" }, g);
    const f = el("filter", { id: "bl", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs); el("feGaussianBlur", { stdDeviation: "2.2" }, f);
    const r = rng(7);
    // stars
    for (let i = 0; i < 90; i++) {
      const x = 640 + r() * 960, y = r() * 380 * (0.4 + r() * .6);
      el("circle", { cx: x, cy: y, r: r() * 1.6 + .4, fill: "#fff", opacity: (.25 + r() * .7).toFixed(2) }, svg);
    }
    el("circle", { cx: 860, cy: 215, r: 24, fill: "#f4f1e6", opacity: ".92", filter: "url(#bl)" }, svg);
    el("circle", { cx: 860, cy: 215, r: 80, fill: "url(#bulb)", opacity: ".22" }, svg);
    // strands: catenary between two points
    const strands = [[[470, 440], [1595, 395], 95], [[560, 520], [1598, 520], 70], [[380, 360], [1240, 250], 80], [[700, 600], [1500, 610], 40]];
    strands.forEach(([a, b, sag], si) => {
      let d = ""; const pts = [];
      for (let t = 0; t <= 1.0001; t += 0.01) {
        const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t);
        d += (t === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " "; pts.push([x, y]);
      }
      el("path", { d, fill: "none", stroke: "rgba(40,30,20,.85)", "stroke-width": 1.4 }, svg);
      for (let i = 2; i < pts.length - 1; i += si === 3 ? 4 : 3) {
        const [x, y] = pts[i]; const off = (si === 1 && i > 80);
        el("circle", { cx: x, cy: y + 7, r: 14, fill: "url(#bulb)", opacity: off ? .1 : .9 }, svg);
        el("circle", { cx: x, cy: y + 7, r: 3.2, fill: off ? "#6a5a40" : "#fff7e0" }, svg);
      }
    });
    // candles on tables
    const candles = [[700, 660], [760, 700], [850, 640], [930, 690], [1010, 650], [1120, 640], [1190, 680], [1270, 655], [1330, 690], [1400, 640], [1460, 680], [1520, 650], [1060, 720], [1250, 740], [1420, 735], [880, 735]];
    candles.forEach(([x, y]) => { el("circle", { cx: x, cy: y, r: 26, fill: "url(#bulb)", opacity: .75 }, svg); el("circle", { cx: x, cy: y, r: 2.4, fill: "#fff3c8" }, svg); });
    // fireflies
    for (let i = 0; i < 44; i++) {
      const x = 560 + r() * 1040, y = 600 + r() * 560;
      const s = .9 + r() * 1.5;
      el("circle", { cx: x, cy: y, r: s * 5, fill: "url(#bulb)", opacity: (.35 + r() * .5).toFixed(2) }, svg);
      el("circle", { cx: x, cy: y, r: s * .7, fill: "#fff8d8", opacity: .95 }, svg);
    }
  })();

  /* ---------------- floor plan ---------------- */
  function buildPlan(svg, opts = {}) {
    if (!svg) return;
    const mini = !!opts.mini;
    const d = el("defs", {}, svg);
    const pat = el("pattern", { id: "parq" + (mini ? "m" : ""), width: 14, height: 14, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, d);
    el("rect", { width: 14, height: 14, fill: "#efe2c9" }, pat); el("line", { x1: 0, y1: 0, x2: 0, y2: 14, stroke: "#dcc9a4", "stroke-width": 6 }, pat);
    const sh = el("filter", { id: "dropS" + (mini ? "m" : ""), x: "-50%", y: "-50%", width: "200%", height: "200%" }, d);
    el("feDropShadow", { dx: 0, dy: 16, stdDeviation: 10, "flood-color": "#1E2B22", "flood-opacity": .3 }, sh);
    // garden
    el("rect", { x: 10, y: 10, width: 940, height: 740, rx: 40, fill: mini ? "#2b3a2f" : "#e2e7d6" }, svg);
    const r = rng(11);
    if (!mini) {
      for (let i = 0; i < 46; i++) {
        let x, y; const side = i % 4;
        if (side === 0) { x = 30 + r() * 900; y = 22 + r() * 30; }
        else if (side === 1) { x = 30 + r() * 900; y = 690 + r() * 45; }
        else if (side === 2) { x = 20 + r() * 30; y = 60 + r() * 640; }
        else { x = 905 + r() * 35; y = 60 + r() * 640; }
        const rr = 12 + r() * 16;
        el("circle", { cx: x, cy: y, r: rr, fill: ["#a9b89c", "#93a687", "#b9c6ab"][i % 3], opacity: .9 }, svg);
      }
    }
    // terrace
    el("rect", { x: 70, y: 70, width: 820, height: 610, rx: 26, fill: mini ? "#33453a" : "#fbf8f2", stroke: mini ? "rgba(239,232,220,.3)" : "#c9bba2", "stroke-width": 2 }, svg);
    // stage + head table
    el("rect", { x: 370, y: 92, width: 220, height: 52, rx: 4, fill: mini ? "#C8A76B" : "#1E2B22" }, svg);
    if (!mini) el("text", { x: 480, y: 124, "text-anchor": "middle", fill: "#E6CD98", "font-family": "Manrope", "font-size": 13, "font-weight": 600, "letter-spacing": 4 }, svg).textContent = "STAGE";
    el("rect", { x: 395, y: 166, width: 170, height: 18, rx: 9, fill: mini ? "rgba(239,232,220,.8)" : "#fff", stroke: "#1E2B22", "stroke-width": mini ? 0 : 1.2 }, svg);
    // dance floor
    el("rect", { x: 382, y: 222, width: 196, height: 220, rx: 6, fill: mini ? "rgba(200,167,107,.35)" : `url(#parq)` }, svg);
    if (!mini) el("text", { x: 480, y: 338, "text-anchor": "middle", fill: "#9b7f4a", "font-family": "Manrope", "font-size": 12, "font-weight": 600, "letter-spacing": 4 }, svg).textContent = "DANCE FLOOR";
    // buffet
    el("rect", { x: 400, y: 520, width: 160, height: 34, rx: 4, fill: mini ? "rgba(239,232,220,.4)" : "#efe8dc", stroke: mini ? "none" : "#c9bba2" }, svg);
    if (!mini) el("text", { x: 480, y: 542, "text-anchor": "middle", fill: "#8b8a7c", "font-family": "Manrope", "font-size": 11, "font-weight": 600, "letter-spacing": 4 }, svg).textContent = "BUFFET";
    // tables
    const xs = [150, 240, 330, 630, 720, 810], ys = [250, 345, 440, 535], tables = [];
    ys.forEach(y => xs.forEach(x => tables.push([x, y])));
    tables.forEach(([x, y], i) => {
      const drop = !mini && i === 23;
      const g = el("g", { transform: drop ? `translate(${x + 4} ${y - 16}) scale(1.22)` : `translate(${x} ${y})`, opacity: drop ? .6 : 1, filter: drop ? `url(#dropS)` : "" }, svg);
      for (let k = 0; k < 10; k++) {
        const a = k / 10 * Math.PI * 2;
        el("circle", { cx: Math.cos(a) * 33, cy: Math.sin(a) * 33, r: mini ? 4 : 5.2, fill: mini ? "#E6CD98" : "#C8A76B" }, g);
      }
      el("circle", { r: 23, fill: mini ? "rgba(239,232,220,.9)" : "#fff", stroke: "#1E2B22", "stroke-width": mini ? 0 : 1.3, "stroke-dasharray": i === 23 ? "4 3" : "" }, g);
      if (!mini && i < 23) el("text", { y: 4, "text-anchor": "middle", fill: "#9b7f4a", "font-family": "Cormorant Garamond", "font-size": 13 }, g).textContent = i + 1;
    });
    if (!mini) {
      // shadows under dropping tables
      el("ellipse", { cx: 810, cy: 548, rx: 30, ry: 8, fill: "#1E2B22", opacity: .12 }, svg);
      const tag = el("g", { transform: "translate(842 452)" }, svg);
      el("rect", { x: 0, y: 0, width: 108, height: 30, rx: 15, fill: "#C8A76B" }, tag);
      el("text", { x: 54, y: 20, "text-anchor": "middle", fill: "#0c1014", "font-family": "Manrope", "font-size": 12, "font-weight": 700, "letter-spacing": 1 }, tag).textContent = "+10 guests";
      el("text", { x: 70, y: 52, fill: "#1E2B22", "font-family": "Manrope", "font-size": 11, "font-weight": 600, "letter-spacing": 3 }, svg).textContent = "OPEN HALL · TOP VIEW";
      const n = el("g", { transform: "translate(880 50)" }, svg);
      el("circle", { r: 16, fill: "none", stroke: "#1E2B22" }, n); el("path", { d: "M0 -11 L5 4 L0 1 L-5 4 Z", fill: "#C8A76B" }, n);
      el("text", { y: -22, "text-anchor": "middle", "font-family": "Manrope", "font-size": 10, "font-weight": 700, fill: "#1E2B22" }, n).textContent = "N";
    }
  }
  buildPlan($("#planSvg"));
  buildPlan($("#miniPlan"), { mini: true });

  /* ---------------- snow ---------------- */
  (function () {
    const c = $("#snow"); if (!c) return;
    const ctx = c.getContext("2d"), r = rng(3);
    for (let i = 0; i < 420; i++) {
      const x = r() * 1440 * .5, y = r() * 900, s = r() * 2.6 + .6;
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${.45 + r() * .5})`;
      ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 26; i++) {
      const x = r() * 700, y = r() * 900, s = 4 + r() * 4;
      const g = ctx.createRadialGradient(x, y, 0, x, y, s); g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }
  })();

  /* ---------------- closed hall flashlight ---------------- */
  (function () {
    const f = $("#flash"); if (!f) return;
    const x = parseFloat(f.style.left), y = parseFloat(f.style.top);
    const img = f.querySelector("img"); img.style.left = (150 - x) + "px"; img.style.top = (150 - y) + "px";
  })();

  /* ---------------- celebrations cards ---------------- */
  (function () {
    const wrap = $("#cards"); if (!wrap) return;
    const data = [
      ["Weddings", "Հարսանիք", "01", "couple-garden.jpg", -6, 40, true],
      ["Engagements", "Նշանադրություն", "02", "couple-red-stairs.jpg", -2, 8],
      ["Birthdays", "Ծննդյան տոն", "03", "cake-gold.jpg", 2, 8],
      ["Holy Baptism", "Սուրբ Մկրտություն", "04", "garden-arch-white.jpg", 6, 40],
    ];
    const lefts = [130, 440, 750, 1060];
    data.forEach((d, i) => {
      const c = document.createElement("div"); c.className = "card" + (d[6] ? " hov" : "");
      c.style.left = lefts[i] + "px"; c.style.top = "0";
      c.style.transform = d[6] ? `translateY(-34px) rotate(-2deg) rotateY(9deg) rotateX(4deg) scale(1.06)` : `translateY(${d[5]}px) rotate(${d[4]}deg)`;
      c.innerHTML = `<div class="ph"><img src="assets/img/${d[3]}" alt=""><svg class="fx" viewBox="0 0 276 362"></svg></div><div class="cap"><div><h4>${d[0]}</h4><small>${d[1]}</small></div><span>${d[2]}</span></div>`;
      wrap.appendChild(c);
      const fx = c.querySelector(".fx"), r = rng(20 + i);
      if (i === 0) { // petals
        for (let k = 0; k < 26; k++) {
          const x = r() * 276, y = r() * 362, rot = r() * 180;
          const g = el("g", { transform: `translate(${x} ${y}) rotate(${rot})`, opacity: (.65 + r() * .35).toFixed(2) }, fx);
          el("ellipse", { rx: 5 + r() * 4, ry: 3 + r() * 2, fill: ["#f6d7da", "#fff4f2", "#e9b3ba", "#fde9e4"][k % 4] }, g);
        }
      }
      if (i === 1) { // rings
        const g = el("g", { transform: "translate(138 112)" }, fx);
        el("circle", { cx: -16, cy: 0, r: 28, fill: "none", stroke: "#E6CD98", "stroke-width": 6, opacity: .95 }, g);
        el("circle", { cx: 16, cy: 0, r: 28, fill: "none", stroke: "#f6e6bd", "stroke-width": 6, opacity: .95 }, g);
        el("circle", { cx: 0, cy: -2, r: 52, fill: "none", stroke: "rgba(255,240,200,.6)", "stroke-width": 1.2, "stroke-dasharray": "2 6" }, g);
      }
      if (i === 2) { // sparkles
        for (let k = 0; k < 22; k++) {
          const x = 70 + r() * 140, y = 30 + r() * 160, s = 2 + r() * 6;
          el("path", { d: `M${x} ${y - s} L${x + s * .25} ${y} L${x} ${y + s} L${x - s * .25} ${y} Z M${x - s} ${y} L${x} ${y + s * .25} L${x + s} ${y} L${x} ${y - s * .25} Z`, fill: "#fff6d8", opacity: .9 }, fx);
        }
      }
      if (i === 3) { const g = document.createElement("div"); g.className = "glow"; c.querySelector(".ph").appendChild(g); }
    });
    // petals drifting outside the hovered card
    const s = el("svg", { viewBox: "0 0 1440 600", style: "position:absolute;left:0;top:0;width:1440px;height:600px;pointer-events:none;overflow:visible" }, null);
    wrap.appendChild(s); const r = rng(99);
    for (let k = 0; k < 18; k++) {
      const x = 120 + r() * 420, y = -40 + r() * 600;
      const g = el("g", { transform: `translate(${x} ${y}) rotate(${r() * 180})`, opacity: (.5 + r() * .4).toFixed(2) }, s);
      el("ellipse", { rx: 6 + r() * 4, ry: 3.5, fill: ["#efc3c8", "#fbe6e2", "#e2a6ae"][k % 3] }, g);
    }
  })();

  /* ---------------- kitchen wedges + steam ---------------- */
  (function () {
    const p = $("#plate"); if (!p) return;
    const N = 9, r = rng(5);
    const offs = [0, 130, 48, 6, 0, 0, 0, 0, 0];
    for (let i = 0; i < N; i++) {
      const a0 = i / N * Math.PI * 2 - Math.PI / 2, a1 = (i + 1) / N * Math.PI * 2 - Math.PI / 2, am = (a0 + a1) / 2;
      const pt = (a) => `${(50 + 80 * Math.cos(a)).toFixed(2)}% ${(50 + 80 * Math.sin(a)).toFixed(2)}%`;
      const w = document.createElement("div"); w.className = "wedge";
      w.style.backgroundImage = "url(assets/img/dish-shrimp.jpg)";
      w.style.clipPath = `polygon(50% 50%, ${pt(a0)}, ${pt((a0 + am) / 2)}, ${pt(am)}, ${pt((am + a1) / 2)}, ${pt(a1)})`;
      const d = offs[i];
      w.style.transform = `translate(${(Math.cos(am) * d).toFixed(1)}px, ${(Math.sin(am) * d).toFixed(1)}px) rotate(${(d * .12 * (r() > .5 ? 1 : -1)).toFixed(1)}deg)`;
      p.appendChild(w);
    }
    const st = $("#steam");
    const f = el("filter", { id: "stb", x: "-50%", y: "-50%", width: "200%", height: "200%" }, el("defs", {}, st));
    el("feGaussianBlur", { stdDeviation: 6 }, f);
    [[110, .35], [150, .45], [190, .3]].forEach(([x, o], k) => {
      el("path", { d: `M${x} 300 C${x - 30} 250 ${x + 30} 210 ${x} 160 C${x - 30} 110 ${x + 20} 70 ${x - 5} 20`, fill: "none", stroke: "#fff", "stroke-width": 14 - k * 2, opacity: o, filter: "url(#stb)", "stroke-linecap": "round" }, st);
    });
  })();

  /* ---------------- equalizers ---------------- */
  (function () {
    const r = rng(8);
    const w = $("#wave");
    if (w) for (let i = 0; i < 64; i++) { const h = 6 + Math.abs(Math.sin(i / 4.3) * Math.cos(i / 9)) * 60 + r() * 14; const b = document.createElement("i"); b.style.height = h + "px"; w.appendChild(b); }
    const e = $("#rowEq");
    if (e) for (let i = 0; i < 7; i++) { const b = document.createElement("i"); b.style.height = (6 + r() * 18) + "px"; e.appendChild(b); }
  })();

  /* ---------------- gallery canvas ---------------- */
  (function () {
    const w = $("#galWorld"); if (!w) return;
    const imgs = ["couple-garden", "openhall-trees", "night-sparklers", "dish-shrimp", "glazed-dome-dusk", "head-table-flowers", "couple-car", "cake-floral", "garden-ceremony", "string-quartet", "red-hearts", "sunset-table", "fireworks-bride", "canopy-flowers", "couple-dip", "terrace-arches", "purple-setup", "drone-garden", "ring-arch-table", "helicopter", "table-mountains", "couple-red-stairs", "canopy-white-flowers", "dish-mussels", "openhall-tree-hall", "entrance-gate", "wall-lights", "villa-tree", "feast-mountains", "garden-arch-white", "cake-gold", "head-table-stairs", "glazed-dome-sunset", "openhall-trees-decor", "table-flowers", "dish-rice"];
    const cols = 8, colW = 230, gap = 26, r = rng(4); let k = 0;
    for (let c = 0; c < cols; c++) {
      let y = -120 - (c % 2) * 140 - r() * 80;
      while (y < 1300) {
        const h = [200, 260, 320, 180, 290][Math.floor(r() * 5)];
        const t = document.createElement("div"); t.className = "tile";
        Object.assign(t.style, { left: 40 + c * (colW + gap) + "px", top: y + "px", width: colW + "px", height: h + "px", transform: `skewY(${(c - 3.5) * -0.6}deg)` });
        t.innerHTML = `<img src="assets/img/${imgs[k++ % imgs.length]}.jpg" alt="">`;
        w.appendChild(t); y += h + gap;
      }
    }
  })();

  /* ---------------- fireworks ---------------- */
  (function () {
    const c = $("#fw"); if (!c) return;
    const ctx = c.getContext("2d"); ctx.scale(2, 2); ctx.globalCompositeOperation = "lighter";
    function burst(cx, cy, R, hue, n, seed, sat = 80) {
      const r = rng(seed);
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3);
      halo.addColorStop(0, `hsla(${hue},${sat}%,75%,.22)`); halo.addColorStop(1, `hsla(${hue},${sat}%,60%,0)`);
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 + r() * .08, len = R * (.75 + r() * .3);
        const steps = 22;
        for (let s = 0; s < steps; s++) {
          const t = s / steps, t2 = (s + 1) / steps;
          const x1 = cx + Math.cos(a) * len * t, y1 = cy + Math.sin(a) * len * t + 28 * t * t;
          const x2 = cx + Math.cos(a) * len * t2, y2 = cy + Math.sin(a) * len * t2 + 28 * t2 * t2;
          ctx.strokeStyle = `hsla(${hue},${sat}%,${70 + t * 20}%,${(t * t * .9).toFixed(3)})`;
          ctx.lineWidth = .6 + t * 1.6; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        const ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len + 28;
        const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 7);
        g.addColorStop(0, `hsla(${hue},100%,96%,1)`); g.addColorStop(1, `hsla(${hue},100%,70%,0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI * 2); ctx.fill();
        if (r() > .55) { ctx.fillStyle = `hsla(${hue},100%,92%,.8)`; ctx.beginPath(); ctx.arc(ex + (r() - .5) * 20, ey + 12 + r() * 30, .9, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    burst(1040, 190, 175, 42, 120, 1);
    burst(1290, 300, 120, 350, 90, 2, 70);
    burst(760, 150, 105, 45, 80, 3, 30);
    burst(380, 230, 135, 38, 96, 4, 90);
    burst(560, 360, 62, 200, 60, 5, 40);
    // rocket trail rising from the tap point
    const grad = ctx.createLinearGradient(1250, 550, 1268, 410);
    grad.addColorStop(0, "rgba(255,220,160,0)"); grad.addColorStop(1, "rgba(255,240,200,.95)");
    ctx.strokeStyle = grad; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(1250, 550); ctx.quadraticCurveTo(1256, 480, 1268, 410); ctx.stroke();
    const hg = ctx.createRadialGradient(1268, 410, 0, 1268, 410, 12); hg.addColorStop(0, "rgba(255,250,230,1)"); hg.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(1268, 410, 12, 0, Math.PI * 2); ctx.fill();
  })();

  /* ---------------- map ---------------- */
  (function () {
    const svg = $("#mapSvg"); if (!svg) return;
    const defs = el("defs", {}, svg);
    const gf = el("filter", { id: "mglow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs); el("feGaussianBlur", { stdDeviation: 5 }, gf);
    const rg = el("radialGradient", { id: "mfade" }, defs); el("stop", { offset: ".55", "stop-color": "#fff" }, rg); el("stop", { offset: "1", "stop-color": "#000" }, rg);
    const mk = el("mask", { id: "mmask" }, defs); el("rect", { x: 0, y: 0, width: 1080, height: 900, fill: "url(#mfade)" }, mk);
    const root = el("g", { mask: "url(#mmask)" }, svg);
    el("rect", { x: 0, y: 0, width: 1080, height: 900, fill: "#121a16" }, root);
    const r = rng(12);
    // contour lines
    [[700, 250, 16, 22], [300, 180, 9, 26], [880, 640, 8, 24]].forEach(([cx, cy, n, step]) => {
      for (let k = 1; k <= n; k++) {
        let d = ""; const R = k * step, ph = r() * 10;
        for (let a = 0; a <= 64; a++) {
          const t = a / 64 * Math.PI * 2;
          const rr = R * (1 + .18 * Math.sin(3 * t + ph) + .08 * Math.cos(5 * t + ph * 2));
          d += (a ? "L" : "M") + (cx + Math.cos(t) * rr * 1.25).toFixed(1) + " " + (cy + Math.sin(t) * rr).toFixed(1);
        }
        el("path", { d: d + "Z", fill: "none", stroke: "rgba(143,164,138,.22)", "stroke-width": 1 }, root);
      }
    });
    // city grid (Yerevan)
    const city = el("g", { opacity: .55 }, root);
    for (let i = 0; i < 26; i++) {
      const x = 110 + i * 16 + r() * 6;
      el("line", { x1: x, y1: 520 + r() * 40, x2: x - 30, y2: 860 - r() * 40, stroke: "rgba(239,232,220,.12)" }, city);
      const y = 540 + i * 13;
      el("line", { x1: 90 + r() * 40, y1: y, x2: 520 - r() * 60, y2: y - 26, stroke: "rgba(239,232,220,.12)" }, city);
    }
    el("ellipse", { cx: 300, cy: 690, rx: 230, ry: 160, fill: "rgba(239,232,220,.04)" }, root);
    // river
    el("path", { d: "M610 0 C640 120 600 200 650 300 C700 400 560 470 520 560 C480 650 380 720 330 900", fill: "none", stroke: "rgba(120,160,190,.45)", "stroke-width": 3 }, root);
    // route
    const route = "M300 680 C340 610 400 580 450 520 C500 460 540 430 575 380 C605 335 630 300 655 255";
    el("path", { d: route, fill: "none", stroke: "#C8A76B", "stroke-width": 12, opacity: .35, filter: "url(#mglow)" }, root);
    const rp = el("path", { d: route, fill: "none", stroke: "#E6CD98", "stroke-width": 4, "stroke-linecap": "round" }, root);
    el("path", { d: route, fill: "none", stroke: "rgba(230,205,152,.25)", "stroke-width": 2, "stroke-dasharray": "2 10" }, root);
    // start
    el("circle", { cx: 300, cy: 680, r: 9, fill: "#EFE8DC" }, root);
    el("circle", { cx: 300, cy: 680, r: 22, fill: "none", stroke: "rgba(239,232,220,.4)" }, root);
    // destination
    el("circle", { cx: 655, cy: 255, r: 46, fill: "rgba(200,167,107,.12)", stroke: "rgba(200,167,107,.4)" }, root);
    el("circle", { cx: 655, cy: 255, r: 80, fill: "none", stroke: "rgba(200,167,107,.2)" }, root);
    el("circle", { cx: 655, cy: 255, r: 18, fill: "#C8A76B" }, root);
    el("path", { d: "M645 258 C648 257 650 250 654 250 C657 250 658 254 660 254 C662 252 663 250 666 250", fill: "none", stroke: "#0c1014", "stroke-width": 1.8, "stroke-linecap": "round" }, root);
    const txt = (x, y, s, size = 14, op = .75, ls = 5) => { const t = el("text", { x, y, fill: `rgba(239,232,220,${op})`, "font-family": "Manrope", "font-size": size, "font-weight": 600, "letter-spacing": ls }, root); t.textContent = s; };
    txt(200, 760, "YEREVAN", 22, .8, 8); txt(690, 215, "PTGHNI", 22, .95, 8); txt(700, 120, "KOTAYK", 13, .45); txt(560, 610, "HRAZDAN RIVER", 11, .4, 4);
    const tg = el("g", { transform: "translate(468 470)" }, root);
    el("rect", { x: 0, y: 0, width: 92, height: 32, rx: 16, fill: "#E6CD98" }, tg);
    el("text", { x: 46, y: 21, "text-anchor": "middle", fill: "#0c1014", "font-family": "Manrope", "font-size": 14, "font-weight": 700 }, tg).textContent = "5 km";
    // car head along route
    const L = rp.getTotalLength(), p = rp.getPointAtLength(L * .9);
    el("circle", { cx: p.x, cy: p.y, r: 16, fill: "#fff3cf", opacity: .5, filter: "url(#mglow)" }, root);
    el("circle", { cx: p.x, cy: p.y, r: 6, fill: "#fff" }, root);
  })();

  /* ---------------- sunset calculation (SunCalc formulae) ---------------- */
  const rad = Math.PI / 180, dayMs = 864e5, J1970 = 2440588, J2000 = 2451545, e = rad * 23.4397, J0 = .0009;
  const toDays = d => d.valueOf() / dayMs - .5 + J1970 - J2000;
  const fromJ = j => new Date((j + .5 - J1970) * dayMs);
  function sunset(date, lat, lng, h = -0.833) {
    const lw = rad * -lng, phi = rad * lat, d = toDays(date);
    const n = Math.round(d - J0 - lw / (2 * Math.PI));
    const ds = J0 + (0 + lw) / (2 * Math.PI) + n;
    const M = rad * (357.5291 + .98560028 * ds);
    const C = rad * (1.9148 * Math.sin(M) + .02 * Math.sin(2 * M) + .0003 * Math.sin(3 * M));
    const L = M + C + rad * 102.9372 + Math.PI;
    const dec = Math.asin(Math.sin(e) * Math.sin(L));
    const w = Math.acos((Math.sin(h * rad) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
    const a = J0 + (w + lw) / (2 * Math.PI) + n;
    return fromJ(J2000 + a + .0053 * Math.sin(M) - .0069 * Math.sin(2 * L));
  }
  const LAT = 40.258, LNG = 44.583; // Ptghni
  const hm = d => { const t = new Date(d.valueOf() + 4 * 3600e3); return String(t.getUTCHours()).padStart(2, "0") + ":" + String(t.getUTCMinutes()).padStart(2, "0"); }; // Armenia UTC+4
  window.ptghniSunset = (y, m, d) => ({ sunset: hm(sunset(new Date(Date.UTC(y, m, d, 12)), LAT, LNG)), golden: hm(sunset(new Date(Date.UTC(y, m, d, 12)), LAT, LNG, 6)) });

  (function () {
    const cal = $("#cal"); if (!cal) return;
    const Y = 2027, M = 5, SEL = 12, booked = [5, 6, 19, 20, 26];
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(d => { const x = document.createElement("div"); x.className = "dow"; x.textContent = d; cal.appendChild(x); });
    const first = (new Date(Date.UTC(Y, M, 1)).getUTCDay() + 6) % 7;
    for (let i = 0; i < first; i++) { const x = document.createElement("div"); x.className = "day empty"; cal.appendChild(x); }
    for (let d = 1; d <= 30; d++) {
      const x = document.createElement("div");
      x.className = "day" + (booked.includes(d) ? " booked" : "") + (d === SEL ? " sel" : "");
      x.innerHTML = `<b>${d}</b><small>☀ ${ptghniSunset(Y, M, d).sunset}</small>`;
      cal.appendChild(x);
    }
    const s = ptghniSunset(Y, M, SEL);
    $("#goldenText").innerHTML = `On <b>Saturday, 12 June 2027</b> the sun sets over Ptghni at <b>${s.sunset}</b>. Golden hour begins at <b>${s.golden}</b>, the perfect moment for your ceremony under the open sky.`;
    $("#sumSun").textContent = `Sunset ${s.sunset} · golden hour ${s.golden}`;
  })();

  /* ---------------- footer wordmark ---------------- */
  (function () {
    const w = $("#wordmark"); if (!w) return;
    const word = "VILLA HILLS".split("");
    const wt = [300, 300, 300, 400, 500, 600, 600, 500, 400, 300, 300];
    const sc = [1, 1, 1, 1.03, 1.08, 1.13, 1.1, 1.05, 1.02, 1, 1];
    word.forEach((ch, i) => {
      const s = document.createElement("span"); s.textContent = ch === " " ? " " : ch;
      s.style.fontWeight = wt[i]; s.style.transform = `scaleY(${sc[i]})`;
      if (i >= 4 && i <= 7) s.style.color = "#E6CD98";
      w.appendChild(s);
    });
  })();
})();
