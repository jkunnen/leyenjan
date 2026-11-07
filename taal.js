// ---------------------------------------------------------------
// Taal: Nederlands of Frans.
// - Elke tekst in index.html heeft zijn Franse versie in data-fr="…"
//   (en attributen in data-fr-placeholder, data-fr-aria-label).
// - De keuze wordt onthouden in de browser. Een link met ?lang=fr
//   (of ?lang=nl) opent meteen in die taal: handig om door te sturen.
// - Andere scripts gebruiken window.T("Nederlands", "Français") en
//   luisteren naar het event "taalwissel" om hun teksten bij te werken.
// ---------------------------------------------------------------
(function () {
  const SLEUTEL = "leyenjan-taal";
  const ATTR = ["placeholder", "aria-label"];
  const lees = () => { try { return localStorage.getItem(SLEUTEL); } catch (e) { return null; } };
  const bewaar = (t) => { try { localStorage.setItem(SLEUTEL, t); } catch (e) {} };

  // welke taal? 1. ?lang= in de link, 2. eerdere keuze, 3. taal van de browser
  const uitLink = new URLSearchParams(location.search).get("lang");
  let taal = ["nl", "fr"].includes(uitLink) ? uitLink
    : ["nl", "fr"].includes(lees()) ? lees()
    : (navigator.language || "nl").toLowerCase().startsWith("fr") ? "fr" : "nl";

  window.taalNu = () => taal;
  window.T = (nl, fr) => (taal === "fr" ? fr : nl);

  function pasToe() {
    document.documentElement.lang = taal;
    document.querySelectorAll("[data-fr]").forEach((el) => {
      if (el.dataset.nl === undefined) el.dataset.nl = el.innerHTML;   // Nederlands één keer bewaren
      el.innerHTML = taal === "fr" ? el.dataset.fr : el.dataset.nl;
    });
    ATTR.forEach((a) => {
      document.querySelectorAll(`[data-fr-${a}]`).forEach((el) => {
        const sleutel = "nl" + a.replace(/-./g, (m) => m[1].toUpperCase()).replace(/^./, (m) => m.toUpperCase());
        if (el.dataset[sleutel] === undefined) el.dataset[sleutel] = el.getAttribute(a) || "";
        el.setAttribute(a, taal === "fr" ? el.getAttribute(`data-fr-${a}`) : el.dataset[sleutel]);
      });
    });
    document.querySelectorAll("[data-taal]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.taal === taal)));
  }

  window.zetTaal = (nieuw) => {
    if (nieuw === taal || !["nl", "fr"].includes(nieuw)) return;
    taal = nieuw;
    bewaar(taal);
    pasToe();
    window.dispatchEvent(new CustomEvent("taalwissel", { detail: taal }));
  };

  document.querySelectorAll("[data-taal]").forEach((b) => b.addEventListener("click", () => window.zetTaal(b.dataset.taal)));
  pasToe();
})();
