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
