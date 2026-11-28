import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SectionDock, type DockItem } from './SectionDock.tsx';
import './company.css';
import './company-light.css';
import './company-at.css';

// "Tietoa yrityksestä", Airtasker-henkinen vaalea ilme: valkoinen pohja, isot tiiviit otsikot,
// sininen ja laivastonsininen pinta, kelluvat käyttöliittymäkortit ja Get to Workin omat 3D-hahmot.
// Sisältö: Rasmuksen hyväksymä luonnos (28.11.2026) + Airtasker-malli (tarve -> työmääräys -> tarjoukset).

const EMAIL = 'rasmus@gettowork.fi';
const ORDER_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Työtilaus')}&body=${encodeURIComponent('Mitä pitää saada tehdyksi:\n\nMissä:\n\nMilloin:\n')}`;
const PARTNER_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Kumppaniksi')}`;
const IMG = '/img/tietoa';

/** Otsikko- ja leipätekstifontit (Anton Formulan tilalla, Manrope kuten Airtaskerilla). */
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;500;600;700&display=swap';
function useFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONTS_HREF;
    document.head.appendChild(l);
  }, []);
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Lisää [data-reveal]-elementeille luokan is-in, kun ne tulevat näkyviin (kerran). */
function useReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reduced() || !('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    items.forEach(i => io.observe(i));
    return () => io.disconnect();
  }, [root]);
}

/** Onko elementti tullut näkyviin (kerran). */
function useInView<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced() || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

const d = (n: number) => ({ '--d': `${n * 90}ms` } as CSSProperties);

const Check = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;

const ICONS: Record<string, string> = {
  box: 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
  calendar: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18',
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  cart: 'M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6',
  drop: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  thumb: 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3',
  ok: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  euro: 'M18 6.5a7 7 0 1 0 0 11M3 10h11M3 14h11',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
};
const Icon = ({ n }: { n: string }) => <svg className="at-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[n]} /></svg>;

const DOCK_ITEMS: DockItem[] = [
  { id: 'miksi', label: 'Miksi' },
  { id: 'mita-teemme', label: 'Mitä teemme' },
  { id: 'nain-se-toimii', label: 'Näin se toimii' },
  { id: 'kumppaneille', label: 'Kumppaneille' },
  { id: 'luottamus', label: 'Luottamus' },
  { id: 'visio', label: 'Visio' },
];

export function Company() {
  const root = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useFonts();
  useReveal(root);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  return <main ref={root} lang="fi" className="at co--light">
    <Hero headingRef={headingRef} />
    <Why />
    <WhatWeDo />
    <HowItWorks />
    <Partners />
    <Trust />
    <Vision />
    <Closing />
    <SectionDock items={DOCK_ITEMS} />
  </main>;
}

/** Kelluva käyttöliittymäkortti kuvan päällä (kuten Airtaskerin "Payment received"). */
function Float({ className, k, v, big }: { className: string; k: string; v?: string; big?: string }) {
  return <div className={`at-float ${className}`} aria-hidden="true">
    <span className="at-float__k">{k}</span>
    {(v || big) && <span className="at-float__row">{v && <span className="at-float__v">{v}</span>}{big && <b>{big}</b>}</span>}
  </div>;
}
const Pill = ({ className, icon, t, s }: { className: string; icon: string; t: string; s?: string }) =>
  <div className={`at-pill ${className}`} aria-hidden="true"><span className="at-pill__i"><Icon n={icon} /></span>{t}{s && <small>{s}</small>}</div>;

// --- Avaus -----------------------------------------------------------------------------

function Hero({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return <section className="at-hero" aria-labelledby="at-hero-title">
    <div className="at-hero__card">
      <img className="at-hero__fig at-hero__fig--l" src={`${IMG}/c07-pipo.webp`} alt="" />
      <img className="at-hero__fig at-hero__fig--r" src={`${IMG}/c02-lasit.webp`} alt="" />
      <div className="at-hero__inner">
        <p className="at-kicker">Get to Work</p>
        <h1 id="at-hero-title" ref={headingRef} tabIndex={-1} className="at-hero__title">
          <span>Mitä pitäisi</span> <span className="at-hero__accent">saada tehtyä?</span>
        </h1>
        <p className="at-hero__sub">Selitä tarpeesi. Saat tarjoukset. Työ tehdään.</p>
        <div className="at-hero__btns">
          <a className="at-btn at-btn--pri at-btn--wide" href={ORDER_HREF}>Kerro tarpeesi</a>
          <a className="at-btn at-btn--soft at-btn--wide" href={PARTNER_HREF}>Liity kumppaniksi</a>
        </div>
        <p className="at-hero__foot" lang="en">Prompt to done.</p>
      </div>
    </div>
  </section>;
}

// --- Miksi (sininen osio) --------------------------------------------------------------

function Why() {
  return <section id="miksi" className="at-band at-band--blue" aria-labelledby="at-why-title">
    <div className="at-wrap at-split">
      <div>
        <h2 id="at-why-title" className="at-h2" data-reveal>Työtä on. Tekijöitä on. Ne eivät vain löydä toisiaan.</h2>
        <p className="at-lead at-lead--on-blue" data-reveal>Etenkin pienillä ja keskisuurilla palveluyrityksillä on jatkuvasti töitä, joihin omat kädet eivät riitä. Samaan aikaan osaamista on käyttämättä: henkilöstöpalveluissa keikkojen välissä ja työpaikoilla, joissa kaikkea työaikaa ei tarvita.</p>
        <p className="at-lead at-lead--on-blue at-strong" data-reveal>Get to Work tuo nämä yhteen.</p>
      </div>
      <div className="at-media" data-reveal>
        <img className="at-media__img" src={`${IMG}/workspace.webp`} alt="Get to Workin tekijöitä saman pöydän ääressä." loading="lazy" />
        <Float className="at-float--tr" k="Uusi työmääräys" v="Varaston järjestely" big="2 pv" />
        <Pill className="at-pill--lime at-pill--ml" icon="bell" t="Uusi tarve saapui!" />
      </div>
    </div>
  </section>;
}

// --- Mitä teemme -----------------------------------------------------------------------

const SOURCES = [
  { img: 'c04-vaalea', t: 'Henkilöstöpalvelut', d: 'Vuokratyöntekijät kumppanimme kautta, muutamasta tunnista kuukausiin.' },
  { img: 'c06-luumu', t: 'Erikoistuneet kumppanit', d: 'Yritykset, jotka hoitavat oman alansa työt alusta loppuun.' },
  { img: 'c05-punakihara', t: 'Jaettu osaaminen', d: 'Työpaikkojen osaajat, joiden työaikaa on vapaana.' },
];

const JOB_TABS = [
  { k: 'Varasto ja logistiikka', icon: 'box', jobs: [['Varaston järjestely ja inventointi', 'Varasto'], ['Palautusten käsittely', 'Logistiikka']] },
  { k: 'Tapahtumat', icon: 'calendar', jobs: [['Messuosaston pystytys ja purku', 'Tapahtumat'], ['Avustajat kolmeksi päiväksi', 'Tapahtumat']] },
  { k: 'Toimitilat ja muutot', icon: 'home', jobs: [['Toimiston tyhjennys ja loppusiivous', 'Muutot'], ['Kalusteiden kokoaminen', 'Toimitilat']] },
  { k: 'Myymälät', icon: 'cart', jobs: [['Myymälän uudelleenjärjestely', 'Myymälät'], ['Kampanjan hyllytys', 'Myymälät']] },
  { k: 'Siivous ja ylläpito', icon: 'drop', jobs: [['Rakennussiivous', 'Siivous'], ['Kiinteistön ylläpitokierros', 'Kiinteistöt']] },
];

function WhatWeDo() {
  const [tab, setTab] = useState(0);
  return <section id="mita-teemme" className="at-band" aria-labelledby="at-what-title">
    <div className="at-wrap">
      <h2 id="at-what-title" className="at-h2 at-ink" data-reveal>Yksi alusta. Kaikki tarvittavat tekijät.</h2>
      <p className="at-lead" data-reveal>Sinun ei tarvitse tietää, tarvitsetko vuokratyöntekijän, alihankkijan vai tiimin. Riittää, että kerrot, mitä pitäisi saada tehtyä.</p>

      <div className="at-listbox" data-reveal>
        {SOURCES.map(s => <div key={s.t} className="at-listcard">
          <span className="at-listcard__img"><img src={`${IMG}/${s.img}.webp`} alt="" loading="lazy" /></span>
          <span><b>{s.t}</b><small>{s.d}</small></span>
        </div>)}
      </div>
      <p className="at-note" data-reveal><b>Emme ole keikka-alusta.</b> Tekijät tulevat aina työnantajilta ja henkilöstöpalveluista, joten heidän työsuhteensa ja turvansa pysyvät.</p>

      <h3 className="at-h3 at-ink" data-reveal>Katso, mitä muut saavat tehtyä</h3>
      <div className="at-tabs" role="tablist" aria-label="Esimerkkityöt" data-reveal>
        {JOB_TABS.map((t, i) => <button key={t.k} type="button" role="tab" aria-selected={tab === i}
          className={`at-tab${tab === i ? ' is-on' : ''}`} onClick={() => setTab(i)}>
          <Icon n={t.icon} />{t.k}
        </button>)}
      </div>
      <div key={tab} className="at-jobs" role="tabpanel">
        {JOB_TABS[tab].jobs.map(([t, c], i) => <div key={t} className="at-job" style={{ animationDelay: `${i * 90}ms` }}>
          <span className="at-job__c">{c}</span>
          <b className="at-job__t">{t}</b>
          <span className="at-job__f"><span className="at-star">★</span> Esimerkki</span>
        </div>)}
      </div>
    </div>
  </section>;
}

// --- Näin se toimii ---------------------------------------------------------------------

const STEPS = [
  { t: 'Selitä tarpeesi', d: 'Kuvaile työ omin sanoin. Tarpeen kertominen on maksutonta.' },
  { t: 'Saat tarjoukset', d: 'Teemme tarpeesta tarkan työmääräyksen, ja vahvistetut yritykset tekevät siihen vertailukelpoiset tarjoukset.' },
  { t: 'Valitse, ja työ tehdään', d: 'Työ kuitataan kuvin, ja maksat vasta, kun olet hyväksynyt sen.' },
];

function HowItWorks() {
  return <section id="nain-se-toimii" className="at-band at-band--tint" aria-labelledby="at-how-title">
    <div className="at-wrap">
      <h2 id="at-how-title" className="at-h2 at-ink" lang="en" data-reveal>Prompt. Plan. Done.</h2>
      <p className="at-lead" data-reveal>Ostat valmiin työn, et tunteja. Muualla kirjoitat ilmoituksen ja vertailet sekalaisia tarjouksia. Get to Workissa tarpeesi muuttuu ensin tarkaksi työmääräykseksi, joten tarjoukset ovat vertailukelpoisia.</p>
      <ol className="at-steps">
        {STEPS.map((s, i) => <li key={s.t} data-reveal style={d(i)}>
          <span className="at-steps__n">{i + 1}</span>
          <span><b>{s.t}</b><small>{s.d}</small></span>
        </li>)}
      </ol>
      <a className="at-btn at-btn--pri at-btn--block" href={ORDER_HREF} data-reveal>Kerro tarpeesi</a>
      <PromptDemo />
    </div>
  </section>;
}

// --- Kumppaneille (sininen osio) --------------------------------------------------------

const PARTNER_POINTS = [
  'Liittyminen on maksutonta',
  'Palkkio peritään vain toteutuneista töistä',
  'Valmiiksi määritellyt työmääräykset',
  'Lisää asiakkaita ilman omaa myyntiä',
];

function Partners() {
  return <section id="kumppaneille" className="at-band at-band--blue" aria-labelledby="at-partners-title">
    <div className="at-wrap at-split at-split--rev">
      <div className="at-media" data-reveal>
        <img className="at-media__img" src={`${IMG}/scene-camera.webp`} alt="Tekijä valmistelee työtä kannettavan tietokoneen ääressä." loading="lazy" />
        <Float className="at-float--tr" k="Tarjous hyväksytty!" v="Messuosaston pystytys" big="Ke 9.00" />
        <Pill className="at-pill--lime at-pill--br" icon="bell" t="Uusi työmääräys!" />
      </div>
      <div>
        <h2 id="at-partners-title" className="at-h2" data-reveal>Enemmän työtä. Vähemmän tyhjäkäyntiä.</h2>
        <p className="at-lead at-lead--on-blue" data-reveal>Henkilöstöyritys saa lisää keikkoja, erikoistunut yritys uusia asiakkaita ja työpaikka tuloa vapaasta työajasta. Tekijä saa lisää työtä ilman työpaikan vaihtoa.</p>
        <ul className="at-ticks" data-reveal>
          {PARTNER_POINTS.map(p => <li key={p}><Check />{p}</li>)}
        </ul>
        <p className="at-lead at-lead--on-blue" data-reveal>Etsimme myös myynnin ja projektien osaajia vaativampiin tehtäviin.</p>
        <a className="at-btn at-btn--white" href={PARTNER_HREF} data-reveal>Liity kumppaniksi <span aria-hidden="true">→</span></a>
      </div>
    </div>
    <div className="at-wrap">
      <div className="at-profile" data-reveal>
        <img className="at-profile__img" src={`${IMG}/cover-newcomer.webp`} alt="" loading="lazy" />
        <div>
          <p className="at-profile__tag">Kumppaniprofiili · esimerkki</p>
          <p className="at-profile__name">Varastopalvelu Oy</p>
          <p className="at-profile__spec">Osaaminen: varastotyöt, inventointi, pakkaus</p>
          <div className="at-badges">
            <span>Y-tunnus vahvistettu</span><span>Vakuutus</span><span>Työturvallisuuskortit</span>
          </div>
          <p className="at-profile__note">Jokaisella kumppanilla on profiili, jossa näkyvät vahvistukset ja asiakkaiden arviot.</p>
        </div>
      </div>
    </div>
  </section>;
}

// --- Luottamus -------------------------------------------------------------------------------

const TRUST = [
  { i: 'euro', t: 'Maksat vasta hyväksynnän jälkeen', d: 'Työ kuitataan kuvin, ja maksu tapahtuu vasta, kun olet tyytyväinen.' },
  { i: 'star', t: 'Arviot jokaisesta työstä', d: 'Arviosi vaikuttavat siihen, kuka saa seuraavat työt.' },
  { i: 'shield', t: 'Vahvistetut yritykset', d: 'Kumppaneilla on tehtävään sopiva osaaminen sekä tarvittavat luvat ja vakuutukset.' },
  { i: 'doc', t: 'Selvät vastuut', d: 'Tekijän työnantaja on aina hänen oma työnantajansa tai henkilöstöpalvelu. Hinta ja vastuut sovitaan ennen aloitusta.' },
  { i: 'users', t: 'Ihminen päättää', d: 'Teknologia auttaa löytämään oikeat tekijät, mutta valinnan tekee aina ihminen.' },
];

function Trust() {
  return <section id="luottamus" className="at-band" aria-labelledby="at-trust-title">
    <div className="at-wrap at-split">
      <div className="at-media at-media--tall" data-reveal>
        <img className="at-media__img" src={`${IMG}/cover-writer.webp`} alt="Tekijä kirjaa työn tietoja muistiin." loading="lazy" />
        <Pill className="at-pill--soft at-pill--b1" icon="thumb" t="Työ kuitattu" s="2 min sitten" />
        <Pill className="at-pill--soft at-pill--b2" icon="ok" t="Maksu hyväksytty" s="2 min sitten" />
      </div>
      <div>
        <h2 id="at-trust-title" className="at-h2 at-ink" data-reveal>Selvät vastuut. Ihminen päättää.</h2>
        <ul className="at-trust">
          {TRUST.map((t, i) => <li key={t.t} data-reveal style={d(i)}>
            <span className="at-trust__i"><Icon n={t.i} /></span>
            <span><b>{t.t}</b><small>{t.d}</small></span>
          </li>)}
        </ul>
        <p className="at-tagline" lang="en" data-reveal>People powered. AI assisted.</p>
      </div>
    </div>
  </section>;
}

// --- Visio -----------------------------------------------------------------------------------

function Vision() {
  return <section id="visio" className="at-band at-band--tint" aria-labelledby="at-vision-title">
    <div className="at-wrap">
      <h2 id="at-vision-title" className="at-h2 at-ink" data-reveal>Maailma, jossa asiat saadaan tehtyä.</h2>
      <p className="at-lead" data-reveal>Haluamme, että osaaminen liikkuu sinne, missä sitä tarvitaan. Yrityksillä on helpompi pääsy tekijöihin, ja ihmisillä on enemmän mahdollisuuksia käyttää osaamistaan.</p>
      <figure className="at-wide" data-reveal>
        <img src={`${IMG}/street.webp`} alt="Get to Workin tekijöitä kadulla toimiston edessä." loading="lazy" />
      </figure>
      <div className="at-share" data-reveal>
        <div>
          <p className="at-kicker at-kicker--blue">Jaettu osaaminen</p>
          <p className="at-share__big">Neljä päivää omassa työssä. Viides päivä toisen yrityksen avuksi.</p>
          <p className="at-small">Osaamisen jakaminen on aina työntekijälle vapaaehtoista ja perustuu selkeisiin sopimuksiin.</p>
        </div>
        <ShareWeek />
      </div>
      <div className="at-mv">
        <div className="at-mv__card" data-reveal><p className="at-kicker at-kicker--blue">Missio</p><p>Tehdä työn ostamisesta, järjestämisestä ja tekemisestä helpompaa.</p></div>
        <div className="at-mv__card at-mv__card--blue" data-reveal><p className="at-kicker">Visio</p><p>Yritysten tarpeet ja ihmisten osaaminen löytävät toisensa yhdellä viestillä.</p></div>
      </div>
    </div>
  </section>;
}

// --- Lopetus ---------------------------------------------------------------------------------

function Closing() {
  return <section className="at-close" data-section-dock-hide aria-labelledby="at-close-title">
    <div className="at-close__card">
      <img className="at-close__img" src={`${IMG}/storefront.webp`} alt="" loading="lazy" />
      <div className="at-close__inner">
        <h2 id="at-close-title" className="at-close__title">Selitä tarpeesi. Get to Work saa sen tehtyä.</h2>
        <div className="at-hero__btns">
          <a className="at-btn at-btn--pri at-btn--wide" href={ORDER_HREF}>Kerro tarpeesi</a>
          <a className="at-btn at-btn--soft at-btn--wide" href={PARTNER_HREF}>Liity kumppaniksi</a>
        </div>
        <p className="at-hero__foot" lang="en">Prompt to done.</p>
      </div>
    </div>
  </section>;
}
const PROMPTS = [
  {
    chip: 'Varasto', prompt: 'Varasto pitäisi järjestää ja inventoida ennen joulusesonkia.',
    plan: [['Työ', 'Järjestely ja inventointi, ohjeet valmiina'], ['Tekijät', '3 tekijää ja vastuuhenkilö'], ['Aikataulu', 'Kaksi päivää ensi viikolla'], ['Tarjoukset', '3 vertailukelpoista tarjousta']],
  },
  {
    chip: 'Tapahtuma', prompt: 'Messuosastolle tarvitaan kaksi avustajaa kolmeksi päiväksi.',
    plan: [['Työ', 'Rakennus, opastus ja purku'], ['Tekijät', '2 avustajaa'], ['Aikataulu', 'Messujen ajan'], ['Tarjoukset', '3 vertailukelpoista tarjousta']],
  },
  {
    chip: 'Toimitila', prompt: 'Toimisto pitää tyhjentää ja siivota muuton jälkeen.',
    plan: [['Työ', 'Tyhjennys, kierrätys ja loppusiivous'], ['Tekijät', 'Muuttotiimi ja siivooja'], ['Aikataulu', 'Muuttoa seuraavana päivänä'], ['Tarjoukset', '3 vertailukelpoista tarjousta']],
  },
] as const;

/** Esitys (ei lomake): tarve kirjoittuu, siitä rakentuu ehdotus ja lopuksi työ on tehty. */
function PromptDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [ex, setEx] = useState(0);
  const [run, setRun] = useState(0);
  const [typed, setTyped] = useState(0);
  const [stage, setStage] = useState(0); // 0 = Prompt, 1 = Plan, 2 = Done
  const [touched, setTouched] = useState(false);
  const text = PROMPTS[ex].prompt;

  useEffect(() => {
    if (!inView) return;
    if (reduced()) { setTyped(text.length); setStage(2); return; }
    setTyped(0); setStage(0);
    const timers: number[] = [];
    let i = 0;
    const iv = window.setInterval(() => {
      i += 1; setTyped(i);
      if (i >= text.length) {
        window.clearInterval(iv);
        timers.push(window.setTimeout(() => setStage(1), 450));
        timers.push(window.setTimeout(() => setStage(2), 450 + 4 * 320 + 700));
        if (!touched) timers.push(window.setTimeout(() => { setEx(e => (e + 1) % PROMPTS.length); setRun(r => r + 1); }, 450 + 4 * 320 + 700 + 3800));
      }
    }, 34);
    return () => { window.clearInterval(iv); timers.forEach(t => window.clearTimeout(t)); };
  }, [inView, ex, run, text, touched]);

  const choose = (i: number) => { setTouched(true); setEx(i); setRun(r => r + 1); };

  // Huom: data-reveal on erillisessä kääreessä. Reactin className-päivitys poistaisi muuten
  // näkyviin tulon is-in-luokan, ja koko esitys katoaisi vaiheen vaihtuessa.
  return <div data-reveal><div ref={ref} className={`co-prompt is-stage-${stage}`}>
    <ol className="co-prompt__stages" aria-hidden="true">
      {['Prompt.', 'Plan.', 'Done.'].map((k, i) => <li key={k} lang="en" className={stage >= i ? 'is-on' : ''}>{k}</li>)}
    </ol>
    <div className="co-prompt__box">
      <p className="co-label">Mitä pitäisi saada tehtyä?</p>
      <p className="co-prompt__text" aria-label={text}><span aria-hidden="true">{text.slice(0, typed)}</span><i className="co-prompt__caret" aria-hidden="true" /></p>
    </div>
    <div className="co-prompt__plan" aria-hidden={stage < 1}>
      {PROMPTS[ex].plan.map(([k, v], i) => <div key={`${run}-${k}`} className="co-prompt__card" style={{ '--i': i } as CSSProperties}>
        <span className="co-prompt__k">{k}</span><span className="co-prompt__v">{v}</span>
      </div>)}
    </div>
    <p className="co-prompt__done" aria-hidden={stage < 2}><Check /> Työ tehty.</p>
    <div className="co-prompt__chips" role="group" aria-label="Esimerkkitarpeet">
      {PROMPTS.map((p, i) => <button key={p.chip} type="button" className={`co-chip${i === ex ? ' is-on' : ''}`} aria-pressed={i === ex} onClick={() => choose(i)}>{p.chip}</button>)}
    </div>
    <p className="co-source">Esimerkki. Jokainen ehdotus ja hinta tehdään tarpeen mukaan.</p>
  </div></div>;
}


/** Kuvitus: neljä päivää omassa yrityksessä, viides toisen yrityksen avuksi. */
function ShareWeek() {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  return <div ref={ref} className={`co-share${inView ? ' is-in' : ''}`} aria-hidden="true">
    {['Ma', 'Ti', 'Ke', 'To', 'Pe'].map((day, i) => <div key={day} className={`co-share__day${i === 4 ? ' is-other' : ''}`} style={{ '--i': i } as CSSProperties}>
      <span className="co-share__k">{day}</span>
      <span className="co-share__bar"><span>{i === 4 ? 'Toinen yritys' : 'Oma yritys'}</span></span>
    </div>)}
  </div>;
}

