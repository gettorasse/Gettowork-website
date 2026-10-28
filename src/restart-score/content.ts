// Gettowork Restart Score — sisältö (versio 1.0).
// Kysymykset, ankkurit, tulosluokat ja ohjelmakirjasto ovat Gettoworkin oma
// ehdotus; ne eivät ole OwnerScore-kyselyn käännös tai validoitu mittari.

export const CONTENT_VERSION = '1.0' as const;

export type PId =
  | 'pricing' | 'persona' | 'problem' | 'product'
  | 'profit' | 'pitch' | 'people' | 'promote'
  | 'process' | 'predicament' | 'path' | 'protect';

export type Score = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type Question = {
  id: PId;
  p: string; // englanninkielinen P-nimi
  name: string; // suomenkielinen osa-alue
  question: string;
  help: string;
  anchors: { 0: string; 5: string; 10: string };
};

export const QUESTIONS: readonly Question[] = [
  {
    id: 'pricing', p: 'Pricing', name: 'Hinnoittelu',
    question: 'Jääkö hinnoistasi se kate, jota tavoittelet?',
    help: 'Huomioi myös oma työaikasi, toimituksen kulut ja toteutuneet alennukset.',
    anchors: {
      0: 'En tiedä katettani.',
      5: 'Tavoite tunnetaan, mutta toteutuminen vaihtelee eikä poikkeamiin aina puututa.',
      10: 'Tiedän katteeni ja hinnoittelen sen mukaan.',
    },
  },
  {
    id: 'persona', p: 'Persona', name: 'Oikeat asiakkaat',
    question: 'Valitsetko asiakkaat, joiden kanssa työ kannattaa?',
    help: 'Arvioi valintaperusteita ja toteutunutta asiakaskantaa.',
    anchors: {
      0: 'Otan kaikki, jotka tulevat.',
      5: 'Kohdeasiakas on määritelty, mutta päätökset poikkeavat usein siitä.',
      10: 'Valitsen asiakkaat selvin perustein.',
    },
  },
  {
    id: 'problem', p: 'Problem', name: 'Asiakkaan ongelma',
    question: 'Tiedätkö, miksi asiakkaat oikeasti ostavat sinulta?',
    help: 'Erota kiinnostus toteutuneesta ostosta ja ongelman poistumista koskevasta palautteesta.',
    anchors: {
      0: 'Arvaan.',
      5: 'Asiakkaat tunnistavat ongelman, mutta ostamisen syy tai saavutettu hyöty jää osin epäselväksi.',
      10: 'Asiakkaat kertovat sen ja ostavat uudelleen.',
    },
  },
  {
    id: 'product', p: 'Product', name: 'Tarjooma',
    question: 'Hoituuko toimitus joka kerta samalla tavalla?',
    help: 'Arvioi yhtä keskeistä tarjoomaa: sisältöä, rajauksia ja toimitustapaa.',
    anchors: {
      0: 'Keksin sen joka kerta uudestaan.',
      5: 'Peruspaketti on olemassa, mutta poikkeukset tekevät toimituksesta usein vaikean.',
      10: 'Sama malli ja sama laatu joka kerta.',
    },
  },
  {
    id: 'profit', p: 'Profit', name: 'Kannattavuuden johtaminen',
    question: 'Näetkö luvuista ajoissa, miten rahat riittävät?',
    help: 'Arvioi tiedon saatavuutta, ymmärrettävyyttä ja käyttöä päätöksissä.',
    anchors: {
      0: 'Huomaan ongelmat vasta jälkikäteen.',
      5: 'Luvut tarkistetaan ajoittain, mutta ennakointi ja toimenpiteet ovat epäsäännöllisiä.',
      10: 'Seuraan lukuja säännöllisesti ja reagoin ajoissa.',
    },
  },
  {
    id: 'pitch', p: 'Pitch', name: 'Myynti',
    question: 'Eteneekö myynti sovitulla tavalla?',
    help: 'Arvioi tarvekartoitusta, tarjouksia, seurantaa ja sitä, tarvitseeko omistajan pelastaa kaupat.',
    anchors: {
      0: 'Jokainen kauppa on improvisaatiota.',
      5: 'Yhteinen malli on olemassa, mutta käyttö ja seuranta vaihtelevat.',
      10: 'Myynnillä on malli, joka toimii.',
    },
  },
  {
    id: 'people', p: 'People', name: 'Ihmiset ja vastuut',
    question: 'Tekevätkö muut arjen päätökset itse?',
    help: 'Tiimi voi sisältää työntekijöitä, kumppaneita tai ulkoistettuja palveluja.',
    anchors: {
      0: 'Kaikki odottaa minun päätöstäni.',
      5: 'Vastuut on nimetty, mutta päätösvalta tai varahenkilöt jäävät epäselviksi.',
      10: 'Vastuut ovat selvät ja toimivat.',
    },
  },
  {
    id: 'promote', p: 'Promote', name: 'Asiakashankinta',
    question: 'Tuleeko uusia asiakkaita tasaisesti?',
    help: 'Arvioi sopivien yhteydenottojen ja kauppojen syntyä, älä seuraajamääriä.',
    anchors: {
      0: 'Sattumalta tai oman juoksemisen varassa.',
      5: 'Toimivia kanavia on, mutta rytmi ja tulokset vaihtelevat eikä syitä tunneta.',
      10: 'Toimivat kanavat tuovat asiakkaita jatkuvasti.',
    },
  },
  {
    id: 'process', p: 'Process', name: 'Prosessit',
    question: 'Valmistuvatko rutiinityöt ilman jatkuvaa neuvomista?',
    help: 'Arvioi esimerkiksi tilausta, toimitusta, laskutusta tai asiakaspalvelua.',
    anchors: {
      0: 'Kaikki on minun päässäni.',
      5: 'Osa työstä on kuvattu, mutta poikkeukset ja laatu vaativat usein omistajaa.',
      10: 'Ohjeet toimivat ja työ valmistuu.',
    },
  },
  {
    id: 'predicament', p: 'Predicament', name: 'Todellinen pullonkaula',
    question: 'Tiedätkö, mikä yritystäsi eniten hidastaa?',
    help: 'Arvioi eroa oireiden korjailun ja yhden todennetun juurisyyn ratkaisemisen välillä.',
    anchors: {
      0: 'Sammutan vain tulipaloja.',
      5: 'Este on tunnistettu, mutta sen ratkaiseminen jää muiden töiden alle.',
      10: 'Tiedän sen ja korjaan sitä.',
    },
  },
  {
    id: 'path', p: 'Path', name: 'Omistajan suunta',
    question: 'Tiedätkö, mihin olet yritystäsi viemässä?',
    help: 'Tavoite voi olla esimerkiksi vakaa toimeentulo ja vapaa aika, kasvu tai myöhempi omistajanvaihdos.',
    anchors: {
      0: 'Suuntaa ei ole.',
      5: 'Tavoite on sanoitettu, mutta resurssit ja arjen valinnat tukevat sitä vain osittain.',
      10: 'Tavoite ohjaa päätöksiäni ja kalenteriani.',
    },
  },
  {
    id: 'protect', p: 'Protect', name: 'Omistajan aika ja jatkuvuus',
    question: 'Pystytkö pitämään lomaa ilman, että työ pysähtyy?',
    help: 'Arvioi toteutuneita vapaita, yhteydenottorajoja ja sovittuja sijaisjärjestelyjä.',
    anchors: {
      0: 'Minun pitää olla aina tavoitettavissa.',
      5: 'Vapaat onnistuvat osittain, mutta keskeytykset tai varajärjestelyjen puute toistuvat.',
      10: 'Loma onnistuu ja arki jatkuu.',
    },
  },
];

/** Pysyvä järjestys: näyttöjärjestys ja tasapisteiden ratkaisu. */
export const ORDER: readonly PId[] = QUESTIONS.map(q => q.id);

export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map(q => [q.id, q])) as Record<PId, Question>;

export type BandKey = 'foundation' | 'stabilise' | 'independence' | 'resilience';

export const BANDS: Record<BandKey, { range: string; title: string; text: string }> = {
  foundation: {
    range: '0–39', title: 'Rakenna arjen perusta',
    text: 'Vastauksissasi moni toimintatapa on vielä epäselvä tai henkilöriippuvainen. Aloita kahdesta rajatusta muutoksesta, jotka helpottavat arkea.',
  },
  stabilise: {
    range: '40–69', title: 'Vahvista toimivia käytäntöjä',
    text: 'Yrityksessäsi on toimivia käytäntöjä, mutta ne eivät vielä kanna tasaisesti. Tee kahdesta kehityskohteesta yhteinen ja seurattava toimintatapa.',
  },
  independence: {
    range: '70–99', title: 'Vähennä riippuvuutta omistajasta',
    text: 'Monet perusasiat toimivat. Tarkista etenkin kohdat, joissa eteneminen, laatu tai päätökset vaativat yhä omistajan läsnäoloa.',
  },
  resilience: {
    range: '100–120', title: 'Varmista toiminnan kestävyys',
    text: 'Arvioit toimintatapasi vahvoiksi. Vahvista arviota käytännön näytöllä ja testaa, että toiminta kestää myös poissaoloja ja muutoksia.',
  },
};

/** Yrittäjätyyppi kokonaispisteiden mukaan. Leikillinen nimi, ei diagnoosi. */
export const OWNER_TYPES: Record<BandKey, { name: string; tagline: string }> = {
  foundation: { name: 'Sammuttaja', tagline: 'Päiväsi kuluvat tulipalojen sammuttamiseen.' },
  stabilise: { name: 'Pyörittäjä', tagline: 'Yritys pyörii – niin kauan kuin sinä pyörität sitä.' },
  independence: { name: 'Rakentaja', tagline: 'Rakennat yritystä, joka alkaa kantaa itseään.' },
  resilience: { name: 'Omistaja', tagline: 'Johdat yritystä etkä vain tee töitä siinä.' },
};

export type AreaLevel = 'build' | 'stabilise' | 'strengthen' | 'maintain';

export const AREA_STATUS: Record<AreaLevel, string> = {
  build: 'Rakenna perusta',
  stabilise: 'Vakiinnuta käytäntö',
  strengthen: 'Vahvista ja testaa',
  maintain: 'Ylläpidä ja varmista',
};

export const AREA_GUIDANCE: Record<AreaLevel, string> = {
  build: 'Rakenna ensin pienin toimiva käytäntö. Valitse vain yksi tarjooma, työ tai päätöstilanne kokeiluun.',
  stabilise: 'Hyödynnä nykyistä käytäntöä ja keskity siihen, että se toteutuu joka kerta. Nimeä vastuu ja seuraa poikkeamia.',
  strengthen: 'Vahvista nykyistä käytäntöä testaamalla sitä tilanteessa, jossa omistaja ei ohjaa toteutusta.',
  maintain: 'Varmista nykyisen käytännön toimivuus näytöllä. Käytä ensimmäinen vaihe tarkistamiseen, toinen poikkeustilanteen testiin ja kolmas ylläpidon sopimiseen.',
};

export type PlanStep = { task: string; done: string };

export type PlanEntry = {
  goal: string;
  steps: [PlanStep, PlanStep, PlanStep];
  metric: string;
};

export const PHASES = [
  { from: 1, to: 30, title: 'Selvitä ja rajaa', text: 'Kirjaa lähtötilanne, valitse yksi kokeilu ja nimeä vastuuhenkilö.' },
  { from: 31, to: 60, title: 'Toteuta ja testaa', text: 'Käytä uutta toimintatapaa oikeassa työssä ja kerää havainnot.' },
  { from: 61, to: 90, title: 'Vakiinnuta ja arvioi', text: 'Dokumentoi toimiva käytäntö, varmista sen jatkuvuus ja tee arviointi uudelleen.' },
] as const;

/** Pisteillä 9–10 vaihetehtävät korvataan varmistusta painottavilla tehtävillä. */
export const MAINTENANCE_STEPS: [PlanStep, PlanStep, PlanStep] = [
  { task: 'Tarkista nykyinen käytäntö ja kokoa näyttö tavoitteen toteutumisesta.', done: 'näyttö on kirjattu.' },
  { task: 'Testaa käytäntö omistajan poissaolon tai muun olennaisen poikkeaman aikana.', done: 'testihavainnot on kirjattu.' },
  { task: 'Korjaa havaittu puute tai vahvista nykyinen malli ja sovi seuraava tarkistus.', done: 'vastuu ja tarkistuspäivä on nimetty.' },
];

export const PLAN_LIBRARY: Record<PId, PlanEntry> = {
  pricing: {
    goal: 'Hinnoittelupäätökset perustuvat toteutuneisiin kustannuksiin ja sovittuun katetavoitteeseen.',
    steps: [
      { task: 'Laske kolmen tavallisen toimituksen kustannukset myös omalle työlle.', done: 'kustannukset ja tavoitekate on kirjattu.' },
      { task: 'Testaa yhdessä tarjoomassa kustannus- ja arvoperusteista hintaa uusissa tarjouksissa.', done: 'tarjoukset ja asiakkaiden päätökset on kirjattu.' },
      { task: 'Vertaa toteutunutta katetta ja sovi hinnan sekä alennusten tarkistusrytmi.', done: 'seuraavan tarkistuksen aika ja vastuuhenkilö on sovittu.' },
    ],
    metric: 'Tarkastellun tarjooman toteutunut kate euroina ja prosentteina samalla laskentatavalla.',
  },
  persona: {
    goal: 'Asiakasvalinta tukee kannattavaa ja sujuvaa työtä.',
    steps: [
      { task: 'Vertaa viittä sujuvaa ja viittä kuormittavaa asiakkuutta, tai kaikkia jos asiakkaita on vähemmän.', done: 'sopivuuskriteerit on kirjattu.' },
      { task: 'Käytä kriteerejä uusien yhteydenottojen arviointiin.', done: 'jokaisesta tarkastelujakson liidistä on sopivuusarvio.' },
      { task: 'Vertaa valittujen asiakkaiden työn sujuvuutta ja katetta; tarkenna kriteerejä.', done: 'käytössä on yhteinen asiakasvalinnan ohje.' },
    ],
    metric: 'Sopivuuskriteerit täyttävien uusien asiakkaiden osuus.',
  },
  problem: {
    goal: 'Keskeisen tarjooman ostoperuste perustuu asiakkaiden osoittamaan tarpeeseen.',
    steps: [
      { task: 'Keskustele viiden asiakkaan kanssa ostoon johtaneesta tilanteesta ja ratkaisemattoman ongelman vaikutuksista.', done: 'havainnot ja tärkein yhteinen ongelma on kirjattu.' },
      { task: 'Testaa ongelman kuvausta oikeissa myyntikeskusteluissa.', done: 'asiakkaiden perustelut ja päätökset on kirjattu.' },
      { task: 'Varmista toimituksen jälkeen, ratkesiko luvattu ongelma.', done: 'palaute on koottu ja tarjooman kuvaus tarkistettu.' },
    ],
    metric: 'Niiden palautetta antaneiden asiakkaiden osuus, jotka vahvistavat sovitun ongelman ratkenneen.',
  },
  product: {
    goal: 'Yksi keskeinen tarjooma voidaan toimittaa sovitulla sisällöllä ja laadulla.',
    steps: [
      { task: 'Kuvaa lupaus, sisältö, rajaukset ja toimituksen vaiheet.', done: 'tarjooma mahtuu yhteen selkeään kuvaukseen.' },
      { task: 'Toimita rajatulla mallilla vähintään kaksi kertaa, tai yksi kokonainen pilotti pitkissä toimituksissa.', done: 'poikkeamat on kirjattu.' },
      { task: 'Korjaa toistuvat poikkeamat ja sovi mallin vastuuhenkilö.', done: 'seuraava toimitus voidaan käynnistää samoilla ohjeilla.' },
    ],
    metric: 'Sovitun rajauksen ulkopuolisen lisätyön tunnit toimitusta kohti.',
  },
  profit: {
    goal: 'Yrityksen johto tunnistaa kannattavuuden ja kassan poikkeamat riittävän ajoissa.',
    steps: [
      { task: 'Määrittele kirjanpitäjän kanssa käytettävät kannattavuusluvut ja tee 13 viikon kassaennuste.', done: 'tietolähteet ja päivitysvastuut on sovittu.' },
      { task: 'Päivitä kassaseuranta viikoittain ja kirjaa toteuman poikkeamat.', done: 'neljä peräkkäistä viikkokatsausta on tehty.' },
      { task: 'Vakiinnuta katsaus ja päätössäännöt havaittuihin poikkeamiin.', done: 'seuraavan kuukauden katsaukset on aikataulutettu.' },
    ],
    metric: 'Ajallaan tehtyjen talouskatsausten osuus sovituista katsauksista.',
  },
  pitch: {
    goal: 'Myyntitilanteet etenevät sovitun mallin mukaan.',
    steps: [
      { task: 'Kuvaa tarvekartoitus, tarjouksen sisältö, päätösvaihe ja seuranta.', done: 'yhdelle tarjoomalle on yhteinen myyntirunko.' },
      { task: 'Testaa runkoa viidessä myyntitilanteessa, tai kaikissa jakson tilanteissa jos niitä on vähemmän.', done: 'eteneminen ja keskeytymisen syyt on kirjattu.' },
      { task: 'Korjaa yksi toistuva este ja varmista, että sovittu vastuuhenkilö pystyy jatkamaan prosessia.', done: 'malli on päivitetty ja vastuut sovittu.' },
    ],
    metric: 'Päätökseen päätyneiden tarjousten voittoprosentti; näytä myös tarjousten lukumäärä.',
  },
  people: {
    goal: 'Arjen päätöksille on selkeät vastuut ja riittävä päätösvalta.',
    steps: [
      { task: 'Kirjaa omistajalle viikon aikana palaavat päätökset ja valitse yksi siirrettävä vastuu.', done: 'vastuu, päätösraja ja sopiva tekijä on nimetty.' },
      { task: 'Anna vastuu työntekijälle tai sovitulle kumppanille ja pidä viikoittainen tarkistus.', done: 'tekijä on hoitanut vastuun itsenäisesti sovituissa rajoissa.' },
      { task: 'Dokumentoi opit ja sovi varajärjestely.', done: 'vastuu ei enää odota omistajan päivittäistä hyväksyntää.' },
    ],
    metric: 'Omistajalle hyväksyttäväksi palaavien rutiinipäätösten määrä viikossa.',
  },
  promote: {
    goal: 'Yksi asiakashankinnan toimintatapa on toistettava ja seurattava.',
    steps: [
      { task: 'Selvitä sopivien asiakkaiden toteutuneet tulolähteet ja valitse yksi kanava.', done: 'kohderyhmä, viesti, rytmi ja vastuu on kirjattu.' },
      { task: 'Toteuta rajattu neljän viikon kokeilu valitussa kanavassa.', done: 'toimenpiteet ja niiden kautta tulleet yhteydenotot on kirjattu.' },
      { task: 'Arvioi sopivuus ja eteneminen kaupoiksi; päätä jatkosta.', done: 'kanavan jatkorytmi tai lopettamispäätös on kirjattu.' },
    ],
    metric: 'Sopiviksi arvioidut myyntimahdollisuudet viikossa valitusta kanavasta.',
  },
  process: {
    goal: 'Yksi toistuva ydintyö valmistuu ilman jatkuvaa omistajan ohjausta.',
    steps: [
      { task: 'Valitse eniten keskeytyksiä aiheuttava työ ja kuvaa vaiheet sekä valmistumiskriteeri.', done: 'työohje on kirjoitettu.' },
      { task: 'Testaa ohjetta toisen tekijän kanssa, tai yksinyrittäjänä seuraavissa kolmessa toistossa ilman muistista täydentämistä.', done: 'puutteet on kirjattu.' },
      { task: 'Korjaa ohje, nimeä vastuu ja poikkeusten käsittelytapa.', done: 'seuraava toisto onnistuu sovituilla kriteereillä.' },
    ],
    metric: 'Omistajan ohjausta vaatineet keskeytykset yhtä työn toistoa kohti.',
  },
  predicament: {
    goal: 'Yhden tärkeimmän pullonkaulan vaikutus on todennettu ja pienentynyt.',
    steps: [
      { task: 'Kerää kahden viikon havainnot jonoista, viiveistä tai uudelleentyöstä.', done: 'yksi este ja sen lähtömittari on valittu.' },
      { task: 'Kokeile yhtä muutosta esteen poistamiseksi.', done: 'ennen–jälkeen-havainnot ovat vertailukelpoiset.' },
      { task: 'Päätä mittarin perusteella, vakiinnutetaanko muutos vai vaihdetaanko kokeilua.', done: 'päätös ja seuraava seuranta on kirjattu.' },
    ],
    metric: 'Valittuun esteeseen liittyvä läpimenoaika samoilla alku- ja loppupisteillä.',
  },
  path: {
    goal: 'Omistajan tavoite ohjaa resursseja ja arjen päätöksiä.',
    steps: [
      { task: 'Kirjaa yksi ensisijainen 12 kuukauden tavoite ja kolme asiaa, joita ei nyt tavoitella.', done: 'omistajat ovat sopineet suunnasta.' },
      { task: 'Vertaa kalenteria ja käynnissä olevia hankkeita tavoitteeseen; rajaa yksi ristiriitainen työ.', done: 'vapautuva aika on kohdistettu tavoitteen mukaiseen tekemiseen.' },
      { task: 'Tarkista päätökset ja valitse seuraavan jakson tärkein askel.', done: 'suunnan mukainen resurssijako on kirjattu.' },
    ],
    metric: 'Tavoitetta tukevan työn osuus omistajan työajasta kahden viikon otannassa.',
  },
  protect: {
    goal: 'Omistajalla on toteutuva irrottautumisen käytäntö ja yrityksellä sovittu poissaolomalli.',
    steps: [
      { task: 'Kirjaa poissaolon estävät riippuvuudet ja valitse yksi rajattu vapaa ajanjakso.', done: 'yhteydenottorajat, asiakasviestintä ja varajärjestely on sovittu.' },
      { task: 'Testaa yksi työpäivä tai toimintaan sopiva rajattu jakso ilman rutiiniyhteydenottoja.', done: 'keskeytykset ja niiden syyt on kirjattu.' },
      { task: 'Korjaa testin puutteet ja kokeile pidempää sovittua poissaoloa.', done: 'käytäntö on dokumentoitu ja seuraava vapaa varattu.' },
    ],
    metric: 'Sovitun vapaan aikana tulleet rutiinikeskeytykset sekä toteutunut vapaa aika.',
  },
};

export const CONTACT_EMAIL = 'rasmus@gettowork.fi';
export const CONTACT_SUBJECT = 'Gettowork Restart Score – keskustelu tuloksesta';
export const CONTACT_BODY = 'Hei, haluaisin keskustella Restart Score -arviosta ja yritykseni seuraavista kehitysaskelista.';
