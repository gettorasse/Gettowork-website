import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { HOME_PATH, interceptClick } from '../router.ts';
import { SectionDock, type DockItem } from './SectionDock.tsx';
import './company.css';

// "Tietoa yrityksestä" – Gettowork, the restart company. Sisältö perustuu esitykseen
// "Work. Build. Grow." (lokakuu 2026); julkiselle sivulle on valittu esittelevät osat
// (sisäinen kannattavuuslaskelma, go-to-market ja 12 kk:n suunnitelma on jätetty pois).
// Animaatiot ovat CSS:ää ja SVG:tä; näkyviin tulo IntersectionObserverilla.

const EMAIL = 'rasmus@gettowork.fi';
const TALK_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Restart-kartoitus yritykselleni')}`;

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

// Luvut: jokainen osa-alue alkaa selkeällä väliotsikolla, ja sama luettelo ohjaa alareunan dockia.
const CHAPTERS = [
  { id: 'filosofia', label: 'Filosofia' },
  { id: 'miksi-nyt', label: 'Miksi nyt' },
  { id: 'kaksi-maailmaa', label: 'Kaksi maailmaa' },
  { id: 'restart-ajattelu', label: 'Restart-ajattelu' },
  { id: 'mita-teemme', label: 'Mitä Gettowork on' },
  { id: 'yrityksille', label: 'Yrityksille' },
  { id: 'kenelle', label: 'Kenelle Restart sopii' },
  { id: 'playbook', label: 'Restart playbook' },
  { id: 'yhteistyo', label: 'Ensimmäinen kauppa' },
  { id: 'esimerkki', label: 'Miltä Restart näyttää' },
  { id: 'hyodyt', label: 'Mitä asiakas saa' },
  { id: 'tekijoille', label: 'Tekijöille' },
  { id: 'verkosto', label: 'Verkosto' },
  { id: 'pelisaannot', label: 'Vastuu ja reiluus' },
] as const satisfies readonly DockItem[];
type ChapterId = (typeof CHAPTERS)[number]['id'];
const DOCK_ITEMS: DockItem[] = [...CHAPTERS];

/** Luvun väliotsikko: viiva, iso numero ja luvun nimi. */
function Chapter({ id }: { id: ChapterId }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.6);
  const i = CHAPTERS.findIndex(c => c.id === id);
  const n = String(i + 1).padStart(2, '0');
  return <div ref={ref} className={`co-chapter${inView ? ' is-in' : ''}`}>
    <span className="co-chapter__n" aria-hidden="true">{n}</span>
    <span className="co-chapter__name">
      <span className="co-chapter__k">Luku {n}</span>
      <span className="co-chapter__t">{CHAPTERS[i].label}</span>
    </span>
    <span className="co-chapter__of" aria-hidden="true">{n} / {CHAPTERS.length}</span>
  </div>;
}

/** Euroluku, joka laskee näkyviin tullessaan. */
function Euro({ to }: { to: number }) {
  return <><CountUp to={to} /><span className="co-unit">&nbsp;€</span></>;
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
    <Example />
    <Benefits />
    <Builders />
    <Network />
    <Fairness />
    <Closing />
    <SectionDock items={DOCK_ITEMS} />
  </main>;
}

// --- 01. Avaus ------------------------------------------------------------------

function Hero({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return <section className="co-hero" aria-labelledby="co-hero-title">
    <div className="co-hero__text">
      <p className="co-eyebrow co-eyebrow--lit is-in">Gettowork <span aria-hidden="true">/</span> The Restart Company</p>
      <h1 id="co-hero-title" ref={headingRef} tabIndex={-1} className="co-hero__title co-hero__title--two">
        <span className="co-hero__word" style={d(1)}>Vanha yritys.</span>
        <span className="co-hero__word co-hero__word--own" style={d(4)}>Uusi vaihde.</span>
      </h1>
      <p className="co-hero__lead" style={d(8)}>Autamme olemassa olevia yrityksiä uudistumaan: tuomme käyttöön uuden ajan osaamista, teknologiaa, tekoälyä, myyntiä, markkinointia, osaajia ja parempia toimintatapoja.</p>
      <p className="co-hero__motto" style={d(10)}>One for many. Many for one.</p>
    </div>
    <Orbit />
    <a className="co-scroll" href="#filosofia" aria-label="Vieritä alas">
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

// --- 02. Filosofia ----------------------------------------------------------------

function Category() {
  return <section id="filosofia" className="co-section" aria-labelledby="co-cat-title">
    <Chapter id="filosofia" />
    <h2 id="co-cat-title" className="co-h2 co-strike" data-reveal>
      Ei <s style={d(2)}>konsulttitoimisto</s>. Ei <s style={d(4)}>rekrytointialusta</s>. Ei <s style={d(6)}>startup-yhteisö</s>.{' '}
      <span className="co-pop" style={d(10)}>Restart company.</span>
    </h2>
    <div className="co-grid co-grid--wide">
      <div className="co-card co-card--glass" data-reveal style={d(1)}>
        <p className="co-card__big">Käytännön kehityskumppani.</p>
        <p className="co-muted">Autamme yrityksiä siirtymään uudelle aikakaudelle. Emme aloita nollasta – rakennamme sen päälle, mikä jo toimii.</p>
      </div>
      <div className="co-card co-card--blue" data-reveal style={d(3)}>
        <p className="co-label">The belief</p>
        <p className="co-card__big">Maailma muuttuu. Yritysten on muututtava mukana.</p>
      </div>
    </div>
  </section>;
}

// --- 03. Miksi nyt -------------------------------------------------------------------

function WhyNow() {
  return <section id="miksi-nyt" className="co-section" aria-labelledby="co-why-title">
    <Chapter id="miksi-nyt" />
    <h2 id="co-why-title" className="co-h2" data-reveal>Suomi on täynnä yrityksiä, joilla on menneisyys. <span className="co-blue-text">Mutta myös tulevaisuus.</span></h2>
    <p className="co-lead" data-reveal>Uusi teknologia muuttaa työskentelyä nopeammin kuin moni yritys ehtii uudistua. Samaan aikaan tuhansilla suomalaisilla yrityksillä on edessään sukupolvenvaihdos, kasvuhaaste tai tarve uudistaa toimintaansa.</p>
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
    <p className="co-statement" data-reveal><strong>Me näemme siellä mahdollisuuden.</strong> Ei vain vaihtaa omistajaa – vaan rakentaa parempi yritys.</p>
    <p className="co-source" data-reveal>* Suomen Yrittäjien omistajanvaihdospoliittinen ohjelma (2025), Omistajanvaihdosbarometri 2024. Luvut kuvaavat omistajanvaihdosaikeita, eivät Gettoworkin todettua asiakaspotentiaalia.</p>
  </section>;
}

/** Koriste: pisteruudukko syttyy aaltona. Ei kuvaa mitään osuutta. */
function Dots() {
  return <div className="co-dots" aria-hidden="true">
    {Array.from({ length: 48 }, (_, i) => <i key={i} className="on" style={{ '--i': i } as CSSProperties} />)}
  </div>;
}

// --- 04. Kaksi maailmaa ------------------------------------------------------------

function TwoWorlds() {
  return <section id="kaksi-maailmaa" className="co-section" aria-labelledby="co-two-title">
    <Chapter id="kaksi-maailmaa" />
    <h2 id="co-two-title" className="co-h2" data-reveal>Yhdellä on yritys.<br />Toisella keinot uudistaa se.</h2>
    <p className="co-lead" data-reveal>Gettowork yhdistää olemassa olevan liiketoiminnan ja uuden ajan osaamisen.</p>
    <div className="co-worlds" data-reveal>
      <div className="co-card co-card--glass co-worlds__a">
        <p className="co-label">Vakiintunut yritys</p>
        <p className="co-card__big">Asiakkaat, kokemus ja toimiva liiketoiminta.</p>
        <p className="co-muted">Mutta rajalliset resurssit, vanhentuneita menetelmiä tai käyttämätöntä kasvupotentiaalia.</p>
      </div>
      <div className="co-venn" aria-hidden="true">
        <span className="co-venn__c co-venn__c--a" />
        <span className="co-venn__c co-venn__c--b" />
        <span className="co-venn__mid">Gettowork</span>
      </div>
      <div className="co-card co-card--blue co-worlds__b">
        <p className="co-label">Uuden ajan tekijät</p>
        <p className="co-card__big">Energiaa, ideoita, teknologiaa ja osaamista.</p>
        <p>Mutta ei välttämättä omaa yritystä tai valmista asiakaskuntaa.</p>
      </div>
    </div>
    <p className="co-statement" data-reveal><strong>Gettowork</strong> yhdistää nämä kaksi maailmaa ja muuttaa mahdollisuudet käytännön tuloksiksi.</p>
  </section>;
}

// --- 05. Restart-ajattelu (vaihdettava) -------------------------------------------

const MODES = {
  startup: ['Keksi uusi idea', 'Rakenna tuote', 'Hanki ensimmäiset asiakkaat', 'Todista liiketoiminta'],
  restart: ['Löydä toimiva yritys', 'Tunnista sen mahdollisuudet', 'Tuo uudet tekijät, työkalut ja menetelmät', 'Kehitä, mittaa ja kasvata'],
} as const;

function StartupVsRestart() {
  const [mode, setMode] = useState<keyof typeof MODES>('restart');
  return <section id="restart-ajattelu" className="co-section" aria-labelledby="co-svr-title">
    <Chapter id="restart-ajattelu" />
    <h2 id="co-svr-title" className="co-h2" data-reveal>Ei aloiteta <span className="co-blue-text">nollasta.</span></h2>
    <p className="co-lead" data-reveal>Startup rakentaa liiketoiminnan alusta. Restart kehittää liiketoimintaa, joka on jo olemassa.</p>
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

// --- 06. Mitä Gettowork on ----------------------------------------------------------

const ROLES = [
  { t: 'Osaamisen yhdistäjä', d: 'Tuomme yrityksiin oikeat ihmiset, erityisosaamisen ja uutta tekemisen energiaa.' },
  { t: 'Restart-kumppani', d: 'Uudistamme myyntiä, markkinointia, prosesseja, palveluita ja toimintatapoja.' },
  { t: 'Käytännön toteuttaja', d: 'Otamme uudet teknologiat ja menetelmät käyttöön. Emme jätä muutosta pelkäksi suunnitelmaksi.' },
];

function Roles() {
  return <section id="mita-teemme" className="co-section" aria-labelledby="co-roles-title">
    <Chapter id="mita-teemme" />
    <h2 id="co-roles-title" className="co-h2" data-reveal>Uudistamisen mahdollistaja.<br />Ei vain neuvonantaja.</h2>
    <p className="co-lead" data-reveal>Kolme roolia. Yksi tavoite.</p>
    <ol className="co-roles">
      {ROLES.map((r, i) => <li key={r.t} className="co-role" data-reveal style={d(i)}>
        <span className="co-role__n">0{i + 1}</span>
        <span className="co-role__t">{r.t}</span>
        <span className="co-role__d">{r.d}</span>
      </li>)}
    </ol>
  </section>;
}

// --- 07. Yrityksille: Connect. Build. Grow. ------------------------------------------

type Step = { k: string; t: string; d: string };

const BUSINESS_PATH: Step[] = [
  { k: 'Connect.', t: 'Oikeat tekijät.', d: 'Yhdistämme yrityksen tarpeet ja oikean osaamisen.' },
  { k: 'Build.', t: 'Oikeat ratkaisut.', d: 'Kehitämme ja toteutamme paremmat toimintatavat.' },
  { k: 'Grow.', t: 'Oikeat tulokset.', d: 'Rakennamme pohjan kasvulle ja jatkuvalle kehitykselle.' },
];

const BUILDER_PATH: Step[] = [
  { k: 'Work.', t: 'Tee oikeaa työtä.', d: 'Tee oikeaa työtä oikeissa yrityksissä. Ansaitse työlläsi ja kasvata osaamistasi.' },
  { k: 'Build.', t: 'Rakenna näyttöä.', d: 'Osallistu yritysten kehittämiseen. Toteuta projekteja, ratkaise ongelmia ja rakenna omaa näyttöäsi.' },
  { k: 'Grow.', t: 'Kasvata mahdollisuuksiasi.', d: 'Kehitä omia projekteja ja löydä osaavia ihmisiä, joiden kanssa voit rakentaa jotain uutta – vaikka yhteisen yrityksen.' },
];

/** Kolmen kortin portaat. Sama moduuli yrityksille ja tekijöille. */
function Steps({ steps, label }: { steps: Step[]; label: string }) {
  const [step, setStep] = useState(0);
  return <div className="co-path" data-reveal>
    <div className="co-stairs" aria-hidden="true">
      {steps.map((p, i) => <span key={p.k} className={`co-stairs__step${i <= step ? ' is-on' : ''}`} style={{ '--h': `${(i + 1) * 33}%` } as CSSProperties} />)}
      <span className="co-stairs__climber" style={{ '--s': step } as CSSProperties} />
    </div>
    <div className="co-path__tabs" role="tablist" aria-label={label}>
      {steps.map((p, i) => <button key={p.k} type="button" role="tab" aria-selected={step === i}
        className={`co-path__tab${step === i ? ' is-on' : ''}`} onClick={() => setStep(i)} onMouseEnter={() => setStep(i)}>
        <span className="co-path__n">0{i + 1}</span>
        <span className="co-path__k">{p.k}</span>
        <span className="co-path__t">{p.t}</span>
        <span className="co-path__d">{p.d}</span>
      </button>)}
    </div>
  </div>;
}

function Path() {
  return <section id="yrityksille" className="co-section" aria-labelledby="co-path-title">
    <Chapter id="yrityksille" />
    <h2 id="co-path-title" className="co-h2" data-reveal>Uudet ihmiset. Uudet ideat.<br /><span className="co-blue-text">Parempi yritys.</span></h2>
    <p className="co-lead" data-reveal>Uudistuminen ei tapahdu yksin. Yhdistämme osaavat tekijät ja olemassa olevat yritykset rakentamaan uusia ratkaisuja oikeisiin tarpeisiin.</p>
    <Steps steps={BUSINESS_PATH} label="Näin uudistus etenee" />
  </section>;
}

// --- 08. Kenelle Restart sopii --------------------------------------------------------

function ForWhom() {
  const yes = ['Toimivaa liiketoimintaa ja olemassa olevaa kysyntää', 'Kehittämätöntä kasvupotentiaalia', 'Omistajia, jotka haluavat uudistaa', 'Mahdollisuuksia parantaa kannattavuutta ja toimintaa'];
  const no = ['Yrityksiä ilman realistista kysyntää', 'Hallitsemattomia taloudellisia riskejä', 'Muutosta, johon johto ei sitoudu', 'Projekteja, joissa tuloksia ei voida mitata'];
  return <section id="kenelle" className="co-section" aria-labelledby="co-who-title">
    <Chapter id="kenelle" />
    <h2 id="co-who-title" className="co-h2" data-reveal>Tylsä on hyvä.<br />Rikkinäinen ei.</h2>
    <p className="co-lead" data-reveal>Etsimme yrityksiä, joilla on jo jotain arvokasta: asiakkaita, kysyntää, osaamista ja mahdollisuus kasvaa.</p>
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
    <p className="co-source" data-reveal>Aloitamme kiinteistö-, toimitila-, huolto- ja erikoispalveluiden pk-yrityksistä.</p>
  </section>;
}

// --- 09. Restart playbook: 180 päivää ------------------------------------------------

const PHASES = [
  { days: '0–30', t: 'Discover', d: 'Ymmärrämme liiketoiminnan, pullonkaulat ja suurimmat mahdollisuudet.' },
  { days: '31–90', t: 'Deploy', d: 'Tuomme oikeat tekijät, teknologian ja uudet toimintatavat käyttöön.' },
  { days: '91–180', t: 'Grow', d: 'Kehitämme toimivia ratkaisuja, mittaamme tulokset ja rakennamme jatkuvaa kasvua.' },
];

function Playbook() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  return <section id="playbook" className="co-section" aria-labelledby="co-play-title">
    <Chapter id="playbook" />
    <h2 id="co-play-title" className="co-h2" data-reveal>180 päivää.<br /><span className="co-blue-text">Todellisia muutoksia.</span></h2>
    <p className="co-lead" data-reveal>Ei konsulttiraporttia. Käytännön kehittämistä.</p>
    <div ref={ref} className={`co-timeline${inView ? ' is-in' : ''}`}>
      <div className="co-timeline__track" aria-hidden="true"><span className="co-timeline__fill" /><span className="co-timeline__spark" /></div>
      {PHASES.map((p, i) => <div key={p.t} className="co-phase" style={{ '--d': `${300 + i * 650}ms` } as CSSProperties}>
        <span className="co-phase__dot" aria-hidden="true" />
        <p className="co-phase__days">{p.days} <span className="co-muted">päivää</span></p>
        <p className="co-phase__t">{p.t}</p>
        <p className="co-muted">{p.d}</p>
      </div>)}
    </div>
  </section>;
}

// --- 10–11. Ensimmäinen kauppa ja liiketoimintamalli --------------------------------

const MODEL = [
  { t: 'Restart-kartoitus', d: 'Selvitämme, mikä toimii, mikä ei ja mitä kannattaa kehittää ensimmäisenä.' },
  { t: 'Restart-projekti', d: 'Toteutamme sovitun uudistuksen oikeiden osaajien kanssa.' },
  { t: 'Kehityskumppanuus', d: 'Jatkamme toimintojen kehittämistä sovitulla kuukausiveloituksella.' },
  { t: 'Tulospalkkio', d: 'Voimme sopia lisäpalkkiosta, joka perustuu mitattuun ja todennettuun parannukseen.' },
];

function Partnership() {
  return <section id="yhteistyo" className="co-section" aria-labelledby="co-part-title">
    <Chapter id="yhteistyo" />
    <h2 id="co-part-title" className="co-h2" data-reveal>Ei tarvita yritysostoa.<br />Tarvitaan yritys, joka haluaa kehittyä.</h2>
    <div className="co-flow" data-reveal>
      <div className="co-flow__node"><p className="co-label">Yritys</p><p>Tuo olemassa olevan liiketoiminnan, asiakkaat ja kehitystarpeen.</p></div>
      <span className="co-flow__arrow" aria-hidden="true"><i /><i /><i /></span>
      <div className="co-flow__node co-flow__node--core"><p className="co-label">Gettowork</p><p>Suunnittelee, kokoaa tekijät ja vastaa uudistuksen toteutuksesta.</p></div>
      <span className="co-flow__arrow" aria-hidden="true"><i /><i /><i /></span>
      <div className="co-flow__node"><p className="co-label">Tekijät</p><p>Tuovat osaamisen, teknologian ja konkreettisen työpanoksen.</p></div>
    </div>
    <p className="co-note" data-reveal><strong>Yhteinen tavoite:</strong> parempi liiketoiminta, paremmat toimintatavat ja mitattavat tulokset.</p>

    <h3 className="co-h3" data-reveal>Meille maksetaan yritysten kehittämisestä.</h3>
    <p className="co-lead" data-reveal>Gettoworkin tehtävä ei ole ostaa yrityksiä. Sen tehtävä on tehdä niistä parempia.</p>
    <ol className="co-model">
      {MODEL.map((m, i) => <li key={m.t} className={`co-model__item${i === 3 ? ' is-blue' : ''}`} data-reveal style={d(i)}>
        <span className="co-model__n">0{i + 1}</span>
        <span className="co-model__t">{m.t}</span>
        <span className="co-model__d">{m.d}</span>
      </li>)}
    </ol>
  </section>;
}

// --- 12. Miltä Restart näyttää (kuvitteellinen esimerkki) ---------------------------

function Example() {
  return <section id="esimerkki" className="co-section" aria-labelledby="co-ex-title">
    <Chapter id="esimerkki" />
    <h2 id="co-ex-title" className="co-h2" data-reveal>Pieni huoltoyritys.<br /><span className="co-blue-text">Suuri kehityspotentiaali.</span></h2>
    <div className="co-grid">
      <div className="co-stat" data-reveal style={d(1)}>
        <p className="co-label">Nyt</p>
        <p className="co-stat__n co-stat__n--white"><Euro to={600000} /></p>
        <p className="co-stat__label">liikevaihto</p>
        <p className="co-ex__row"><span><Euro to={48000} /></span><span className="co-muted">liikevoitto / 8 %</span></p>
      </div>
      <div className="co-stat co-stat--blue" data-reveal style={d(3)}>
        <p className="co-label">Tavoite</p>
        <p className="co-stat__n co-stat__n--white"><Euro to={750000} /></p>
        <p className="co-stat__label">liikevaihto</p>
        <p className="co-ex__row"><span><Euro to={75000} /></span><span>liikevoitto / 10 %</span></p>
      </div>
    </div>
    <p className="co-statement" data-reveal><strong>Mitä muutettiin?</strong> Myynnin toimintatavat, asiakashankinta, automaatio, resurssien käyttö ja palveluiden kannattavuus.</p>
    <p className="co-source" data-reveal>Kuvitteellinen 18 kuukauden tavoiteskenaario, ei toteutunut asiakastulos tai ennuste.</p>
  </section>;
}

// --- 14. Mitä asiakas saa -----------------------------------------------------------------

const BENEFITS = [
  { k: 'A', t: 'Enemmän kasvua', d: 'Uusia asiakkaita, parempaa myyntiä ja uusia liiketoimintamahdollisuuksia.' },
  { k: 'B', t: 'Parempi kannattavuus', d: 'Tehokkaampia prosesseja, toimivampia järjestelmiä ja tuottavampaa työtä.' },
  { k: 'C', t: 'Arvokkaampi yritys', d: 'Vahvempi liiketoiminta, joka voi jatkaa kasvua, siirtyä seuraavalle sukupolvelle tai kiinnostaa ostajia.' },
];

function Benefits() {
  return <section id="hyodyt" className="co-section" aria-labelledby="co-ben-title">
    <Chapter id="hyodyt" />
    <h2 id="co-ben-title" className="co-h2" data-reveal>Parempi yritys.<br />Useampi mahdollisuus.</h2>
    <div className="co-benefits">
      {BENEFITS.map((b, i) => <div key={b.k} className={`co-benefit${i === 2 ? ' is-blue' : ''}`} data-reveal style={d(i)}>
        <span className="co-benefit__k">{b.k}</span>
        <p className="co-benefit__t">{b.t}</p>
        <p className="co-benefit__d">{b.d}</p>
      </div>)}
    </div>
  </section>;
}

// --- Tekijöille: Work. Build. Grow. ------------------------------------------------------

const BUILDER_POINTS = [
  'Mahdollisuus osallistua oikeisiin yritysprojekteihin',
  'Mahdollisuus kehittää osaamista ja rakentaa näyttöä',
  'Mahdollisuus tavata muita osaavia tekijöitä',
  'Mahdollisuus rakentaa omia projekteja ja perustaa uusia yrityksiä yhdessä',
];
const BUILDER_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Haluan mukaan tekijäksi')}`;

function Builders() {
  const [ref, inView] = useInView<HTMLOListElement>(0.35);
  return <section id="tekijoille" className="co-section" aria-labelledby="co-build-title">
      <Chapter id="tekijoille" />
      <h2 id="co-build-title" className="co-h2" data-reveal>Kaikkien ei tarvitse alkaa yrittäjiksi,<br />jotta voisi rakentaa jotain merkityksellistä.</h2>
      <p className="co-lead" data-reveal>Gettoworkin toinen puoli on osaajaverkosto. Se tuo yrityksiin oikeat tekijät – ja tekijöille oikeita mahdollisuuksia.</p>

      {/* Tekijän polku vaakasuorana matkana: viiva piirtyy ja vaiheet syttyvät järjestyksessä. */}
      <ol ref={ref} className={`co-journey${inView ? ' is-in' : ''}`} aria-label="Tekijän polku">
        <span className="co-journey__line" aria-hidden="true" />
        {BUILDER_PATH.map((p, i) => <li key={p.k} className="co-journey__step" style={{ '--d': `${300 + i * 500}ms` } as CSSProperties}>
          <span className="co-journey__dot" aria-hidden="true" />
          <span className="co-journey__k">{p.k}</span>
          <span className="co-journey__t">{p.t}</span>
          <span className="co-journey__d">{p.d}</span>
        </li>)}
      </ol>

      <div className="co-builders-wrap">
        <ul className="co-checks co-builders" data-reveal>
          {BUILDER_POINTS.map((t, i) => <li key={t} style={d(i + 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>{t}</li>)}
        </ul>
        <div className="co-builders-cta" data-reveal>
          <p className="co-builders-cta__t">Haluatko mukaan tekijäksi?</p>
          <a className="co-btn co-btn--primary" href={BUILDER_HREF}>Ota yhteyttä <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <p className="co-source" data-reveal>Yrittäjyys on mahdollisuus, ei vaatimus. Emme lupaa tekijöille omistusosuuksia asiakasyrityksistä.</p>
    </section>;
}

// --- 15. Verkosto ------------------------------------------------------------------------------

function Network() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const nodes = [[50, 50], [18, 26], [82, 22], [22, 78], [80, 76], [50, 12], [50, 90], [8, 52], [92, 50]];
  const links = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [3, 6], [4, 6], [1, 7], [3, 7], [2, 8], [4, 8]];
  return <section id="verkosto" className="co-section" aria-labelledby="co-net-title">
    <Chapter id="verkosto" />
    <div className="co-net">
      <div>
        <Eyebrow>One for many. Many for one.</Eyebrow>
        <h2 id="co-net-title" className="co-h2" data-reveal>Verkosto on voimavaramme.</h2>
        <p className="co-lead" data-reveal>Yhdessä yrityksessä opittu voidaan hyödyntää seuraavassa.</p>
        <ol className="co-net__steps">
          {['Yritys – ensimmäinen onnistunut Restart-projekti', 'Osaaminen – uudet toimintamallit, osaajat, teknologiat ja kokemukset', 'Verkosto – jokainen onnistuminen vahvistaa kykyämme uudistaa seuraavaa yritystä'].map((t, i) =>
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
    <p className="co-motto" data-reveal><strong>One for many:</strong> yksi mahdollisuus luo työtä ja oppimista monelle. <strong>Many for one:</strong> monta osaajaa rakentaa yhdessä parempaa yritystä.</p>
  </section>;
}

// --- 16. Vastuu ja reiluus ----------------------------------------------------------------

const RULES = [
  { t: 'Työstä maksetaan', d: 'Jokaisella projektilla on sovitut vastuut ja asianmukaiset korvaukset.' },
  { t: 'Lupaukset pidetään', d: 'Myymme kehitystä, jonka pystymme toteuttamaan ja jonka vaikutuksia voidaan arvioida.' },
  { t: 'Asiakas omistaa liiketoimintansa', d: 'Kehityskumppanuus ei edellytä omistusosuuden luovuttamista.' },
  { t: 'Projekteilla on selkeät sopimukset', d: 'Työsuhteet, toimeksiannot, vastuut ja oikeudet määritellään ennen työn aloittamista.' },
];

function Fairness() {
  return <section id="pelisaannot" className="co-section" aria-labelledby="co-fair-title">
    <Chapter id="pelisaannot" />
    <h2 id="co-fair-title" className="co-h2" data-reveal>Uuden ajan tekemistä.<br />Selkeillä pelisäännöillä.</h2>
    <div className="co-rules">
      {RULES.map((r, i) => <div key={r.t} className="co-rule" data-reveal style={d(i)}>
        <p className="co-rule__t">{r.t}</p>
        <p className="co-muted">{r.d}</p>
      </div>)}
    </div>
  </section>;
}

// --- 19. Lopetus ---------------------------------------------------------------------------

function Closing() {
  return <section className="co-closing" data-section-dock-hide aria-labelledby="co-close-title">
    <div className="co-closing__rings" aria-hidden="true"><span /><span /></div>
    <h2 id="co-close-title" className="co-closing__title" data-reveal>
      <span lang="en">We don’t need more startups.</span>
      <span lang="en" className="co-blue-text">We need more restarts.</span>
    </h2>
    <p className="co-closing__sub" data-reveal>Vanha yritys. Uusi vaihde. Aloitetaan Restart-kartoituksella: selvitämme, mikä toimii, mikä ei ja mitä kannattaa kehittää ensimmäisenä.</p>
    <div className="co-actions" data-reveal>
      <a className="co-btn co-btn--primary" href={TALK_HREF}>Pyydä Restart-kartoitus <span aria-hidden="true">→</span></a>
      <a className="co-btn" href={HOME_PATH} onClick={e => interceptClick(e, HOME_PATH, { rs: { view: 'intro', step: 0 } })}>Tee Restart-testi</a>
    </div>
    <div className="co-closing__foot" data-reveal>
      <span lang="en">Connect. Build. Grow.</span>
      <span lang="en">One for many. Many for one.</span>
      <span lang="en">Forget jobs. Get to work.</span>
    </div>
  </section>;
}
