// ---------------------------------------------------------------
// Zijkant: kleine lijntekeningen in de witruimte links en rechts,
// alleen op brede schermen. Ze schuiven traag mee met het scrollen
// en bewegen rustig: wielen draaien, de zon komt op en gaat onder,
// de varen wiegt, de wandelaar stapt, ...
// ---------------------------------------------------------------
(function () {
  const S = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const T = {
    fiets: `<g ${S}>
      <g class="z-draai" style="transform-origin:25px 66px"><circle cx="25" cy="66" r="15"/><path d="M25 51v30M10 66h30M14.4 55.4l21.2 21.2M14.4 76.6l21.2-21.2"/></g>
      <g class="z-draai" style="transform-origin:75px 66px"><circle cx="75" cy="66" r="15"/><path d="M75 51v30M60 66h30M64.4 55.4l21.2 21.2M64.4 76.6l21.2-21.2"/></g>
      <path d="M25 66h21l-8-24ZM46 66l20-26H38M66 40l9 26M66 40l-3-9h9M33 40h10"/></g>`,
    camionette: `<g ${S} class="z-hobbel">
      <path d="M22 72V42a6 6 0 0 1 6-6h46l16 18v18Z"/><path d="M74 38l13 15H74Z"/><rect x="32" y="45" width="14" height="9" rx="2"/><rect x="28" y="28" width="40" height="5" rx="2"/>
      <path d="M22 66h-8"/><rect x="2" y="63" width="14" height="4" rx="1"/><rect x="5.5" y="47" width="3.5" height="16" rx="1.7"/><path d="M7.2 47v-5M1 40q6.2 2 12.4 0"/><rect x="10" y="47" width="3.5" height="16" rx="1.7"/><path d="M11.7 47v-5M5.5 40q6.2 2 12.4 0"/>
      <circle cx="36" cy="73" r="7"/><circle cx="74" cy="73" r="7"/></g>`,
    varen: `<g ${S} class="z-wieg" style="transform-origin:50px 96px">
      <path d="M50 96C50 74 47 52 57 36c8-12 2-24-8-21-8 3-6 13 2 12 5-1 5-7 1-7"/>
      <path d="M50 88c-8-3-14-1-18 3M50 88c8-3 14-1 18 3M49 78c-8-4-15-2-20 2M50 78c8-4 15-2 20 2M48 68c-7-4-13-3-18 0M50 67c7-5 13-4 18-1M50 57c-6-5-11-5-15-3M52 56c6-5 11-5 15-2M54 46c-4-4-9-5-12-4M56 45c5-4 9-4 12-2"/></g>`,
    laptop: `<g ${S}>
      <rect x="22" y="28" width="56" height="36" rx="3"/><path d="M12 70h76l-6 8H18Z"/><path d="M30 38h14M30 45h22M30 52h10"/>
      <rect class="z-knipper" x="42" y="49" width="2" height="7" fill="currentColor" stroke="none"/></g>`,
    zon: `<g ${S}>
      <defs><clipPath id="z-horizon"><rect x="0" y="0" width="100" height="70"/></clipPath></defs>
      <g clip-path="url(#z-horizon)"><g class="z-zon"><circle cx="50" cy="70" r="15"/><path d="M50 47v-8M33 54l-6-6M67 54l6-6M27 70h-8M73 70h8"/></g></g>
      <path d="M8 70h84M20 78h22M56 78h26"/></g>`,
    bergen: `<g ${S}>
      <path d="M4 82l26-40 12 18 16-28 24 36 14 14Z"/><path d="M24 51l6 5 6-5M52 41l6 5 5-4"/>
      <g class="z-wapper" style="transform-origin:58px 32px"><path d="M58 32V14l12 5-12 5"/></g></g>`,
    wandelen: `<g ${S} class="z-stap">
      <circle cx="52" cy="20" r="6"/><path d="M52 27l-2 26"/><rect x="38" y="29" width="10" height="17" rx="3"/>
      <path d="M51 34l11 11 4 34"/>
      <g class="z-been1" style="transform-origin:50px 53px"><path d="M50 53l-6 25"/></g>
      <g class="z-been2" style="transform-origin:50px 53px"><path d="M50 53l7 25"/></g>
      <path d="M20 82h62" class="z-grond"/></g>`,
    proost: `<g ${S}>
      <g class="z-proost-l" style="transform-origin:40px 82px"><path d="M26 38h20l-2 44H28Z"/><path d="M26 48h-5a5 5 0 0 0 0 10h6"/><path d="M26 38q3-7 7-3q4-5 7 0q4-4 6 3"/><path d="M32 50v22M39 50v22"/></g>
      <g class="z-proost-r" style="transform-origin:60px 82px"><path d="M54 38h20l-2 44H56Z"/><path d="M74 48h5a5 5 0 0 1 0 10h-6"/><path d="M54 38q3-7 7-3q4-5 7 0q4-4 6 3"/><path d="M61 50v22M68 50v22"/></g>
      <path class="z-knipper" d="M50 28v-10M42 31l-6-7M58 31l6-7"/></g>`,
    kampvuur: `<g ${S}>
      <path d="M24 84l52-14M24 70l52 14"/>
      <g class="z-flakker" style="transform-origin:50px 76px"><path d="M50 74c-14-6-14-22-2-36 0 10 10 12 12 22 2 8-2 12-10 14Z"/><path d="M50 74c-5-3-5-9 0-14 2 4 5 6 4 10-1 3-2 4-4 4Z"/></g>
      <circle class="z-knipper" cx="38" cy="34" r="1" fill="currentColor"/><circle cx="64" cy="28" r="1" fill="currentColor"/></g>`,
    messen: `<g ${S}>
      <rect x="12" y="14" width="76" height="7" rx="2"/>
      <g class="z-zwaai" style="transform-origin:28px 21px"><rect x="25" y="21" width="6" height="16" rx="2"/><path d="M24 37h8v34q-4 10-8 2Z"/></g>
      <g class="z-zwaai" style="transform-origin:48px 21px;animation-delay:.6s"><rect x="45.5" y="21" width="5" height="13" rx="2"/><path d="M45 34h6v20q-3 6-6 2Z"/></g>
      <g class="z-zwaai" style="transform-origin:70px 21px;animation-delay:1.2s"><rect x="67" y="21" width="6" height="12" rx="2"/><path d="M61 33h18v26H61Z"/><circle cx="74" cy="38" r="2"/></g></g>`,
    specerijen: `<g ${S}>
      <path d="M18 58h52q-3 26-26 26T18 58Z"/><path d="M16 58h56"/>
      <g class="z-stamp" style="transform-origin:50px 58px"><path d="M46 56l18-30"/><circle cx="66" cy="23" r="4.5"/></g>
      <path d="M84 30l1.8 4.2 4.6.4-3.5 3 1 4.4-3.9-2.4-3.9 2.4 1-4.4-3.5-3 4.6-.4Z"/>
      <circle cx="78" cy="58" r="1.5" fill="currentColor"/><circle cx="84" cy="64" r="1.5" fill="currentColor"/><circle cx="80" cy="70" r="1.5" fill="currentColor"/></g>`,
    kimono: `<g ${S}>
      <path d="M34 16L18 22 6 44l15 7 7-12v47h44V39l7 12 15-7-12-22-16-6"/>
      <path d="M34 16q16 8 32 0"/><path d="M34 16l24 46M43 15l20 38"/><path d="M66 16L50 46"/>
      <path d="M28 59h44v8H28Z" fill="currentColor"/><path d="M45 56h10v14H45Z" fill="currentColor"/>
      <g class="z-wieg" style="transform-origin:50px 68px"><path d="M47 70l-7 17M53 70l8 16" stroke-width="4"/></g></g>`,
    ballet: `<g ${S} class="z-wieg" style="transform-origin:50px 92px">
      <circle cx="50" cy="18" r="6"/><path d="M50 24v26"/>
      <path d="M50 30c-10-6-20-6-24 2M50 30c10-6 20-6 24 2"/>
      <path d="M28 54l6-4 6 4 5-4 5 4 5-4 5 4 6-4 6 4q-22 8-44 0Z"/>
      <path d="M48 56l-2 34M52 56c6 8 14 10 20 6"/><path d="M44 90h4"/></g>`,
    groenten: `<g ${S}>
      <path d="M22 40q8-8 16 0L56 84q-3 4-7 1Z"/><path d="M28 48l6 2M33 58l6 2M39 68l6 2"/>
      <g class="z-wieg" style="transform-origin:30px 36px"><path d="M27 36l-8-12M31 34v-15M35 36l7-12"/></g>
      <circle cx="72" cy="64" r="15"/><path d="M72 49v-7"/><path d="M72 45q8-7 13-1q-6 5-13 1Z"/></g>`,
    gember: `<g ${S}>
      <path d="M16 84Q13 71 17 58Q14 45 19 34Q21 24 29 24Q37 24 38 32L50 48L62 32Q63 24 71 24Q79 24 81 34Q86 45 83 58Q87 71 84 84Q78 90 72 84Q75 71 71 58L70 48L54 68Q50 73 46 68L30 48L29 58Q25 71 28 84Q22 90 16 84Z"/>
      <path d="M17 58q6 3 12 0M19 40q6 3 12 1M71 58q6 3 12 0M70 41q6 2 12 0M36 54l8-9M64 54l-8-9M22 74q3 1 6 0M74 74q3 1 6 0"/>
      <g class="z-wieg" style="transform-origin:29px 24px"><path d="M29 24q-3-9 2-15"/><path d="M31 11q6-2 8 3q-5 3-8-3Z"/></g>
      <g class="z-wieg" style="transform-origin:71px 24px"><path d="M71 24q3-9-2-15"/><path d="M69 11q-6-2-8 3q5 3 8-3Z"/></g></g>`,
    hamsa: `<g ${S}>
      <path d="M50 88c-18 0-28-12-28-26 0-7 2-11 6-11V32a4 4 0 0 1 8 0v18V24a4 4 0 0 1 8 0v26V22a4 4 0 0 1 8 0v28V24a4 4 0 0 1 8 0v26V32a4 4 0 0 1 8 0v19c4 0 6 4 6 11 0 14-10 26-28 26Z"/>
      <path d="M38 68q12-10 24 0q-12 10-24 0Z"/><circle class="z-knipper" cx="50" cy="68" r="2.6" fill="currentColor"/></g>`,
    druiven: `<g ${S}>
      <path d="M48 30V16"/><path d="M48 22c8-10 22-6 24 2-9 4-17 4-24-2Z"/><path class="z-wieg" style="transform-origin:50px 22px" d="M50 20q9-8 4-15"/>
      <circle cx="36" cy="38" r="7"/><circle cx="50" cy="37" r="7"/><circle cx="64" cy="38" r="7"/>
      <circle cx="43" cy="51" r="7"/><circle cx="57" cy="51" r="7"/><circle cx="50" cy="64" r="7"/><circle cx="50" cy="78" r="6"/></g>`,
    hotton: `<g ${S}>
      <path d="M18 58C18 48 24 42 34 40C42 34 50 26 60 28C66 29 70 33 72 37L76 32L77 41C82 46 88 54 94 60V64C90 66 84 65 80 63C76 66 72 68 68 68L67 82H62L60 69C50 70 40 70 32 68L30 82H25V66C20 64 18 61 18 58Z"/>
      <path d="M56 70l-3 11M36 69l-3 11"/>
      <path d="M40 37l-3-5M46 32l-2-6M52 29l-1-6M58 28l0-6M64 29l2-5"/>
      <circle cx="78" cy="48" r="1.8" fill="currentColor"/><path d="M84 64q6-1 5-9"/><path d="M94 60v4"/>
      <g class="z-wieg" style="transform-origin:18px 56px"><path d="M18 56q-5 1-7-3M11 53l-2-3M11 53l-3 1"/></g></g>`,
    borncrazy: `<g ${S}>
      <circle cx="50" cy="50" r="44"/>
      <g class="z-wheelie" style="transform-origin:61px 46px">
        <g class="z-draai" style="transform-origin:61px 46px"><circle cx="61" cy="46" r="7.7"/><path d="M61 38.3v15.4M53.3 46h15.4"/></g>
        <g class="z-draai" style="transform-origin:37px 29.2px"><circle cx="37" cy="29.2" r="7.7"/><path d="M37 21.5v15.5M29.3 29.2h15.5"/></g>
        <path d="M61 46L50.4 41.7 62.8 31.5ZM62.8 31.5L48.2 22.3 37 29.2M48.2 22.3l1.2-5.4 2.4 1.7M47.1 40.4l6.6 2.6"/>
        <path d="M47.1 40.4l3.8-9.9 12.8 2.7-3.3-14.9-6.6-2.5-3.8 1M60.4 18.3l-.7-2.7" stroke-width="3"/>
        <path d="M54.8 11.2a4 4 0 1 1 5.7 4.1" stroke-width="3"/><path d="M54.8 11.2h-3.9M60.5 15.3a4 4 0 0 1-5.7-4.1"/>
      </g>
      <path class="z-knipper" d="M72 34h9M74 42h11M73 50h8"/>
      <path d="M26.5 57v11M26.5 57h5.2a3.3 2.8 0 0 1 0 5.5h-5.2M31.7 62.5a3.3 2.8 0 0 1 0 5.5h-5.2M42.3 57h2.9a3.3 2.8 0 0 1 3.3 2.8v5.5a3.3 2.8 0 0 1-3.3 2.7h-2.9a3.3 2.8 0 0 1-3.3-2.7v-5.5a3.3 2.8 0 0 1 3.3-2.8ZM51.5 68V57h5.2a3.3 2.8 0 0 1 0 5.5h-5.2M55.8 62.5l5.2 5.5M64 68V57l9.5 11V57" stroke-width="3.4"/>
      <path d="M33.3 74.4c-1.2-2.4-8.2-3.6-8.2 3.1s7 5.5 8.2 3.1M35.5 83V72H40a2.9 2.8 0 0 1 0 5.5h-4.5M39.2 77.5l4.5 5.5M45.9 83l4.1-11 4.1 11M47.5 78.7h5M56.3 72h8.2l-8.2 11h8.2M66.7 72l4.1 5.1 4.1-5.1M70.8 77.1V83" stroke-width="3.4"/></g>`,
    hantilopen: `<g ${S}>
      <path d="M12 60a38 38 0 0 1 76 0"/><path d="M14 50l-6-2M20 36l-5-4M31 25l-3-6M44 21l-1-6M56 21l1-6M69 25l3-6M80 36l5-4M86 50l6-2"/>
      <path d="M50 86c-7 0-11-7-11-15 0-11 4-21 11-25 7 4 11 14 11 25 0 8-4 15-11 15Z"/>
      <path d="M40 54l-16-7 13 14M60 54l16-7-13 14"/>
      <path d="M45 47c-4-11-14-16-22-14M55 47c4-11 14-16 22-14M20 31l7 4M80 31l-7 4"/>
      <path d="M46 78h8M44 62v.1M56 62v.1"/></g>`,
    sterren: `<g ${S}>
      <path d="M22 46l40-20 6 12-40 20Z"/><path d="M62 26l4-2 6 12-4 2"/><path d="M18 48l4-2 6 12-4 2Z"/>
      <path d="M46 46l-14 40M46 46l2 40M46 46l16 38"/>
      <circle cx="78" cy="68" r="7"/><path d="M66 72q12-10 24-8"/>
      <path class="z-knipper" d="M20 18l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6Z"/>
      <path class="z-knipper" style="animation-delay:.8s" d="M84 14l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2Z"/>
      <circle class="z-knipper" style="animation-delay:1.6s" cx="40" cy="14" r="1.6" fill="currentColor"/></g>`,
    architectuur: `<g ${S}>
      <path d="M12 86h76"/><path d="M18 86V54l26-18 26 18v32"/><path d="M30 86V66h12v20M52 62h10v10H52Z"/>
      <g class="z-wieg" style="transform-origin:70px 14px"><circle cx="70" cy="14" r="3.5"/><path d="M68 17L56 46M72 17l12 29"/><path d="M84 46l1 4"/><path d="M61 34q9 5 18 0"/></g>
      <path d="M76 86l14-20v20" /></g>`,
    sailing: `<g ${S}>
      <circle cx="50" cy="52" r="38"/><path d="M14 64L32 30l8 12 12-28 18 34 14 10"/>
      <g class="z-hobbel"><path d="M52 34v38M52 34L36 70h16Z"/><path d="M32 74h40l-6 8H38Z"/></g>
      <path d="M22 86q6-3 12 0t12 0 12 0 12 0"/></g>`,
    dromen: `<g ${S}>
      <circle cx="50" cy="52" r="38"/><path d="M16 72l18-22 8 7 14-24 28 39"/>
      <g class="z-zon2" style="transform-origin:72px 40px"><path d="M66 40a6 6 0 0 1 12 0"/><path d="M72 30v-5M80 33l4-4M83 40h5M64 33l-4-4"/></g>
      <path d="M30 32l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1Z"/></g>`
  };
  const links = ["fiets", "proost", "kimono", "sterren", "gember", "sailing", "varen", "druiven", "hamsa", "dromen", "laptop"];
  const rechts = ["camionette", "messen", "architectuur", "ballet", "bergen", "borncrazy", "specerijen", "hantilopen", "groenten", "hotton", "kampvuur", "wandelen", "zon"];
  const traag = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const banden = [];
  [["links", links], ["rechts", rechts]].forEach(([kant, lijst]) => {
    const band = document.createElement("div");
    band.className = "zijkant " + kant;
    band.setAttribute("aria-hidden", "true");
    const kolom = document.createElement("div");
    kolom.className = "z-kolom";
    // twee keer dezelfde reeks, zodat het naadloos doorloopt
    for (let herhaal = 0; herhaal < 2; herhaal++) {
      lijst.forEach((naam, i) => {
        const fig = document.createElement("div");
        fig.className = "z-fig " + (i % 2 ? "z-r" : "z-l");
        fig.innerHTML = `<svg viewBox="0 0 100 100">${T[naam]}</svg>`;
        kolom.appendChild(fig);
      });
    }
    band.appendChild(kolom);
    document.body.appendChild(band);
    const b = { band, kolom, factor: kant === "links" ? 0.22 : 0.3, eigen: 0, doel: 0 };
    banden.push(b);
    // zelf door de tekeningen scrollen: met het muiswiel of door te slepen
    band.addEventListener("wheel", (e) => {
      e.preventDefault();                       // alleen de zijkant schuift, de pagina blijft staan
      b.doel += e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      start();
    }, { passive: false });
    let sleep = null;
    band.addEventListener("pointerdown", (e) => {
      sleep = { y: e.clientY, doel: b.doel };
      band.setPointerCapture(e.pointerId); band.classList.add("sleept");
    });
    band.addEventListener("pointermove", (e) => {
      if (!sleep) return;
      b.doel = sleep.doel - (e.clientY - sleep.y);
      if (traag) b.eigen = b.doel;
      start();
    });
    const los = () => { sleep = null; band.classList.remove("sleept"); };
    band.addEventListener("pointerup", los); band.addEventListener("pointercancel", los);
  });
  // traag meeschuiven met het scrollen (een beetje diepte), plus wat je zelf scrolde
  let wacht = false, loopt = false;
  const schuif = () => {
    wacht = false;
    banden.forEach(({ kolom, factor, eigen }) => {
      const helft = kolom.scrollHeight / 2;
      const y = (((traag ? 0 : window.scrollY * factor) + eigen) % helft + helft) % helft;   // altijd naadloos rond
      kolom.style.transform = `translateY(${-y.toFixed(1)}px)`;
    });
  };
  // zelf scrollen loopt zacht uit
  function start() {
    if (loopt) return; loopt = true;
    const stap = () => {
      let bezig = false;
      banden.forEach((b) => {
        if (traag) { b.eigen = b.doel; return; }
        b.eigen += (b.doel - b.eigen) * 0.18;
        if (Math.abs(b.doel - b.eigen) > 0.3) bezig = true; else b.eigen = b.doel;
      });
      schuif();
      if (bezig) requestAnimationFrame(stap); else loopt = false;
    };
    requestAnimationFrame(stap);
  }
  window.addEventListener("scroll", () => { if (!wacht) { wacht = true; requestAnimationFrame(schuif); } }, { passive: true });
  schuif();
})();
