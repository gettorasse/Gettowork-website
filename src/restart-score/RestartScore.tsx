import React, { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { useTypewriter } from '../useTypewriter.ts';
import {
  ARCHETYPES, CONTACT_BODY, CONTACT_EMAIL, CONTACT_SUBJECT, LEVELS, LEVERS, LEVER_BY_ID, ORDER, PER_SECTION,
  PHASE_INFO, PLAN_PHASES, SCALE, ZONES, type Answer, type LevelKey, type PId,
} from './content.ts';
import {
  buildAreaPlan, defaultPriorities, formatFi, localDateString, planDay, sectionComplete, sectionIndexes, zoneFor,
  type AreaPlan, type Evaluation,
} from './engine.ts';
import type { RestartScoreState } from './useRestartScore.ts';
import { submitLead, validateLead, type Lead, type LeadErrors, type LeadPayload } from './lead.ts';
import './restart-score.css';

type FocusRef = RefObject<HTMLElement | null>;
type ViewProps = { rs: RestartScoreState; focusRef: FocusRef };
type Ok = Extract<Evaluation, { ok: true }>;

const TITLE = 'Minkälainen yrittäjä olet?';
const SUBTITLE = 'Tee testi ja selvitä, kuinka hyvin yrityksesi toimii.';
const TYPED = `${TITLE} ${SUBTITLE}`;
const QUESTION_PILLS = ['Miksi kiire ei lopu?', 'Onko hinnoittelu kohdallaan?', 'Mistä seuraavat asiakkaat?', 'Mihin aikani oikeasti menee?'];
let typedOnce = false;

/** Testi etenee etusivulla: tausta ja hahmo pysyvät, vain sisältö vaihtuu. */
export function RestartScore({ rs }: { rs: RestartScoreState }) {
  const { view, currentStep } = rs.assessment;
  const focusRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (firstRender.current) { firstRender.current = false; return; }
    focusRef.current?.focus({ preventScroll: true });
  }, [view, currentStep]);

  if (view === 'question') return <SectionView key={currentStep} rs={rs} focusRef={focusRef} />;
  if (view === 'result' && rs.evaluation.ok) return <Result rs={rs} focusRef={focusRef} />;
  return <Intro rs={rs} focusRef={focusRef} />;
}

function Notices({ rs }: { rs: RestartScoreState }) {
  const messages = [rs.notice, rs.storageError].filter(Boolean) as string[];
  return <div role="status" aria-live="polite" className="rs-notices">
    {messages.map(m => <p key={m} className="rs-notice">{m}</p>)}
  </div>;
}

// --- Etusivu: testin aloitus ---------------------------------------------------

function Intro({ rs, focusRef }: ViewProps) {
  const skip = typedOnce;
  const { displayed, done } = useTypewriter(TYPED, 38, 600, skip);
  const [pillsVisible, setPillsVisible] = useState(skip);
  useEffect(() => { if (done) typedOnce = true; }, [done]);
  useEffect(() => { if (skip) return; const t = setTimeout(() => setPillsVisible(true), 400); return () => clearTimeout(t); }, [skip]);

  const onSub = displayed.length > TITLE.length;
  const caret = <span className="cursor ml-[3px] inline-block h-[0.9em] w-[2px] bg-white align-[-0.08em]" />;
  const canResume = Boolean(rs.deviceDraft) || rs.hasMemoryProgress;
  const storedOnDevice = Boolean(rs.deviceDraft) || rs.persist;
  const start = () => {
    if (storedOnDevice && !window.confirm('Uusi testi korvaa tälle laitteelle tallennetun testin. Jatketaanko?')) return;
    rs.start(storedOnDevice);
  };

  return <>
    <main lang="fi" className="hero rs-home relative z-[1] flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
      <div className="relative z-10 max-w-[820px]">
        <h1 ref={focusRef as RefObject<HTMLHeadingElement | null>} tabIndex={-1} className="rs-home-title">
          <span className="sr-only">{TYPED}</span>
          {/* Näkymätön kopio varaa tilan, jottei sivu hypi kirjoituksen aikana. */}
          <span className="rs-home-title__ghost" aria-hidden="true"><span className="rs-home-title__big">{TITLE}</span> <span className="rs-home-title__sub">{SUBTITLE}</span></span>
          <span className="rs-home-title__typed" aria-hidden="true">
            {/* Kursori kulkee aina kirjoitettavan rivin lopussa, joten se ei hyppää omalle rivilleen. */}
            <span className="rs-home-title__big">{displayed.slice(0, TITLE.length)}{!done && !onSub && caret}</span>
            {onSub && <span className="rs-home-title__sub">{displayed.slice(TITLE.length + 1)}{!done && caret}</span>}
          </span>
        </h1>
        <div className="rs-home-actions" style={{ opacity: pillsVisible ? 1 : 0, transform: `translateY(${pillsVisible ? 0 : 8}px)`, transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <ul className="rs-checks">
            {QUESTION_PILLS.map(q => <li key={q}><CheckIcon />{q}</li>)}
          </ul>
          <div className="rs-home-main">
            <button type="button" className="pill white-pill rs-start" onClick={start}>Aloita testi <span aria-hidden="true">→</span></button>
            {canResume && <button type="button" className="pill outline-pill rs-resume" onClick={rs.resume}>Jatka testiä</button>}
          </div>
          <Notices rs={rs} />
        </div>
      </div>
    </main>
    <div className="mobile-scroll-spacer" aria-hidden="true" />
  </>;
}

function CheckIcon() {
  return <svg className="rs-checks__icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#1480ff" />
    <path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

// --- Osio: kuusi väittämää yhdellä sivulla --------------------------------------

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function SectionView({ rs, focusRef }: ViewProps) {
  const step = rs.assessment.currentStep;
  const lever = LEVERS[step];
  const answers = rs.assessment.answers;
  const indexes = sectionIndexes(step);
  const last = step === LEVERS.length - 1;
  const active = indexes.find(i => answers[i] === null) ?? null;
  const [error, setError] = useState(false);
  const itemRefs = useRef<Record<number, HTMLFieldSetElement | null>>({});
  const scrollTo = (i: number) => {
    const el = itemRefs.current[i];
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  };

  const select = (i: number, v: Answer) => {
    const wasEmpty = answers[i] === null;
    rs.setAnswer(i, v);
    setError(false);
    if (!wasEmpty) return;
    // Seuraava vastaamaton väittämä keskelle näyttöä.
    const next = indexes.find(j => j > i && answers[j] === null);
    if (next !== undefined) window.setTimeout(() => scrollTo(next), 260);
  };

  const submit = () => {
    if (!sectionComplete(answers, step)) {
      setError(true);
      const first = indexes.find(i => answers[i] === null)!;
      scrollTo(first);
      itemRefs.current[first]?.querySelector('input')?.focus({ preventScroll: true });
      return;
    }
    if (!last) { rs.go('question', step + 1); return; }
    rs.showResult();
  };
  const prev = () => (step === 0 ? rs.go('intro') : rs.go('question', step - 1));

  return <main lang="fi" className="rs-stage rs-stage--question">
    <form className="rs-sec" onSubmit={e => { e.preventDefault(); submit(); }} noValidate>
      <div className="rs-sec__top">
        <div className="rs-sec__row">
          <span className="rs-sec__phase">{PHASE_INFO[lever.phase].label}</span>
          <span className="rs-sec__count">Osa {step + 1} / {LEVERS.length}</span>
        </div>
        <div className="rs-segs" aria-hidden="true">
          {LEVERS.map((l, i) => <span key={l.id} className={`rs-seg${i < step ? ' is-done' : ''}${i === step ? ' is-current' : ''}${i > 0 && LEVERS[i - 1].phase !== l.phase ? ' is-gap' : ''}`} />)}
        </div>
        <h1 ref={focusRef as RefObject<HTMLHeadingElement | null>} tabIndex={-1} className="rs-sec__title">
          <span className="rs-sec__n">{String(step + 1).padStart(2, '0')}</span>{lever.name}
        </h1>
        <p className="rs-q__hint">{step === 0
          ? 'Vastaa sen mukaan, miten asiat ovat nyt – ei sen mukaan, miten haluaisit niiden olevan.'
          : PHASE_INFO[lever.phase].blurb}</p>
      </div>

      <div className="rs-statements">
        {indexes.map((i, k) => {
          const value = answers[i] as Answer | null;
          const state = value !== null ? 'is-done' : i === active ? 'is-active' : 'is-next';
          const name = `rs-a-${i}`;
          return <fieldset key={i} ref={el => { itemRefs.current[i] = el; }} className={`rs-st ${state}`}>
            <legend className="rs-st__text"><span className="sr-only">Väittämä {k + 1} / {PER_SECTION}: </span>{lever.statements[k].text}</legend>
            <div className="rs-scale">
              <div className="rs-scale__ends" aria-hidden="true"><span>Eri mieltä</span><span>Samaa mieltä</span></div>
              <div className="rs-scale__balls">
                {SCALE.map((label, n) => (
                  <label key={n} className={`rs-ball rs-ball--scale${value !== null && n <= value ? ' is-lit' : ''}${value === n ? ' is-selected' : ''}`}
                    style={{ '--i': n } as CSSProperties}>
                    <input type="radio" className="rs-ball__input" name={name} value={n} checked={value === n}
                      onChange={() => select(i, n as Answer)} />
                    <span className="rs-ball__face" aria-hidden="true" />
                    <span className="sr-only">{label}</span>
                  </label>
                ))}
              </div>
              <p className="rs-scale__value" aria-hidden="true">{value !== null ? SCALE[value] : ' '}</p>
            </div>
          </fieldset>;
        })}
      </div>

      {error && <p role="alert" className="rs-error">Vastaa kaikkiin kuuteen väittämään.</p>}

      <div className="rs-q__nav">
        <button type="button" className="pill outline-pill rs-btn" onClick={prev}><span aria-hidden="true">← </span>Edellinen</button>
        <button type="submit" className="pill white-pill rs-btn">{last ? 'Näytä tulos' : 'Seuraava'} <span aria-hidden="true">→</span></button>
        <button type="button" className="rs-link rs-q__save" onClick={rs.saveAndExit}>Tallenna ja jatka myöhemmin</button>
      </div>
    </form>
  </main>;
}

// --- Tulos -------------------------------------------------------------------

function Result({ rs, focusRef }: ViewProps) {
  const ev = rs.evaluation;
  const a = rs.assessment;
  // Juuri valmistunut tulos näyttää ensin lyhyen latauksen.
  const [loading, setLoading] = useState(() => Boolean(a.completedAt) && Date.now() - Date.parse(a.completedAt!) < 3000);
  const [revealTick, setRevealTick] = useState(0);
  useEffect(() => { if (!loading && revealTick > 0) focusRef.current?.focus({ preventScroll: true }); }, [loading, revealTick, focusRef]);
  if (!ev.ok) return null;
  if (loading) return <ResultLoader focusRef={focusRef} onDone={() => { setLoading(false); setRevealTick(t => t + 1); }} />;

  const arch = ARCHETYPES[ev.dominant];
  const start = a.planStartDate ?? localDateString(new Date());
  const completed = formatFi(a.completedAt ? localDateString(new Date(a.completedAt)) : start);
  const unlocked = Boolean(a.leadSubmittedAt);
  const selected = a.selectedPriorities ?? defaultPriorities(ev);
  const payload: Omit<LeadPayload, keyof Lead | 'website'> = {
    total: ev.total, ownerType: arch.name, level: ev.level.name, health: ev.health, priorities: selected, completedAt: a.completedAt,
  };

  return <main lang="fi" className="rs-stage rs-stage--panel">
    <article className="rs-panel rs-result">
      <p className="rs-eyebrow">Restart Score · {completed}</p>
      <p className="rs-hero__label">Yrittäjätyyppisi</p>
      <h1 ref={focusRef as RefObject<HTMLHeadingElement | null>} tabIndex={-1} className="rs-archetype">{arch.name}</h1>
      <p className="rs-hero__weakest">Heikoin osa-alue · {LEVER_BY_ID[ev.dominant].name}</p>
      <p className="rs-lead rs-hero__line">{arch.oneLine}</p>
      <div className="rs-scoreline">
        <p className="rs-score">{ev.total}<span className="rs-score__max"> / 120</span></p>
        <div>
          <p className="rs-level-chip">{ev.level.name}</p>
          <p className="rs-muted rs-small">{ev.level.tag}</p>
        </div>
      </div>
      <p className="rs-muted rs-small">Tulos perustuu omaan arvioosi. Se on keskustelun lähtökohta, ei mitattu diagnoosi.</p>

      {unlocked ? <Report rs={rs} ev={ev} selected={selected} start={start} /> : <LeadGate payload={payload} onUnlocked={rs.unlockReport} />}
    </article>
  </main>;
}

function Report({ rs, ev, selected, start }: { rs: RestartScoreState; ev: Ok; selected: [PId, PId]; start: string }) {
  const arch = ARCHETYPES[ev.dominant];
  const [picking, setPicking] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const plans = selected.map(id => buildAreaPlan(id, ev.health[id])) as [AreaPlan, AreaPlan];
  const userChoice = rs.assessment.prioritySource === 'user';
  const nextTwo = ev.ranked.filter(id => id !== ev.fixFirst).slice(0, 2);
  const remove = () => {
    if (window.confirm('Tallennettu tulos poistuu tältä laitteelta. Haluatko poistaa sen?')) rs.deleteFromDevice();
  };

  return <>
    <section className="rs-section" aria-labelledby="rs-what-title">
      <h2 id="rs-what-title" className="rs-h2">Mitä tämä tarkoittaa</h2>
      {arch.narrative.map(p => <p key={p.slice(0, 20)} className="rs-para">{p}</p>)}
      <div className="rs-callout">
        <p className="rs-label">Aloita tästä</p>
        <p>{arch.nextMove}</p>
      </div>
    </section>

    <section className="rs-section" aria-labelledby="rs-levers-title">
      <h2 id="rs-levers-title" className="rs-h2">Kaikki 12 osa-aluetta</h2>
      <p className="rs-muted rs-small">Palkki näyttää, kuinka hyvin osa-alue toimii nyt. Heikoimmat ovat ylimpänä – niissä on suurin mahdollisuus.</p>
      <p className="rs-legend" aria-hidden="true">
        {(Object.keys(ZONES) as (keyof typeof ZONES)[]).map(z => <span key={z} className={`rs-legend__item is-${z}`}>{ZONES[z].label}</span>)}
      </p>
      <ul className="rs-levers">
        {ev.ranked.map(id => <LeverRow key={id} id={id} health={ev.health[id]} isType={id === ev.dominant} isFirst={id === ev.fixFirst} />)}
      </ul>
    </section>

    <Ladder current={ev.level.key} />

    <section className="rs-section rs-two" aria-label="Vahvuudet ja varoitusmerkit">
      <div>
        <h2 className="rs-h2">Missä olet vahva</h2>
        <ul className="rs-bullets">{arch.strengths.map(t => <li key={t}>{t}</li>)}</ul>
      </div>
      <div>
        <h2 className="rs-h2">Varoitusmerkit</h2>
        <ul className="rs-bullets rs-bullets--warn">{arch.warnings.map(t => <li key={t}>{t}</li>)}</ul>
      </div>
    </section>

    <section className="rs-section rs-two" aria-label="Toiseksi heikoin ja vahvin osa-alue">
      <div>
        <p className="rs-label">Toiseksi heikoin osa-alue</p>
        <h2 className="rs-h3">{ARCHETYPES[ev.shadow].name} · {LEVER_BY_ID[ev.shadow].name}</h2>
        <p className="rs-para">{ARCHETYPES[ev.shadow].oneLine}</p>
        <p className="rs-note">{arch.shadow}</p>
      </div>
      <div>
        <p className="rs-label">Vahvin osa-alue</p>
        <h2 className="rs-h3">{LEVER_BY_ID[ev.strongest].name} <span className="rs-muted">· {ev.health[ev.strongest]} / 100</span></h2>
        <p className="rs-note">{ARCHETYPES[ev.strongest].strongest}</p>
      </div>
    </section>

    <section className="rs-section" aria-labelledby="rs-path-title">
      <p className="rs-label">Polku seuraavalle tasolle</p>
      {ev.nextLevel
        ? <h2 id="rs-path-title" className="rs-h2"><span className="rs-big-n">{ev.toNextLevel}</span> pistettä sinun ja {ev.nextLevel.name}-tason välissä.</h2>
        : <h2 id="rs-path-title" className="rs-h2">Olet ylimmällä tasolla.</h2>}
      <p className="rs-para">Korjaa ensin <strong>{LEVER_BY_ID[ev.fixFirst].name}</strong>.{' '}
        {ev.redCount > 0 && ev.fixFirst !== ev.dominant ? 'Se on perustavampi kuin heikoin osa-alueesi, ja sen korjaaminen helpottaa muita. ' : ''}
        Seuraavaksi kannattaa katsoa {LEVER_BY_ID[nextTwo[0]].name.toLowerCase()} ja {LEVER_BY_ID[nextTwo[1]].name.toLowerCase()}.</p>
    </section>

    <section className="rs-section" aria-labelledby="rs-plan-title">
      <div className="rs-plan-head">
        <h2 id="rs-plan-title" className="rs-h2">90 päivän ohjelma</h2>
        <button type="button" className="pill outline-pill rs-btn rs-noprint" aria-expanded={planOpen} aria-controls="rs-plan" onClick={() => setPlanOpen(v => !v)}>{planOpen ? 'Piilota' : 'Näytä ohjelma'}</button>
      </div>
      <p className="rs-muted">{LEVER_BY_ID[selected[0]].name} ja {LEVER_BY_ID[selected[1]].name.toLowerCase()} · alkaa {formatFi(start)} · tarkistus päivinä 30, 60 ja 90.</p>
      <div className="rs-actions rs-noprint">
        <button type="button" className="rs-link" onClick={() => setPicking(v => !v)} aria-expanded={picking}>Vaihda kehityskohteita</button>
        {userChoice && <button type="button" className="rs-link" onClick={rs.resetPriorities}>Palauta ehdotus</button>}
      </div>
      {picking && <PriorityPicker health={ev.health} initial={selected} onCancel={() => setPicking(false)}
        onApply={pair => { rs.choosePriorities(pair); setPicking(false); }} />}
      <Plan id="rs-plan" open={planOpen} plans={plans} start={start} />
    </section>

    <section className="rs-section rs-noprint">
      <div className="rs-actions">
        <button type="button" className="pill white-pill rs-btn" onClick={() => window.print()}>Tulosta tai tallenna PDF</button>
        <button type="button" className="pill outline-pill rs-btn" onClick={() => rs.go('question', 0)}>Muokkaa vastauksia</button>
        {rs.persist
          ? <button type="button" className="pill outline-pill rs-btn" onClick={remove}>Poista tallennus</button>
          : <button type="button" className="pill outline-pill rs-btn" onClick={rs.saveToDevice}>Tallenna tälle laitteelle</button>}
      </div>
      <p className="rs-muted rs-small" role="status" aria-live="polite">{rs.persist ? 'Tulos on tallennettu tähän selaimeen 120 päiväksi. ' : ''}Tee testi uudelleen 90 päivän päästä ja vertaa tulosta.</p>
      <Notices rs={rs} />
    </section>

    <Contact />
  </>;
}

function LeverRow({ id, health, isType, isFirst }: { id: PId; health: number; isType: boolean; isFirst: boolean }) {
  const [open, setOpen] = useState(false);
  const zone = zoneFor(health);
  const arch = ARCHETYPES[id];
  const panelId = `rs-lever-${id}`;
  return <li className={`rs-lever is-${zone}`}>
    <button type="button" className="rs-lever__head" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(v => !v)}>
      <span className="rs-lever__name">
        <span>{LEVER_BY_ID[id].name}</span>
        <small>{arch.name}</small>
        {(isType || isFirst) && <span className="rs-lever__tags">
          {isType && <span className="rs-tag">Tyyppisi</span>}
          {isFirst && <span className="rs-tag rs-tag--first">Korjaa ensin</span>}
        </span>}
      </span>
      <span className="rs-lever__bar" aria-hidden="true"><span style={{ width: `${Math.max(health, 2)}%` }} /></span>
      <span className="rs-lever__val">{health}<span className="sr-only"> / 100, {ZONES[zone].label}</span></span>
      <span className="rs-lever__plus" aria-hidden="true">{open ? '–' : '+'}</span>
    </button>
    <div id={panelId} className="rs-lever__more" hidden={!open}>
      <p>{arch.oneLine}</p>
      <p><span className="rs-label">Ensimmäinen askel</span>{arch.nextMove}</p>
    </div>
  </li>;
}

function Ladder({ current }: { current: LevelKey }) {
  const [shown, setShown] = useState<LevelKey>(current);
  const index = LEVELS.findIndex(l => l.key === shown);
  const level = LEVELS[index];
  return <section className="rs-section" aria-labelledby="rs-ladder-title">
    <h2 id="rs-ladder-title" className="rs-h2">Omistajan portaat</h2>
    <p className="rs-muted rs-small">Missä olet nyt ja mitä seuraava taso vaatii. Valitse taso.</p>
    <div className="rs-ladder" role="tablist" aria-label="Tasot">
      {LEVELS.map(l => <button key={l.key} type="button" role="tab" id={`rs-tab-${l.key}`} aria-selected={shown === l.key} aria-controls="rs-ladder-panel"
        className={`rs-ladder__step${l.key === current ? ' is-current' : ''}${shown === l.key ? ' is-selected' : ''}`} onClick={() => setShown(l.key)}>
        {l.name}<span className="rs-ladder__range">{l.min}–{l.max}</span>
      </button>)}
    </div>
    <div id="rs-ladder-panel" role="tabpanel" aria-labelledby={`rs-tab-${shown}`} className="rs-ladder__panel">
      <p className="rs-label">{shown === current ? 'Olet nyt' : `Taso ${index + 1}`} · {level.name}</p>
      <p className="rs-lead">{level.blurb}</p>
      <p className="rs-ladder__climb">{level.climbTitle} <span aria-hidden="true">→</span></p>
      <p className="rs-para">{level.climb}</p>
    </div>
  </section>;
}

const LOADING_STEPS = ['Lasketaan osa-alueita', 'Etsitään yrittäjätyyppiäsi', 'Kootaan raporttia'];

function ResultLoader({ focusRef, onDone }: { focusRef: FocusRef; onDone: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, LOADING_STEPS.length)), 700);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (step >= LOADING_STEPS.length) { const t = setTimeout(onDone, 250); return () => clearTimeout(t); } }, [step, onDone]);
  return <main lang="fi" className="rs-stage rs-stage--loading">
    <div className="rs-loader">
      <div className="rs-loader__balls" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <span key={i} style={{ '--i': i } as CSSProperties} />)}</div>
      <h1 ref={focusRef as RefObject<HTMLHeadingElement | null>} tabIndex={-1} className="rs-h1">Tulos valmistuu…</h1>
      <p className="rs-loader__step" role="status" aria-live="polite">{LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)]}</p>
    </div>
  </main>;
}

function LeadGate({ payload, onUnlocked }: { payload: Omit<LeadPayload, keyof Lead | 'website'>; onUnlocked: () => void }) {
  const [lead, setLead] = useState<Lead>({ name: '', email: '', phone: '' });
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<LeadErrors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), phone: useRef<HTMLInputElement>(null) };
  const set = (key: keyof Lead) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLead(l => ({ ...l, [key]: e.target.value }));
    if (errors[key]) setErrors(er => ({ ...er, [key]: undefined }));
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateLead(lead);
    setErrors(found);
    const first = (['name', 'email', 'phone'] as const).find(k => found[k]);
    if (first) { refs[first].current?.focus(); return; }
    setSending(true); setFailed(false);
    const res = await submitLead({ ...payload, name: lead.name.trim(), email: lead.email.trim(), phone: lead.phone.trim(), website });
    setSending(false);
    if (res.ok) onUnlocked(); else setFailed(true);
  };
  const field = (key: keyof Lead, label: string, type: string, autoComplete: string, required: boolean) => (
    <label className="rs-field">
      <span className="rs-field__label">{label}{!required && <span className="rs-muted"> (valinnainen)</span>}</span>
      <input ref={refs[key]} type={type} name={key} autoComplete={autoComplete} value={lead[key]} onChange={set(key)}
        required={required} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `rs-err-${key}` : undefined} />
      {errors[key] && <span id={`rs-err-${key}`} className="rs-field__error">{errors[key]}</span>}
    </label>
  );
  return <section className="rs-section rs-gate rs-noprint" aria-labelledby="rs-gate-title">
    <h2 id="rs-gate-title" className="rs-h2">Avaa koko raporttisi</h2>
    <p className="rs-muted">Kaikki 12 osa-aluetta, omistajan portaat, vahvuudet, varoitusmerkit ja 90 päivän ohjelma. Jätä yhteystietosi, niin raportti avautuu heti.</p>
    <form className="rs-gate__form" noValidate onSubmit={submit}>
      {field('name', 'Nimi', 'text', 'name', true)}
      {field('email', 'Sähköposti', 'email', 'email', true)}
      {field('phone', 'Puhelin', 'tel', 'tel', false)}
      {/* Roskapostiansa: piilossa ihmisiltä ja ruudunlukijoilta. */}
      <input className="rs-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)} />
      <div className="rs-gate__actions">
        <button type="submit" className="pill white-pill rs-btn rs-btn--big" disabled={sending}>{sending ? 'Raporttia kootaan…' : 'Avaa raporttini'} <span aria-hidden="true">→</span></button>
      </div>
      {failed && <p role="alert" className="rs-error">Lähetys ei onnistunut. Yritä hetken päästä uudelleen.</p>}
      <p className="rs-muted rs-small">Lähettämällä tiedot hyväksyt, että olemme sinuun yhteydessä tuloksesi tiimoilta. Emme luovuta tietoja eteenpäin. <a className="rs-inline-link" href="/tietosuoja" target="_blank" rel="noopener">Tietosuojaseloste</a></p>
    </form>
  </section>;
}

function PriorityPicker({ health, initial, onApply, onCancel }: {
  health: Record<PId, number>; initial: [PId, PId];
  onApply: (pair: [PId, PId]) => void; onCancel: () => void;
}) {
  const [sel, setSel] = useState<PId[]>([...initial]);
  const legendRef = useRef<HTMLLegendElement>(null);
  useEffect(() => { legendRef.current?.focus(); }, []);
  const toggle = (id: PId) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : s.length < 2 ? [...s, id] : s);

  return <fieldset className="rs-picker rs-noprint">
    <legend ref={legendRef} tabIndex={-1}>Valitse kaksi <span className="rs-muted" aria-live="polite">({sel.length} / 2)</span></legend>
    <ul>
      {ORDER.map(id => {
        const checked = sel.includes(id);
        return <li key={id}>
          <label className="rs-check">
            <input type="checkbox" checked={checked} disabled={!checked && sel.length >= 2} onChange={() => toggle(id)} />
            <span>{LEVER_BY_ID[id].name}</span>
            <span className="rs-picker__score">{health[id]}</span>
          </label>
        </li>;
      })}
    </ul>
    <div className="rs-actions">
      <button type="button" className="pill white-pill rs-btn" disabled={sel.length !== 2} onClick={() => sel.length === 2 && onApply([sel[0], sel[1]])}>Käytä valintaa</button>
      <button type="button" className="pill outline-pill rs-btn" onClick={onCancel}>Peruuta</button>
    </div>
  </fieldset>;
}

function Plan({ id, open, plans, start }: { id: string; open: boolean; plans: [AreaPlan, AreaPlan]; start: string }) {
  const name = (pid: PId) => LEVER_BY_ID[pid].name;
  return <div id={id} className={`rs-plan${open ? '' : ' is-collapsed'}`}>
    <div className="rs-phase__tasks rs-plan__goals">
      {plans.map(p => <div key={p.id} className="rs-task">
        <p className="rs-label">{name(p.id)} · {p.health} / 100</p>
        <p>{p.goal}</p>
      </div>)}
    </div>
    {PLAN_PHASES.map((phase, i) => <section key={phase.from} className="rs-phase">
      <h3 className="rs-h3">Päivät {phase.from}–{phase.to} · {phase.title}</h3>
      <p className="rs-muted rs-small">{formatFi(planDay(start, phase.from))}–{formatFi(planDay(start, phase.to))}</p>
      <div className="rs-phase__tasks">
        {plans.map(p => <div key={p.id} className="rs-task">
          <p className="rs-label">{name(p.id)}</p>
          <p>{p.steps[i].task}</p>
          <p className="rs-done">Valmis, kun {p.steps[i].done}</p>
        </div>)}
      </div>
    </section>)}
    <section className="rs-phase">
      <h3 className="rs-h3">Seurantamittarit</h3>
      <div className="rs-phase__tasks">
        {plans.map(p => <div key={p.id} className="rs-task">
          <p className="rs-label">{name(p.id)}</p>
          <p>{p.metric}</p>
          <p className="rs-print-only">Lähtöarvo: __________ · Tavoite: __________</p>
        </div>)}
      </div>
      <p className="rs-muted rs-small">Vastuu: sinä tai nimeämäsi henkilö<span className="rs-print-only"> ____________________</span>. Päivänä 90 tee testi uudelleen ja vertaa tulosta.</p>
    </section>
  </div>;
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}&body=${encodeURIComponent(CONTACT_BODY)}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(CONTACT_EMAIL); setCopied(true); } catch { setCopied(false); }
  };
  return <section className="rs-section rs-contact" aria-labelledby="rs-contact-title">
    <h2 id="rs-contact-title" className="rs-h2">Haluatko sparrata seuraavat askeleet?</h2>
    <p className="rs-muted">Ota tulos mukaan keskusteluun. Käydään läpi, mistä kannattaa aloittaa.</p>
    <div className="rs-actions">
      <a className="pill white-pill rs-btn rs-noprint" href={href}>Keskustele tuloksesta</a>
      <button type="button" className="rs-link rs-noprint" onClick={copy}>{copied ? 'Kopioitu' : `Kopioi ${CONTACT_EMAIL}`}</button>
      <span className="rs-print-only">{CONTACT_EMAIL}</span>
    </div>
  </section>;
}
