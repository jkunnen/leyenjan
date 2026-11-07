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
    keuken: `<g ${S} class="z-wiebel" style="transform-origin:50px 55px">
      <path d="M18 84l44-44c6-6 14-2 12 5L32 88Z"/><path d="M18 84l-8 8"/><circle cx="25" cy="82" r=".8"/>
      <ellipse cx="74" cy="76" rx="7" ry="11" transform="rotate(-45 74 76)"/><path d="M68 70L30 30"/>
      <path d="M78 20v22M74 20c0 8 8 8 8 0M76 20v6M80 20v6"/></g>`,
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
    vrienden: `<g ${S}>
      <circle cx="28" cy="44" r="7"/><circle cx="50" cy="38" r="7.5"/><circle cx="72" cy="44" r="7"/>
      <path d="M16 82c0-14 5-24 12-24s12 10 12 24M38 82c0-17 5-28 12-28s12 11 12 28M60 82c0-14 5-24 12-24s12 10 12 24M33 64l10-4M57 60l10 4"/>
      <path class="z-hart" style="transform-origin:50px 18px" d="M50 24c-6-5-10-8-10-12a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 4-4 7-10 12Z"/></g>`
  };
  const links = ["fiets", "varen", "laptop", "zon", "vrienden"];
  const rechts = ["camionette", "keuken", "bergen", "wandelen", "varen"];
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
    banden.push({ kolom, factor: kant === "links" ? 0.22 : 0.3 });
  });
  if (traag) return;
  // traag meeschuiven met het scrollen (een beetje diepte)
  let wacht = false;
  const schuif = () => {
    wacht = false;
    banden.forEach(({ kolom, factor }) => {
      const helft = kolom.scrollHeight / 2;
      const y = (window.scrollY * factor) % helft;
      kolom.style.transform = `translateY(${-y.toFixed(1)}px)`;
    });
  };
  window.addEventListener("scroll", () => { if (!wacht) { wacht = true; requestAnimationFrame(schuif); } }, { passive: true });
  schuif();
})();
