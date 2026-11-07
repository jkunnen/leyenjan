// rsvp.js · versie 7nov-5 (met contactkaartjes)
// ---------------------------------------------------------------
// Inschrijvingen gaan naar jullie Google Form (en dus de sheet).
// Vul hieronder de link en de veldnummers in zodra het formulier
// bestaat. Zolang FORM_ACTION leeg is, toont de site enkel een
// melding en wordt er niets verstuurd.
// ---------------------------------------------------------------
const FORM_ACTION = ""; // bv. "https://docs.google.com/forms/d/e/XXXX/formResponse"
const FIELDS = {
  naam: "",        // bv. "entry.123456789"
  komt: "",
  volwassenen: "",
  kinderen: "",
  dieet: "",
  camionette: "",
  bericht: ""
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
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "status";
    const data = new FormData(form);

    if (!data.get("naam") || !String(data.get("naam")).trim()) {
      return fout("Vul je naam in, dan weten we wie er komt.");
    }
    if (!data.get("komt")) {
      return fout("Kies of je erbij bent.");
    }
    if (!FORM_ACTION) {
      return fout("Inschrijven kan binnenkort. Stuur ons intussen een berichtje.");
    }

    const body = new URLSearchParams();
    for (const [key, entry] of Object.entries(FIELDS)) {
      if (entry) body.append(entry, data.get(key) || "");
    }

    const btn = form.querySelector("button");
    btn.disabled = true;
    status.textContent = "Even versturen…";
    try {
      await fetch(FORM_ACTION, { method: "POST", mode: "no-cors", body });
      form.reset();
      status.textContent = data.get("komt") === "Nee"
        ? "Jammer! Bedankt om het te laten weten."
        : "Top, we hebben je antwoord. Tot 2 juli!";
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
