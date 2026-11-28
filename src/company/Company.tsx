import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SectionDock, type DockItem } from './SectionDock.tsx';
import './company.css';

// "Tietoa yrityksestä" – Get to Work yhdistää työt ja tekijät: henkilöstöpalvelut, kumppanit ja jaettu osaaminen.
// Sisältö perustuu Rasmuksen hyväksymään luonnokseen (28.11.2026). Prompt to done. Animaatiot ovat CSS:ää ja SVG:tä;
// näkyviin tulo IntersectionObserverilla.

const EMAIL = 'rasmus@gettowork.fi';
const ORDER_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Työtilaus')}&body=${encodeURIComponent('Mitä pitää saada tehdyksi:\n\nMissä:\n\nMilloin:\n')}`;
const PARTNER_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Kumppaniksi')}`;

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


// Luvut: jokainen osa-alue alkaa selkeällä väliotsikolla, ja sama luettelo ohjaa alareunan dockia.
const CHAPTERS = [
  { id: 'miksi', label: 'Miksi' },
  { id: 'mita-teemme', label: 'Mitä teemme' },
  { id: 'nain-se-toimii', label: 'Näin se toimii' },
  { id: 'kumppaneille', label: 'Kumppaneille' },
  { id: 'luottamus', label: 'Luottamus' },
  { id: 'visio', label: 'Visio' },
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

const Check = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;

export function Company() {
  const root = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useReveal(root);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  return <main ref={root} lang="fi" className="co">
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

// --- Avaus ------------------------------------------------------------------------

function Hero({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return <section className="co-hero" aria-labelledby="co-hero-title">
    <div className="co-hero__text">
      <p className="co-eyebrow co-eyebrow--lit is-in">Get to Work <span aria-hidden="true">/</span> Työt ja tekijät yhteen</p>
      <h1 id="co-hero-title" ref={headingRef} tabIndex={-1} className="co-hero__title co-hero__title--two">
        <span className="co-hero__word" style={d(1)}>Mitä pitäisi</span>
        <span className="co-hero__word co-hero__word--own" style={d(4)}>saada tehtyä?</span>
      </h1>
      <p className="co-hero__lead" style={d(8)}>Kerro tarve. Get to Work löytää tekijät, sopii aikataulun ja hinnan, ja työ tehdään.</p>
      <div className="co-actions co-hero__actions" style={d(10)}>
        <a className="co-btn co-btn--primary" href={ORDER_HREF}>Kerro, mitä tarvitset <span aria-hidden="true">→</span></a>
      </div>
    </div>
    <Orbit />
    <a className="co-scroll" href="#miksi" aria-label="Vieritä alas">
      <span aria-hidden="true" />
    </a>
  </section>;
}

// --- 01. Miksi --------------------------------------------------------------------------

function Why() {
  return <section id="miksi" className="co-section" aria-labelledby="co-why-title">
    <Chapter id="miksi" />
    <h2 id="co-why-title" className="co-h2" data-reveal>Työtä on. Tekijöitä on.<br /><span className="co-blue-text">Ne eivät vain löydä toisiaan.</span></h2>
    <p className="co-lead" data-reveal>Yrityksillä on jatkuvasti töitä, joihin omat kädet eivät riitä. Samaan aikaan osaamista on käyttämättä: henkilöstöpalveluissa keikkojen välissä ja työpaikoilla, joissa kaikkea työaikaa ei tarvita.</p>
    <Bridge />
    <p className="co-statement" data-reveal><strong>Get to Work tuo nämä yhteen.</strong></p>
  </section>;
}

// --- 02. Mitä teemme --------------------------------------------------------------------

const SOURCES = [
  { t: 'Henkilöstöpalvelut.', d: 'Vuokratyöntekijät kumppanimme kautta, kun tarvitset lisää käsiä.', tag: 'Muutamasta tunnista kuukausiin' },
  { t: 'Erikoistuneet kumppanit.', d: 'Yritykset, jotka hoitavat oman alansa työt alusta loppuun.', tag: 'Työ valmiina' },
  { t: 'Jaettu osaaminen.', d: 'Työpaikkojen osaajat, joiden työaikaa on vapaana.', tag: 'Osaaminen käyttöön' },
];
const JOBS = ['Varasto ja logistiikka', 'Tapahtumat', 'Toimitilat ja muutot', 'Myymälät', 'Siivous ja ylläpito', 'Kiinteistöt'];

function WhatWeDo() {
  return <section id="mita-teemme" className="co-section" aria-labelledby="co-what-title">
    <Chapter id="mita-teemme" />
    <h2 id="co-what-title" className="co-h2" data-reveal>Yksi alusta.<br /><span className="co-blue-text">Kaikki tarvittavat tekijät.</span></h2>
    <p className="co-lead" data-reveal>Get to Work yhdistää yrityksesi tarpeen oikeaan toteuttajaan. Sinun ei tarvitse tietää, tarvitsetko vuokratyöntekijän, alihankkijan vai tiimin. Riittää, että kerrot, mitä pitäisi saada tehtyä.</p>
    <ol className="co-uses">
      {SOURCES.map((u, i) => <li key={u.t} className="co-use" data-reveal style={d(i * 2)}>
        <span className="co-use__n">0{i + 1}</span>
        <span className="co-use__t">{u.t}</span>
        <span className="co-use__d">{u.d}</span>
        <span className="co-use__tag">{u.tag}</span>
      </li>)}
    </ol>
    <p className="co-label co-label--gap" data-reveal>Esimerkkejä töistä</p>
    <ul className="co-tags" data-reveal>
      {JOBS.map(j => <li key={j}>{j}</li>)}
    </ul>
    <p className="co-motto" data-reveal><strong>Yksi yhteyspiste.</strong> Lukemattomia tapoja saada työt tehtyä.</p>
  </section>;
}

// --- 03. Näin se toimii -----------------------------------------------------------------

const STEPS = [
  { t: 'Prompt: kerro, mitä tarvitset.', d: 'Kuvaile työ, tehtävä tai tilanne viestillä, sähköpostilla tai puhelimessa.' },
  { t: 'Plan: saat ehdotuksen.', d: 'Työn kuvaus, tekijät, aikataulu ja hinta ennen aloitusta.' },
  { t: 'Done: työ tehdään.', d: 'Hyväksyt ehdotuksen, ja me järjestämme loput. Sinulla on koko ajan yksi yhteyspiste.' },
];

const PROMPTS = [
  {
    chip: 'Varasto', prompt: 'Varasto pitäisi järjestää ja inventoida ennen joulusesonkia.',
    plan: [['Työ', 'Järjestely ja inventointi, ohjeet valmiina'], ['Tekijät', '3 tekijää ja vastuuhenkilö'], ['Aikataulu', 'Kaksi päivää ensi viikolla'], ['Hinta', 'Arvio ennen aloitusta']],
  },
  {
    chip: 'Tapahtuma', prompt: 'Messuosastolle tarvitaan kaksi avustajaa kolmeksi päiväksi.',
    plan: [['Työ', 'Rakennus, opastus ja purku'], ['Tekijät', '2 avustajaa'], ['Aikataulu', 'Messujen ajan'], ['Hinta', 'Arvio ennen aloitusta']],
  },
  {
    chip: 'Toimitila', prompt: 'Toimisto pitää tyhjentää ja siivota muuton jälkeen.',
    plan: [['Työ', 'Tyhjennys, kierrätys ja loppusiivous'], ['Tekijät', 'Muuttotiimi ja siivooja'], ['Aikataulu', 'Muuttoa seuraavana päivänä'], ['Hinta', 'Arvio ennen aloitusta']],
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


function HowItWorks() {
  return <section id="nain-se-toimii" className="co-section" aria-labelledby="co-how-title">
    <Chapter id="nain-se-toimii" />
    <h2 id="co-how-title" className="co-h2" lang="en" data-reveal>Prompt. Plan.<br /><span className="co-blue-text">Done.</span></h2>
    <p className="co-lead" data-reveal>Sinun ei tarvitse tehdä tarjouspyyntöä tai etsiä toimittajaa. Kerro tarve omin sanoin, niin hoidamme loput.</p>
    <ol className="co-roles">
      {STEPS.map((r, i) => <li key={r.t} className="co-role" data-reveal style={d(i)}>
        <span className="co-role__n">0{i + 1}</span>
        <span className="co-role__t">{r.t}</span>
        <span className="co-role__d">{r.d}</span>
      </li>)}
    </ol>
    <div className="co-grid co-compare">
      <div className="co-card co-card--glass" data-reveal style={d(1)}>
        <p className="co-label">Perinteinen henkilöstöpalvelu kysyy</p>
        <p className="co-card__big co-muted">Millaisen työntekijän tarvitset?</p>
      </div>
      <div className="co-card co-card--blue" data-reveal style={d(3)}>
        <p className="co-label">Get to Work kysyy</p>
        <p className="co-card__big">Mitä pitäisi saada tehtyä?</p>
      </div>
    </div>
    <PromptDemo />
  </section>;
}

// --- 04. Kumppaneille ja tekijöille -----------------------------------------------------

const PARTNERS = [
  { t: 'Henkilöstöyritys', d: 'Lisää keikkoja ja paremmin täyttyvät vuorot.' },
  { t: 'Erikoistunut yritys', d: 'Uusia asiakkaita ilman omaa myyntiä.' },
  { t: 'Työpaikka', d: 'Vapaa työaika muuttuu tuloksi.' },
  { t: 'Tekijä', d: 'Lisää työtä ilman työpaikan vaihtoa. Työsuhde ja turva pysyvät.' },
];

function Partners() {
  return <section id="kumppaneille" className="co-section" aria-labelledby="co-partners-title">
    <Chapter id="kumppaneille" />
    <h2 id="co-partners-title" className="co-h2" data-reveal>Enemmän työtä.<br /><span className="co-blue-text">Vähemmän tyhjäkäyntiä.</span></h2>
    <p className="co-lead" data-reveal>Get to Work tuo valmiiksi määritellyt työt niille, joilla on osaamista ja aikaa.</p>
    <ul className="co-uses co-uses--4">
      {PARTNERS.map((p, i) => <li key={p.t} className="co-use" data-reveal style={d(i)}>
        <span className="co-use__t">{p.t}</span>
        <span className="co-use__d">{p.d}</span>
      </li>)}
    </ul>
    <p className="co-motto" data-reveal><strong>Myös myynnin ja projektien osaajat.</strong> Käytännön töiden lisäksi etsimme osaajia vaativampiin tehtäviin.</p>
    <div className="co-actions co-actions--gap" data-reveal>
      <a className="co-btn co-btn--primary" href={PARTNER_HREF}>Liity kumppaniksi <span aria-hidden="true">→</span></a>
    </div>
  </section>;
}

// --- 05. Luottamus ------------------------------------------------------------------------------

const TRUST = [
  'Tekijän työnantaja on aina hänen oma työnantajansa tai henkilöstöpalvelu. Vastuut sovitaan ennen aloitusta.',
  'Kumppaneilla on tehtävään sopiva osaaminen sekä tarvittavat luvat ja vakuutukset.',
  'Tiedät, kuka työn tekee, mitä siihen sisältyy ja mitä se maksaa.',
  'Teknologia auttaa löytämään oikeat tekijät, mutta valinnan tekee aina ihminen.',
];

function Trust() {
  return <section id="luottamus" className="co-section" aria-labelledby="co-trust-title">
    <Chapter id="luottamus" />
    <h2 id="co-trust-title" className="co-h2" data-reveal>Selvät vastuut.<br /><span className="co-blue-text">Ihminen päättää.</span></h2>
    <p className="co-lead" data-reveal>Työn ostamisen pitää olla turvallista ja ennustettavaa.</p>
    <div className="co-card co-card--glass co-trust" data-reveal>
      <ul className="co-checks">
        {TRUST.map((t, i) => <li key={t} style={d(i + 1)}><Check />{t}</li>)}
      </ul>
    </div>
    <p className="co-motto" lang="en" data-reveal><strong>People powered.</strong> AI assisted.</p>
  </section>;
}

// --- 06. Visio ---------------------------------------------------------------------------------

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


function Vision() {
  return <section id="visio" className="co-section" aria-labelledby="co-vision-title">
    <Chapter id="visio" />
    <h2 id="co-vision-title" className="co-h2" data-reveal>Maailma, jossa asiat<br /><span className="co-blue-text">saadaan tehtyä.</span></h2>
    <p className="co-lead" data-reveal>Haluamme, että osaaminen liikkuu sinne, missä sitä tarvitaan. Yrityksillä on helpompi pääsy tekijöihin, ja ihmisillä on enemmän mahdollisuuksia käyttää osaamistaan.</p>
    <div className="co-side" data-reveal>
      <div>
        <p className="co-label">Jaettu osaaminen</p>
        <p className="co-side__big">Neljä päivää omassa työssä. Viides päivä toisen yrityksen avuksi.</p>
      </div>
      <ShareWeek />
    </div>
    <div className="co-grid">
      <div className="co-card co-card--glass" data-reveal style={d(1)}>
        <p className="co-label">Missio</p>
        <p className="co-card__big">Tehdä työn ostamisesta, järjestämisestä ja tekemisestä helpompaa.</p>
      </div>
      <div className="co-card co-card--blue" data-reveal style={d(3)}>
        <p className="co-label">Visio</p>
        <p className="co-card__big">Yritysten tarpeet ja ihmisten osaaminen löytävät toisensa yhdellä viestillä.</p>
      </div>
    </div>
    <p className="co-source">Osaamisen jakaminen on aina työntekijälle vapaaehtoista ja perustuu selkeisiin sopimuksiin.</p>
  </section>;
}

// --- Lopetus ---------------------------------------------------------------------------------

function Closing() {
  return <section className="co-closing" data-section-dock-hide aria-labelledby="co-close-title">
    <div className="co-closing__rings" aria-hidden="true"><span /><span /></div>
    <h2 id="co-close-title" className="co-closing__title" data-reveal>
      <span>Mitä pitäisi</span>
      <span className="co-blue-text">saada tehtyä?</span>
    </h2>
    <p className="co-closing__sub" data-reveal>Kerro, millaista apua yrityksesi tarvitsee. Me yhdistämme sinut oikeisiin tekijöihin.</p>
    <div className="co-actions" data-reveal>
      <a className="co-btn co-btn--primary" href={ORDER_HREF}>Kerro, mitä tarvitset <span aria-hidden="true">→</span></a>
      <a className="co-btn" href={PARTNER_HREF}>Liity kumppaniksi</a>
    </div>
    <div className="co-closing__foot" data-reveal>
      <span>Työt ja tekijät yhteen.</span>
      <span lang="en">Prompt to done.</span>
      <span>Get to Work.</span>
    </div>
  </section>;
}

// --- Kuvitukset ------------------------------------------------------------------------

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


const BRIDGE_PLANKS = 10;

/** Kaksi rantaa ja silta: yritykset ja tekijät ovat eri puolilla, ja vierittäessä väliin rakentuu
 *  palikka kerrallaan Get to Work -silta. Kun silta on valmis, sen yli kulkee liikettä molempiin suuntiin. */
function Bridge() {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) { setCount(BRIDGE_PLANKS); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.85 - rect.top) / (vh * 0.5)));
      setCount(Math.round(p * BRIDGE_PLANKS));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  const full = count >= BRIDGE_PLANKS;

  return <div className="co-bridge-wrap" data-reveal>
    <div className="co-match-head">
      <p><span className="co-label">Yritykset</span>Töitä, joihin omat resurssit eivät riitä.</p>
      <p><span className="co-label">Tekijät</span>Osaamista ja työkapasiteettia, joka voisi olla paremmin käytössä.</p>
    </div>
    <div ref={ref} className={`co-bridge${full ? ' is-full' : ''}`} aria-hidden="true">
      <div className="co-bridge__shore co-bridge__shore--l">
        <span className="co-bridge__label">Yritykset</span>
        <span className="co-bridge__icons co-bridge__icons--l">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</span>
      </div>
      <div className="co-bridge__gap">
        <div className="co-bridge__deck">
          {Array.from({ length: BRIDGE_PLANKS }, (_, i) => <span key={i} className={`co-bridge__plank${i < count ? ' is-in' : ''}`} />)}
          <span className="co-bridge__walker co-bridge__walker--a" />
          <span className="co-bridge__walker co-bridge__walker--b" />
        </div>
        <span className="co-bridge__name">Get to Work</span>
        <div className="co-bridge__water"><span /><span /></div>
      </div>
      <div className="co-bridge__shore co-bridge__shore--r">
        <span className="co-bridge__label">Tekijät</span>
        <span className="co-bridge__icons co-bridge__icons--r">{Array.from({ length: 5 }, (_, i) => <i key={i} />)}</span>
      </div>
    </div>
    <p className="co-bridge__cap" aria-live="polite">{full ? 'Get to Work yhdistää työt ja tekijät.' : 'Työt ja tekijät eivät löydä toisiaan.'}</p>
  </div>;
}


function PlaceArt({ i }: { i: number }) {
  if (i === 0) return <svg viewBox="0 0 240 150" aria-hidden="true">
    <path className="a-line" d="M10 140 H230" />
    {[0, 1].map(r => <g key={r} transform={`translate(${24 + r * 84} 30)`}>
      <path className="a-line" d="M0 0 V110 M70 0 V110 M0 36 H70 M0 73 H70" />
      {[0, 1, 2].map(row => [0, 1].map(c => <rect key={`${row}-${c}`} className="a-box" x={6 + c * 32} y={8 + row * 37} width="26" height="24" rx="3" style={{ '--i': row * 2 + c + r * 6 } as CSSProperties} />))}
    </g>)}
    <g className="a-move"><rect className="a-fill" x="190" y="104" width="30" height="22" rx="4" /><path className="a-line" d="M188 126 V80 M188 112 H174" /><circle className="a-line" cx="196" cy="132" r="6" /><circle className="a-line" cx="214" cy="132" r="6" /></g>
  </svg>;
  if (i === 1) return <svg viewBox="0 0 240 150" aria-hidden="true">
    <path className="a-line" d="M10 140 H230 M20 140 V70 L60 50 V70 L100 50 V70 L140 50 V140 M150 140 V40 H170 V140" />
    <path className="a-line" d="M30 118 H220" />
    {[0, 1, 2, 3].map(k => <rect key={k} className="a-box a-belt" x={34 + k * 46} y="100" width="22" height="16" rx="3" style={{ '--i': k } as CSSProperties} />)}
    <circle className="a-line" cx="40" cy="124" r="5" /><circle className="a-line" cx="210" cy="124" r="5" />
    <path className="a-smoke" d="M160 34 q6 -8 0 -16 q-6 -8 0 -16" />
  </svg>;
  if (i === 2) return <svg viewBox="0 0 240 150" aria-hidden="true">
    <path className="a-line" d="M10 140 H230 M30 140 V56 H210 V140" />
    <path className="a-fill" d="M24 40 H216 L208 58 H32 Z" />
    {[0, 1, 2, 3, 4, 5].map(k => <path key={k} className="a-stripe" d={`M${40 + k * 30} 40 l-4 18`} />)}
    <path className="a-line" d="M48 82 H112 M48 106 H112 M128 76 H190 V140" />
    {[0, 1, 2, 3].map(k => <rect key={k} className="a-box" x={50 + k * 15} y="68" width="11" height="13" rx="2" style={{ '--i': k } as CSSProperties} />)}
    {[0, 1, 2, 3].map(k => <rect key={`b${k}`} className="a-box" x={50 + k * 15} y="92" width="11" height="13" rx="2" style={{ '--i': k + 4 } as CSSProperties} />)}
  </svg>;
  return <svg viewBox="0 0 240 150" aria-hidden="true">
    <path className="a-line" d="M10 140 H230 M40 140 V20 H200 V140" />
    {[0, 1, 2].map(r => [0, 1, 2, 3].map(c => <rect key={`${r}-${c}`} className={`a-win${(r + c) % 3 === 0 ? ' is-lit' : ''}`} x={54 + c * 36} y={34 + r * 30} width="24" height="18" rx="2" style={{ '--i': r * 4 + c } as CSSProperties} />))}
    <path className="a-line" d="M108 140 V118 H132 V140" />
  </svg>;
}
