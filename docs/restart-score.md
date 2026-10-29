# Restart Score – toteutusmuistio

Määrittely: Gettowork Restart Score – toteutusmäärittely v1.0 (28.10.2026).

## Havainnot lähdekoodista ennen muutosta

- Vite 6 + React 19 + TypeScript + Tailwind 4. Koko sivu oli yhdessä tiedostossa `src/main.tsx`; reititintä ei ollut.
- Rakennus `npm run build` (`tsc --noEmit && vite build`), Vercel tarjoaa `dist`-kansion (`vercel.json`, framework `vite`).
- Fontit: `HelveticaNowDisplay-Medium` (otsikot) ja `HelveticaNowDisplayW01-Rg` (leipäteksti), muuttujat `--font-heading` ja `--font-body`.
- Värit: pohja `#080e30` (videon liukuväri), korostus `#1480FF` (painikkeiden hover), valkoinen teksti. Painikkeet: `.pill`, `.white-pill`, `.outline-pill`.
- A.R.I.A-hahmo on taustavideo (nykyään `public/getto-video-woman-2.mp4`, käännetty niin, että alku katsoo ylös ja loppu alas), jota hiiri (työpöytä) tai vieritys (mobiili) kelaa.
- Mobiilissa etusivun `.hero` on kiinteä ja painikkeet kahden sarakkeen ruudukossa; navigaatio on hampurilaisvalikko.
- Analytiikkaa ei ole käytössä, joten kysely ei lähetä tapahtumia.

## Ratkaisut

- Etusivu (/) on testin aloitus suomeksi: kirjoittuva kysymys, kahden sarakkeen tarkistuslista, iso "Aloita testi" ja vasemmassa alakulmassa "Tavoita minut". Testi etenee samalla sivulla: taustavideo ja hahmo pysyvät, vain sisältö vaihtuu. Jokainen vaihe on oma historiamerkintä, joten selaimen Takaisin palaa edelliseen kysymykseen.
- Yläpalkissa ei ole omaa taustaa. Valinnat: Aloita markkinointi (webshow.fi), oikealla Ota yhteyttä. Tietosivu /kysely on olemassa, mutta siihen ei ole linkkiä.
- Pisteet 0–10 ovat pyöreitä palloja yhdellä rivillä näytön halki (mobiilissa 6 + 5, alle 354 px 4 + 4 + 3). Valinta syttyy nollasta valittuun numeroon. Video kelautuu kursorin pystysijainnin mukaan koko näytön korkeudelta: yläreuna = alku, alareuna = loppu (BackgroundVideo.tsx); pallot eivät ohjaa sitä erikseen.
- Tulos kertoo pisteet / 120 ja yrittäjätyypin (Sammuttaja, Pyörittäjä, Rakentaja, Omistaja), kaksi kehityskohdetta ja avattavan 90 päivän ohjelman. Tulos- ja tietosivulla tausta himmenee lukemisen ajaksi.
- "En osaa vielä arvioida" poistettiin käyttäjän pyynnöstä; jokaiseen kysymykseen annetaan arvosana.
- Vanha /restart-score-osoite ohjautuu etusivulle. vercel.json ohjaa /kysely- ja /restart-score-polut index.html:ään.
- Kyselyn tiedostot: src/restart-score/ (content, engine, storage, useRestartScore, RestartScore, About, CSS). Testit: npm test.
- Laitetallennus: avain gettowork.restart-score.v1, vain käyttäjän tallennuspainikkeesta, vanhenee 120 päivää viimeisestä tallennuksesta.
- Etusivun oikeassa alakulmassa (mobiilissa ylhäällä) on Nainen / Mies -kytkin. Mies-video on public/getto-video-man-4.mp4 (H.264, avainkuva 12 framen välein kuten alkuperäinen). Video ladataan vasta, kun se valitaan, ja valinta muistetaan selaimessa (gettowork.character).
- Tulos: ensin lyhyt lataus (Tulos valmistuu…), sitten pisteet ja yrittäjätyyppi. Kehityskohteet ja 90 päivän ohjelma avautuvat yhteystietolomakkeen jälkeen (nimi ja sähköposti pakollisia, puhelin valinnainen). Lomake lähettää tiedot sivuston Vercel-funktioon api/lead.ts, joka lisää rivin Notion-tietokantaan (ympäristömuuttujat NOTION_TOKEN ja NOTION_DATABASE_ID). Tietosuojaseloste on osoitteessa /tietosuoja. Laitteelle tallennetaan vain avaushetki (leadSubmittedAt), ei yhteystietoja.

## Versio 2.0 (29.10.2026): OwnerScore-rakenne

- 12 osa-aluetta kolmessa vaiheessa (Perusta, Arki, Omistaja), kuusi väittämää kussakin, yhteensä 72. Yksi osa-alue = yksi sivu; jokaiseen väittämään vastataan seitsemällä pallolla (täysin eri mieltä … täysin samaa mieltä). Samaa mieltä oleminen tarkoittaa heikkoutta.
- Pisteytys (engine.ts): heikkouspisteet −3…+3, väittämän omalle osa-alueelle täysinä ja lisäosa-alueille kolmanneksen painolla. Osa-alueen kunto 0–100 = 100 × (M − T) / (2M). Kokonaispisteet = kuntojen summa / 10 → 0–120.
- Tasot: Itsensätyöllistäjä 0–40, Pyörittäjä 41–80, Omistaja 81–120. Vyöhykkeet: alle 40 vaatii työtä, 40–69 kehittymässä, 70+ vahvuus.
- Heikoin osa-alue määrää yrittäjätyypin (12 tyyppiä). Korjaa ensin = punaisista varhaisimman vaiheen heikoin.
- Tulossivu: tyyppi, pisteet ja taso näkyvät heti; lomakkeen jälkeen kuvaus, aloita tästä, kaikki 12 osa-aluetta palkkeina, omistajan portaat, vahvuudet ja varoitusmerkit, toiseksi heikoin ja vahvin osa-alue, polku seuraavalle tasolle ja 90 päivän ohjelma.
- Rakenne ja pisteytyslogiikka mukailevat OwnerScore-testiä; väittämät ja kaikki tekstit on kirjoitettu itse suomeksi.
- Laitetallennuksen avain vaihtui: gettowork.restart-score.v2 (v1 poistetaan).
- Notion: Pisteet = kokonaispisteet, Yrittäjätyyppi = uusi tyyppinimi (Notion luo uuden valinnan automaattisesti), Osa-alueet = "Taso: … . Hinnoittelu 45, …" (0–100).
