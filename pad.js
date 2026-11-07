// ---------------------------------------------------------------
// Ons pad: de levenslijn als hoogteprofiel, zoals een enduro-stage.
// Het pad stijgt in het algemeen naar een hoog plateau en loopt na
// 2027 verder omhoog. De haltes komen uit <ol id="haltes">.
// ---------------------------------------------------------------
(function () {
  const svg = document.getElementById("pad-svg");
  const lijst = document.getElementById("haltes");
  const wrap = document.getElementById("pad");
  const kaart = document.getElementById("pad-kaart");
  if (!svg || !lijst || !wrap || !kaart) return;

  const NS = "http://www.w3.org/2000/svg";
  const H = 360, X0 = 40, X1 = 985, Y_HOOG = 70, Y_LAAG = 300, H_MIN = -0.3, H_MAX = 3.9;
  const y = (h) => Y_LAAG - (h - H_MIN) / (H_MAX - H_MIN) * (Y_LAAG - Y_HOOG);
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(n);
    return n;
  };
  const num = (v, d) => (isNaN(parseFloat(v)) ? d : parseFloat(v));

  // 1. Haltes inlezen (in de volgorde van de lijst)
  const items = [...lijst.querySelectorAll("li")].map((li) => ({
    li,
    jaar: li.dataset.jaar || "",
    hoogte: num(li.dataset.hoogte, 1),
    daarna: li.dataset.daarna !== undefined ? num(li.dataset.daarna, null) : null,
    datum: (li.querySelector(".h-datum") || {}).textContent || "",
    titel: (li.querySelector(".h-titel") || {}).textContent || "",
    tekst: (li.querySelector(".h-tekst") || {}).textContent || "",
    stil: li.classList.contains("stil"),
    now: li.classList.contains("now")
  }));
  const n = items.length;
  if (n < 2) return;

  // 2. Terrein: haltes op gelijke afstand, met zachte heuveltjes ertussen.
  //    Na de laatste halte loopt het pad nog anderhalve stap verder omhoog.
  const stap = (X1 - X0) / (n - 1 + 2.2);
  let seed = 11;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 - 0.5; };
  const pts = [[X0 - 20, y(items[0].hoogte - 0.4)]];
  let xi = X0;
  items.forEach((it, i) => {
    if (i > 0) {
      const vorige = pts[pts.length - 1];
      const mid = (vorige[0] + xi) / 2;
      const hv = H_MIN + (Y_LAAG - vorige[1]) / (Y_LAAG - Y_HOOG) * (H_MAX - H_MIN);
      pts.push([mid, y((hv + it.hoogte) / 2 - 0.18 + rnd() * 0.3)]);
    }
    it.x = xi; it.y = y(it.hoogte);
    pts.push([it.x, it.y]);
    if (it.daarna !== null) { xi += stap * 0.45; pts.push([xi, y(it.daarna)]); it.x2 = xi; it.y2 = y(it.daarna); }
    xi += stap;
  });
  const laatste = items[n - 1];
  const verder = [[laatste.x + stap * 0.6, y(laatste.hoogte + 0.12)], [laatste.x + stap * 1.2, y(laatste.hoogte + 0.32)], [laatste.x + stap * 1.7, y(laatste.hoogte + 0.42)], [X1 + 15, y(laatste.hoogte + 0.5)]];

  // vloeiende lijn (Catmull-Rom naar Bézier), in stukjes zodat we kunnen splitsen bij 2027
  const alles = pts.concat(verder);
  const f = (v) => v.toFixed(1);
  const segs = [];
  for (let i = 0; i < alles.length - 1; i++) {
    const p0 = alles[i - 1] || alles[i], p1 = alles[i], p2 = alles[i + 1], p3 = alles[i + 2] || p2;
    segs.push(` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`);
  }
  const knip = pts.length - 1; // index van de laatste halte
  const dVerleden = `M${f(alles[0][0])},${f(alles[0][1])}` + segs.slice(0, knip).join("");
  const dToekomst = `M${f(alles[knip][0])},${f(alles[knip][1])}` + segs.slice(knip).join("");

  // 3. Tekenen: grond, plateau-lijn, pad, en de weg verder
  el("path", { d: `${dVerleden}${segs.slice(knip).join("")} L${X1 + 15},${H} L${X0 - 20},${H} Z`, class: "p-grond" });
  el("line", { x1: X0 - 20, x2: X1 + 15, y1: y(3.4), y2: y(3.4), class: "p-raster" });
  el("text", { x: X0 - 16, y: y(3.4) - 10, class: "p-as" }).textContent = "*hoog plateau";
  // vanaf 2023: trails die van de toppen naar beneden lopen, waar we samen afrijden
  const eersteTrailX = (items.find((it) => parseInt(it.jaar, 10) >= 2023) || {}).x;
  if (eersteTrailX !== undefined) {
    let kant = 1, laatsteTrail = -1e9;
    alles.forEach((p, i) => {
      const v = alles[i - 1], w = alles[i + 1];
      if (!v || !w || p[0] < eersteTrailX - 1) return;
      if (!(p[1] <= v[1] && p[1] <= w[1])) return;        // alleen op een top (kleinere y = hoger)
      if (items.some((it) => it.stil && Math.abs(it.x - p[0]) < 1)) return; // niet vanaf een stil moment
      if (p[0] - laatsteTrail < 90) return;                                   // niet te dicht op elkaar
      laatsteTrail = p[0];
      // haarspeldbochten schuin de flank af
      let tx = p[0] + kant * 6, ty = p[1] + 12, d = `M${tx.toFixed(1)},${ty.toFixed(1)}`;
      const bodem = H - 36;
      for (let k = 0; k < 5 && ty + 14 < bodem; k++) {
        tx += kant * (k % 2 ? 4 : 22); ty += k % 2 ? 6 : 12;
        d += ` L${tx.toFixed(1)},${ty.toFixed(1)}`;
        if (k % 2 === 0) { tx -= kant * 14; ty += 8; d += ` L${tx.toFixed(1)},${ty.toFixed(1)}`; }
      }
      el("path", { d, class: "p-trail" });
      kant = -kant;
    });
  }
  const pad = el("path", { d: dVerleden, class: "p-pad" });
  el("path", { d: dToekomst, class: "p-toekomst" });
  const eind = alles[alles.length - 1];
  el("text", { x: eind[0] - 4, y: eind[1] - 16, "text-anchor": "end", class: "p-as" }).textContent = "*en verder";
  const L = pad.getTotalLength();
  const lengteBijX = (tx) => {
    let lo = 0, hi = L;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; (pad.getPointAtLength(m).x < tx ? (lo = m) : (hi = m)); }
    return lo;
  };

  // jaartallen onder het pad (alleen als het jaar verandert)
  let vorigJaar = "";
  items.forEach((it) => {
    if (it.jaar && it.jaar !== vorigJaar) el("text", { x: it.x, y: H - 10, "text-anchor": "middle", class: "p-jaar" }).textContent = it.jaar;
    vorigJaar = it.jaar;
  });

  // 4. De camionette (onder de haltes, zodat labels leesbaar blijven)
  const van = el("g", { class: "p-van", "aria-hidden": "true" });
  el("path", { d: "M-20,-2 v-15 a3,3 0 0 1 3,-3 h24 l8,9 v9 Z", class: "p-van-body" }, van);
  el("path", { d: "M8,-18 l6.5,7.5 h-6.5 Z", class: "p-van-raam" }, van);
  el("rect", { x: -15, y: -15, width: 7, height: 5, rx: 1, class: "p-van-raam" }, van);
  el("rect", { x: -17, y: -24, width: 20, height: 3, rx: 1, class: "p-van-body" }, van);
  el("circle", { cx: -12, cy: -1, r: 4.2, class: "p-van-wiel" }, van);
  el("circle", { cx: 8, cy: -1, r: 4.2, class: "p-van-wiel" }, van);
  // twee mountainbikes op een fietsdrager aan de trekhaak.
  // In zijaanzicht van de camionette zie je ze van voor: smal, met het stuur dwars.
  el("path", { d: "M-20,-3.5 h-5", class: "p-haak" }, van);                         // trekhaak
  el("rect", { x: -33, y: -5, width: 9, height: 2.4, rx: 0.8, class: "p-drager" }, van); // drager
  el("rect", { x: -33.4, y: -5.6, width: 1.6, height: 1.6, rx: 0.4, class: "p-licht" }, van); // achterlicht
  const fiets = (cx, cls) => {
    const g = el("g", { class: "p-fiets " + cls }, van);
    el("rect", { x: cx - 1.2, y: -12.5, width: 2.4, height: 8.2, rx: 1.2, class: "p-band" }, g); // banden, van voor gezien
    el("path", { d: `M${cx},-12.5 V-15.6 M${cx - 4.6},-16.2 Q${cx},-15 ${cx + 4.6},-16.2 M${cx - 1.6},-13.8 h3.2` }, g); // stuurpen, stuur, zadel
  };
  fiets(-30.6, "achter");
  fiets(-27.2, "voor");

  // 5. Haltes
  items.forEach((it, i) => {
    it.len = lengteBijX(it.x);
    const g = el("g", { class: "p-halte" + (it.stil ? " stil" : "") + (it.now ? " now" : ""), tabindex: "0", role: "button", "aria-label": `${i + 1}. ${it.titel}` });
    if (it.now) {
      el("line", { x1: it.x, x2: it.x, y1: it.y - 13, y2: it.y - 46, class: "p-paal" }, g);
      el("path", { d: `M${it.x},${it.y - 46} l22,7 l-22,7 Z`, class: "p-vlag" }, g);
    }
    el("circle", { cx: it.x, cy: it.y, r: 16, class: "p-raak" }, g); // groter tikvlak
    el("circle", { cx: it.x, cy: it.y, r: it.stil ? 7 : 10, class: "p-punt" }, g);
    if (it.x2) el("circle", { cx: it.x2, cy: it.y2, r: 5, class: "p-stip" }, svg);
    it.g = g;
    g.addEventListener("click", () => kies(i));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); kies(i); } });
  });
  svg.insertBefore(van, items[0].g);

  // 6. Rijden en kiezen
  let huidig = 0, doel = 0, anim = null, actief = 0;
  const zet = (len) => {
    const a = pad.getPointAtLength(Math.max(0, Math.min(L, len)));
    const b = pad.getPointAtLength(Math.max(0, Math.min(L, len + 2)));
    const hoek = Math.max(-22, Math.min(22, Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI));
    van.setAttribute("transform", `translate(${a.x.toFixed(1)},${(a.y - 2).toFixed(1)}) rotate(${hoek.toFixed(1)}) scale(1.5)`);
  };
  const traag = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rijNaar = (len) => {
    doel = len;
    if (traag) { huidig = doel; zet(huidig); return; }
    if (anim) return;
    const stap2 = () => {
      huidig += (doel - huidig) * 0.1;
      if (Math.abs(doel - huidig) < 0.5) { huidig = doel; anim = null; zet(huidig); return; }
      zet(huidig); anim = requestAnimationFrame(stap2);
    };
    anim = requestAnimationFrame(stap2);
  };
  const vorige = document.getElementById("pad-vorige"), volgende = document.getElementById("pad-volgende");
  // bij momenten van afscheid: een stille voetnoot
  const voetnoot = document.createElement("span");
  voetnoot.className = "h-voetnoot"; voetnoot.textContent = "*voor altijd in inkt en in ons hart"; voetnoot.hidden = true;
  kaart.querySelector(".pad-tekst").appendChild(voetnoot);
  function kies(i) {
    actief = i; const it = items[i];
    items.forEach((o, k) => o.g.classList.toggle("actief", k === i));
    kaart.classList.toggle("now", it.now); kaart.classList.toggle("stil", it.stil);
    kaart.querySelector(".h-datum").textContent = it.datum;
    kaart.querySelector(".h-titel").textContent = it.titel;
    kaart.querySelector(".h-tekst").textContent = it.tekst;
    voetnoot.hidden = !it.stil;
    vorige.disabled = i === 0; volgende.disabled = i === n - 1;
    rijNaar(Math.max(0, it.len - 42)); // parkeer net voor de halte, zodat je ze blijft zien
  }
  vorige.addEventListener("click", () => actief > 0 && kies(actief - 1));
  volgende.addEventListener("click", () => actief < n - 1 && kies(actief + 1));

  wrap.hidden = false;
  lijst.hidden = true;   // de lijst blijft in de code als bron en voor wie geen JavaScript heeft
  zet(0);
  kies(0);
})();
