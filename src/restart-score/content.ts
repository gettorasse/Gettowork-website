// Gettowork Restart Score — sisältö (versio 2.0).
// Rakenne ja pisteytyslogiikka mukailevat OwnerScore-testiä: 12 osa-aluetta kolmessa
// vaiheessa, väittämät 7-portaisella asteikolla ja samaa mieltä oleminen paljastaa
// heikkouden. Kaikki tekstit ovat Get to Workin omia.

export const CONTENT_VERSION = '2.0' as const;

export type PId =
  | 'pricing' | 'persona' | 'problem' | 'product'
  | 'profit' | 'pitch' | 'people' | 'promote'
  | 'process' | 'predicament' | 'path' | 'protect';

export type PhaseKey = 'base' | 'work' | 'owner';

export const PHASE_INFO: Record<PhaseKey, { label: string; blurb: string }> = {
  base: { label: 'Perusta', blurb: 'Kuka olet ja kenelle teet töitä.' },
  work: { label: 'Arki', blurb: 'Miten yritys oikeasti pyörii.' },
  owner: { label: 'Omistaja', blurb: 'Mitä sinulle jää ja mitä se sinulle maksaa.' },
};

export type Statement = {
  text: string;
  /** Osa-alueet, joihin vastaus vaikuttaa lisäksi kolmanneksen painolla. */
  also: PId[];
};

export type Lever = {
  id: PId;
  /** Englanninkielinen P-nimi (Pricing, Persona …). */
  p: string;
  /** Suomenkielinen osa-alue. */
  name: string;
  phase: PhaseKey;
  statements: readonly Statement[];
};

const s = (text: string, ...also: PId[]): Statement => ({ text, also });

export const LEVERS: readonly Lever[] = [
  {
    id: 'pricing', p: 'Pricing', name: 'Hinnoittelu', phase: 'base',
    statements: [
      s('Pidät hintasi alhaalla, koska et halua vaikuttaa kalliilta.', 'profit'),
      s('Hintojasi ei ole nostettu yli vuoteen.', 'predicament'),
      s('Laskun lähettäminen tuntuu sinusta vähän kiusalliselta.', 'promote'),
      s('Hintasi perustuvat lähinnä siihen, mitä kilpailijat pyytävät.', 'persona'),
      s('Kun asiakas pyytää alennusta, annat sen yleensä.', 'profit', 'pitch'),
      s('Teet usein lisätöitä veloittamatta niistä.', 'profit'),
    ],
  },
  {
    id: 'persona', p: 'Persona', name: 'Oikeat asiakkaat', phase: 'base',
    statements: [
      s('Otat vastaan lähes kaikki työt, joita sinulle tarjotaan.', 'profit'),
      s('Et pysty kuvaamaan parasta asiakastasi yhdellä lauseella.', 'path'),
      s('Lupaat asiakkaalle uuden palvelun, vaikka et ole tehnyt sitä ennen.', 'pitch', 'product'),
      s('Markkinointisi puhuu kaikille eikä kenellekään erityisesti.', 'promote'),
      s('Asiakkaasi ovat keskenään hyvin erilaisia kooltaan ja tarpeiltaan.', 'pricing'),
      s('Huonosti sopivasta asiakkaasta kieltäytyminen tuntuu mahdottomalta.', 'product', 'profit'),
    ],
  },
  {
    id: 'problem', p: 'Problem', name: 'Asiakkaan ongelma', phase: 'base',
    statements: [
      s('Teet työn niin kuin itse pidät parhaana, vaikka asiakas toivoisi muuta.', 'product'),
      s('Viimeistelet yksityiskohtia, joista asiakas ei maksa.', 'people'),
      s('Tekeminen innostaa sinua enemmän kuin yrityksen pyörittäminen.', 'protect'),
      s('Kehität mieluummin palveluasi kuin myyt sitä.', 'promote'),
      s('Et ole kysynyt asiakkailta, minkä ongelman takia he ostivat sinulta.', 'promote', 'predicament'),
      s('Kaupallisuus tuntuu sinusta vähän vastenmieliseltä.', 'pitch'),
    ],
  },
  {
    id: 'product', p: 'Product', name: 'Tarjonta ja toimitus', phase: 'base',
    statements: [
      s('Myyt yhä palveluja tai tuotteita, jotka eivät enää kannata.', 'protect'),
      s('Huonosti myyvän palvelun lopettaminen tuntuu ylivoimaiselta.', 'problem'),
      s('Valikoimasi on kasvanut, mutta siitä ei ole karsittu mitään.', 'persona'),
      s('Osa palveluistasi myydään vain muutamalle asiakkaalle vuodessa.', 'predicament'),
      s('Uudelle asiakkaalle on vaikea kertoa lyhyesti, mitä myyt.', 'pitch'),
      s('Pidät vanhoista palveluista kiinni, koska yritys alkoi niistä.', 'problem', 'protect'),
    ],
  },
  {
    id: 'profit', p: 'Profit', name: 'Kannattavuus', phase: 'work',
    statements: [
      s('Maksat yrityksen kuluja omista rahoistasi.', 'protect'),
      s('Maksat itsellesi palkkaa vasta, kun kaikki muut on maksettu.', 'pricing'),
      s('Annat asiakkaille pitkiä maksuaikoja, vaikka se kiristää kassaa.', 'pricing'),
      s('Omat ja yrityksen rahat menevät sekaisin.', 'protect'),
      s('Et tiedä tarkasti, mitkä työt tuottavat ja mitkä eivät.', 'pricing', 'process'),
      s('Olet jättänyt tänä vuonna oman palkkasi väliin, jotta yritys pärjää.', 'process', 'protect'),
    ],
  },
  {
    id: 'pitch', p: 'Pitch', name: 'Myynti', phase: 'work',
    statements: [
      s('Kaupat syntyvät lähinnä siksi, että sinä olet itse paikalla.', 'people'),
      s('Jos et hoitaisi myyntiä itse, myynti pysähtyisi.', 'people'),
      s('Hoidat itse kaikki tärkeät myyntineuvottelut.', 'people'),
      s('Myyntitapaasi ei ole kirjattu minnekään.', 'process'),
      s('Tarjoukset ja niiden seuranta ovat oman muistisi varassa.', 'people', 'process'),
      s('Kukaan muu ei ole vielä onnistunut tekemään isoa kauppaa.', 'people'),
    ],
  },
  {
    id: 'people', p: 'People', name: 'Ihmiset ja vastuut', phase: 'work',
    statements: [
      s('Kun annat tehtävän muille, korjaat sen usein lopulta itse.', 'process'),
      s('Kukaan ei mielestäsi tee töitä yhtä hyvin kuin sinä.', 'problem'),
      s('Pidät tärkeät työt itselläsi, jotta laatu pysyy.', 'process'),
      s('Työntekijät tai kumppanit odottavat päätöstäsi pienissäkin asioissa.', 'pitch'),
      s('Sinun on vaikea luottaa siihen, että muut tekevät oikeat ratkaisut.', 'protect'),
      s('Hyvä tekijä on lähtenyt yllättäen, ja syy selvisi vasta jälkikäteen.', 'process'),
    ],
  },
  {
    id: 'promote', p: 'Promote', name: 'Markkinointi', phase: 'work',
    statements: [
      s('Itsesi esille tuominen tuntuu epämukavalta, joten jätät sen tekemättä.', 'problem'),
      s('Uudet asiakkaat tulevat lähes pelkästään suosittelujen kautta.', 'pricing'),
      s('Kerrot harvoin julkisesti yrityksestäsi tai sen tuloksista.', 'protect'),
      s('Ajattelet, että hyvä työ myy itse itsensä.', 'problem'),
      s('Markkinoit vain silloin, kun töitä on vähän.', 'predicament'),
      s('Et ole koskaan tehnyt suunnitelmallista maksettua mainontaa.', 'predicament'),
    ],
  },
  {
    id: 'process', p: 'Process', name: 'Prosessit', phase: 'work',
    statements: [
      s('Teet yrityksessäsi enemmän tunteja kuin kukaan muu.', 'protect'),
      s('Olet ylpeä siitä, että teet eniten töitä.', 'people'),
      s('Ratkaiset ongelmat yleensä tekemällä enemmän töitä.', 'predicament'),
      s('Yritys pyörii, koska sinä jaksat, ei siksi, että sillä on toimivat rutiinit.', 'people', 'pitch'),
      s('Teet säännöllisesti iltoja ja viikonloppuja, jotta työt valmistuvat.', 'protect', 'profit'),
      s('Toistuvista töistä ei ole kirjallisia ohjeita.', 'pitch'),
    ],
  },
  {
    id: 'predicament', p: 'Predicament', name: 'Riskit ja ennakointi', phase: 'owner',
    statements: [
      s('Uskot, että useimmat ongelmat ratkeavat ajan kanssa itsestään.', 'process'),
      s('Kun luvut heikkenevät, odotat niiden kääntyvän ilman toimenpiteitä.', 'path'),
      s('Siirrät vaikeita päätöksiä niin pitkälle kuin mahdollista.', 'protect'),
      s('Huomaat varoitusmerkit, mutta jäät katsomaan, mitä tapahtuu.', 'promote'),
      s('Yrityksessä on riski, jonka tunnet, mutta jolle et ole tehnyt mitään.', 'path'),
      s('Sinulla ei ole kirjoitettua varasuunnitelmaa pahan päivän varalle.', 'process'),
    ],
  },
  {
    id: 'path', p: 'Path', name: 'Suunta', phase: 'owner',
    statements: [
      s('Haluat yritykseltä yhtä aikaa vapautta, kasvua ja myyntivoittoa.', 'persona'),
      s('Et ole päättänyt, mihin yrityksen pitäisi pitkällä aikavälillä päätyä.', 'predicament'),
      s('Sinulla on käynnissä useita isoja tavoitteita yhtä aikaa.', 'persona'),
      s('Yrityksen suunta muuttuu useammin kuin kerran vuodessa.', 'predicament'),
      s('Sinulla on lista uusista liikeideoista, joita haluaisit vielä kokeilla.', 'problem'),
      s('Kun mietit yritystä viiden vuoden päästä, näet monta hyvin erilaista vaihtoehtoa.', 'predicament'),
    ],
  },
  {
    id: 'protect', p: 'Protect', name: 'Oma aika ja jaksaminen', phase: 'owner',
    statements: [
      s('Et ole pitänyt yli viikon lomaa kahteen vuoteen.', 'process'),
      s('Et osaa erottaa itseäsi ja yritystäsi toisistaan.', 'product'),
      s('Työ ja vapaa-aika sekoittuvat lähes joka päivä.', 'process'),
      s('Läheiset ihmiset ovat jääneet yrityksen jalkoihin.', 'process', 'profit'),
      s('Sinulla ei juuri ole elämää yrityksen ulkopuolella.', 'product'),
      s('Yrityksen myyminen tai lopettaminen tuntuisi kuin menettäisit osan itsestäsi.', 'product'),
    ],
  },
];

/** Pysyvä järjestys: näyttöjärjestys ja tasapisteiden ratkaisu. */
export const ORDER: readonly PId[] = LEVERS.map(l => l.id);
export const LEVER_BY_ID = Object.fromEntries(LEVERS.map(l => [l.id, l])) as Record<PId, Lever>;

/** Kaikki väittämät yhtenä listana: indeksi = vastauksen paikka. */
export const FLAT = LEVERS.flatMap(l => l.statements.map(st => ({ lever: l.id, ...st })));
export const TOTAL_Q = FLAT.length;
export const PER_SECTION = 6;

/** Vastausasteikko: 0 = täysin eri mieltä … 6 = täysin samaa mieltä. Samaa mieltä = heikkous. */
export const SCALE = [
  'Täysin eri mieltä', 'Eri mieltä', 'Jokseenkin eri mieltä', 'En samaa enkä eri mieltä',
  'Jokseenkin samaa mieltä', 'Samaa mieltä', 'Täysin samaa mieltä',
] as const;
export type Answer = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// --- Tasot ---

export type LevelKey = 'self' | 'operator' | 'owner';
export type Level = { key: LevelKey; name: string; min: number; max: number; tag: string; blurb: string; climbTitle: string; climb: string };

export const LEVELS: readonly Level[] = [
  {
    key: 'self', name: 'Itsensätyöllistäjä', min: 0, max: 40, tag: 'Yritys omistaa sinut.',
    blurb: 'Yritys on olemassa, mutta se elää sinun päässäsi eikä rutiineissa. Samat tulipalot syttyvät viikosta toiseen, vain eri asussa.',
    climbTitle: 'Näin pääset Pyörittäjäksi',
    climb: 'Valitse yksi tavoite ja yksi pullonkaula. Ota käyttöön viikoittainen rytmi. Nosta heikoin osa-alueesi pois punaiselta, niin arki kevenee nopeasti.',
  },
  {
    key: 'operator', name: 'Pyörittäjä', min: 41, max: 80, tag: 'Pyörität kovaa, mutta kaikki kulkee sinun kauttasi.',
    blurb: 'Sinulla on tekijöitä tai kumppaneita, mutta suunta ja päätökset tulevat sinulta. Yksi vahva osa-alue lisää vakauttaisi koko yrityksen.',
    climbTitle: 'Näin pääset Omistajaksi',
    climb: 'Tee yhdestä heikosta osa-alueesta aidosti vahva. Tee myynnistä ja markkinoinnista toistettavaa. Anna yksi oikea vastuu pois, jotta muut eivät odota sinua joka asiassa.',
  },
  {
    key: 'owner', name: 'Omistaja', min: 81, max: 120, tag: 'Johdat yritystä etkä vain tee töitä siinä.',
    blurb: 'Yritys pyörii ilman, että kaikki kulkee sinun kauttasi. Nyt kannattaa vahvistaa heikointa kohtaa ennen kuin se pettää.',
    climbTitle: 'Näin pysyt huipulla',
    climb: 'Nosta rimaa yhdessä osa-alueessa kerrallaan. Rakenna ympärillesi ihmiset, jotka osaavat kehittää toimintaa eivätkä vain toteuttaa sitä.',
  },
];

// --- Osa-alueen tila (0–100) ---

export type Zone = 'red' | 'gold' | 'strong';
export const ZONES: Record<Zone, { label: string; min: number }> = {
  red: { label: 'Vaatii työtä', min: 0 },
  gold: { label: 'Kehittymässä', min: 40 },
  strong: { label: 'Vahvuus', min: 70 },
};

// --- Yrittäjätyypit: yksi jokaiselle osa-alueelle; heikoin osa-alue määrää tyypin ---

export type Archetype = {
  name: string;
  oneLine: string;
  narrative: [string, string];
  strengths: [string, string, string];
  warnings: string[];
  nextMove: string;
  /** Kun osa-alue on vastaajan vahvin. */
  strongest: string;
  /** Kun osa-alue on toiseksi heikoin. */
  shadow: string;
};

export const ARCHETYPES: Record<PId, Archetype> = {
  pricing: {
    name: 'Mukava tyyppi',
    oneLine: 'Hinnoittelet reilusti – niin reilusti, että maksat erotuksen itse.',
    narrative: [
      'Asiakkaat luottavat sinuun, koska kohtelet heitä reilusti. Se on aito vahvuus, ja sen varaan on rakentunut paljon.',
      'Jokainen ylimääräinen alennus ja ilmainen lisätyö on kuitenkin pois jostain: omasta palkastasi, seuraavasta rekrytoinnista tai markkinoinnista. Reiluus ei vaadi alhaista hintaa. Se vaatii, että asiakas saa sen, mistä maksaa.',
    ],
    strengths: [
      'Asiakkaat luottavat sanaasi, ja se lyhentää kauppoja.',
      'Asiakassuhteesi kestävät vuosia.',
      'Kun hinnoittelu korjataan, tulos paranee nopeasti, koska kysyntää on jo.',
    ],
    warnings: [
      'Annat alennuksen ennen kuin asiakas ehtii pyytää.',
      'Edellisestä hinnankorotuksesta on aikaa.',
      'Perustelet alhaista hintaa reiluudella etkä laskelmilla.',
      'Parhaat ja huonoimmat asiakkaasi maksavat lähes saman verran.',
      'Täyden hinnan pyytäminen tuntuu vatsanpohjassa.',
    ],
    nextMove: 'Nosta kannattamattomimman palvelusi hintaa 10–15 % ja ilmoita siitä 30 päivää etukäteen. Seuraa, kuka oikeasti lähtee.',
    strongest: 'Pidät hinnoistasi kiinni, ja se näkyy katteessa.',
    shadow: 'Sama kiltteys, joka pitää hinnat alhaalla, vaikuttaa myös tähän osa-alueeseen.',
  },
  persona: {
    name: 'Kaikkien kauppa',
    oneLine: 'Osaat palvella lähes ketä tahansa – siksi kukaan ei muista sinua ensimmäisenä.',
    narrative: [
      'Monipuolisuutesi on todellista. Alussa kaikkeen suostuminen piti yrityksen pystyssä, ja asiakkaat tietävät, että saat asiat hoidettua.',
      'Markkina ei kuitenkaan maksa monipuolisuudesta. Se maksaa siitä, kenen nimi tulee mieleen tietyn ongelman kohdalla. Jokainen huonosti sopiva asiakas vie aikaa niiltä, jotka maksaisivat sinulle eniten.',
    ],
    strengths: [
      'Ratkaiset ongelmia, joista moni muu kieltäytyy.',
      'Asiakkaat tuovat sinulle uusia tarpeita ilman kilpailutusta.',
      'Kun valitset kohderyhmän, sinulla on siitä enemmän kokemusta kuin erikoistuneilla kilpailijoilla.',
    ],
    warnings: [
      'Parhaan asiakkaasi kuvaaminen yhdellä lauseella ei onnistu.',
      'Verkkosivuillasi on pitkä lista palveluja.',
      'Otat töitä, jotka eivät sovi sinulle, koska raha on tarjolla.',
      'Suosittelijat kuvaavat sinua ihmiseksi, joka tekee vähän kaikkea.',
      'Lähes jokainen työ vaatii oman räätälöidyn tarjouksen.',
    ],
    nextMove: 'Käy läpi viimeiset 20 asiakasta ja järjestä ne katteen mukaan. Kuvaa kolme parasta yhdellä lauseella ja suuntaa markkinointi vain heille 90 päivän ajan.',
    strongest: 'Tiedät tarkasti, kenelle teet töitä. Se helpottaa kaikkea muuta.',
    shadow: 'Kaikkeen suostuminen vaikuttaa myös tähän osa-alueeseen ja kasvattaa sen hintaa.',
  },
  problem: {
    name: 'Taiteilija',
    oneLine: 'Teet hienoa työtä – mutta et aina sitä, mistä asiakas on valmis maksamaan.',
    narrative: [
      'Laatusi on aitoa, ja sen huomaavat asiakkaat ovat sinulle uskollisia. Ammattiylpeys on syy siihen, että työsi erottuu.',
      'Asiakas ei kuitenkaan osta käsityötä. Hän ostaa ratkaisun ongelmaan, joka hänellä jo on. Jos työsi ei ole nopein tie siihen, laatu ei näy laskulla. Kiire ja kipu myyvät, viimeistely ei.',
    ],
    strengths: [
      'Laatusi tekee asiakkaista suosittelijoita.',
      'Näet ratkaisuja, joita muut eivät huomaa.',
      'Kun osaaminen suunnataan oikeaan ongelmaan, sitä on vaikea kopioida.',
    ],
    warnings: [
      'Kuvaat ostamatta jättäneitä asiakkaita ihmisiksi, jotka eivät ymmärrä.',
      'Myyntikeskustelut muuttuvat opetustuokioiksi.',
      'Lisäät laatua, jota ostaja ei huomaa eikä maksa.',
      'Liikevaihto ei ole kasvanut samaa tahtia kuin työn laatu.',
      'Helposti myyvät asiat ärsyttävät sinua hiukan.',
    ],
    nextMove: 'Kysy viideltä viimeisimmältä asiakkaalta yksi kysymys: minkä ongelman takia ostit? Rakenna seuraava tarjous heidän sanoistaan, ei omistasi.',
    strongest: 'Ratkaiset ongelmia, joista asiakkaat ovat valmiita maksamaan. Se on kaiken perusta.',
    shadow: 'Sama tekemisen ilo ohjaa myös tätä osa-aluetta – välillä laskutuksen kustannuksella.',
  },
  product: {
    name: 'Keräilijä',
    oneLine: 'Et raaski lopettaa mitään, minkä olet joskus aloittanut.',
    narrative: [
      'Saat asioita aikaan. Moni valikoimasi palvelu oli aikanaan oikea veto, ja osa niistä kantoi yritystä vaikeiden vuosien yli.',
      'Jokainen vanha palvelu vie silti yhä aikaa, osaamista ja huomiota – ja tilaa asiakkaan mielessä. Kun valikoima on pitkä, kukaan ei enää tiedä, missä olet paras. Karsiminen ei ole luopumista vaan tilan tekemistä parhaalle.',
    ],
    strengths: [
      'Saat asioita valmiiksi ja markkinoille.',
      'Tunnet asiakkaasi ja valikoimasi historian paremmin kuin kukaan.',
      'Ensimmäiset asiakkaasi ovat yhä mukana.',
    ],
    warnings: [
      'Perustelet palvelua sillä, että joku vielä käyttää sitä.',
      'Uudet ideat saavat vain sen huomion, mikä jää yli.',
      'Pääpalvelusi nimeäminen vie hetken.',
      'Palvelun lopettamisesta puhutaan, mutta päätös siirtyy.',
      'Hinnastosi tarvitsee selityksen.',
    ],
    nextMove: 'Laske jokaiselle palvelulle kate suhteessa siihen käytettyyn aikaan. Lopeta heikoin tällä neljänneksellä. Vain yksi.',
    strongest: 'Tarjontasi on selkeä ja kannattava. Pidä siitä kiinni, kun korjaat muuta.',
    shadow: 'Sama kiintymys, joka pitää vanhat palvelut hengissä, pitää kiinni myös tässä.',
  },
  profit: {
    name: 'Uhrautuja',
    oneLine: 'Kaikki saavat rahansa ajallaan – paitsi sinä.',
    narrative: [
      'Olet antelias, ja se näkyy. Palkat on maksettu, toimittajat saavat rahansa ja asiakkaat joustoa. Ihmiset pysyvät ympärilläsi juuri siksi.',
      'Kaiken tämän rahoittaa kuitenkin yksi tili: sinun. Jokainen jousto, jonka annat muille, on jousto, jonka otat itseltäsi. Yritys, joka ei pysty maksamaan omistajalleen, ei ole antelias – sitä tuetaan.',
    ],
    strengths: [
      'Tiimisi ja kumppanisi luottavat sinuun syvästi.',
      'Toimit säästeliäästi, joten tulos paranee nopeasti, kun rahavirrat korjataan.',
      'Ihmiset joustavat puolestasi, koska sinä joustit ensin.',
    ],
    warnings: [
      'Olet jättänyt oman palkkasi väliin viimeisen puolen vuoden aikana.',
      'Yrityksen kuluja menee henkilökohtaiselta kortiltasi.',
      'Asiakkaillasi on paremmat maksuehdot kuin sinulla.',
      'Oma palkkasi ei ole kiinteä rivi budjetissa.',
      'Lasket kassaa öisin päässäsi.',
    ],
    nextMove: 'Tee omasta palkastasi kiinteä kuluerä tällä viikolla ja maksa se ensimmäisenä, vaikka summa olisi pieni. Katso, mikä oikeasti menee rikki.',
    strongest: 'Rahat ovat hallinnassa ja maksat itsellesi kuin omistaja. Se antaa aikaa korjata muuta.',
    shadow: 'Sama itsensä viimeiseksi laittaminen näkyy myös tässä osa-alueessa.',
  },
  pitch: {
    name: 'Myyntitykki',
    oneLine: 'Myyt mitä tahansa – paitsi yritystä, joka myisi ilman sinua.',
    narrative: [
      'Myyntitaitosi on aito. Luet tilanteen, vastaat vastaväitteisiin ennen kuin niitä esitetään ja saat kaupat kotiin. Moni asia yrityksessä on rakentunut sen varaan.',
      'Ongelma on siinä, missä taito asuu. Kun lähes jokainen kauppa kulkee sinun kauttasi, myynti pysähtyy aina, kun olet muualla. Se ei ole myyntikone vaan esitys, ja esitys loppuu, kun esiintyjä lähtee lavalta.',
    ],
    strengths: [
      'Kuulet asiakkaan todellisen huolen sanojen takaa.',
      'Pystyt pitämään hinnasta kiinni.',
      'Paras myyntimallisi on jo olemassa – se pitää vain kirjoittaa auki.',
    ],
    warnings: [
      'Myynti hidastuu, kun olet lomalla tai matkoilla.',
      'Myyntipuhetta ei ole kirjattu.',
      'Otat kaupat takaisin itsellesi, koska muut eivät kuulosta oikealta.',
      'Myyntiputki on sinun päässäsi.',
      'Sanot usein: hoidan tämän itse, se on nopeampaa.',
    ],
    nextMove: 'Nauhoita seuraavat viisi myyntipuhelua ja litteroi ne. Niistä syntyy ensimmäinen versio myyntimallista, jota joku muu voi käyttää.',
    strongest: 'Osaat pyytää kauppaa täydellä hinnalla. Käytä samaa voimaa heikoimpaan osa-alueeseen.',
    shadow: 'Sama kaiken itse hoitaminen jatkuu myös tässä osa-alueessa.',
  },
  people: {
    name: 'Yksinpelaaja',
    oneLine: 'Kukaan ei tee sitä yhtä hyvin kuin sinä – siksi teet kaiken itse.',
    narrative: [
      'Vaatimustasosi on korkea, ja moni asiakas on tullut juuri sen takia. Tiedät, miltä hyvä työ näyttää.',
      'Kun vain sinä yllät omaan vaatimustasoosi, yritys ei voi kasvaa yhtään sinua suuremmaksi. Delegointi, joka päättyy siihen, että korjaat työn itse, opettaa muille vain sen, että lopulta sinä hoidat sen.',
    ],
    strengths: [
      'Tiedät tarkalleen, miltä hyvä lopputulos näyttää.',
      'Osaat itse kaikki työvaiheet, joten osaat myös opettaa ne.',
      'Kun annat vastuuta, laatutasosi siirtyy koko tiimiin.',
    ],
    warnings: [
      'Korjaat muiden työt omin käsin.',
      'Muut odottavat hyväksyntääsi pienissäkin asioissa.',
      'Lomailu on vaikeaa, koska muut eivät pärjää ilman sinua.',
      'Hyviä tekijöitä on lähtenyt yllättäen.',
      'Sanot usein, että on nopeampi tehdä itse.',
    ],
    nextMove: 'Valitse yksi viikoittain sinulle palaava päätös ja anna se kokonaan toiselle selkein rajoin. Älä korjaa lopputulosta neljään viikkoon.',
    strongest: 'Ihmiset ympärilläsi kantavat vastuuta. Se on harvinaista ja arvokasta.',
    shadow: 'Sama vaikeus päästää irti näkyy myös tässä osa-alueessa.',
  },
  promote: {
    name: 'Piilohelmi',
    oneLine: 'Työsi on hyvää, mutta harva tietää sinusta.',
    narrative: [
      'Asiakkaasi ovat tyytyväisiä ja suosittelevat sinua. Maineesi on rakentunut tekemällä, ei puhumalla, ja se on vahva perusta.',
      'Suosittelut eivät kuitenkaan ole kasvusuunnitelma. Kun et näy, parhaat mahdolliset asiakkaat valitsevat jonkun, joka näkyy – vaikka hän tekisi heikompaa työtä.',
    ],
    strengths: [
      'Maineesi perustuu oikeisiin tuloksiin.',
      'Suosittelijasi ovat aitoja ja uskottavia.',
      'Sinulla on paljon kerrottavaa, kun alat kertoa.',
    ],
    warnings: [
      'Uudet asiakkaat tulevat lähes pelkästään suosittelujen kautta.',
      'Markkinointia tehdään vain, kun töitä on vähän.',
      'Verkossa sinusta näkyy vähän.',
      'Esille tuleminen tuntuu kehuskelulta.',
      'Et tiedä, mistä seuraavan kuukauden asiakkaat tulevat.',
    ],
    nextMove: 'Valitse yksi kanava ja julkaise siellä kerran viikossa 90 päivän ajan: asiakastarina, ennen ja jälkeen -esimerkki tai yksi neuvo. Seuraa yhteydenottoja.',
    strongest: 'Asiakkaat löytävät sinut tasaisesti. Se kantaa koko yritystä.',
    shadow: 'Sama näkymättömyys vaikuttaa myös tähän osa-alueeseen.',
  },
  process: {
    name: 'Työjuhta',
    oneLine: 'Yritys pyörii, koska sinä jaksat – ei siksi, että se toimisi ilman sinua.',
    narrative: [
      'Työmoraalisi on poikkeuksellinen, ja yritys on rakennettu sen varaan. Kukaan ei voi syyttää sinua laiskuudesta.',
      'Lisää tunteja ei kuitenkaan ole strategia. Kun ratkaisu jokaiseen ongelmaan on oma jaksamisesi, yrityksellä on katto: sinun vuorokautesi. Rutiinit ja ohjeet tekevät saman työn ilman, että se maksaa sinulle illat ja viikonloput.',
    ],
    strengths: [
      'Saat asiat tehtyä silloinkin, kun muut luovuttavat.',
      'Tunnet jokaisen työvaiheen omakohtaisesti.',
      'Kun työsi kirjataan ohjeiksi, niistä tulee käytännöllisiä ja toimivia.',
    ],
    warnings: [
      'Teet säännöllisesti iltoja ja viikonloppuja.',
      'Toistuvista töistä ei ole kirjallisia ohjeita.',
      'Ratkaiset ongelmat tekemällä enemmän.',
      'Väsymyksestä on tullut normaali olotila.',
      'Jos sairastut viikoksi, moni asia pysähtyy.',
    ],
    nextMove: 'Kirjoita ohje sille työlle, joka keskeyttää sinut useimmin. Anna se toiselle tekijälle ja korjaa ohjetta, älä työtä.',
    strongest: 'Yritykselläsi on toimivat rutiinit. Työ valmistuu ilman, että kannat sitä.',
    shadow: 'Sama kaiken kantaminen omilla harteilla näkyy myös tässä osa-alueessa.',
  },
  predicament: {
    name: 'Toiveikas',
    oneLine: 'Uskot, että asiat järjestyvät – ja siksi ne jäävät hoitamatta.',
    narrative: [
      'Optimismisi on kantanut sinut monen vaikean hetken yli. Usko tulevaan on yrittäjälle välttämätöntä.',
      'Toivo ei kuitenkaan ole suunnitelma. Kun varoitusmerkit selitetään parhain päin, pienet ongelmat ehtivät kasvaa isoiksi. Vaikea päätös ei helpotu odottamalla – se vain kallistuu.',
    ],
    strengths: [
      'Pysyt rauhallisena, kun muut hätääntyvät.',
      'Saat ihmiset uskomaan tulevaan.',
      'Kun teet päätöksen, sitoudut siihen.',
    ],
    warnings: [
      'Vaikeat päätökset siirtyvät kuukausilla.',
      'Selität heikot luvut tilapäisiksi.',
      'Varasuunnitelmaa ei ole paperilla.',
      'Tiedät riskin, mutta et ole tehnyt sille mitään.',
      'Odotat, että tilanne korjaantuu itsestään.',
    ],
    nextMove: 'Kirjoita ylös kolme suurinta riskiä ja päätä jokaiselle yksi toimenpide ja päivämäärä. Tee ensimmäinen tällä viikolla.',
    strongest: 'Tartut ongelmiin ajoissa. Se säästää rahaa ja hermoja.',
    shadow: 'Sama odottaminen näkyy myös tässä osa-alueessa.',
  },
  path: {
    name: 'Haaveilija',
    oneLine: 'Haluat kaiken yhtä aikaa – ja siksi mikään ei etene.',
    narrative: [
      'Näet mahdollisuuksia, joita muut eivät näe, ja innostuksesi vetää ihmisiä mukaan. Kunnianhimo sai yrityksen alulle.',
      'Elämäntapayritys, kasvuyritys ja myytävä yritys rakennetaan kuitenkin eri tavoin alusta asti. Kun tavoittelet kaikkia, jokainen päätös vetää eri suuntaan. Suunnan valitseminen ei kavenna unelmaa – se tekee siitä mahdollisen.',
    ],
    strengths: [
      'Näet tulevaisuuden, ja ihmiset haluavat lähteä mukaan.',
      'Huomaat mahdollisuudet ennen muita.',
      'Kun valitset suunnan, innostuksesi tekee sinusta vaikean kilpailijan.',
    ],
    warnings: [
      'Vastauksesi viiden vuoden tavoitteeseen vaihtelee kysyjän mukaan.',
      'Olet aloittanut tänä vuonna enemmän kuin saanut valmiiksi.',
      'Tiimisi ei osaa kertoa, mihin yritys on menossa.',
      'Uusi idea vie huomion edelliseltä.',
      'Pidät vaihtoehdot auki ja kutsut sitä strategiaksi.',
    ],
    nextMove: 'Kirjoita yksi 12 kuukauden tavoite ja kolme asiaa, joita et nyt tavoittele. Näytä lista tiimillesi tai kumppanillesi.',
    strongest: 'Tiedät, mihin olet yritystä viemässä. Se ohjaa kaikkia muita päätöksiä.',
    shadow: 'Sama päättämättömyys suunnasta heijastuu myös tähän osa-alueeseen.',
  },
  protect: {
    name: 'Kiinni kasvanut',
    oneLine: 'Yritys on sinä – ja siksi se vie sinulta kaiken.',
    narrative: [
      'Sitoutumisesi on aitoa. Olet antanut yritykselle vuosia, ja se näkyy sen laadussa ja asiakassuhteissa.',
      'Kun yritys ja oma elämä sulautuvat yhteen, kumpikaan ei saa tarvitsemaansa. Lepo, läheiset ja oma aika eivät ole palkinto, jonka ansaitset joskus – ne ovat edellytys sille, että jaksat johtaa yritystä vielä vuosia.',
    ],
    strengths: [
      'Sitoutumisesi näkyy asiakkaille ja tiimille.',
      'Tunnet yrityksesi läpikotaisin.',
      'Kun opit irrottautumaan, yrityksen arvo kasvaa, koska se ei ole enää sinusta kiinni.',
    ],
    warnings: [
      'Viimeisestä yli viikon lomasta on vuosia.',
      'Vastaat työpuhelimeen myös lomalla.',
      'Läheiset ovat jääneet työn jalkoihin.',
      'Et tiedä, kuka olisit ilman yritystä.',
      'Harrastukset ovat jääneet.',
    ],
    nextMove: 'Varaa seuraavalle kuukaudelle yksi työpäivä ilman puhelinta ja sovi, kuka hoitaa kiireelliset asiat. Katso, mitä tapahtuu.',
    strongest: 'Pystyt irrottautumaan, ja arki jatkuu. Yrityksesi kestää myös poissaolosi.',
    shadow: 'Sama sulautuminen yritykseen näkyy myös tässä osa-alueessa.',
  },
};

export type PlanStep = { task: string; done: string };

export type PlanEntry = {
  goal: string;
  steps: [PlanStep, PlanStep, PlanStep];
  metric: string;
};

export const PLAN_PHASES = [
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
      { task: 'Testaa yhdessä palvelussa tai tuotteessa kustannus- ja arvoperusteista hintaa uusissa tarjouksissa.', done: 'tarjoukset ja asiakkaiden päätökset on kirjattu.' },
      { task: 'Vertaa toteutunutta katetta ja sovi hinnan sekä alennusten tarkistusrytmi.', done: 'seuraavan tarkistuksen aika ja vastuuhenkilö on sovittu.' },
    ],
    metric: 'Tarkastellun palvelun toteutunut kate euroina ja prosentteina samalla laskentatavalla.',
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
    goal: 'Tärkeimmän palvelun ostoperuste perustuu asiakkaiden osoittamaan tarpeeseen.',
    steps: [
      { task: 'Keskustele viiden asiakkaan kanssa ostoon johtaneesta tilanteesta ja ratkaisemattoman ongelman vaikutuksista.', done: 'havainnot ja tärkein yhteinen ongelma on kirjattu.' },
      { task: 'Testaa ongelman kuvausta oikeissa myyntikeskusteluissa.', done: 'asiakkaiden perustelut ja päätökset on kirjattu.' },
      { task: 'Varmista toimituksen jälkeen, ratkesiko luvattu ongelma.', done: 'palaute on koottu ja palvelun kuvaus tarkistettu.' },
    ],
    metric: 'Niiden palautetta antaneiden asiakkaiden osuus, jotka vahvistavat sovitun ongelman ratkenneen.',
  },
  product: {
    goal: 'Yksi tärkeä palvelu tai tuote toimitetaan sovitulla sisällöllä ja laadulla.',
    steps: [
      { task: 'Kuvaa lupaus, sisältö, rajaukset ja toimituksen vaiheet.', done: 'palvelu mahtuu yhteen selkeään kuvaukseen.' },
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
      { task: 'Kuvaa tarvekartoitus, tarjouksen sisältö, päätösvaihe ja seuranta.', done: 'yhdelle palvelulle on yhteinen myyntirunko.' },
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
