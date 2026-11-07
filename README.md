# leyenjan.be

Website voor het stalen huwelijk van Leyla & Jan, vrijdag 2 juli 2027.

## Wat staat waar
- `index.html`: alle teksten, in het Nederlands, met de Franse versie erbij in `data-fr="…"`
- `style.css`: de huisstijl (staal, bergkammen, plaatjes, animaties)
- `taal.js`: de taalkeuze NL/FR (onthouden in de browser; `?lang=fr` in de link opent in het Frans)
- `pad.js`: Ons pad, het hoogteprofiel met de voertuigen en de trails
- `rijders.js`: Leyla en Jan die de trails en de jump bovenaan afrijden
- `zijkant.js`: de lijntekeningen in de witruimte op brede schermen
- `rsvp.js`: het inschrijvingsformulier, gekoppeld aan de Google Form, en de contactkaartjes
- `assets/`: staaltextuur, deelbeeld voor WhatsApp, favicon

## Een tekst aanpassen
Pas de Nederlandse tekst aan, en ook de Franse in `data-fr="…"` op dezelfde regel.

## Een nieuwsbericht toevoegen
Zoek in `index.html` naar `NIEUWS` en zet een nieuw `<article>` bovenaan de lijst, met `data-fr` voor de Franse tekst.

## Na een wijziging aan css of js
Verhoog het versienummer achter de bestanden onderaan in `index.html` (bv. `?v=7nov-14` → `?v=8nov-1`), zodat browsers de nieuwe versie ophalen.

## Belangrijk
Deze repo is publiek. Zet hier nooit adressen of gegevens van gasten in.
