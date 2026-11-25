import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SectionDock, type DockItem } from './SectionDock.tsx';
import './company.css';

// "Tietoa yrityksestä" – Get to Work: tehdään työn tekemisestä helpompaa. From prompt to done.
// Sisältö perustuu Rasmuksen tekstiin (marraskuu 2026). Animaatiot ovat CSS:ää ja SVG:tä;
// näkyviin tulo IntersectionObserverilla.

const EMAIL = 'rasmus@gettowork.fi';
const ORDER_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Työtilaus')}&body=${encodeURIComponent('Mitä pitää saada tehdyksi:\n\nMissä:\n\nMilloin:\n')}`;
const BUILDER_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Haluan mukaan tekijäksi')}`;

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
  { id: 'tilaa-tyo', label: 'Tilaa työ' },
  { id: 'mahdollisuudet', label: 'Mahdollisuudet' },
  { id: 'tavallista-tyota', label: 'Tavallista työtä' },
  { id: 'yksi-tyo-kerrallaan', label: 'Yksi työ kerrallaan' },
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
    <Order />
    <Opportunities />
    <EverydayWork />
    <OneJob />
    <Closing />
    <SectionDock items={DOCK_ITEMS} />
  </main>;
}

// --- Avaus ------------------------------------------------------------------------

function Hero({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return <section className="co-hero" aria-labelledby="co-hero-title">
    <div className="co-hero__text">
      <p className="co-eyebrow co-eyebrow--lit is-in">Get to Work <span aria-hidden="true">/</span> <span lang="en">From prompt to done</span></p>
      <h1 id="co-hero-title" ref={headingRef} tabIndex={-1} className="co-hero__title co-hero__title--two">
        <span className="co-hero__word" style={d(1)}>Tehdään työn tekemisestä</span>
        <span className="co-hero__word co-hero__word--own" style={d(4)}>helpompaa.</span>
      </h1>
      <p className="co-hero__lead" style={d(8)}>Sinä kerrot, mitä pitää tehdä. Me selvitämme, miten se saadaan tehdyksi, kuka sen tekee ja mitä se maksaa.</p>
      <div className="co-actions co-hero__actions" style={d(10)}>
        <a className="co-btn co-btn--primary" href={ORDER_HREF}>Kerro mitä pitää tehdä <span aria-hidden="true">→</span></a>
      </div>
    </div>
    <Orbit />
    <a className="co-scroll" href="#miksi" aria-label="Vieritä alas">
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

// --- 01. Miksi --------------------------------------------------------------------------

const MATCH_NEEDS = ['Kuorman purku', 'Inventaario', 'Siivous', 'Myymälätyö'];
const MATCH_PEOPLE = ['Opiskelija', 'Alanvaihtaja', 'Kokenut tekijä', 'Osa-aikainen'];
/** Kuvitteelliset parit: tarve i ↔ tekijä MATCH_PAIR[i]. */
const MATCH_PAIR = [2, 0, 3, 1];
const MATCH_Y = [18, 39, 61, 82];

/** Kohtaamiskartta: ensin tarpeet ja tekijät eivät kohtaa, sitten Get to Work yhdistää ne pareiksi. */
function MatchMap() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [linked, setLinked] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [auto, setAuto] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced()) { setLinked(true); return; }
    const t = window.setTimeout(() => setLinked(true), 1300);
    return () => window.clearTimeout(t);
  }, [inView]);
  useEffect(() => {
    if (!linked || hover !== null || reduced()) return;
    const t = window.setInterval(() => setAuto(a => (a + 1) % MATCH_NEEDS.length), 2200);
    return () => window.clearInterval(t);
  }, [linked, hover]);
  const cur = linked ? (hover ?? auto) : null;
  const pickPerson = (j: number) => setHover(MATCH_PAIR.indexOf(j));

  return <div className="co-match-wrap" data-reveal>
    <div className="co-match-head">
      <p><span className="co-label">Yritykset</span>Tekemistä, johon ei riitä aikaa, osaamista tai tekijöitä.</p>
      <p><span className="co-label">Tekijät</span>Haluavat tehdä töitä, mutta oikeita mahdollisuuksia on vaikea löytää.</p>
    </div>
    <div ref={ref} className={`co-match${linked ? ' is-linked' : ''}${cur !== null ? ' has-active' : ''}`} onMouseLeave={() => setHover(null)}>
      <svg className="co-match__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {MATCH_Y.map((y, i) => <path key={`n${i}`} className={`co-match__path${cur === i ? ' is-on' : ''}`} pathLength={1}
          d={`M 31 ${y} C 41 ${y}, 41 50, 50 50`} style={{ '--i': i } as CSSProperties} />)}
        {MATCH_Y.map((y, j) => <path key={`p${j}`} className={`co-match__path${cur !== null && MATCH_PAIR[cur] === j ? ' is-on' : ''}`} pathLength={1}
          d={`M 50 50 C 59 50, 59 ${y}, 69 ${y}`} style={{ '--i': j + 4 } as CSSProperties} />)}
      </svg>
      {MATCH_NEEDS.map((t, i) => <button key={t} type="button" className={`co-match__node co-match__node--l${cur === i ? ' is-on' : ''}`}
        style={{ top: `${MATCH_Y[i]}%` }} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)}>
        <span>{t}</span><i aria-hidden="true" />
      </button>)}
      {MATCH_PEOPLE.map((t, j) => <button key={t} type="button" className={`co-match__node co-match__node--r${cur !== null && MATCH_PAIR[cur] === j ? ' is-on' : ''}`}
        style={{ top: `${MATCH_Y[j]}%` }} onMouseEnter={() => pickPerson(j)} onFocus={() => pickPerson(j)} onClick={() => pickPerson(j)}>
        <i aria-hidden="true" /><span>{t}</span>
      </button>)}
      <div className="co-match__hub" aria-hidden="true"><span className="co-match__q">?</span><span className="co-match__g">Get to Work</span></div>
    </div>
    <p className="co-match__cap" aria-live="polite">
      {cur === null ? 'Tarpeet ja tekijät eivät löydä toisiaan.' : <>Esimerkki: <strong>{MATCH_NEEDS[cur]}</strong> ↔ <strong>{MATCH_PEOPLE[MATCH_PAIR[cur]]}</strong></>}
    </p>
  </div>;
}

function Why() {
  return <section id="miksi" className="co-section" aria-labelledby="co-why-title">
    <Chapter id="miksi" />
    <h2 id="co-why-title" className="co-h2" data-reveal>Maailma muuttuu nopeasti.<br /><span className="co-blue-text">Työn hankinta ei.</span></h2>
    <p className="co-lead" data-reveal>Tapa, jolla yritykset hankkivat työvoimaa ja järjestävät työnsä, ei ole muuttunut läheskään yhtä nopeasti.</p>
    <MatchMap />
    <p className="co-statement" data-reveal><strong>Näiden kahden kohtaamisen pitäisi olla paljon helpompaa.</strong> Siksi rakennamme Get to Workia.</p>
  </section>;
}

// --- 02. Tilaa työ: From prompt to done -----------------------------------------------------

const PROMPTS = [
  {
    chip: 'Varasto', prompt: 'Tarvitsen kolme tekijää purkamaan kuorman varastolla perjantaina.',
    plan: [['Miten', 'Purku ja hyllytys, ohjeet valmiina'], ['Kuka', '3 tekijää ja vastuuhenkilö'], ['Milloin', 'Perjantaina aamusta'], ['Hinta', 'Arvio ennen aloitusta']],
  },
  {
    chip: 'Myymälä', prompt: 'Myymälään tarvitaan apua inventaarioon kuun lopussa.',
    plan: [['Miten', 'Laskenta osastoittain valmiilla listoilla'], ['Kuka', '2 tekijää'], ['Milloin', 'Kuun viimeisenä iltana'], ['Hinta', 'Arvio ennen aloitusta']],
  },
  {
    chip: 'Toimitila', prompt: 'Toimisto pitää tyhjentää ja siivota muuton jälkeen.',
    plan: [['Miten', 'Tyhjennys, kierrätys ja loppusiivous'], ['Kuka', 'Muuttotiimi ja siivooja'], ['Milloin', 'Muuttoa seuraavana päivänä'], ['Hinta', 'Arvio ennen aloitusta']],
  },
] as const;

/** Esitys (ei lomake): tarve kirjoittuu, siitä rakentuu suunnitelma ja lopuksi työ on tehty. */
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
      <p className="co-label">Mitä pitää tehdä?</p>
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
    <p className="co-source">Esimerkki. Jokainen suunnitelma ja hinta tehdään tarpeen mukaan.</p>
  </div></div>;
}

const PARTS = [
  { t: 'Tekoäly', d: 'Nopeuttaa tarpeen jäsentämistä ja työn suunnittelua.' },
  { t: 'Älykäs työnsuunnittelu', d: 'Selkeät tehtävät ja ohjeet jokaiselle työlle.' },
  { t: 'Luotettavat toteutuskumppanit', d: 'Osaavat tekijät, jotka hoitavat työn oikeassa maailmassa.' },
];

function Order() {
  return <section id="tilaa-tyo" className="co-section" aria-labelledby="co-order-title">
    <Chapter id="tilaa-tyo" />
    <h2 id="co-order-title" className="co-h2" data-reveal>Mitä jos työn voisi<br /><span className="co-blue-text">vain tilata?</span></h2>
    <p className="co-lead" data-reveal>Get to Work on uudenlainen tapa saada asioita tehdyksi. Sen sijaan, että yritys etsii työntekijöitä, kilpailuttaa palveluntarjoajia tai suunnittelee itse työn toteutuksen, se voi yksinkertaisesti kertoa, mitä pitäisi saada aikaan.</p>
    <p className="co-h3 co-strike" data-reveal>
      Ei <s style={d(2)}>rekrytointia</s>. Ei <s style={d(4)}>kilpailutusta</s>.{' '}
      <span className="co-pop" style={d(8)}>Kerro tarve.</span>
    </p>
    <PromptDemo />
    <p className="co-lead co-lead--gap" data-reveal>Yhdistämme kolme asiaa yhdeksi helposti käytettäväksi palveluksi.</p>
    <ol className="co-roles">
      {PARTS.map((r, i) => <li key={r.t} className="co-role" data-reveal style={d(i)}>
        <span className="co-role__n">0{i + 1}</span>
        <span className="co-role__t">{r.t}</span>
        <span className="co-role__d">{r.d}</span>
      </li>)}
    </ol>
  </section>;
}

// --- 03. Mahdollisuudet ---------------------------------------------------------------------

const SIDES = {
  company: {
    tab: 'Yrityksille', big: 'Joustavampi tapa hankkia työtä.',
    points: ['Jokaiseen tarpeeseen ei tarvitse palkata uutta ihmistä', 'Työ tilataan silloin, kun sitä tarvitaan', 'Yksi kumppani huolehtii kokonaisuudesta'],
  },
  builder: {
    tab: 'Tekijöille', big: 'Pääse näyttämään osaamisesi.',
    points: ['Osallistu oikeisiin työprojekteihin', 'Kartuta kokemusta työ kerrallaan', 'Pitkää työhistoriaa ei aina tarvita'],
  },
} as const;
type Side = keyof typeof SIDES;

/** Kuvitus: yritykselle viikko, johon työ tilataan tarpeen mukaan; tekijälle kasvava kokemus. */
function SideArt({ side }: { side: Side }) {
  if (side === 'company') {
    const filled = [[0, 1], [1, 3], [3, 0], [3, 2], [4, 1]];
    return <div className="co-week" aria-hidden="true">
      {['Ma', 'Ti', 'Ke', 'To', 'Pe'].map((day, c) => <div key={day} className="co-week__col">
        <span className="co-week__day">{day}</span>
        {[0, 1, 2, 3].map(r => {
          const k = filled.findIndex(([fc, fr]) => fc === c && fr === r);
          return <span key={r} className={`co-week__cell${k >= 0 ? ' is-on' : ''}`} style={{ '--i': k } as CSSProperties} />;
        })}
      </div>)}
      <span className="co-week__cap">Työ tilataan tarpeen mukaan</span>
    </div>;
  }
  return <div className="co-grow" aria-hidden="true">
    {['Ensimmäinen työ', 'Uusi ympäristö', 'Vastuuta enemmän', 'Näyttöä ja kokemusta'].map((t, i) =>
      <span key={t} className="co-grow__bar" style={{ '--i': i, '--w': `${46 + i * 18}%` } as CSSProperties}>{t}</span>)}
  </div>;
}

const PIECES = ['Tehtävät suunniteltu', 'Selkeät ohjeet', 'Oikeat ihmiset'];

function Opportunities() {
  const [side, setSide] = useState<Side>('company');
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  const s = SIDES[side];
  return <section id="mahdollisuudet" className="co-section" aria-labelledby="co-opp-title">
    <Chapter id="mahdollisuudet" />
    <h2 id="co-opp-title" className="co-h2" data-reveal>Enemmän mahdollisuuksia.<br /><span className="co-blue-text">Vähemmän esteitä.</span></h2>
    <p className="co-lead" data-reveal>Haluamme rakentaa uudenlaisia mahdollisuuksia sekä yrityksille että työntekijöille.</p>

    <div className="co-toggle" role="tablist" aria-label="Näkökulma" data-reveal>
      {(Object.keys(SIDES) as Side[]).map(k => <button key={k} type="button" role="tab" aria-selected={side === k}
        className={`co-toggle__btn${side === k ? ' is-on' : ''}`} onClick={() => setSide(k)}>{SIDES[k].tab}</button>)}
      <span className={`co-toggle__thumb${side === 'builder' ? ' is-restart' : ''}`} aria-hidden="true" />
    </div>
    <div key={side} className="co-side" role="tabpanel">
      <div>
        <p className="co-side__big">{s.big}</p>
        <ul className="co-checks co-side__points">
          {s.points.map((t, i) => <li key={t} style={d(i + 1)}><Check />{t}</li>)}
        </ul>
        {side === 'builder' && <a className="co-btn co-side__cta" href={BUILDER_HREF}>Haluan mukaan tekijäksi <span aria-hidden="true">→</span></a>}
      </div>
      <SideArt side={side} />
    </div>

    <p className="co-statement" data-reveal><strong>Hyvän työn tekeminen ei aina edellytä pitkää työhistoriaa tai täydellistä ansioluetteloa.</strong></p>
    <p className="co-lead" data-reveal>Kun tehtävät suunnitellaan hyvin, ohjeet ovat selkeät ja oikeat ihmiset työskentelevät yhdessä, saadaan aikaan paljon enemmän.</p>
    <div ref={ref} className={`co-puzzle${inView ? ' is-in' : ''}`} aria-label="Tehtävät suunniteltu, selkeät ohjeet ja oikeat ihmiset: enemmän aikaan">
      {PIECES.map((t, i) => <span key={t} className="co-puzzle__piece" style={{ '--i': i } as CSSProperties}>{t}</span>)}
      <span className="co-puzzle__eq" aria-hidden="true">=</span>
      <span className="co-puzzle__result">Enemmän aikaan.</span>
    </div>
  </section>;
}

// --- 04. Tavallista työtä ------------------------------------------------------------------

const PLACES = [
  { k: 'Varastot', tasks: ['Kuorman purku', 'Keräily', 'Inventaario'] },
  { k: 'Tuotanto', tasks: ['Linjan tukityöt', 'Pakkaus', 'Järjestys ja siivous'] },
  { k: 'Kaupat', tasks: ['Hyllytys', 'Inventaario', 'Kampanjan valmistelu'] },
  { k: 'Toimitilat', tasks: ['Siivous', 'Muutto', 'Kalusteiden kokoaminen'] },
];

/** Yksinkertainen 2D-kuvitus kullekin työympäristölle. */
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

const NEEDS = [
  { t: 'Oikeat ihmiset', d: 'oikeaan paikkaan.' },
  { t: 'Selkeä suunnitelma', d: 'jota on helppo seurata.' },
  { t: 'Joku, joka huolehtii kokonaisuudesta', d: 'alusta loppuun.' },
];

function EverydayWork() {
  const [place, setPlace] = useState(0);
  return <section id="tavallista-tyota" className="co-section" aria-labelledby="co-every-title">
    <Chapter id="tavallista-tyota" />
    <h2 id="co-every-title" className="co-h2" data-reveal>Tavallista työtä.<br /><span className="co-blue-text">Uudella tavalla.</span></h2>
    <p className="co-lead" data-reveal>Meitä kiinnostavat erityisesti yritykset, jotka pitävät arjen pyörimässä: työympäristöt, joissa asioiden täytyy tapahtua oikeassa maailmassa.</p>
    <div className="co-places" role="tablist" aria-label="Työympäristöt" data-reveal>
      {PLACES.map((p, i) => <button key={p.k} type="button" role="tab" aria-selected={place === i}
        className={`co-places__tab${place === i ? ' is-on' : ''}`} onClick={() => setPlace(i)}>{p.k}</button>)}
    </div>
    <div key={place} className="co-place" role="tabpanel">
      <div className="co-place__art"><PlaceArt i={place} /></div>
      <div>
        <p className="co-label">Esimerkkitöitä</p>
        <ul className="co-place__tasks">
          {PLACES[place].tasks.map((t, i) => <li key={t} style={d(i + 1)}>{t}</li>)}
        </ul>
        <p className="co-muted co-small">…ja lukemattomia muita töitä muissa työympäristöissä.</p>
      </div>
    </div>
    <p className="co-statement" data-reveal>Emme usko, että kaikki ongelmat ratkaistaan rakentamalla lisää ohjelmistoja. <strong>Joskus tarvitaan vain:</strong></p>
    <ol className="co-roles">
      {NEEDS.map((r, i) => <li key={r.t} className="co-role" data-reveal style={d(i)}>
        <span className="co-role__n">0{i + 1}</span>
        <span className="co-role__t">{r.t}</span>
        <span className="co-role__d">{r.d}</span>
      </li>)}
    </ol>
    <p className="co-motto" data-reveal><strong>Teknologian tehtävä</strong> on tehdä tästä mahdollisimman yksinkertaista.</p>
  </section>;
}

// --- 05. Yksi työ kerrallaan -------------------------------------------------------------------

const STACK_ROWS = [6, 5, 4];
const STACK: { r: number; c: number }[] = STACK_ROWS.flatMap((n, r) => Array.from({ length: n }, (_, c) => ({ r, c })));

/** Työpalikat putoavat vierityksen mukaan yksi kerrallaan ja rakentavat alustan. */
function JobStack() {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) { setCount(STACK.length); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.92 - rect.top) / (vh * 0.62)));
      setCount(Math.round(p * STACK.length));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  const w = 100 / STACK_ROWS[0];
  const full = count >= STACK.length;
  return <div ref={ref} className={`co-stack${full ? ' is-full' : ''}`} aria-hidden="true">
    <div className="co-stack__area">
      {STACK.map(({ r, c }, i) => <span key={i} className={`co-stack__block${i < count ? ' is-in' : ''}${i === 0 ? ' is-first' : ''}`}
        style={{ left: `${r * w / 2 + c * w}%`, width: `${w}%`, bottom: `${r * 33.3}%` }}>{i === 0 ? '1 työ' : ''}</span>)}
    </div>
    <div className="co-stack__base">Alusta</div>
    <div className="co-stack__labels"><span>Nyt: yksi työ kerrallaan</span><span>Tavoite: alusta</span></div>
  </div>;
}

function OneJob() {
  return <section id="yksi-tyo-kerrallaan" className="co-section" aria-labelledby="co-one-title">
    <Chapter id="yksi-tyo-kerrallaan" />
    <h2 id="co-one-title" className="co-h2" data-reveal>Yksi työ <span className="co-blue-text">kerrallaan.</span></h2>
    <p className="co-lead" data-reveal>Get to Work on vasta rakentumassa. Aloitamme tekemällä yksittäisten töiden tilaamisesta helpompaa.</p>
    <JobStack />
    <div className="co-grid">
      <div className="co-card co-card--glass" data-reveal style={d(1)}>
        <p className="co-label">Nyt</p>
        <p className="co-card__big">Yksittäisten töiden tilaamisesta helpompaa.</p>
        <p className="co-muted">Samalla opimme, miten työtä voidaan suunnitella, organisoida ja toteuttaa paremmin.</p>
      </div>
      <div className="co-card co-card--blue" data-reveal style={d(3)}>
        <p className="co-label">Pitkällä aikavälillä</p>
        <p className="co-card__big">Alusta, jonka kautta työn hankkii yhtä helposti kuin muutkin palvelut.</p>
      </div>
    </div>
    <p className="co-h3 co-strike co-strike--gap" data-reveal>
      Ei <s style={d(2)}>turhaa monimutkaisuutta</s>. Ei <s style={d(4)}>loputtomia rekrytointiprosesseja</s>.{' '}
      <span className="co-pop" style={d(8)}>Tehty työ.</span>
    </p>
    <p className="co-lead" data-reveal>Vain selkeä tarve, toimiva ratkaisu ja tehty työ.</p>
  </section>;
}

// --- Lopetus ---------------------------------------------------------------------------------

function Closing() {
  return <section className="co-closing" data-section-dock-hide aria-labelledby="co-close-title">
    <div className="co-closing__rings" aria-hidden="true"><span /><span /></div>
    <h2 id="co-close-title" className="co-closing__title" data-reveal>
      <span>Get to Work.</span>
      <span lang="en" className="co-blue-text">From prompt to done.</span>
    </h2>
    <p className="co-closing__sub" data-reveal>Kerro, mitä pitää saada tehdyksi. Me selvitämme, miten se tehdään, kuka sen tekee ja mitä se maksaa.</p>
    <div className="co-actions" data-reveal>
      <a className="co-btn co-btn--primary" href={ORDER_HREF}>Kerro mitä pitää tehdä <span aria-hidden="true">→</span></a>
      <a className="co-btn" href={BUILDER_HREF}>Haluan mukaan tekijäksi</a>
    </div>
    <div className="co-closing__foot" data-reveal>
      <span>Tehdään työn tekemisestä helpompaa.</span>
      <span>Yksi työ kerrallaan.</span>
      <span lang="en">From prompt to done.</span>
    </div>
  </section>;
}
