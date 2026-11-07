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
    voertuig: li.dataset.voertuig || "",
    trails: li.dataset.trails || "",
    now: li.classList.contains("now"),
    // punt = geen halte met tekst, alleen iets in de animatie (een berg, vrienden, een ballon, ...)
    punt: li.classList.contains("punt"),
    berg: li.dataset.berg || "",
    konvooi: (li.dataset.konvooi || "").split(",").filter(Boolean),
    wedstrijd: li.dataset.wedstrijd !== undefined,
    ballon: (li.dataset.ballon || "").split(",").filter(Boolean),
    varen: li.dataset.varen !== undefined,
    inkt: li.dataset.inkt || "",
    sticker: li.dataset.sticker || ""
  }));
  const haltes = items.filter((it) => !it.punt);
  const n = items.length;
  if (n < 2) return;

  // 2. Terrein: haltes op gelijke afstand, met zachte heuveltjes ertussen.
  //    Na de laatste halte loopt het pad nog anderhalve stap verder omhoog.
  const gewicht = (it) => (it.punt ? 0.6 : 1);   // een punt neemt minder plaats in dan een halte
  const stap = (X1 - X0) / (items.slice(1).reduce((s, it) => s + gewicht(it), 0) + 2.2);
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
    const volgende = items[i + 1];
    xi += stap * (volgende ? gewicht(volgende) : 1);
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
  const tPlateau = el("text", { x: X0 - 16, y: y(3.4) - 10, class: "p-as" });
  const tal = (window.T || ((nl) => nl));
  const vertaalPlateau = () => (tPlateau.textContent = tal("hoog plateau", "haut plateau"));
  vertaalPlateau();
  // Trails, in drie fases (in de lijst aangeduid met data-trails op de halte waar een fase begint):
  //   klim  : Jan rijdt alleen bergop, dat deed hij altijd al
  //   solo  : Jan rijdt ook bergaf, nog alleen
  //   samen : Leyla en Jan samen bergaf: eerst kort en traag, dan langer en sneller
  const fases = items.filter((it) => it.trails).map((it) => ({ x: it.x, soort: it.trails }));
  const faseBij = (x) => { let s = null; fases.forEach((f) => { if (x >= f.x - 1) s = f.soort; }); return s; };
  if (fases.length) {
    let kant = 1, laatsteTrail = -1e9, nSamen = 0;
    alles.forEach((p, i) => {
      const v = alles[i - 1], w = alles[i + 1];
      if (!v || !w) return;
      const soort = faseBij(p[0]);
      if (!soort) return;
      if (items.some((it) => it.stil && Math.abs(it.x - p[0]) < 30)) return; // niet bij een stil moment
      const top = p[1] <= v[1] && p[1] <= w[1];
      // klim en solo: alleen op toppen. samen: ook onderweg, steeds vaker
      if (soort === "klim" && !top) return;
      if (p[0] - laatsteTrail < (soort === "samen" ? 62 : 80)) return;
      laatsteTrail = p[0];
      // hoe verder we samen zijn, hoe langer de trail en hoe sneller we rijden
      const bochten = soort === "samen" ? Math.min(7, 2 + nSamen) : 3;
      const snelheid = soort === "klim" ? 0.35 : soort === "solo" ? 0.8 : 0.55 + nSamen * 0.3;
      if (soort === "samen") nSamen++;
      // haarspeldbochten: punten afwisselend links en rechts, steeds wat lager
      let tx = p[0] + kant * 4, ty = p[1] + 12;
      const tpts = [[tx, ty]], bodem = H - 40;
      for (let k = 0; k < bochten && ty + 14 < bodem; k++) {
        tx += kant * (k % 2 ? -26 : 34); ty += 12;
        tpts.push([tx, ty]);
      }
      // ronde bochten, zodat de rijders er vloeiend doorheen gaan
      let d = `M${tpts[0][0].toFixed(1)},${tpts[0][1].toFixed(1)}`;
      for (let k = 1; k < tpts.length - 1; k++) {
        const m = [(tpts[k][0] + tpts[k + 1][0]) / 2, (tpts[k][1] + tpts[k + 1][1]) / 2];
        d += ` Q${tpts[k][0].toFixed(1)},${tpts[k][1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
      }
      const lp = tpts[tpts.length - 1]; d += ` L${lp[0].toFixed(1)},${lp[1].toFixed(1)}`;
      const tg = el("g", { class: "p-trailgroep " + soort, tabindex: "0", role: "button" });
      tg.dataset.soort = soort;
      el("path", { d, class: "p-trail-raak" }, tg);           // breed, onzichtbaar tikvlak
      const tp = el("path", { d, class: "p-trail" }, tg);
      const start = () => afdalen(tp, soort, snelheid);
      tg.addEventListener("click", start);
      tg.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(); } });
      kant = -kant;
    });
  }
  // wedstrijden: een lange trail vanaf de startboog, met een heel peloton
  const wedstrijdTrails = [];
  items.forEach((it) => {
    if (!it.wedstrijd) return;
    let tx = it.x + 6, ty = it.y + 12;
    const tpts = [[tx, ty]], bodem = H - 40;
    for (let k = 0; k < 12 && ty + 12 < bodem; k++) { tx += (k % 2 ? -26 : 30); ty += 10; tpts.push([tx, ty]); }
    let d = `M${tpts[0][0].toFixed(1)},${tpts[0][1].toFixed(1)}`;
    for (let k = 1; k < tpts.length - 1; k++) {
      const m = [(tpts[k][0] + tpts[k + 1][0]) / 2, (tpts[k][1] + tpts[k + 1][1]) / 2];
      d += ` Q${tpts[k][0].toFixed(1)},${tpts[k][1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
    }
    const lp = tpts[tpts.length - 1]; d += ` L${lp[0].toFixed(1)},${lp[1].toFixed(1)}`;
    const tg = el("g", { class: "p-trailgroep wedstrijd", tabindex: "0", role: "button" });
    tg.dataset.soort = "wedstrijd";
    el("path", { d, class: "p-trail-raak" }, tg);
    const tp = el("path", { d, class: "p-trail" }, tg);
    wedstrijdTrails.push({ it, tg, tp });
  });
  const pad = el("path", { d: dVerleden, class: "p-pad" });
  el("path", { d: dToekomst, class: "p-toekomst" });
  const eind = alles[alles.length - 1];
  const tVerder = el("text", { x: eind[0] - 4, y: eind[1] - 16, "text-anchor": "end", class: "p-as" });
  const vertaalVerder = () => (tVerder.textContent = tal("en verder", "et plus loin"));
  vertaalVerder();
  const L = pad.getTotalLength();
  const lengteBijX = (tx) => {
    let lo = 0, hi = L;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; (pad.getPointAtLength(m).x < tx ? (lo = m) : (hi = m)); }
    return lo;
  };

  items.forEach((it) => (it.len = lengteBijX(it.x)));
  const opPad = (x) => pad.getPointAtLength(lengteBijX(x));

  // ---- versiering in de animatie, zonder tekst: wie het weet, herkent het ----
  items.forEach((it) => {
    const p = opPad(it.x);
    // een hoge berg met sneeuw, een vlag en twee klimmers op de top
    if (it.berg) {
      const top = y(4.55), voet = H;
      const g = el("g", { class: "p-berg" });
      svg.insertBefore(g, svg.querySelector(".p-grond"));   // achter de grond: de voet verdwijnt erin
      el("path", { d: `M${p.x - 70},${voet} L${p.x - 8},${top + 12} L${p.x},${top} L${p.x + 9},${top + 14} L${p.x + 68},${voet} Z`, class: "b-rots" }, g);
      el("path", { d: `M${p.x - 12},${top + 17} L${p.x},${top} L${p.x + 12},${top + 18} L${p.x + 6},${top + 15} L${p.x + 1},${top + 20} L${p.x - 5},${top + 15} Z`, class: "b-sneeuw" }, g);
      el("path", { d: `M${p.x},${top} v-13 l9,3.5 l-9,3.5`, class: "b-vlag" }, g);
      [[-7, 9], [-12, 14]].forEach(([dx, dy]) => {   // twee klimmers, vlak onder de top
        const k = el("g", { class: "b-klimmer", transform: `translate(${p.x + dx},${top + dy})` }, g);
        el("circle", { cx: 0, cy: -6, r: 1.6 }, k);
        el("path", { d: "M0,-4.4 L-0.6,0 M-0.6,0 L-2.2,3 M-0.6,0 L1.4,2.8 M0,-3.6 L2.6,-5.4 M2.6,-5.4 L3.4,-1" }, k);
      });
    }
    // een wedstrijd: een startboog met dambordvlag over het pad
    if (it.wedstrijd) {
      const g = el("g", { class: "p-wedstrijd", tabindex: "0", role: "button" });
      it.boog = g;
      svg.insertBefore(g, pad.nextSibling);
      el("rect", { x: p.x - 16, y: p.y - 36, width: 32, height: 40, class: "w-raak" }, g);   // tikvlak
      el("path", { d: `M${p.x - 13},${p.y + 2} V${p.y - 30} M${p.x + 13},${p.y + 2} V${p.y - 30}`, class: "w-paal" }, g);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 9; c++)
        el("rect", { x: p.x - 13 + c * (26 / 9), y: p.y - 33 + r * 3, width: 26 / 9, height: 3, class: (r + c) % 2 ? "w-zwart" : "w-wit" }, g);
    }
    // een sticker, zoals op de laptop: een ronde badge in de grond onder het pad
    if (it.sticker) {
      const sx = p.x + 6, sy = Math.min(H - 36, p.y + 46);
      const g = el("g", { class: "p-sticker", transform: `translate(${sx},${sy}) rotate(${it.sticker === "dromen" ? 8 : -10})` });
      const R = it.sticker === "borncrazy" ? 25 : 15;
      el("circle", { cx: 0, cy: 0, r: R, class: "st-rond" }, g);
      if (it.sticker === "dromen") {   // bergen met een opkomende zon
        el("path", { d: "M-11,6 L-4,-2 L-1,1 L4,-6 L11,5 M4,-9 a3,3 0 0 1 6,0 M7,-14 v-2 M11,-12 l1.5,-1.5 M3,-12 l-1.5,-1.5", class: "st-lijn" }, g);
      } else {                         // Born Crazy: de sticker van de bende, nagetekend in lijnen (zoals in de zijkant)
        const s = 0.52;                // de tekening staat in 100 eenheden, zoals de zijkant-iconen
        const k = el("g", { class: "st-bc", transform: `translate(${-50 * s},${-50 * s}) scale(${s})` }, g);
        el("circle", { cx: 60, cy: 44, r: 7.2 }, k);                                 // achterwiel op de grond
        el("circle", { cx: 36, cy: 31.2, r: 7.2 }, k);                               // voorwiel in de lucht: wheelie
        el("path", { d: "M60 44L49.7 41.2 60 30.4ZM60 30.4L45.5 23.6 36 31.2M45.5 23.6l.5-5.2 2.4 1.3M46.5 40.4l6.4 1.6" }, k);   // kader, stuur, trapper
        el("path", { d: "M46.5 40.4l2.4-9.6 12.1 1.1-4.7-13.4-6.4-1.6-3.4 1.4M56.3 18.5l-.9-2.4M50.3 12.5a3.7 3.7 0 1 1 5.8 3.2", class: "dik" }, k);   // rijder, gehurkt, en zijn helm
        el("path", { d: "M50.3 12.5l-3.6.5M56.1 15.7a3.7 3.7 0 0 1-5.8-3.2M71 32h8M73 40h10M72 48h7" }, k);   // klep, kin en vaart
        el("path", { d: "M24.5 55v13M24.5 55h5.8a3.7 3.3 0 0 1 0 6.5h-5.8M30.3 61.5a3.7 3.3 0 0 1 0 6.5h-5.8M41.7 55h3.1a3.7 3.3 0 0 1 3.7 3.3v6.5a3.7 3.3 0 0 1-3.7 3.2h-3.1a3.7 3.3 0 0 1-3.7-3.2v-6.5a3.7 3.3 0 0 1 3.7-3.3ZM51.5 68V55h5.8a3.7 3.3 0 0 1 0 6.5h-5.8M56.2 61.5l5.8 6.5M65 68V55l10.5 13V55", class: "letter" }, k);   // BORN
        el("path", { d: "M31.4 74.3c-1.4-2.8-9.2-4.2-9.2 3.7s7.8 6.5 9.2 3.7M33.8 84.5v-13h5.1a3.2 3.3 0 0 1 0 6.5h-5.1M37.9 78l5.1 6.5M45.4 84.5l4.6-13 4.6 13M47.2 79.4h5.6M57 71.5h9.2L57 84.5h9.2M68.6 71.5l4.6 6 4.6-6M73.2 77.5v7", class: "letter" }, k);   // CRAZY
      }
    }
    // ballonnen voor de petekinderen (grafiet: van Jan, rood: van Leyla)
    it.ballon.forEach((wie, k) => {
      const bx = p.x + (k - (it.ballon.length - 1) / 2) * 13, by = p.y - 40 - (k % 2) * 7;
      const g = el("g", { class: "p-ballon " + wie, style: `animation-delay:${(k * 0.7).toFixed(1)}s` });
      el("path", { d: `M${bx},${by + 8} q-3,8 1,13 q3,5 -1,11`, class: "bl-touw" }, g);
      el("ellipse", { cx: bx, cy: by, rx: 6, ry: 7.5, class: "bl-ballon" }, g);
      el("path", { d: `M${bx - 1.6},${by + 7.2} h3.2 l-1.6,2.2 Z`, class: "bl-knoop" }, g);
    });
    // een varentak zoals de tatoeage, geplant naast het pad
    if (it.varen) {
      const g = el("g", { class: "p-varen", transform: `translate(${p.x + 4},${p.y + 2}) rotate(-58)` });
      el("path", { d: "M0,0 C8,-2 18,-3 30,-1" }, g);
      for (let k = 0; k < 6; k++) {
        const sx = 6 + k * 4.4, l = 6 - k * 0.6;
        el("path", { d: `M${sx},-1.5 l${l * 0.5},-${l} M${sx},-1 l${l * 0.5},${l * 0.9} M${sx + l * 0.25},-${l * 0.5} l-1.4,-1 M${sx + l * 0.25},${l * 0.45} l-1.4,1` }, g);
      }
    }
  });

  // jaartallen onder het pad (alleen als het jaar verandert)
  let vorigJaar = "";
  items.forEach((it) => {
    if (it.punt) return;
    if (it.jaar && it.jaar !== vorigJaar) el("text", { x: it.x, y: H - 10, "text-anchor": "middle", class: "p-jaar" }).textContent = it.jaar;
    vorigJaar = it.jaar;
  });

  // 4. Ons voertuig (onder de haltes). Het wisselt onderweg:
  //    eerst een kleine auto met één fiets, dan Ivette (Iveco Daily) met twee,
  //    daarna de Caddy Maxi met twee. Zie data-voertuig in de lijst.
  const van = el("g", { class: "p-van", "aria-hidden": "true" });
  // fietsen op een drager aan de trekhaak: in zijaanzicht zie je ze van voor
  const drager = (parent, achterkant, aantal) => {
    const x0 = achterkant;                                   // x van de achterbumper
    el("path", { d: `M${x0},-3.5 h-5`, class: "p-haak" }, parent);
    const breed = aantal === 1 ? 6 : 9;
    el("rect", { x: x0 - 5 - breed + 1, y: -5, width: breed, height: 2.4, rx: 0.8, class: "p-drager" }, parent);
    el("rect", { x: x0 - 5 - breed + 0.6, y: -5.6, width: 1.6, height: 1.6, rx: 0.4, class: "p-licht" }, parent);
    const fiets = (cx, cls) => {
      const g = el("g", { class: "p-fiets " + cls }, parent);
      el("rect", { x: cx - 1.2, y: -12.5, width: 2.4, height: 8.2, rx: 1.2, class: "p-band" }, g);
      el("path", { d: `M${cx},-12.5 V-15.6 M${cx - 4.6},-16.2 Q${cx},-15 ${cx + 4.6},-16.2 M${cx - 1.6},-13.8 h3.2` }, g);
    };
    if (aantal === 1) fiets(x0 - 8, "jan");                    // de kleine auto: enkel de fiets van Jan
    else { fiets(x0 - 10.6, "leyla"); fiets(x0 - 7.2, "jan"); } // rood is Leyla, grafiet is Jan
  };
  const voertuigen = {};
  // kleine auto (zoals een Opel Corsa): hatchback, één fiets
  voertuigen.auto = el("g", { class: "v-auto" }, van);
  el("path", { d: "M-12,-2 v-6.5 q0,-1.5 1.2,-2.2 l2.6,-3.6 q0.8,-1 2,-1 h8.6 q1.3,0 2.1,0.9 l3.8,4.1 l4.2,1 q1.5,0.4 1.5,1.9 v5.4 Z", class: "p-van-body" }, voertuigen.auto);
  el("path", { d: "M-8.4,-10.6 l2.2,-3 h4.4 v3 Z M-0.6,-13.6 h4.2 l2.8,3 h-7 Z", class: "p-van-raam" }, voertuigen.auto);
  el("circle", { cx: -7, cy: -1, r: 3.3, class: "p-van-wiel" }, voertuigen.auto);
  el("circle", { cx: 8.5, cy: -1, r: 3.3, class: "p-van-wiel" }, voertuigen.auto);
  drager(voertuigen.auto, -12, 1);
  // Ivette, de Iveco Daily: hoog, lang, met dakrek, twee fietsen
  voertuigen.ivette = el("g", { class: "v-ivette" }, van);
  el("path", { d: "M-20,-2 v-15 a3,3 0 0 1 3,-3 h24 l8,9 v9 Z", class: "p-van-body" }, voertuigen.ivette);
  el("path", { d: "M8,-18 l6.5,7.5 h-6.5 Z", class: "p-van-raam" }, voertuigen.ivette);
  el("rect", { x: -15, y: -15, width: 7, height: 5, rx: 1, class: "p-van-raam" }, voertuigen.ivette);
  el("rect", { x: -17, y: -24, width: 20, height: 3, rx: 1, class: "p-van-body" }, voertuigen.ivette);
  el("circle", { cx: -12, cy: -1, r: 4.2, class: "p-van-wiel" }, voertuigen.ivette);
  el("circle", { cx: 8, cy: -1, r: 4.2, class: "p-van-wiel" }, voertuigen.ivette);
  drager(voertuigen.ivette, -20, 2);
  // de Caddy Maxi: lager en korter dan Ivette, met een korte motorkap, twee fietsen
  voertuigen.caddy = el("g", { class: "v-caddy" }, van);
  el("path", { d: "M-17,-2 v-11.5 a2.5,2.5 0 0 1 2.5,-2.5 h19.5 l5.2,5.6 l4.6,1.3 q1.2,0.4 1.2,1.6 v5.5 Z", class: "p-van-body" }, voertuigen.caddy);
  el("path", { d: "M5.2,-14.4 l4.4,4.8 h-4.4 Z", class: "p-van-raam" }, voertuigen.caddy);
  el("rect", { x: -3.5, y: -13.6, width: 7, height: 4.2, rx: 0.8, class: "p-van-raam" }, voertuigen.caddy);
  el("circle", { cx: -10.5, cy: -1, r: 3.7, class: "p-van-wiel" }, voertuigen.caddy);
  el("circle", { cx: 9, cy: -1, r: 3.7, class: "p-van-wiel" }, voertuigen.caddy);
  drager(voertuigen.caddy, -17, 2);

  // 5. Haltes
  haltes.forEach((it, i) => {
    const g = el("g", { class: "p-halte" + (it.stil ? " stil" : "") + (it.now ? " now" : "") + (it.inkt ? " inkt-" + it.inkt : ""), tabindex: "0", role: "button", "aria-label": `${i + 1}. ${it.titel}` });
    if (it.now) {
      el("line", { x1: it.x, x2: it.x, y1: it.y - 13, y2: it.y - 46, class: "p-paal" }, g);
      el("path", { d: `M${it.x},${it.y - 46} l22,7 l-22,7 Z`, class: "p-vlag" }, g);
    }
    el("circle", { cx: it.x, cy: it.y, r: 16, class: "p-raak" }, g); // groter tikvlak
    el("circle", { cx: it.x, cy: it.y, r: it.stil ? 7 : 10, class: "p-punt" }, g);
    // een klein teken in inkt bij een afscheid met een tatoeage
    if (it.inkt === "h") el("path", { d: `M${it.x - 2.4},${it.y - 3.4} v6.8 M${it.x + 2.4},${it.y - 3.4} v6.8 M${it.x - 2.4},${it.y + 0.3} h4.8`, class: "p-inkt" }, g);
    if (it.inkt === "quoi") el("path", { d: `M${it.x - 2.2},${it.y - 2.2} a2.3,2.3 0 1 1 3.4,2 q-1.2,0.7 -1.2,1.8 M${it.x},${it.y + 3.6} v0.1`, class: "p-inkt" }, g);
    if (it.inkt === "hibiscus") for (let k = 0; k < 5; k++) { const a = k * 72 * Math.PI / 180; el("circle", { cx: it.x + Math.cos(a) * 2.6, cy: it.y + Math.sin(a) * 2.6, r: 1.6, class: "p-inkt-blad" }, g); }
    if (it.x2) el("circle", { cx: it.x2, cy: it.y2, r: 5, class: "p-stip" }, svg);
    it.g = g;
    g.addEventListener("click", () => kies(i));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); kies(i); } });
  });
  svg.insertBefore(van, haltes[0].g);

  // 5b. Twee mountainbikers (Leyla en Jan) die samen een trail afrijden
  const maakRijder = (cls) => {
    const g = el("g", { class: "p-rijder " + cls, "aria-hidden": "true" });
    el("circle", { cx: -6, cy: -3, r: 3, class: "r-wiel" }, g);   // achterwiel
    el("circle", { cx: 6, cy: -3, r: 3, class: "r-wiel" }, g);    // voorwiel
    el("path", { d: "M-6,-3 L-1,-3.5 L-2.5,-8 Z M-2.5,-8 L4,-8.5 L-1,-3.5 M4,-8.5 L6,-3 M4,-8.5 L4.6,-10.2", class: "r-kader" }, g); // kader en stuur
    el("path", { d: "M-2.6,-9.6 L1.8,-13.6 L4.6,-10.2 M-2.6,-9.6 L1.2,-7.2 L-1,-3.8", class: "r-lijf" }, g); // romp, arm, been: staand in de pedalen
    el("circle", { cx: 2.8, cy: -16, r: 2.2, class: "r-hoofd" }, g);  // helm
    g.style.opacity = 0;
    return g;
  };
  let rijders = null, anderen = null, afdaling = null;
  function afdalen(trail, soort, snelheid) {
    if (!rijders) rijders = { jan: maakRijder("jan"), leyla: maakRijder("leyla") };
    if (!anderen) anderen = Array.from({ length: 7 }, () => maakRijder("ander"));
    if (afdaling) cancelAnimationFrame(afdaling);
    // wie rijdt er mee? klim en solo: Jan alleen. samen: om beurten Leyla of Jan voorop
    let ploeg;
    if (soort === "samen") {
      window.__leylaVoorop = !window.__leylaVoorop;
      ploeg = window.__leylaVoorop ? [rijders.leyla, rijders.jan] : [rijders.jan, rijders.leyla];
    } else if (soort === "wedstrijd") {
      // een heel peloton, met Leyla en Jan ergens tussenin (telkens op een andere plek)
      ploeg = anderen.slice();
      const plek = (n) => Math.floor(Math.random() * (n + 1));
      ploeg.splice(plek(ploeg.length), 0, rijders.jan);
      ploeg.splice(plek(ploeg.length), 0, rijders.leyla);
    } else ploeg = [rijders.jan];
    Object.values(rijders).concat(anderen).forEach((r) => { r.style.transition = ""; r.style.opacity = 0; });
    ploeg.forEach((r) => svg.appendChild(r));                   // bovenaan tekenen
    const len = trail.getTotalLength(), afstand = soort === "wedstrijd" ? 15 : 22;
    const bergop = soort === "klim";
    const duur = Math.max(900, (len + afstand) / (snelheid || 0.6) * 10);  // snelheid in px per 10 ms
    const plaats = (r, l) => {
      // bergop rijden we de trail van onder naar boven
      const pos = bergop ? len - l : l, vooruit = bergop ? -4 : 4;
      const a = trail.getPointAtLength(Math.max(0, Math.min(len, pos)));
      const b = trail.getPointAtLength(Math.max(0, Math.min(len, pos + vooruit)));
      const links = b.x < a.x;
      let hoek = Math.atan2(b.y - a.y, Math.abs(b.x - a.x)) * 180 / Math.PI;
      hoek = Math.max(-20, Math.min(20, hoek));
      r.setAttribute("transform", `translate(${a.x.toFixed(1)},${a.y.toFixed(1)}) scale(${links ? -1.4 : 1.4},1.4) rotate(${hoek.toFixed(1)})`);
      r.style.opacity = l < 0 || l > len ? 0 : 1;
    };
    if (traag) { ploeg.forEach((r, k) => plaats(r, len - k * afstand)); setTimeout(() => ploeg.forEach((r) => (r.style.opacity = 0)), 2500); return; }
    const t0 = performance.now();
    const loop = (nu) => {
      const t = Math.min(1, (nu - t0) / duur);
      const e = bergop ? t : (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);   // bergop: rustig gelijkmatig trappen
      const l = e * (len + afstand * (ploeg.length - 1));
      ploeg.forEach((r, k) => plaats(r, l - k * afstand));
      if (t < 1) afdaling = requestAnimationFrame(loop);
      else setTimeout(() => ploeg.forEach((r) => { r.style.transition = "opacity .4s"; r.style.opacity = 0; }), 1500);
    };
    ploeg.forEach((r, k) => plaats(r, -k * afstand));
    afdaling = requestAnimationFrame(loop);
  }

  wedstrijdTrails.forEach(({ it, tg, tp }) => {
    const start = () => afdalen(tp, "wedstrijd", 0.75);
    [tg, it.boog].forEach((n) => {
      if (!n) return;
      n.addEventListener("click", start);
      n.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(); } });
    });
  });

  const wissels = items.filter((it) => it.voertuig && voertuigen[it.voertuig]).map((it) => ({ len: it.len, soort: it.voertuig }));

  // Vrienden die een stuk meereizen: hun camionettes (of auto met daktent).
  const maakVriend = (soort) => {
    const g = el("g", { class: "p-vriend", "aria-hidden": "true" });
    if (soort === "daktent") {   // auto met een daktent
      el("path", { d: "M-12,-2 v-6 q0,-1.4 1.2,-2 l2.6,-3.4 q0.8,-1 2,-1 h8.6 q1.3,0 2.1,0.9 l3.8,4 l4.2,1 q1.5,0.4 1.5,1.9 v4.6 Z", class: "vr-body" }, g);
      el("path", { d: "M-9,-14.6 h14 l-3,-5.6 h-8 Z", class: "vr-tent" }, g);
      el("circle", { cx: -7, cy: -1, r: 3.2, class: "vr-wiel" }, g); el("circle", { cx: 8.5, cy: -1, r: 3.2, class: "vr-wiel" }, g);
    } else {                     // een camionette van vrienden
      el("path", { d: "M-18,-2 v-13.5 a2.5,2.5 0 0 1 2.5,-2.5 h21 l7,8 v8 Z", class: "vr-body" }, g);
      el("path", { d: "M5.5,-16.4 l5.6,6.4 h-5.6 Z", class: "vr-raam" }, g);
      el("circle", { cx: -11, cy: -1, r: 3.8, class: "vr-wiel" }, g); el("circle", { cx: 6.5, cy: -1, r: 3.8, class: "vr-wiel" }, g);
    }
    g.style.display = "none";
    svg.insertBefore(g, van);
    return g;
  };
  // Op een moment met vrienden rijden hun camionettes van onder aan de berg naar ons toe,
  // en parkeren ze naast ons. Daarna blijven ze daar samen staan.
  const plekken = [];
  items.forEach((it) => {
    if (!it.konvooi.length) return;
    const plek = { len: it.punt ? it.len - 8 : it.len - 42, aanwezig: false, tok: 0, wagens: [] };
    it.konvooi.forEach((soort, k) => {
      const g = maakVriend(soort);
      const eindLen = plek.len - 56 * (k + 1);               // achter ons geparkeerd
      const P = pad.getPointAtLength(Math.max(0, eindLen));
      const kant = k % 2 ? -1 : 1, bodem = H - 16;
      // een weggetje met bochten, van onder aan de berg naar de parkeerplek
      const wp = [[P.x + kant * 46, bodem], [P.x - kant * 24, bodem - (bodem - P.y) * 0.38], [P.x + kant * 28, bodem - (bodem - P.y) * 0.72], [P.x, P.y]];
      let d = `M${wp[0][0].toFixed(1)},${wp[0][1].toFixed(1)}`;
      for (let q = 1; q < wp.length; q++) {
        const m = q < wp.length - 1 ? [(wp[q][0] + wp[q + 1][0]) / 2, (wp[q][1] + wp[q + 1][1]) / 2] : wp[q];
        d += q < wp.length - 1 ? ` Q${wp[q][0].toFixed(1)},${wp[q][1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}` : ` L${m[0].toFixed(1)},${m[1].toFixed(1)}`;
      }
      const weg = el("path", { d, class: "p-weg" });
      svg.insertBefore(weg, pad);
      plek.wagens.push({ g, weg, eindLen });
    });
    plekken.push(plek);
  });
  plekken.sort((a, b) => a.len - b.len);
  const plaatsOp = (g, len) => {
    const a = pad.getPointAtLength(Math.max(0, Math.min(L, len)));
    const b = pad.getPointAtLength(Math.max(0, Math.min(L, len + 2)));
    const hoek = Math.max(-22, Math.min(22, Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI));
    g.setAttribute("transform", `translate(${a.x.toFixed(1)},${(a.y - 2).toFixed(1)}) rotate(${hoek.toFixed(1)}) scale(1.35)`);
  };
  const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
  // de vrienden rijden hun weggetje op (allemaal tegelijk, een beetje na elkaar)
  // vrienden rijden hun weggetje op (op = true) of weer naar beneden (op = false)
  function rijden(plek, op) {
    plek.aanwezig = op;
    const tok = ++plek.tok;
    return Promise.all(plek.wagens.map((w, k) => new Promise((klaar) => {
      const { g, weg, eindLen } = w;
      const L2 = weg.getTotalLength();
      if (w.pos === undefined) w.pos = 0;
      const zetOpWeg = (l) => {
        w.pos = l;
        const a = weg.getPointAtLength(Math.max(0, Math.min(L2, l)));
        const b = weg.getPointAtLength(Math.max(0, Math.min(L2, l + (op ? 2 : -2))));   // kijk in de rijrichting
        const links = b.x < a.x;
        const hoek = Math.max(-30, Math.min(30, Math.atan2(b.y - a.y, Math.abs(b.x - a.x)) * 180 / Math.PI));
        g.setAttribute("transform", `translate(${a.x.toFixed(1)},${(a.y - 2).toFixed(1)}) scale(${links ? -1.35 : 1.35},1.35) rotate(${hoek.toFixed(1)})`);
      };
      if (traag) {
        if (op) { g.style.display = ""; plaatsOp(g, eindLen); w.pos = L2; } else { g.style.display = "none"; w.pos = 0; }
        klaar(); return;
      }
      weg.classList.add("zichtbaar"); g.style.display = "";
      const van = w.pos, naar = op ? L2 : 0;
      const deel = Math.abs(naar - van) / L2 || 0;
      const duur = (op ? 1700 + k * 350 : 1300 + k * 200) * Math.max(0.3, deel);
      const t0 = performance.now() + k * (op ? 250 : 150);
      zetOpWeg(van);
      const loop = (nu) => {
        if (tok !== plek.tok) { klaar(); return; }              // ondertussen iets anders gekozen
        const t = Math.max(0, Math.min(1, (nu - t0) / duur));
        const e = op ? 1 - Math.pow(1 - t, 3) : t * t;          // rustig parkeren, vlot vertrekken
        if (t < 1) { zetOpWeg(van + (naar - van) * e); requestAnimationFrame(loop); return; }
        if (op) {
          plaatsOp(g, eindLen); w.pos = L2;
          setTimeout(() => { if (tok === plek.tok) weg.classList.remove("zichtbaar"); }, 1200);
        } else {
          g.style.display = "none"; w.pos = 0; weg.classList.remove("zichtbaar");
        }
        klaar();
      };
      requestAnimationFrame(loop);
    })));
  }

  // 6. Rijden en kiezen
  let huidig = 0, doel = 0, anim = null, actief = 0;
  const zet = (len) => {
    const a = pad.getPointAtLength(Math.max(0, Math.min(L, len)));
    const b = pad.getPointAtLength(Math.max(0, Math.min(L, len + 2)));
    const hoek = Math.max(-22, Math.min(22, Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI));
    van.setAttribute("transform", `translate(${a.x.toFixed(1)},${(a.y - 2).toFixed(1)}) rotate(${hoek.toFixed(1)}) scale(1.5)`);
    // welk voertuig rijdt hier? het laatste wissel-punt dat we gepasseerd zijn
    let soort = wissels.length ? wissels[0].soort : "ivette";
    for (const w of wissels) if (len >= w.len - 50) soort = w.soort;
    for (const k in voertuigen) voertuigen[k].style.display = k === soort ? "" : "none";
  };
  const traag = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rit = 0;   // elke nieuwe keuze annuleert de vorige rit
  const rijTot = (len, nr) => new Promise((klaar) => {
    doel = len;
    if (traag) { huidig = doel; zet(huidig); klaar(); return; }
    if (anim) cancelAnimationFrame(anim);
    const stap2 = () => {
      if (nr !== rit) { anim = null; klaar(); return; }
      huidig += (doel - huidig) * 0.1;
      if (Math.abs(doel - huidig) < 0.5) { huidig = doel; anim = null; zet(huidig); klaar(); return; }
      zet(huidig); anim = requestAnimationFrame(stap2);
    };
    anim = requestAnimationFrame(stap2);
  });
  async function rijNaar(len) {
    const nr = ++rit;
    // wie nu bij ons staat, rijdt weer naar beneden zodra wij verder gaan
    plekken.forEach((p) => { if (p.aanwezig && Math.abs(p.len - len) > 1) rijden(p, false); });
    // rijden we vooruit langs een plek waar vrienden aansluiten? dan stoppen we daar even
    while (true) {
      const plek = plekken.find((p) => !p.aanwezig && p.len > huidig + 1 && p.len <= len + 1);
      if (!plek) break;
      await rijTot(plek.len, nr);
      if (nr !== rit) return;
      await rijden(plek, true);
      if (nr !== rit) return;
      if (Math.abs(plek.len - len) <= 1) return;   // hier blijven we samen staan
      await wacht(900);
      if (nr !== rit) return;
      rijden(plek, false);                         // zij rijden weer naar beneden, wij verder
    }
    await rijTot(len, nr);
    if (nr !== rit) return;
    const hier = plekken.find((p) => !p.aanwezig && Math.abs(p.len - len) <= 1);
    if (hier) rijden(hier, true);
  }
  const vorige = document.getElementById("pad-vorige"), volgende = document.getElementById("pad-volgende");
  // bij momenten van afscheid: een stille voetnoot
  const voetnoot = document.createElement("span");
  voetnoot.className = "h-voetnoot"; voetnoot.hidden = true;
  kaart.querySelector(".pad-tekst").appendChild(voetnoot);
  // het teken in inkt: groot, als tekening rechts in het kaartje
  const INKT = {
    hibiscus: `<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(0 50 50)"><path d="M50 50C36 42 28 26 36 15q4-5 8-2q3-4 6-4q3 0 6 4q4-3 8 2C72 26 64 42 50 50Z"/><path class="ader" d="M50 50L50 18"/></g><g transform="rotate(72 50 50)"><path d="M50 50C36 42 28 26 36 15q4-5 8-2q3-4 6-4q3 0 6 4q4-3 8 2C72 26 64 42 50 50Z"/><path class="ader" d="M50 50L50 18"/></g><g transform="rotate(144 50 50)"><path d="M50 50C36 42 28 26 36 15q4-5 8-2q3-4 6-4q3 0 6 4q4-3 8 2C72 26 64 42 50 50Z"/><path class="ader" d="M50 50L50 18"/></g><g transform="rotate(216 50 50)"><path d="M50 50C36 42 28 26 36 15q4-5 8-2q3-4 6-4q3 0 6 4q4-3 8 2C72 26 64 42 50 50Z"/><path class="ader" d="M50 50L50 18"/></g><g transform="rotate(288 50 50)"><path d="M50 50C36 42 28 26 36 15q4-5 8-2q3-4 6-4q3 0 6 4q4-3 8 2C72 26 64 42 50 50Z"/><path class="ader" d="M50 50L50 18"/></g>
      <path class="meeldraad" d="M50 50Q66 40 78 24"/><circle class="stip" cx="79" cy="22" r="2.6"/><circle class="stip" cx="74" cy="22" r="2"/><circle class="stip" cx="80" cy="28" r="2"/><circle class="stip" cx="76" cy="17" r="1.8"/><circle class="stip" cx="83" cy="20" r="1.8"/>
      <circle class="hart" cx="50" cy="50" r="5"/></svg>`,
    quoi: `<svg viewBox="0 0 120 100" aria-hidden="true"><text x="60" y="60" text-anchor="middle" class="typmachine">quoi?</text></svg>`,
    dromen: `<svg viewBox="0 0 100 100" class="sticker" aria-hidden="true">
      <circle class="st-vlak" cx="50" cy="50" r="46"/><circle class="st-ring" cx="50" cy="50" r="41"/>
      <path id="kaart-boog-dromen" d="M22,70 A33,33 0 1 1 78,70" fill="none" stroke="none"/>
      <text class="st-woord"><textPath href="#kaart-boog-dromen" startOffset="50%" text-anchor="middle">HET LEVEN VAN ONS DROMEN</textPath></text>
      <path class="st-wit" d="M30 66L41 53l5 5 8-13 16 21Z"/><path class="st-wit" d="M56 44a6 6 0 0 1 12 0"/><path class="st-wit" d="M62 33v-3M69 36l2-2M55 36l-2-2"/>
      </svg>`,
    h: `<svg viewBox="0 0 100 100" aria-hidden="true"><path class="letter" d="M30 18v64M70 18v64M30 50h40M22 18h16M62 18h16M22 82h16M62 82h16"/></svg>`
  };
  const inktLabel = document.createElement("figure");
  inktLabel.className = "inkt-beeld"; inktLabel.hidden = true;
  kaart.insertBefore(inktLabel, document.getElementById("pad-volgende"));
  const nh = haltes.length;
  function kies(i) {
    actief = i; const it = haltes[i];
    haltes.forEach((o, k) => o.g.classList.toggle("actief", k === i));
    kaart.classList.toggle("now", it.now); kaart.classList.toggle("stil", it.stil);
    kaart.querySelector(".h-datum").textContent = it.datum;
    kaart.querySelector(".h-titel").textContent = it.titel;
    kaart.querySelector(".h-tekst").textContent = it.tekst;
    voetnoot.hidden = !it.inkt;   // alleen bij een afscheid dat in inkt staat
    const beeld = it.inkt || it.sticker;      // een tatoeage of een sticker, groot rechts in het kaartje
    inktLabel.hidden = !INKT[beeld];
    inktLabel.classList.toggle("is-sticker", !it.inkt && !!it.sticker);
    if (INKT[beeld]) inktLabel.innerHTML = INKT[beeld];
    vorige.disabled = i === 0; volgende.disabled = i === nh - 1;
    rijNaar(Math.max(0, it.len - 42)); // parkeer net voor de halte, zodat je ze blijft zien
  }
  vorige.addEventListener("click", () => actief > 0 && kies(actief - 1));
  volgende.addEventListener("click", () => actief < nh - 1 && kies(actief + 1));

  // teksten in de juiste taal zetten (bij het laden en bij elke taalwissel)
  function vertaal() {
    haltes.forEach((it, i) => {
      it.datum = (it.li.querySelector(".h-datum") || {}).textContent || "";
      it.titel = (it.li.querySelector(".h-titel") || {}).textContent || "";
      it.tekst = (it.li.querySelector(".h-tekst") || {}).textContent || "";
      if (it.g) it.g.setAttribute("aria-label", `${i + 1}. ${it.titel}`);
    });
    svg.querySelectorAll(".p-trailgroep").forEach((g) => {
      const s = g.dataset.soort;
      g.setAttribute("aria-label", s === "klim" ? tal("Jan klimt naar boven", "Jan grimpe vers le sommet")
        : s === "solo" ? tal("Jan rijdt naar beneden", "Jan descend la piste")
        : tal("Rij samen deze trail af", "Descendez cette piste ensemble"));
    });
    voetnoot.textContent = tal("voor altijd in inkt en in ons hart", "à jamais dans l'encre et dans nos cœurs");
    vertaalPlateau(); vertaalVerder();
  }
  vertaal();
  window.addEventListener("taalwissel", () => { vertaal(); kies(actief); });

  wrap.hidden = false;
  lijst.hidden = true;   // de lijst blijft in de code als bron en voor wie geen JavaScript heeft
  zet(0);
  kies(0);
})();
