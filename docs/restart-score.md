# Restart Score – toteutusmuistio

Määrittely: Gettowork Restart Score – toteutusmäärittely v1.0 (28.10.2026).

## Havainnot lähdekoodista ennen muutosta

- Vite 6 + React 19 + TypeScript + Tailwind 4. Koko sivu oli yhdessä tiedostossa `src/main.tsx`; reititintä ei ollut.
- Rakennus `npm run build` (`tsc --noEmit && vite build`), Vercel tarjoaa `dist`-kansion (`vercel.json`, framework `vite`).
- Fontit: `HelveticaNowDisplay-Medium` (otsikot) ja `HelveticaNowDisplayW01-Rg` (leipäteksti), muuttujat `--font-heading` ja `--font-body`.
- Värit: pohja `#080e30` (videon liukuväri), korostus `#1480FF` (painikkeiden hover), valkoinen teksti. Painikkeet: `.pill`, `.white-pill`, `.outline-pill`.
- A.R.I.A-hahmo on taustavideo `public/getto-video.mp4`, jota hiiri (työpöytä) tai vieritys (mobiili) kelaa.
- Mobiilissa etusivun `.hero` on kiinteä ja painikkeet kahden sarakkeen ruudukossa; navigaatio on hampurilaisvalikko.
- Analytiikkaa ei ole käytössä, joten kysely ei lähetä tapahtumia.

## Ratkaisut

- Etusivu (/) on testin aloitus suomeksi: kirjoittuva kysymys, kahden sarakkeen tarkistuslista, iso "Aloita testi" ja vasemmassa alakulmassa "Tavoita minut". Testi etenee samalla sivulla: taustavideo ja hahmo pysyvät, vain sisältö vaihtuu. Jokainen vaihe on oma historiamerkintä, joten selaimen Takaisin palaa edelliseen kysymykseen.
- Yläpalkissa ei ole omaa taustaa. Valinnat: Aloita markkinointi (webshow.fi), oikealla Ota yhteyttä. Tietosivu /kysely on olemassa, mutta siihen ei ole linkkiä.
- Pisteet 0–10 ovat pyöreitä palloja yhdellä rivillä näytön halki (mobiilissa 6 + 5, alle 354 px 4 + 4 + 3). Valinta syttyy nollasta valittuun numeroon. Pallon päälle vieminen tai valinta kääntää hahmon katsetta (lookAt BackgroundVideo.tsx:ssä).
- Tulos kertoo pisteet / 120 ja yrittäjätyypin (Sammuttaja, Pyörittäjä, Rakentaja, Omistaja), kaksi kehityskohdetta ja avattavan 90 päivän ohjelman. Tulos- ja tietosivulla tausta himmenee lukemisen ajaksi.
- "En osaa vielä arvioida" poistettiin käyttäjän pyynnöstä; jokaiseen kysymykseen annetaan arvosana.
- Vanha /restart-score-osoite ohjautuu etusivulle. vercel.json ohjaa /kysely- ja /restart-score-polut index.html:ään.
- Kyselyn tiedostot: src/restart-score/ (content, engine, storage, useRestartScore, RestartScore, About, CSS). Testit: npm test.
- Laitetallennus: avain gettowork.restart-score.v1, vain käyttäjän tallennuspainikkeesta, vanhenee 120 päivää viimeisestä tallennuksesta.
