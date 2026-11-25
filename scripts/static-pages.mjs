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
<li><a href="/">Restart-testi</a></li>
<li><a href="/tietoa">Tietoa yrityksestä</a></li>
<li><a href="/kysely">Tietoa testistä</a></li>
<li><a href="/tietosuoja">Tietosuojaseloste</a></li>
</ul></nav>`;
const footer = `<footer><p>© 2026 Gettowork Oy · Y-tunnus 3196576-1 · Espoo, Suomi</p>
<p>Yhteystiedot: <a href="mailto:${EMAIL}">${EMAIL}</a> · <a href="tel:+358442361914">044 236 1914</a></p></footer>`;

const PAGES = [
  {
    path: '/',
    title: 'Restart-testi: Minkälainen yrittäjä olet? · Get to Work',
    description: 'Tee Get to Workin Restart-testi: 72 lyhyttä väittämää yrityksesi arjesta. Saat pisteet, tasosi, yrittäjätyyppisi ja tiedon siitä, mistä kannattaa aloittaa.',
    body: `<h1>Minkälainen yrittäjä olet?</h1>
<p>Tee testi ja selvitä, kuinka hyvin yrityksesi toimii.</p>
${list(['Miksi kiire ei lopu?', 'Onko hinnoittelu kohdallaan?', 'Mistä seuraavat asiakkaat?', 'Mihin aikani oikeasti menee?'])}
<p>Restart-testissä on 72 lyhyttä väittämää 12 osa-alueelta. Testi vie noin 10 minuuttia, ja tuloksen näet heti: pisteet, tasosi ja yrittäjätyyppisi. <a href="/kysely">Lue lisää testistä</a>.</p>
<p>Get to Work tekee työn tekemisestä helpompaa. <a href="/tietoa">Tietoa yrityksestä</a>.</p>`,
  },
  {
    path: '/tietoa',
    title: 'Tietoa yrityksestä · Get to Work',
    description: 'Get to Work tekee työn tekemisestä helpompaa. Sinä kerrot, mitä pitää tehdä. Me selvitämme, miten se saadaan tehdyksi, kuka sen tekee ja mitä se maksaa. From prompt to done.',
    body: `<p>Get to Work / From prompt to done</p>
<h1>Tehdään työn tekemisestä helpompaa.</h1>
<p>Sinä kerrot, mitä pitää tehdä. Me selvitämme, miten se saadaan tehdyksi, kuka sen tekee ja mitä se maksaa.</p>
<p><a href="mailto:${EMAIL}?subject=Ty%C3%B6tilaus">Kerro mitä pitää tehdä</a></p>

<h2>Maailma muuttuu nopeasti. Työn hankinta ei.</h2>
<p>Tapa, jolla yritykset hankkivat työvoimaa ja järjestävät työnsä, ei ole muuttunut läheskään yhtä nopeasti.</p>
<p>Yrityksillä on jatkuvasti tekemistä, johon ei riitä aikaa, osaamista tai tekijöitä. Samalla ympärillämme on valtavasti ihmisiä, jotka haluaisivat tehdä töitä, mutta joille oikeiden mahdollisuuksien löytäminen on vaikeaa.</p>
<p>Me uskomme, että näiden kahden kohtaamisen pitäisi olla paljon helpompaa. Siksi rakennamme Get to Workia.</p>

<h2>Mitä jos työn voisi vain tilata?</h2>
<p>Get to Work on uudenlainen tapa saada asioita tehdyksi. Sen sijaan, että yritys etsii työntekijöitä, kilpailuttaa palveluntarjoajia tai suunnittelee itse työn toteutuksen, se voi yksinkertaisesti kertoa, mitä pitäisi saada aikaan. Meidän tehtävämme on selvittää, miten.</p>
<ol>
<li><strong>Prompt.</strong> Kerro, mitä pitää tehdä.</li>
<li><strong>Plan.</strong> Me selvitämme, miten työ saadaan tehdyksi, kuka sen tekee ja mitä se maksaa.</li>
<li><strong>Done.</strong> Luotettavat toteutuskumppanit tekevät työn, ja me huolehdimme kokonaisuudesta.</li>
</ol>
<p>Yhdistämme tekoälyn, älykkään työnsuunnittelun ja luotettavien toteutuskumppaneiden osaamisen yhdeksi helposti käytettäväksi palveluksi.</p>

<h2>Enemmän mahdollisuuksia. Vähemmän esteitä.</h2>
<p>Haluamme rakentaa uudenlaisia mahdollisuuksia sekä yrityksille että työntekijöille.</p>
<p><strong>Yrityksille</strong> se tarkoittaa joustavampaa tapaa hankkia työtä ilman, että jokaiseen tarpeeseen täytyy palkata uusia ihmisiä.</p>
<p><strong>Tekijöille</strong> se tarkoittaa mahdollisuutta päästä näyttämään osaamistaan, kartuttamaan kokemustaan ja osallistumaan oikeisiin työprojekteihin.</p>
<p>Hyvän työn tekeminen ei aina edellytä pitkää työhistoriaa tai täydellistä ansioluetteloa. Kun tehtävät suunnitellaan hyvin, ohjeet ovat selkeät ja oikeat ihmiset työskentelevät yhdessä, saadaan aikaan paljon enemmän.</p>
<p><a href="mailto:${EMAIL}?subject=Haluan%20mukaan%20tekij%C3%A4ksi">Haluan mukaan tekijäksi</a></p>

<h2>Tavallista työtä. Uudella tavalla.</h2>
<p>Meitä kiinnostavat erityisesti yritykset, jotka pitävät arjen pyörimässä: varastot, tuotantolaitokset, kaupat, toimitilat ja lukemattomat muut työympäristöt, joissa asioiden täytyy tapahtua oikeassa maailmassa.</p>
<p>Emme usko, että kaikki ongelmat ratkaistaan rakentamalla lisää ohjelmistoja. Joskus tarvitaan vain oikeat ihmiset oikeaan paikkaan, selkeä suunnitelma ja joku, joka huolehtii kokonaisuudesta. Teknologian tehtävä on tehdä tästä mahdollisimman yksinkertaista.</p>

<h2>Yksi työ kerrallaan.</h2>
<p>Get to Work on vasta rakentumassa. Aloitamme tekemällä yksittäisten töiden tilaamisesta helpompaa. Samalla opimme, miten työtä voidaan suunnitella, organisoida ja toteuttaa paremmin.</p>
<p>Pitkällä aikavälillä tavoitteemme on rakentaa alusta, jonka kautta yritykset voivat hankkia tarvitsemaansa työtä yhtä helposti kuin ne ostavat muitakin palveluita.</p>
<p>Ei turhaa monimutkaisuutta. Ei loputtomia rekrytointiprosesseja jokaista yksittäistä tarvetta varten. Vain selkeä tarve, toimiva ratkaisu ja tehty työ.</p>

<h2>Get to Work. From prompt to done.</h2>
<p>Kerro, mitä pitää saada tehdyksi. Me selvitämme, miten se tehdään, kuka sen tekee ja mitä se maksaa.</p>
<p><a href="mailto:${EMAIL}?subject=Ty%C3%B6tilaus">Kerro mitä pitää tehdä</a></p>`,
  },
  {
    path: '/kysely',
    title: 'Tietoa testistä · Get to Work',
    description: 'Restart-testi: 12 osa-aluetta, 72 väittämää, noin 10 minuuttia. Kolme tasoa: Itsensätyöllistäjä, Pyörittäjä ja Omistaja.',
    body: `<p>Restart Score</p>
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
    description: 'Näin Get to Work käsittelee tietoja, jotka jätät Restart Score -testin yhteydessä.',
    body: `<p>Päivitetty 28.10.2026</p>
<h1>Tietosuojaseloste</h1>
<p>Näin käsittelemme tietoja, jotka jätät Restart Score -testin yhteydessä.</p>
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

> Get to Work (Gettowork Oy, Espoo) tekee työn tekemisestä helpompaa. Yritys kertoo, mitä pitää saada tehdyksi, ja Get to Work selvittää, miten se tehdään, kuka sen tekee ja mitä se maksaa. From prompt to done.

Get to Work yhdistää tekoälyn, älykkään työnsuunnittelun ja luotettavien toteutuskumppaneiden osaamisen yhdeksi palveluksi. Se palvelee erityisesti yrityksiä, jotka pitävät arjen pyörimässä: varastoja, tuotantolaitoksia, kauppoja ja toimitiloja. Tekijöille se tarjoaa mahdollisuuden osallistua oikeisiin työprojekteihin ja kartuttaa kokemusta.

## Sivut

- [Tietoa yrityksestä](${SITE}/tietoa): mitä Get to Work tekee ja miksi
- [Restart-testi](${SITE}/): 72 väittämän itsearvio yrittäjälle
- [Tietoa testistä](${SITE}/kysely): testin osa-alueet ja tasot
- [Tietosuojaseloste](${SITE}/tietosuoja)

## Yhteystiedot

- Sähköposti: ${EMAIL}
- Puhelin: 044 236 1914
- Gettowork Oy, Y-tunnus 3196576-1, Espoo
`);

console.log(`static-pages: ${written} sivua, sitemap.xml ja llms.txt kirjoitettu`);
