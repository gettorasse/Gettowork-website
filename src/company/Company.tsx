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

function Why() {
  return <section id="miksi" className="co-section" aria-labelledby="co-why-title">
    <Chapter id="miksi" />
    <h2 id="co-why-title" className="co-h2" data-reveal>Maailma muuttuu nopeasti.<br /><span className="co-blue-text">Työn hankinta ei.</span></h2>
    <p className="co-lead" data-reveal>Tapa, jolla yritykset hankkivat työvoimaa ja järjestävät työnsä, ei ole muuttunut läheskään yhtä nopeasti.</p>
    <div className="co-worlds" data-reveal>
      <div className="co-card co-card--glass co-worlds__a">
        <p className="co-label">Yritykset</p>
        <p className="co-card__big">Jatkuvasti tekemistä.</p>
        <p className="co-muted">Mutta ei riittävästi aikaa, osaamista tai tekijöitä.</p>
      </div>
      <div className="co-venn" aria-hidden="true">
        <span className="co-venn__c co-venn__c--a" />
        <span className="co-venn__c co-venn__c--b" />
        <span className="co-venn__mid">Get to Work</span>
      </div>
      <div className="co-card co-card--blue co-worlds__b">
        <p className="co-label">Tekijät</p>
        <p className="co-card__big">Ihmisiä, jotka haluaisivat tehdä töitä.</p>
        <p>Mutta oikeiden mahdollisuuksien löytäminen on vaikeaa.</p>
      </div>
    </div>
    <p className="co-statement" data-reveal><strong>Näiden kahden kohtaamisen pitäisi olla paljon helpompaa.</strong> Siksi rakennamme Get to Workia.</p>
  </section>;
}

// --- 02. Tilaa työ: From prompt to done -----------------------------------------------------

const FLOW = [
  { k: 'Prompt.', t: 'Kerro, mitä pitää tehdä.', d: 'Kuvaa, mitä pitäisi saada aikaan. Työntekijöitä ei tarvitse etsiä eikä palveluntarjoajia kilpailuttaa.' },
  { k: 'Plan.', t: 'Me selvitämme, miten.', d: 'Saat suunnitelman: miten työ saadaan tehdyksi, kuka sen tekee ja mitä se maksaa.' },
  { k: 'Done.', t: 'Työ tehdään.', d: 'Luotettavat toteutuskumppanit tekevät työn, ja me huolehdimme kokonaisuudesta.' },
];

const PARTS = [
  { t: 'Tekoäly', d: 'Nopeuttaa tarpeen jäsentämistä ja työn suunnittelua.' },
  { t: 'Älykäs työnsuunnittelu', d: 'Selkeät tehtävät ja ohjeet jokaiselle työlle.' },
  { t: 'Luotettavat toteutuskumppanit', d: 'Osaavat tekijät, jotka hoitavat työn oikeassa maailmassa.' },
];

function Order() {
  const [ref, inView] = useInView<HTMLOListElement>(0.35);
  return <section id="tilaa-tyo" className="co-section" aria-labelledby="co-order-title">
    <Chapter id="tilaa-tyo" />
    <h2 id="co-order-title" className="co-h2" data-reveal>Mitä jos työn voisi<br /><span className="co-blue-text">vain tilata?</span></h2>
    <p className="co-lead" data-reveal>Get to Work on uudenlainen tapa saada asioita tehdyksi. Sen sijaan, että yritys etsii työntekijöitä, kilpailuttaa palveluntarjoajia tai suunnittelee itse työn toteutuksen, se voi yksinkertaisesti kertoa, mitä pitäisi saada aikaan.</p>
    <p className="co-h3 co-strike" data-reveal>
      Ei <s style={d(2)}>rekrytointia</s>. Ei <s style={d(4)}>kilpailutusta</s>.{' '}
      <span className="co-pop" style={d(8)}>Kerro tarve.</span>
    </p>

    <ol ref={ref} className={`co-journey${inView ? ' is-in' : ''}`} aria-label="Näin työ tilataan">
      <span className="co-journey__line" aria-hidden="true" />
      {FLOW.map((p, i) => <li key={p.k} className="co-journey__step" style={{ '--d': `${300 + i * 500}ms` } as CSSProperties}>
        <span className="co-journey__dot" aria-hidden="true" />
        <span className="co-journey__k" lang="en">{p.k}</span>
        <span className="co-journey__t">{p.t}</span>
        <span className="co-journey__d">{p.d}</span>
      </li>)}
    </ol>

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

function Opportunities() {
  return <section id="mahdollisuudet" className="co-section" aria-labelledby="co-opp-title">
    <Chapter id="mahdollisuudet" />
    <h2 id="co-opp-title" className="co-h2" data-reveal>Enemmän mahdollisuuksia.<br /><span className="co-blue-text">Vähemmän esteitä.</span></h2>
    <p className="co-lead" data-reveal>Haluamme rakentaa uudenlaisia mahdollisuuksia sekä yrityksille että työntekijöille.</p>
    <div className="co-grid">
      <div className="co-card co-card--glass" data-reveal style={d(1)}>
        <p className="co-label">Yrityksille</p>
        <p className="co-card__big">Joustavampi tapa hankkia työtä.</p>
        <p className="co-muted">Jokaiseen tarpeeseen ei tarvitse palkata uusia ihmisiä.</p>
      </div>
      <div className="co-card co-card--blue" data-reveal style={d(3)}>
        <p className="co-label">Tekijöille</p>
        <p className="co-card__big">Pääse näyttämään osaamisesi.</p>
        <p>Kartuta kokemusta ja osallistu oikeisiin työprojekteihin.</p>
      </div>
    </div>
    <p className="co-statement" data-reveal><strong>Hyvän työn tekeminen ei aina edellytä pitkää työhistoriaa tai täydellistä ansioluetteloa.</strong></p>
    <div className="co-builders-wrap">
      <div data-reveal>
        <p className="co-lead co-lead--tight">Kun tehtävät suunnitellaan hyvin, ohjeet ovat selkeät ja oikeat ihmiset työskentelevät yhdessä, saadaan aikaan paljon enemmän.</p>
        <ul className="co-checks co-checks--anim" data-reveal>
          {['Hyvin suunnitellut tehtävät', 'Selkeät ohjeet', 'Oikeat ihmiset yhdessä'].map((t, i) => <li key={t} style={d(i + 1)}><Check />{t}</li>)}
        </ul>
      </div>
      <div className="co-builders-cta" data-reveal>
        <p className="co-builders-cta__t">Haluatko mukaan tekijäksi?</p>
        <a className="co-btn" href={BUILDER_HREF}>Ota yhteyttä <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>;
}

// --- 04. Tavallista työtä ------------------------------------------------------------------

const PLACES = ['Varastot', 'Tuotantolaitokset', 'Kaupat', 'Toimitilat'];
const NEEDS = [
  { t: 'Oikeat ihmiset', d: 'oikeaan paikkaan.' },
  { t: 'Selkeä suunnitelma', d: 'jota on helppo seurata.' },
  { t: 'Joku, joka huolehtii kokonaisuudesta', d: 'alusta loppuun.' },
];

function EverydayWork() {
  return <section id="tavallista-tyota" className="co-section" aria-labelledby="co-every-title">
    <Chapter id="tavallista-tyota" />
    <h2 id="co-every-title" className="co-h2" data-reveal>Tavallista työtä.<br /><span className="co-blue-text">Uudella tavalla.</span></h2>
    <p className="co-lead" data-reveal>Meitä kiinnostavat erityisesti yritykset, jotka pitävät arjen pyörimässä: työympäristöt, joissa asioiden täytyy tapahtua oikeassa maailmassa.</p>
    <ul className="co-places" aria-label="Työympäristöt">
      {PLACES.map((p, i) => <li key={p} data-reveal style={d(i)}>{p}</li>)}
      <li className="co-places__more" data-reveal style={d(PLACES.length)}>…ja lukemattomat muut.</li>
    </ul>
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

function OneJob() {
  return <section id="yksi-tyo-kerrallaan" className="co-section" aria-labelledby="co-one-title">
    <Chapter id="yksi-tyo-kerrallaan" />
    <h2 id="co-one-title" className="co-h2" data-reveal>Yksi työ <span className="co-blue-text">kerrallaan.</span></h2>
    <p className="co-lead" data-reveal>Get to Work on vasta rakentumassa.</p>
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
