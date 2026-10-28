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

- Julkinen osoite on **/restart-score**. Polku valitaan `src/router.ts`:ssä ilman lisäkirjastoa. `vercel.json` ohjaa polun `index.html`:ään, joten suora avaus ja päivitys toimivat. Viten kehityspalvelin tekee saman oletuksena.
- Siirtymät etusivun ja kyselyn välillä tehdään sovelluksen sisällä (`history.pushState`), joten etusivulla käynti ei tyhjennä muistissa olevia vastauksia. Jokainen kyselyn vaihe on oma historiamerkintä; selaimen Takaisin palaa edelliseen vaiheeseen. URL ei sisällä pisteitä.
- Header ja taustavideo erotettiin omiksi komponenteiksi (`SiteHeader.tsx`, `BackgroundVideo.tsx`) ilman muutoksia etusivun toimintaan. Kyselyssä headerin alla on tumma läpikuultava pinta vieritystä varten.
- Kyselyn tiedostot ovat kansiossa `src/restart-score/`: `content.ts` (sisältö), `engine.ts` (laskenta), `storage.ts` (laitetallennus), `useRestartScore.ts` (tila), `RestartScore.tsx` (näkymät) ja `restart-score.css`.
- Laskennan testit: `npm test` (Noden oma testiajuri, ei uusia riippuvuuksia), tiedosto `tests/restart-score.test.ts`.
- Laitetallennus: avain `gettowork.restart-score.v1`, vain käyttäjän tallennuspainikkeesta, vanhenee 120 päivää viimeisestä tallennuksesta.
