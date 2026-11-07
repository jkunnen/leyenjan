// ---------------------------------------------------------------
// Rijders: Leyla en Jan op de mountainbike, overal op de site.
// - Klik op een trail (stippellijn) in de bergkam bovenaan of in de
//   footer: ze rijden hem samen af.
// - Klik op een witte lijn in de bergkam bovenaan: ze rijden over de
//   linkerlijn, springen over de kloof en landen op de rechterlijn.
// De rijders worden getekend in een eigen laag over de pagina, zodat
// ze nooit uitgerekt worden, ook al zijn de bergkammen dat wel.
// ---------------------------------------------------------------
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const traag = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mk = (tag, a, p) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); if (p) p.appendChild(n); return n; };

  // de laag met de rijders, over de hele pagina
  const laag = mk("svg", { class: "rijderslaag", "aria-hidden": "true" });
  document.body.appendChild(laag);
  const rijder = (cls) => {
    const g = mk("g", { class: "p-rijder " + cls }, laag);
    mk("circle", { cx: -6, cy: -3, r: 3, class: "r-wiel" }, g);
    mk("circle", { cx: 6, cy: -3, r: 3, class: "r-wiel" }, g);
    mk("path", { d: "M-6,-3 L-1,-3.5 L-2.5,-8 Z M-2.5,-8 L4,-8.5 L-1,-3.5 M4,-8.5 L6,-3 M4,-8.5 L4.6,-10.2", class: "r-kader" }, g);
    mk("path", { d: "M-2.6,-9.6 L1.8,-13.6 L4.6,-10.2 M-2.6,-9.6 L1.2,-7.2 L-1,-3.8", class: "r-lijf" }, g);
    mk("circle", { cx: 2.8, cy: -16, r: 2.2, class: "r-hoofd" }, g);
    g.style.opacity = 0;
    return g;
  };
  const jan = rijder("jan"), leyla = rijder("leyla");

  // punten langs een SVG-lijn, omgerekend naar paginacoördinaten
  function punten(el, stap) {
    const L = el.getTotalLength(), m = el.getScreenCTM(), uit = [];
    const n = Math.max(2, Math.ceil(L / (stap || 4)));
    for (let i = 0; i <= n; i++) {
      const p = el.getPointAtLength(L * i / n);
      const s = new DOMPoint(p.x, p.y).matrixTransform(m);
      uit.push([s.x + window.scrollX, s.y + window.scrollY]);
    }
    return uit;
  }
  // een sprong als boog tussen twee punten
  function boog(a, b, hoogte) {
    const uit = [], n = 60;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      uit.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 4 * hoogte * t * (1 - t)]);
    }
    return uit;
  }

  let anim = null;
  function rij(route, schaal) {
    if (route.length < 2) return;
    // laag even zo groot maken als de pagina
    const W = document.documentElement.scrollWidth, H = document.documentElement.scrollHeight;
    laag.setAttribute("width", W); laag.setAttribute("height", H); laag.setAttribute("viewBox", `0 0 ${W} ${H}`);
    // cumulatieve afstand langs de route
    const d = [0];
    for (let i = 1; i < route.length; i++) d.push(d[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
    const totaal = d[d.length - 1];
    const op = (l) => {
      l = Math.max(0, Math.min(totaal, l));
      let i = 1; while (i < d.length - 1 && d[i] < l) i++;
      const t = (l - d[i - 1]) / ((d[i] - d[i - 1]) || 1);
      const a = route[i - 1], b = route[i];
      return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, dx: b[0] - a[0], dy: b[1] - a[1] };
    };
    const zet = (g, l) => {
      const p = op(l);
      const links = p.dx < 0;
      const hoek = Math.max(-35, Math.min(35, Math.atan2(p.dy, Math.abs(p.dx) || 0.001) * 180 / Math.PI));
      g.setAttribute("transform", `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) scale(${links ? -schaal : schaal},${schaal}) rotate(${hoek.toFixed(1)})`);
      g.style.opacity = l < 0 || l > totaal ? 0 : 1;
    };
    const afstand = 13 * schaal;
    // om beurten rijdt Leyla of Jan voorop, gedeeld met Ons pad
    window.__leylaVoorop = !window.__leylaVoorop;
    const [eerste, tweede] = window.__leylaVoorop ? [leyla, jan] : [jan, leyla];
    if (anim) cancelAnimationFrame(anim);
    if (traag) { zet(eerste, totaal); zet(tweede, totaal - afstand); setTimeout(() => { jan.style.opacity = leyla.style.opacity = 0; }, 2500); return; }
    const duur = Math.min(6000, Math.max(1800, (totaal + afstand) / 0.28));   // ongeveer 280 px per seconde
    const t0 = performance.now();
    const loop = (nu) => {
      const t = Math.min(1, (nu - t0) / duur);
      const e = t < 0.15 ? (t / 0.15) * (t / 0.15) * 0.075 / 1 : t > 0.85 ? 1 - Math.pow((1 - t) / 0.15, 2) * 0.075 : 0.075 + (t - 0.15) / 0.7 * 0.85;
      const l = e * (totaal + afstand);
      zet(eerste, l); zet(tweede, l - afstand);
      if (t < 1) anim = requestAnimationFrame(loop);
      else { anim = null; setTimeout(() => { jan.style.transition = leyla.style.transition = "opacity .4s"; jan.style.opacity = leyla.style.opacity = 0; setTimeout(() => { jan.style.transition = leyla.style.transition = ""; }, 500); }, 1200); }
    };
    anim = requestAnimationFrame(loop);
  }

  // een lijn klikbaar maken met een breed, onzichtbaar tikvlak
  function klikbaar(el, actie) {
    const raak = el.cloneNode(false);
    raak.removeAttribute("class");
    raak.setAttribute("class", "raakvlak");
    el.after(raak);
    [el, raak].forEach((n) => n.addEventListener("click", actie));
  }

  // 1. trail in de bergkam bovenaan
  const heroTrail = document.querySelector(".ridge .trail");
  if (heroTrail) klikbaar(heroTrail, () => rij(punten(heroTrail), 2));
  // 2. de jump: linkerlijn, sprong, rechterlijn
  const lijnen = [...document.querySelectorAll(".ridge .far")];
  if (lijnen.length >= 2) {
    const springen = () => {
      const a = punten(lijnen[0], 6), b = punten(lijnen[1], 6);
      const start = a[a.length - 1], landing = b[0];
      rij(a.concat(boog(start, landing, Math.max(70, Math.abs(landing[0] - start[0]) * 0.18))).concat(b), 2);
    };
    lijnen.forEach((l) => klikbaar(l, springen));
  }
  // 3. trail in de footer
  const voetTrail = document.querySelector(".fb-trail");
  if (voetTrail) klikbaar(voetTrail, () => rij(punten(voetTrail), 1.8));
})();
