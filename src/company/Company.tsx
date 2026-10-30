import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { HOME_PATH, interceptClick } from '../router.ts';
import './company.css';

// "Tietoa yrityksestä" – Gettowork, the restart company. Sisältö perustuu strategiaan
// "Work. Build. Own." (lokakuu 2026); julkiselle sivulle on valittu esittelevät osat.
// Animaatiot ovat CSS:ää ja SVG:tä; näkyviin tulo IntersectionObserverilla.

const EMAIL = 'rasmus@gettowork.fi';
const TALK_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Restart – kerron yrityksestäni')}`;

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

function CountUp({ to, duration = 1600 }: { to: number; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.6);
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced()) { setValue(to); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref} aria-label={to.toLocaleString('fi-FI')}>{value.toLocaleString('fi-FI')}</span>;
}

const d = (n: number) => ({ '--d': `${n * 90}ms` } as CSSProperties);

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="co-eyebrow" data-reveal>{children}</p>;
}

export function Company() {
  const root = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useReveal(root);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  return <main ref={root} lang="fi" className="co">
    <Hero headingRef={headingRef} />
    <Category />
    <WhyNow />
    <TwoWorlds />
    <StartupVsRestart />
    <Roles />
    <Path />
    <ForWhom />
    <Playbook />
    <Partnership />
    <Network />
    <Fairness />
    <Closing />
  </main>;
}

// --- 1. Avaus ------------------------------------------------------------------

function Hero({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return <section className="co-hero" aria-labelledby="co-hero-title">
    <div className="co-hero__text">
      <p className="co-eyebrow co-eyebrow--lit is-in">Gettowork <span aria-hidden="true">/</span> The Restart Company</p>
      <h1 id="co-hero-title" ref={headingRef} tabIndex={-1} className="co-hero__title">
        <span className="co-hero__word" style={d(1)}>Work.</span>
        <span className="co-hero__word" style={d(3)}>Build.</span>
        <span className="co-hero__word co-hero__word--own" style={d(5)}>Own.</span>
      </h1>
      <p className="co-hero__lead" style={d(8)}>Vanhoille yrityksille uusi tulevaisuus.<br />Ihmisille uusi tie työstä omistajuuteen.</p>
      <p className="co-hero__motto" style={d(10)}>One for many. Many for one.</p>
    </div>
    <Orbit />
    <a className="co-scroll" href="#co-category" aria-label="Vieritä alas">
      <span aria-hidden="true" />
    </a>
  </section>;
}

function Orbit() {
  return <div className="co-orbit" aria-hidden="true">
    <div className="co-orbit__ring co-orbit__ring--1" />
    <div className="co-orbit__ring co-orbit__ring--2" />
    <div className="co-orbit__ring co-orbit__ring--3"><span className="co-orbit__dot co-orbit__dot--small" /></div>
    <div className="co-orbit__core" />
    <div className="co-orbit__spin"><span className="co-orbit__planet">G</span></div>
    <span className="co-block co-block--a" />
    <span className="co-block co-block--b" />
  </div>;
}

// --- 2. Uusi kategoria ----------------------------------------------------------

function Category() {
  return <section id="co-category" className="co-section" aria-labelledby="co-cat-title">
    <Eyebrow>Uusi kategoria</Eyebrow>
    <h2 id="co-cat-title" className="co-h2 co-strike" data-reveal>
      Ei <s style={d(2)}>startup</s>. Ei <s style={d(5)}>työnvälityspalvelu</s>.{' '}
      <span className="co-pop" style={d(9)}>Restart.</span>
    </h2>
    <div className="co-grid co-grid--wide">
      <div className="co-card co-card--glass" data-reveal style={d(1)}>
        <p className="co-card__big">Rakennamme vanhasta uutta. Jotain aitoa.</p>
        <p className="co-muted">Oikeita yrityksiä. Oikeita tekijöitä. Oikeaa omistajuutta.</p>
      </div>
      <div className="co-card co-card--blue" data-reveal style={d(3)}>
        <p className="co-label">Uskomme</p>
        <p className="co-card__big">Työ muuttuu. Mahdollisuuden omistaa on kasvettava.</p>
      </div>
    </div>
  </section>;
}

// --- 3. Miksi nyt ---------------------------------------------------------------

function WhyNow() {
  return <section className="co-section" aria-labelledby="co-why-title">
    <Eyebrow>Miksi nyt</Eyebrow>
    <h2 id="co-why-title" className="co-h2" data-reveal>Suomi on täynnä seuraavaa sukupolvea odottavia yrityksiä.</h2>
    <p className="co-lead" data-reveal>Omistajanvaihdos on talouden rakennemuutos. Samalla ihmiset etsivät uutta tapaa ansaita ja rakentaa.</p>
    <div className="co-grid">
      <div className="co-stat" data-reveal style={d(1)}>
        <p className="co-stat__n"><CountUp to={33000} /></p>
        <p className="co-stat__label">yritystä myynnin piirissä</p>
        <p className="co-muted co-small">Arvio seuraavan 10 vuoden aikana myyntiä suunnittelevista yrityksistä.*</p>
        <Dots />
      </div>
      <div className="co-stat" data-reveal style={d(3)}>
        <p className="co-stat__n"><CountUp to={28000} /></p>
        <p className="co-stat__label">harkitsee lopettamista</p>
        <p className="co-muted co-small">Arvio yrittäjistä, jotka harkitsevat toiminnan lopettamista seuraavan 10 vuoden aikana.*</p>
        <Dots />
      </div>
    </div>
    <p className="co-source" data-reveal>* Suomen Yrittäjien omistajanvaihdospoliittinen ohjelma (2025), Omistajanvaihdosbarometri 2024. Aikeita koskevia arvioita, ei toteutumia.</p>
  </section>;
}

/** Koriste: pisteruudukko syttyy aaltona. Ei kuvaa mitään osuutta. */
function Dots() {
  return <div className="co-dots" aria-hidden="true">
    {Array.from({ length: 48 }, (_, i) => <i key={i} className="on" style={{ '--i': i } as CSSProperties} />)}
  </div>;
}

// --- 4. Kaksi maailmaa ----------------------------------------------------------

function TwoWorlds() {
  return <section className="co-section" aria-labelledby="co-two-title">
    <Eyebrow>Mahdollisuus</Eyebrow>
    <h2 id="co-two-title" className="co-h2" data-reveal>Yhdellä on asiakkaat.<br />Toisella halu rakentaa.</h2>
    <p className="co-lead" data-reveal>Gettowork ratkaisee kohtaanto-ongelman: yritys tarvitsee uuden vaiheen, ihminen tarvitsee todellisen mahdollisuuden.</p>
    <div className="co-worlds" data-reveal>
      <div className="co-card co-card--glass co-worlds__a">
        <p className="co-label">Vanhan talouden yritys</p>
        <p className="co-card__big">Asiakkaat, osaaminen, historia.</p>
        <p className="co-muted">Kasvu, myynti tai jatkaja puuttuu. Omistaja ei halua aloittaa kaikkea alusta.</p>
      </div>
      <div className="co-venn" aria-hidden="true">
        <span className="co-venn__c co-venn__c--a" />
        <span className="co-venn__c co-venn__c--b" />
        <span className="co-venn__mid">Restart</span>
      </div>
      <div className="co-card co-card--blue co-worlds__b">
        <p className="co-label">Uuden ajan rakentaja</p>
        <p className="co-card__big">Energiaa, osaamista, tekoälyä.</p>
        <p>Ei välttämättä pääomaa, asiakkaita tai syytä perustaa uutta yritystä tyhjästä.</p>
      </div>
    </div>
  </section>;
}

// --- 5. Startup vs. Restart (vaihdettava) ---------------------------------------

const MODES = {
  startup: ['Keksi uusi idea', 'Rakenna tuote', 'Hanki ensimmäiset asiakkaat', 'Todista liiketoiminta'],
  restart: ['Etsi toimiva yritys', 'Ymmärrä mikä jo toimii', 'Uudista kasvu ja operointi', 'Rakenna polku omistajuuteen'],
} as const;

function StartupVsRestart() {
  const [mode, setMode] = useState<keyof typeof MODES>('restart');
  return <section className="co-section" aria-labelledby="co-svr-title">
    <Eyebrow>Ei aloiteta nollasta</Eyebrow>
    <h2 id="co-svr-title" className="co-h2" data-reveal>Startup luo kysyntää.<br /><span className="co-blue-text">Restart löytää sen jo valmiina.</span></h2>
    <p className="co-lead" data-reveal>Restart ei poista riskiä. Se vaihtaa riskin luonteen: kysyntäriskistä operointi- ja uudistamisriskiin.</p>
    <div className="co-toggle" role="tablist" aria-label="Vertailu" data-reveal>
      {(['startup', 'restart'] as const).map(m => <button key={m} type="button" role="tab" aria-selected={mode === m}
        className={`co-toggle__btn${mode === m ? ' is-on' : ''}`} onClick={() => setMode(m)}>{m === 'startup' ? 'Startup' : 'Restart'}</button>)}
      <span className={`co-toggle__thumb is-${mode}`} aria-hidden="true" />
    </div>
    <ol key={mode} className={`co-steps co-steps--${mode}`} role="tabpanel">
      {MODES[mode].map((s, i) => <li key={s} style={d(i)}><span className="co-steps__n">0{i + 1}</span>{s}</li>)}
    </ol>
  </section>;
}

// --- 6. Kolme roolia --------------------------------------------------------------

const ROLES = [
  { t: 'Työllistäjä', d: 'Mahdollistaa palkallisen työn ja osaamisen kasvun.' },
  { t: 'Restart-kumppani', d: 'Rakentaa yrityksille kasvua, järjestelmiä ja toimintakykyä.' },
  { t: 'Omistajuuden avaaja', d: 'Mahdollistaa tuloksiin perustuvan polun todelliseen omistajuuteen.' },
];

function Roles() {
  return <section className="co-section" aria-labelledby="co-roles-title">
    <Eyebrow>Operaattori, ei vain alusta</Eyebrow>
    <h2 id="co-roles-title" className="co-h2" data-reveal>Kolme roolia.<br />Yksi liiketoimintamalli.</h2>
    <ol className="co-roles">
      {ROLES.map((r, i) => <li key={r.t} className="co-role" data-reveal style={d(i)}>
        <span className="co-role__n">0{i + 1}</span>
        <span className="co-role__t">{r.t}</span>
        <span className="co-role__d">{r.d}</span>
      </li>)}
    </ol>
  </section>;
}

// --- 7. Tekijän polku: Work. Build. Own. ----------------------------------------

const PATH = [
  { k: 'Work.', t: 'Tee oikeaa työtä.', d: 'Palkka tai asianmukainen toimeksiantokorvaus. Ei ilmaista työpanosta.' },
  { k: 'Build.', t: 'Kasvata yrityksen arvoa.', d: 'Vastuu, tulosmittarit ja mahdollinen lisäpalkkio. Osaaminen kasvaa.' },
  { k: 'Own.', t: 'Osallistu arvonnousuun.', d: 'Erillisellä sopimuksella osakkeita tai optioita, kun näyttö ja ehdot ovat kunnossa.' },
];

function Path() {
  const [step, setStep] = useState(0);
  return <section className="co-section" aria-labelledby="co-path-title">
    <Eyebrow>Tekijän polku</Eyebrow>
    <h2 id="co-path-title" className="co-h2" data-reveal>Kaikkien ei tarvitse olla yrittäjiä.<br />Kaikilla voi olla mahdollisuus kasvaa.</h2>
    <p className="co-lead" data-reveal>Kolme askelta. Eri vastuut, eri korvaukset. Omistajuus on mahdollisuus, ei pakko.</p>
    <div className="co-path" data-reveal>
      <div className="co-stairs" aria-hidden="true">
        {PATH.map((p, i) => <span key={p.k} className={`co-stairs__step${i <= step ? ' is-on' : ''}`} style={{ '--h': `${(i + 1) * 33}%` } as CSSProperties} />)}
        <span className="co-stairs__climber" style={{ '--s': step } as CSSProperties} />
      </div>
      <div className="co-path__tabs" role="tablist" aria-label="Tekijän polku">
        {PATH.map((p, i) => <button key={p.k} type="button" role="tab" aria-selected={step === i}
          className={`co-path__tab${step === i ? ' is-on' : ''}`} onClick={() => setStep(i)} onMouseEnter={() => setStep(i)}>
          <span className="co-path__n">0{i + 1}</span>
          <span className="co-path__k">{p.k}</span>
          <span className="co-path__t">{p.t}</span>
          <span className="co-path__d">{p.d}</span>
        </button>)}
      </div>
    </div>
  </section>;
}

// --- 8. Kenelle Restart sopii ---------------------------------------------------

function ForWhom() {
  const yes = ['Toistuvaa B2B-kysyntää', 'Paikallinen asiakaskanta', 'Omistaja valmis yhteistyöhön', 'Todellinen kannattavuuspotentiaali'];
  const no = ['Romahtava kysyntä', 'Epäselvät vastuut ja velat', 'Vain omistajan varassa elävä myynti', 'Pakkomyynti ilman realistista korjausta'];
  return <section className="co-section" aria-labelledby="co-who-title">
    <Eyebrow>Kenelle Restart sopii</Eyebrow>
    <h2 id="co-who-title" className="co-h2" data-reveal>Tylsä on hyvä.<br />Rikkinäinen ei.</h2>
    <p className="co-lead" data-reveal>Etsimme vakaita palveluyrityksiä, joilla on asiakkaita, osaamista ja kehittämätöntä kasvupotentiaalia.</p>
    <div className="co-grid">
      <div className="co-card co-card--blue" data-reveal>
        <p className="co-label">Etsimme</p>
        <ul className="co-checks">{yes.map((t, i) => <li key={t} style={d(i + 2)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>{t}</li>)}</ul>
      </div>
      <div className="co-card co-card--glass" data-reveal style={d(1)}>
        <p className="co-label">Vältämme</p>
        <ul className="co-checks co-checks--no">{no.map((t, i) => <li key={t} style={d(i + 3)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" /></svg>{t}</li>)}</ul>
      </div>
    </div>
    <p className="co-source" data-reveal>Ensimmäinen rajaus: kiinteistö-, toimitila-, huolto- ja erikoispalvelujen pk-yritykset.</p>
  </section>;
}

// --- 9. Restart playbook: 180 päivää --------------------------------------------

const PHASES = [
  { days: '0–30', t: 'Discover', d: 'Taloustilanne, asiakkaat, kapasiteetti, riskit.', r: 'Selkeä lähtötaso' },
  { days: '31–90', t: 'Deploy', d: 'Myynti, CRM, palveluvalikoima ja automaatiot käyttöön.', r: 'Ensimmäiset tulokset' },
  { days: '91–180', t: 'Scale', d: 'Toistuva myynti, prosessit, vastuuhenkilöt ja raportointi.', r: 'Toistettava malli' },
];

function Playbook() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  return <section className="co-section" aria-labelledby="co-play-title">
    <Eyebrow>Restart playbook · 180 päivää</Eyebrow>
    <h2 id="co-play-title" className="co-h2" data-reveal>Ei konsulttiraporttia.<br /><span className="co-blue-text">Operatiivinen muutos.</span></h2>
    <p className="co-lead" data-reveal>Siirrymme analyysista suoraan toteutukseen. Tulos näkyy asiakkaissa, katteessa ja työn laadussa.</p>
    <div ref={ref} className={`co-timeline${inView ? ' is-in' : ''}`}>
      <div className="co-timeline__track" aria-hidden="true"><span className="co-timeline__fill" /><span className="co-timeline__spark" /></div>
      {PHASES.map((p, i) => <div key={p.t} className="co-phase" style={{ '--d': `${300 + i * 650}ms` } as CSSProperties}>
        <span className="co-phase__dot" aria-hidden="true" />
        <p className="co-phase__days">{p.days} <span className="co-muted">päivää</span></p>
        <p className="co-phase__t">{p.t}</p>
        <p className="co-muted">{p.d}</p>
        <p className="co-phase__r">{p.r}</p>
      </div>)}
    </div>
  </section>;
}

// --- 10. Kumppanuus ensin ja yhteistyön malli -----------------------------------

const MODEL = [
  { t: 'Restart Audit', d: 'Maksullinen nykytila-analyysi ja 90 päivän toteutussuunnitelma.' },
  { t: 'Operointipalkkio', d: 'Kuukausiveloitus kattaa toteutuksen, työpanoksen ja palvelun riskin.' },
  { t: 'Tulospalkkio', d: 'Erikseen sovittu osuus todennetusta lisäarvosta, ei automaattinen oikeus.' },
  { t: 'Omistusoptio', d: 'Mahdollinen osake- tai optiojärjestely vasta näytön ja erillisen sopimuksen jälkeen.' },
];

function Partnership() {
  return <section className="co-section" aria-labelledby="co-part-title">
    <Eyebrow>Ei tarvita yrityskauppaa</Eyebrow>
    <h2 id="co-part-title" className="co-h2" data-reveal>Kumppanuus ensin.<br />Omistus vasta myöhemmin.</h2>
    <p className="co-lead" data-reveal>Yhteistyö voi alkaa palvelusopimuksella. Näin pääomariski pysyy rajattuna.</p>
    <div className="co-flow" data-reveal>
      <div className="co-flow__node"><p className="co-label">Paikallinen yritys</p><p>Asiakkaat, toimituskyky ja sovittu kehitystavoite.</p></div>
      <span className="co-flow__arrow" aria-hidden="true"><i /><i /><i /></span>
      <div className="co-flow__node co-flow__node--core"><p className="co-label">Gettowork</p><p>Myy, johtaa ja mittaa Restart-toteutusta.</p></div>
      <span className="co-flow__arrow" aria-hidden="true"><i /><i /><i /></span>
      <div className="co-flow__node"><p className="co-label">Rakentajat</p><p>Toteuttavat työn palkalla tai sovitulla korvauksella.</p></div>
    </div>
    <p className="co-note" data-reveal>Mahdollinen jatko: erillinen neuvottelu omistusosuudesta, optiosta tai yrityskaupasta.</p>

    <h3 className="co-h3" data-reveal>Kassavirta ennen osakkeita</h3>
    <ol className="co-model">
      {MODEL.map((m, i) => <li key={m.t} className={`co-model__item${i === 3 ? ' is-blue' : ''}`} data-reveal style={d(i)}>
        <span className="co-model__n">0{i + 1}</span>
        <span className="co-model__t">{m.t}</span>
        <span className="co-model__d">{m.d}</span>
      </li>)}
    </ol>
  </section>;
}

// --- 11. Verkosto ------------------------------------------------------------------

function Network() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const nodes = [[50, 50], [18, 26], [82, 22], [22, 78], [80, 76], [50, 12], [50, 90], [8, 52], [92, 50]];
  const links = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [3, 6], [4, 6], [1, 7], [3, 7], [2, 8], [4, 8]];
  return <section className="co-section" aria-labelledby="co-net-title">
    <div className="co-net">
      <div>
        <Eyebrow>Verkosto on tuote</Eyebrow>
        <h2 id="co-net-title" className="co-h2" data-reveal>Yksi Restart tekee seuraavasta helpomman.</h2>
        <p className="co-lead" data-reveal>Kun järjestelmät, osaaminen ja tekijät ovat yhteisiä, verkoston arvo kasvaa yritys yritykseltä.</p>
        <ol className="co-net__steps">
          {['Yritys – ensimmäinen toimiva Restart-pilotti', 'Osaaminen – toistettavat prosessit, tekijät ja data', 'Verkosto – seuraavan yrityksen uudistaminen helpottuu'].map((t, i) =>
            <li key={t} data-reveal style={d(i)}><span>{i + 1}</span>{t}</li>)}
        </ol>
      </div>
      <div ref={ref} className={`co-graph${inView ? ' is-in' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 100 100">
          {links.map(([a, b], i) => <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} pathLength={1} style={{ '--i': i } as CSSProperties} />)}
        </svg>
        {nodes.map(([x, y], i) => <span key={i} className={`co-graph__node${i === 0 ? ' is-core' : ''}`} style={{ left: `${x}%`, top: `${y}%`, '--i': i } as CSSProperties} />)}
      </div>
    </div>
    <p className="co-motto" data-reveal><strong>One for many:</strong> yksi yritys avaa mahdollisuuksia monelle. <strong>Many for one:</strong> moni rakentaa yhtä.</p>
  </section>;
}

// --- 12. Reiluus ----------------------------------------------------------------------

const RULES = [
  { t: 'Ei ilmaista työtä', d: 'Työstä maksetaan. Omistus on mahdollinen lisä, ei palkattomuuden peruste.' },
  { t: 'Ei kuviteltua omistusta', d: 'Bonukset, optiot ja osakkeet eritellään. Veroseuraamukset selvitetään.' },
  { t: 'Ei työsuhteen kiertämistä', d: 'Sopimuksen nimi ei muuta työsuhteen tunnusmerkkejä.' },
  { t: 'Selkeät roolit', d: 'Työnantaja- ja palveluntuottajarooli vahvistetaan ennen jokaista pilottia.' },
];

function Fairness() {
  return <section className="co-section" aria-labelledby="co-fair-title">
    <Eyebrow>Vastuu ja reiluus</Eyebrow>
    <h2 id="co-fair-title" className="co-h2" data-reveal>Vallankumouksellinen malli.<br />Tavalliset velvollisuudet.</h2>
    <p className="co-lead" data-reveal>Omistus ei korvaa palkkaa, työsopimusta eikä hyvää hallintoa.</p>
    <div className="co-rules">
      {RULES.map((r, i) => <div key={r.t} className="co-rule" data-reveal style={d(i)}>
        <p className="co-rule__t">{r.t}</p>
        <p className="co-muted">{r.d}</p>
      </div>)}
    </div>
  </section>;
}

// --- 13. Lopetus ------------------------------------------------------------------------

function Closing() {
  return <section className="co-closing" aria-labelledby="co-close-title">
    <div className="co-closing__rings" aria-hidden="true"><span /><span /></div>
    <h2 id="co-close-title" className="co-closing__title" data-reveal>
      <span lang="en">We don’t need more startups.</span>
      <span lang="en" className="co-blue-text">We need more restarts.</span>
    </h2>
    <p className="co-closing__sub" data-reveal>Tunnetko yrityksen, joka ansaitsee uuden vaiheen? Tai haluatko itse rakentaa?</p>
    <div className="co-actions" data-reveal>
      <a className="co-btn co-btn--primary" href={TALK_HREF}>Kerro yrityksestäsi <span aria-hidden="true">→</span></a>
      <a className="co-btn" href={HOME_PATH} onClick={e => interceptClick(e, HOME_PATH, { rs: { view: 'intro', step: 0 } })}>Tee Restart-testi</a>
    </div>
    <div className="co-closing__foot" data-reveal>
      <span lang="en">Work. Build. Own.</span>
      <span lang="en">Forget jobs. Get to work.</span>
    </div>
  </section>;
}
