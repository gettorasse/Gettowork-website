// Kirjoittaa jokaiselle osoitteelle oman HTML-tiedoston, jossa on sivun teksti valmiina sekä oma
// otsikko ja kuvaus. Näin sivun voivat lukea myös lukijat, jotka eivät aja JavaScriptiä
// (ChatGPT, hakukoneet, linkkien esikatselut). React korvaa tekstiversion heti latautuessaan,
// joten kävijän näkymä ei muutu.
//
// Ajetaan rakennusvaiheessa `vite build` -komennon jälkeen (package.json: build).
// HUOM: kun sivujen tekstit muuttuvat, päivitä ne myös tänne.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://gettowork.fi';
// Yhteyssähköposti luetaan samasta paikasta kuin sovellus käyttää (content.ts), ettei sitä tarvitse toistaa.
const contentSrc = readFileSync(new URL('../src/restart-score/content.ts', import.meta.url), 'utf8');
const EMAIL = (contentSrc.match(/CONTACT_EMAIL\s*=\s*'([^']+)'/) || [])[1];
if (!EMAIL) throw new Error('static-pages: CONTACT_EMAIL puuttuu content.ts:stä');
const dist = new URL('../dist/', import.meta.url);
const template = readFileSync(new URL('index.html', dist), 'utf8');

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const list = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const nav = `<nav aria-label="Sivut"><ul>
<li><a href="/">Yrittäjätesti</a></li>
<li><a href="/tietoa">Tietoa yrityksestä</a></li>
<li><a href="/kysely">Tietoa testistä</a></li>
<li><a href="/tietosuoja">Tietosuojaseloste</a></li>
</ul></nav>`;
const footer = `<footer><p>© 2026 Gettowork Oy · Y-tunnus 3196576-1 · Espoo, Suomi</p>
<p>Yhteystiedot: <a href="mailto:${EMAIL}">${EMAIL}</a> · <a href="tel:+358442361914">044 236 1914</a></p></footer>`;

const PAGES = [
  {
    path: '/',
    title: 'Yrittäjätesti: Pyöritätkö sinä yritystä vai pyörittääkö se sinua? · Get to Work',
    description: 'Pyöritätkö sinä yritystä, vai pyörittääkö se sinua? Testaa, minkälainen yrittäjä sinä olet. Yrittäjätesti vie noin 10 minuuttia: löydät syyt ja näet, mitä sinun kannattaa parantaa ja mihin keskittyä.',
    body: `<h1>Pyöritätkö sinä yritystä, vai pyörittääkö se sinua?</h1>
<p>Testaa, minkälainen yrittäjä sinä olet. Löydät syyt, miksi kiire ei lopu, ja näet, mitä sinun kannattaa parantaa ja mihin keskittyä.</p>
${list(['Miksi kiire ei lopu?', 'Onko hinnoittelu kohdallaan?', 'Mistä seuraavat asiakkaat?', 'Mihin aikani oikeasti menee?'])}
<p>Yrittäjätestissä on 72 lyhyttä väittämää 12 osa-alueelta. Testi vie noin 10 minuuttia, ja tuloksen näet heti: pisteet, tasosi ja yrittäjätyyppisi. <a href="/kysely">Lue lisää testistä</a>.</p>
<p>Get to Work tekee työn tekemisestä helpompaa. <a href="/tietoa">Tietoa yrityksestä</a>.</p>`,
  },
  {
    path: '/tietoa',
    title: 'Tietoa yrityksestä · Get to Work',
    description: 'Get to Work yhdistää työt ja tekijät. Kerro, mitä pitäisi saada tehtyä, niin yhdistämme sinut oikeisiin tekijöihin henkilöstöpalveluista, kumppaneilta ja työpaikoilta. Prompt to done.',
    body: `<p>Get to Work / Työt ja tekijät yhteen</p>
<h1>Mitä pitäisi saada tehtyä?</h1>
<p>Kerro tarve. Get to Work löytää tekijät, sopii aikataulun ja hinnan, ja työ tehdään.</p>
<p><a href="mailto:${EMAIL}?subject=Ty%C3%B6tilaus">Kerro, mitä tarvitset</a></p>

<h2>Työtä on. Tekijöitä on. Ne eivät vain löydä toisiaan.</h2>
<p>Yrityksillä on jatkuvasti töitä, joihin omat kädet eivät riitä. Samaan aikaan osaamista on käyttämättä: henkilöstöpalveluissa keikkojen välissä ja työpaikoilla, joissa kaikkea työaikaa ei tarvita. Get to Work tuo nämä yhteen.</p>

<h2>Yksi alusta. Kaikki tarvittavat tekijät.</h2>
<p>Get to Work yhdistää yrityksesi tarpeen oikeaan toteuttajaan. Sinun ei tarvitse tietää, tarvitsetko vuokratyöntekijän, alihankkijan vai tiimin.</p>
<ul>
<li><strong>Henkilöstöpalvelut.</strong> Vuokratyöntekijät kumppanimme kautta, muutamasta tunnista kuukausiin.</li>
<li><strong>Erikoistuneet kumppanit.</strong> Yritykset, jotka hoitavat oman alansa työt alusta loppuun.</li>
<li><strong>Jaettu osaaminen.</strong> Työpaikkojen osaajat, joiden työaikaa on vapaana.</li>
</ul>
<p>Esimerkkejä töistä: varasto ja logistiikka, tapahtumat, toimitilat ja muutot, myymälät, siivous ja ylläpito, kiinteistöt.</p>

<h2>Prompt. Plan. Done.</h2>
<ol>
<li><strong>Prompt: kerro, mitä tarvitset.</strong> Kuvaile työ, tehtävä tai tilanne viestillä, sähköpostilla tai puhelimessa.</li>
<li><strong>Plan: saat ehdotuksen.</strong> Työn kuvaus, tekijät, aikataulu ja hinta ennen aloitusta.</li>
<li><strong>Done: työ tehdään.</strong> Hyväksyt ehdotuksen, ja me järjestämme loput. Sinulla on koko ajan yksi yhteyspiste.</li>
</ol>
<p>Perinteinen henkilöstöpalvelu kysyy, millaisen työntekijän tarvitset. Get to Work kysyy, mitä pitäisi saada tehtyä.</p>

<h2>Enemmän työtä. Vähemmän tyhjäkäyntiä.</h2>
<p>Henkilöstöyritys saa lisää keikkoja, erikoistunut yritys uusia asiakkaita, työpaikka tuloa vapaasta työajasta, ja tekijä lisää työtä ilman työpaikan vaihtoa. Käytännön töiden lisäksi etsimme myös myynnin ja projektien osaajia vaativampiin tehtäviin. <a href="mailto:${EMAIL}?subject=Kumppaniksi">Liity kumppaniksi</a></p>

<h2>Selvät vastuut. Ihminen päättää.</h2>
<p>Tekijän työnantaja on aina hänen oma työnantajansa tai henkilöstöpalvelu, ja vastuut sovitaan ennen aloitusta. Kumppaneilla on tehtävään sopiva osaaminen sekä tarvittavat luvat ja vakuutukset. Teknologia auttaa löytämään oikeat tekijät, mutta valinnan tekee aina ihminen.</p>

<h2>Maailma, jossa asiat saadaan tehtyä.</h2>
<p><strong>Missio:</strong> Tehdä työn ostamisesta, järjestämisestä ja tekemisestä helpompaa.</p>
<p><strong>Visio:</strong> Yritysten tarpeet ja ihmisten osaaminen löytävät toisensa yhdellä viestillä.</p>
<p>Osaamisen jakaminen on aina työntekijälle vapaaehtoista ja perustuu selkeisiin sopimuksiin.</p>

<h2>Mitä pitäisi saada tehtyä?</h2>
<p>Kerro, millaista apua yrityksesi tarvitsee. Me yhdistämme sinut oikeisiin tekijöihin.</p>
<p><a href="mailto:${EMAIL}?subject=Ty%C3%B6tilaus">Kerro, mitä tarvitset</a> · <a href="mailto:${EMAIL}?subject=Kumppaniksi">Liity kumppaniksi</a></p>
<p>Prompt to done.</p>`,
  },
  {
    path: '/kysely',
    title: 'Tietoa testistä · Get to Work',
    description: 'Yrittäjätesti: voisiko ongelmat johtua sinusta? Löydä syyt ja se, mihin keskittyä. 12 osa-aluetta, 72 väittämää, noin 10 minuuttia. Kolme tasoa: Itsensätyöllistäjä, Pyörittäjä ja Omistaja.',
    body: `<p>Yrittäjätesti</p>
<h1>Minkälainen yrittäjä olet?</h1>
<p>72 lyhyttä väittämää yrityksesi arjesta. Saat pisteet, tasosi, yrittäjätyyppisi ja tiedon siitä, mistä kannattaa aloittaa.</p>
<p>12 osa-aluetta · 72 väittämää · noin 10 minuuttia · tulos heti</p>
<h2>Kolme tasoa</h2>
${list(['0–40 Itsensätyöllistäjä: Yritys omistaa sinut.', '41–80 Pyörittäjä: Pyörität kovaa, mutta kaikki kulkee sinun kauttasi.', '81–120 Omistaja: Johdat yritystä etkä vain tee töitä siinä.'])}
<h2>Mitä testi mittaa</h2>
<h3>Perusta: Kuka olet ja kenelle teet töitä.</h3>
${list(['Hinnoittelu (Mukava tyyppi)', 'Oikeat asiakkaat (Kaikkien kauppa)', 'Asiakkaan ongelma (Taiteilija)', 'Tarjonta ja toimitus (Keräilijä)'])}
<h3>Arki: Miten yritys oikeasti pyörii.</h3>
${list(['Kannattavuus (Uhrautuja)', 'Myynti (Myyntitykki)', 'Ihmiset ja vastuut (Yksinpelaaja)', 'Markkinointi (Piilohelmi)', 'Prosessit (Työjuhta)'])}
<h3>Omistaja: Mitä sinulle jää ja mitä se sinulle maksaa.</h3>
${list(['Riskit ja ennakointi (Toiveikas)', 'Suunta (Haaveilija)', 'Oma aika ja jaksaminen (Kiinni kasvanut)'])}
<h2>Näin vastaat</h2>
<p>Jokaisessa osassa on kuusi väittämää. Kerro, kuinka hyvin väittämä pitää paikkansa juuri nyt – ei sen mukaan, miten haluaisit asioiden olevan. Mitä enemmän olet samaa mieltä, sitä enemmän osa-alueessa on korjattavaa.</p>
<p>Heikoin osa-alueesi kertoo yrittäjätyyppisi. Raportti näyttää kaikki 12 osa-aluetta, tasosi ja 90 päivän ohjelman.</p>
<h2>Tulos ja yhteystiedot</h2>
<p>Pisteet, tason ja yrittäjätyypin näet heti. Koko raportin saat, kun jätät nimesi ja sähköpostisi. Tulos on itsearvio ja keskustelun lähtökohta, ei mitattu diagnoosi.</p>
<p><a href="/">Aloita testi</a></p>`,
  },
  {
    path: '/tietosuoja',
    title: 'Tietosuojaseloste · Get to Work',
    description: 'Näin Get to Work käsittelee tietoja, jotka jätät yrittäjätestin yhteydessä.',
    body: `<p>Päivitetty 28.10.2026</p>
<h1>Tietosuojaseloste</h1>
<p>Näin käsittelemme tietoja, jotka jätät yrittäjätestin yhteydessä.</p>
<h2>Rekisterinpitäjä</h2>
<p>Get to Work, Rasmus Rautavirta. Yhteydenotot: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
<h2>Mitä tietoja keräämme</h2>
<p>Kun avaat raporttisi lomakkeella, tallennamme nimesi, sähköpostiosoitteesi, puhelinnumerosi (jos annat sen) sekä testin tuloksen: kokonaispisteet, osa-alueiden pisteet, yrittäjätyypin, kehityskohteet ja testin valmistumisajan. Testin vastaukset käsitellään selaimessasi. Niitä ei lähetetä meille ennen kuin lähetät lomakkeen.</p>
<h2>Mihin tietoja käytetään</h2>
<p>Käytämme tietoja ollaksemme sinuun yhteydessä tuloksesi tiimoilta ja kertoaksemme palveluista, joista voisi olla sinulle apua. Käsittely perustuu suostumukseesi, jonka annat lähettämällä lomakkeen. Voit perua suostumuksen milloin tahansa ilmoittamalla siitä sähköpostilla.</p>
<h2>Säilytys ja käsittelijät</h2>
<p>Säilytämme tietoja niin kauan kuin niitä tarvitaan yhteydenpitoon, kuitenkin enintään 24 kuukautta viimeisestä yhteydenotosta, tai kunnes pyydät poistamaan ne. Tiedot tallennetaan Notioniin (Notion Labs, Inc.), ja sivusto toimii Vercelin (Vercel Inc.) palveluissa. Palveluntarjoajat voivat käsitellä tietoja myös EU:n ja ETA:n ulkopuolella. Tällöin siirrot perustuvat EU:n komission vakiosopimuslausekkeisiin tai EU–Yhdysvallat-tietosuojakehykseen. Emme myy emmekä luovuta tietoja muille.</p>
<h2>Oikeutesi</h2>
<p>Sinulla on oikeus tarkastaa tietosi, pyytää niiden oikaisemista tai poistamista, rajoittaa niiden käsittelyä ja perua suostumuksesi. Lähetä pyyntö osoitteeseen ${EMAIL}. Jos katsot, että tietojasi käsitellään lainvastaisesti, voit tehdä valituksen tietosuojavaltuutetun toimistolle (tietosuoja.fi).</p>
<h2>Selaimeen tallennettavat tiedot</h2>
<p>Jos valitset tallennuksen tälle laitteelle, testin vastaukset tallennetaan selaimesi paikalliseen tallennustilaan 120 päiväksi. Selain muistaa myös valitsemasi taustahahmon ja evästevalintasi. Näitä tietoja ei lähetetä meille. Sivustolla ei tällä hetkellä käytetä seuranta- tai markkinointievästeitä.</p>`,
  },
];

// Tekstiversio näkyy vain ilman JavaScriptiä: latausnäkymä piilotetaan silloin, ja teksti saa perustyylit.
const HEAD_EXTRA = `<noscript><style>.logo-loader{display:none!important}</style></noscript>
<style>.static-page{max-width:760px;margin:0 auto;padding:96px 24px 64px;color:#fff;background:#080e30;font-family:system-ui,sans-serif;line-height:1.6}.static-page a{color:#7dbbff}.static-page h1{font-size:2.2em;line-height:1.15}.static-page nav ul{display:flex;flex-wrap:wrap;gap:8px 20px;padding:0;list-style:none}</style>`;

function meta(page) {
  const url = SITE + (page.path === '/' ? '/' : page.path);
  return [
    `<meta name="description" content="${esc(page.description)}"/>`,
    `<link rel="canonical" href="${url}"/>`,
    `<meta property="og:type" content="website"/>`,
    `<meta property="og:site_name" content="Get to Work"/>`,
    `<meta property="og:locale" content="fi_FI"/>`,
    `<meta property="og:url" content="${url}"/>`,
    `<meta property="og:title" content="${esc(page.title)}"/>`,
    `<meta property="og:description" content="${esc(page.description)}"/>`,
    `<meta name="twitter:card" content="summary"/>`,
  ].join('');
}

let written = 0;
for (const page of PAGES) {
  let html = template;
  if (!/<title>[\s\S]*?<\/title>/.test(html) || !html.includes('<div id="root"></div>')) {
    throw new Error('static-pages: index.html ei ole odotetun muotoinen (title tai #root puuttuu)');
  }
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>${meta(page)}${HEAD_EXTRA}`);
  html = html.replace('<div id="root"></div>', `<div id="root"><div class="static-page">${nav}<main lang="fi">${page.body}</main>${footer}</div></div>`);
  const dir = page.path === '/' ? dist : new URL(`.${page.path}/`, dist);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), html);
  written += 1;
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(new URL('sitemap.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(p => `  <url><loc>${SITE}${p.path === '/' ? '/' : p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);

writeFileSync(new URL('llms.txt', dist), `# Get to Work

> Get to Work (Gettowork Oy, Espoo) yhdistää työt ja tekijät. Yritys kertoo, mitä pitäisi saada tehtyä, ja Get to Work yhdistää sen oikeaan toteuttajaan: henkilöstöpalveluihin, erikoistuneisiin kumppaneihin tai työpaikkojen vapaaseen osaamiseen. Prompt to done.

Tekijän työnantaja on aina hänen oma työnantajansa tai henkilöstöpalvelu; Get to Work ei itse työllistä. Painopiste on käytännön töissä: varasto ja logistiikka, tapahtumat, toimitilat ja muutot, myymälät, siivous ja ylläpito sekä kiinteistöt.

## Sivut

- [Tietoa yrityksestä](${SITE}/tietoa): mitä Get to Work tekee, miten se toimii ja mihin se pyrkii
- [Yrittäjätesti](${SITE}/): pyöritätkö sinä yritystä, vai pyörittääkö se sinua? 72 väittämän itsearvio yrittäjälle
- [Tietoa testistä](${SITE}/kysely): testin osa-alueet ja tasot
- [Tietosuojaseloste](${SITE}/tietosuoja)

## Yhteystiedot

- Sähköposti: ${EMAIL}
- Puhelin: 044 236 1914
- Gettowork Oy, Y-tunnus 3196576-1, Espoo
`);

console.log(`static-pages: ${written} sivua, sitemap.xml ja llms.txt kirjoitettu`);
