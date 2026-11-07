// rsvp.js · versie 7nov-10 (gekoppeld aan Google Form, contactkaartjes, slapen, antwoord bekijken en aanpassen)
// ---------------------------------------------------------------
// Inschrijvingen gaan naar jullie Google Form (en dus de sheet).
// FORM_ACTION = het adres waar antwoorden naartoe gaan ("viewform" vervangen
// door "formResponse"). FIELDS = het nummer van elke vraag in de Google Form.
// ---------------------------------------------------------------
const FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSeB-BgEY0m1j57Vzq853xD_e8b_0ZYwTgTNgeYO-UNktKqJIA/formResponse";
const FIELDS = {
  naam: "entry.328509129",
  komt: "entry.1010029386",
  volwassenen: "entry.1407839934",
  kinderen: "entry.831943697",
  dieet: "entry.393772376",
  slapen: "entry.747051466",
  bericht: "entry.968310925",
  soort: "entry.1139462462"   // "nieuw" of "aanpassing"
};

// Contactkaartjes: nummer pas hier samenstellen (minder spam van bots)
document.querySelectorAll(".contact-card").forEach((card) => {
  const d = (card.dataset.nr || "").split("|");
  if (d.length < 5) return;
  const intl = d.join("");                                  // 32497852938
  const mooi = "+" + d[0] + " " + d.slice(1).join(" ");    // +32 497 85 29 38
  card.innerHTML =
    '<span class="c-naam"></span><span class="c-nr"></span>' +
    '<span class="c-links"><a class="wa" target="_blank" rel="noopener">WhatsApp</a><a class="alt tel">Bellen</a></span>';
  card.querySelector(".c-naam").textContent = card.dataset.naam;
  card.querySelector(".c-nr").textContent = mooi;
  card.querySelector(".wa").href = "https://wa.me/" + intl;
  card.querySelector(".tel").href = "tel:+" + intl;
});

// Aftellen naar het feest
(function () {
  const el = document.getElementById("countdown");
  if (!el) return;
  const feest = new Date("2027-07-02T00:00:00+02:00");
  const dagen = Math.ceil((feest - new Date()) / 86400000);
  if (dagen > 1) el.textContent = "vrijdag 2 juli 2027 · nog " + dagen + " dagen";
  else if (dagen === 1) el.textContent = "morgen is het zover!";
  else if (dagen === 0) el.textContent = "vandaag is het feest!";
})();

// Inschrijvingsformulier
(function () {
  const form = document.getElementById("rsvp");
  const status = document.getElementById("rsvp-status");
  const kaart = document.getElementById("mijn-antwoord");
  if (!form) return;
  const SLEUTEL = "leyenjan-antwoord";
  const VELDEN = ["naam", "komt", "volwassenen", "kinderen", "dieet", "slapen", "bericht"];
  const LABELS = { naam: "Naam", komt: "Komen jullie?", volwassenen: "Volwassenen", kinderen: "Kinderen", dieet: "Dieetwensen", slapen: "Blijven slapen", bericht: "Berichtje" };

  // kopie in de eigen browser (kan ontbreken of geblokkeerd zijn: dan gewoon zonder)
  const lees = () => { try { return JSON.parse(localStorage.getItem(SLEUTEL) || "null"); } catch (e) { return null; } };
  const bewaar = (v) => { try { localStorage.setItem(SLEUTEL, JSON.stringify(v)); } catch (e) {} };

  function toonAntwoord(a) {
    if (!kaart || !a) return;
    const lijst = document.getElementById("ma-lijst");
    lijst.innerHTML = "";
    VELDEN.forEach((k) => {
      const v = a.waarden[k];
      if (v === undefined || v === "") return;
      const dt = document.createElement("dt"); dt.textContent = LABELS[k];
      const dd = document.createElement("dd"); dd.textContent = v;
      lijst.append(dt, dd);
    });
    document.getElementById("ma-datum").textContent = new Date(a.wanneer).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" });
    kaart.hidden = false;
    form.hidden = true;
  }
  function vulIn(a) {
    VELDEN.forEach((k) => {
      const v = a.waarden[k];
      const els = form.elements[k];
      if (!els || v === undefined) return;
      if (els.length && els[0] && els[0].type === "radio") [...els].forEach((r) => (r.checked = r.value === v));
      else els.value = v;
    });
  }
  const eerder = lees();
  if (eerder) toonAntwoord(eerder);
  const knop = document.getElementById("ma-aanpassen");
  if (knop) knop.addEventListener("click", () => {
    const a = lees(); if (a) vulIn(a);
    kaart.hidden = true; form.hidden = false;
    form.querySelector("button[type=submit]").textContent = "Aanpassing versturen";
    form.elements.naam.focus();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "status";
    const data = new FormData(form);
    if (data.get("website")) return;                   // onzichtbaar veld: alleen bots vullen dit in

    if (!data.get("naam") || !String(data.get("naam")).trim()) {
      return fout("Vul je naam in, dan weten we wie er komt.");
    }
    if (!data.get("komt")) {
      return fout("Kies of je erbij bent.");
    }
    if (!FORM_ACTION) {
      return fout("Inschrijven kan binnenkort. Stuur ons intussen een berichtje.");
    }

    const waarden = {};
    VELDEN.forEach((k) => (waarden[k] = String(data.get(k) || "").trim()));
    const soort = lees() ? "aanpassing" : "nieuw";
    const body = new URLSearchParams();
    for (const [key, entry] of Object.entries(FIELDS)) {
      if (!entry) continue;
      body.append(entry, key === "soort" ? soort : (waarden[key] || ""));
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = "Even versturen…";
    try {
      await fetch(FORM_ACTION, { method: "POST", mode: "no-cors", body });
      const a = { wanneer: Date.now(), waarden };
      bewaar(a);
      form.reset();
      toonAntwoord(a);
      status.textContent = "";
      let bedankt = kaart.querySelector(".bedankt");          // maar één bedankje tonen
      if (!bedankt) { bedankt = document.createElement("p"); bedankt.className = "status bedankt"; kaart.prepend(bedankt); }
      bedankt.textContent = waarden.komt === "Nee" ? "Jammer! Bedankt om het te laten weten." : "Top, we hebben je antwoord. Tot 2 juli!";
    } catch (err) {
      fout("Versturen lukte niet. Probeer opnieuw of stuur ons een berichtje.");
    } finally {
      btn.disabled = false;
    }
  });

  function fout(msg) {
    status.textContent = msg;
    status.className = "status fout";
  }
})();
