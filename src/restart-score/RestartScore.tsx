import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { lookAt } from '../BackgroundVideo.tsx';
import { useTypewriter } from '../useTypewriter.ts';
import {
  BANDS, CONTACT_BODY, CONTACT_EMAIL, CONTACT_SUBJECT, OWNER_TYPES, PHASES, QUESTIONS, QUESTION_BY_ID,
  type PId, type Score,
} from './content.ts';
import { buildAreaPlan, formatFi, localDateString, planDay, type AreaPlan } from './engine.ts';
import type { RestartScoreState } from './useRestartScore.ts';
import './restart-score.css';

type FocusRef = RefObject<HTMLElement | null>;
type ViewProps = { rs: RestartScoreState; focusRef: FocusRef };

const TYPED = 'Minkälainen yrittäjä sinä olet? Tee testi ja selvitä, kuinka hyvin yrityksesi toimii.';
const QUESTION_PILLS = ['Miksi kiire ei lopu?', 'Onko hinnoittelu kohdallaan?', 'Mistä seuraavat asiakkaat?', 'Mihin aikani oikeasti menee?'];
let typedOnce = false;

/** Testi etenee etusivulla: tausta ja hahmo pysyvät, vain sisältö vaihtuu. */
export function RestartScore({ rs }: { rs: RestartScoreState }) {
  const { view, currentStep } = rs.assessment;
  const focusRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const [fromReview, setFromReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (firstRender.current) { firstRender.current = false; return; }
    focusRef.current?.focus({ preventScroll: true });
  }, [view, currentStep]);
  useEffect(() => { if (view === 'intro' || view === 'result') setFromReview(false); }, [view]);

  const edit = (step: number) => { setFromReview(true); rs.go('question', step); };

  if (view === 'intro') return <Intro rs={rs} focusRef={focusRef} />;
  if (view === 'question') return <QuestionView key={currentStep} rs={rs} focusRef={focusRef} fromReview={fromReview} />;
  if (view === 'result' && rs.evaluation.ok) return <Result rs={rs} focusRef={focusRef} />;
  return <Review rs={rs} focusRef={focusRef} onEdit={edit} />;
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

  const canResume = Boolean(rs.deviceDraft) || rs.hasMemoryProgress;
  const storedOnDevice = Boolean(rs.deviceDraft) || rs.persist;
  const start = () => {
    if (storedOnDevice && !window.confirm('Uusi testi korvaa tälle laitteelle tallennetun testin. Jatketaanko?')) return;
    rs.start(storedOnDevice);
  };

  return <>
    <main lang="fi" className="hero rs-home relative z-[1] flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
      <div className="relative z-10 max-w-xl">
        <h1 ref={focusRef as RefObject<HTMLHeadingElement | null>} tabIndex={-1} className="typewriter mb-5 min-h-[54px] text-white sm:mb-6">
          <span className="sr-only">{TYPED}</span>
          <span aria-hidden="true">{displayed}{!done && <span className="cursor ml-[2px] inline-block h-[1.1em] w-[2px] bg-white align-middle" />}</span>
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
      <a className="pill outline-pill rs-contact-corner gap-2 sm:gap-3" href={`mailto:${CONTACT_EMAIL}`} style={{ opacity: pillsVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}><span>Tavoita minut: <span className="underline underline-offset-1">{CONTACT_EMAIL}</span></span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 5 10 8 10-8" /></svg></a>
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

// --- Kysymys -----------------------------------------------------------------

function QuestionView({ rs, focusRef, fromReview }: ViewProps & { fromReview: boolean }) {
  const step = rs.assessment.currentStep;
  const q = QUESTIONS[step];
  const value = rs.assessment.answers[q.id];
  const last = step === QUESTIONS.length - 1;
  const [error, setError] = useState(false);
  const [errorTick, setErrorTick] = useState(0);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (errorTick > 0) errorRef.current?.focus(); }, [errorTick]);
  useEffect(() => { if (value !== null) lookAt(value / 10); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (n: number) => { rs.setScore(q.id, n as Score); setError(false); lookAt(n / 10); };
  const submit = () => {
    if (value === null) { setError(true); setErrorTick(t => t + 1); return; }
    if (fromReview) { rs.go('review'); return; }
    if (!last) { rs.go('question', step + 1); return; }
    if (!rs.showResult()) rs.go('review');
  };
  const prev = () => (step === 0 ? rs.go('intro') : rs.go('question', step - 1));
  const endsId = `rs-ends-${q.id}`;

  return <main lang="fi" className="rs-stage rs-stage--question">
    <form className="rs-q" onSubmit={e => { e.preventDefault(); submit(); }} noValidate>
      <div className="rs-q__top">
        <p className="rs-q__meta"><span className="rs-q__count">{step + 1} / {QUESTIONS.length}</span> {q.name}</p>
        <div className="rs-q__progress" aria-hidden="true"><span style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
      </div>
      <fieldset className="rs-q__field" aria-describedby={endsId}>
        <legend ref={focusRef as RefObject<HTMLLegendElement | null>} tabIndex={-1} className="rs-q__title">{q.question}</legend>
        <p className="rs-q__hint">{q.help}{step === 0 && <><br />Arvioi viimeisen 90 päivän toteutunutta arkea.</>}</p>
        <div className="rs-answer">
        <div className="rs-balls">
          {Array.from({ length: 11 }, (_, n) => (
            <label key={n} className={`rs-ball${value !== null && n <= value ? ' is-lit' : ''}${value === n ? ' is-selected' : ''}`}
              style={{ '--i': n } as CSSProperties} onMouseEnter={() => lookAt(n / 10)}>
              <input type="radio" className="rs-ball__input" name={`rs-score-${q.id}`} value={n} checked={value === n}
                onChange={() => select(n)} onFocus={() => lookAt(n / 10)} />
              <span className="rs-ball__face" aria-hidden="true">{n}</span>
              <span className="sr-only">{n} pistettä 10:stä</span>
            </label>
          ))}
        </div>
        <div id={endsId} className="rs-ends">
          <p><span className="rs-ends__n">0</span> {q.anchors[0]}</p>
          <p><span className="rs-ends__n">10</span> {q.anchors[10]}</p>
        </div>
        </div>
      </fieldset>

      {error && <p ref={errorRef} tabIndex={-1} role="alert" className="rs-error">Valitse pisteet 0–10.</p>}

      <div className="rs-q__nav">
        <button type="button" className="pill outline-pill rs-btn" onClick={prev}><span aria-hidden="true">← </span>Edellinen</button>
        <button type="submit" className="pill white-pill rs-btn">{fromReview ? 'Valmis' : last ? 'Näytä tulos' : 'Seuraava'} <span aria-hidden="true">→</span></button>
        <button type="button" className="rs-link rs-q__save" onClick={rs.saveAndExit}>Tallenna ja jatka myöhemmin</button>
      </div>
    </form>
  </main>;
}

// --- Vastausten muokkaus -------------------------------------------------------

function Review({ rs, focusRef, onEdit }: ViewProps & { onEdit: (step: number) => void }) {
  const missing = rs.missing;
  const show = () => { if (!rs.showResult()) onEdit(QUESTIONS.findIndex(q => q.id === missing[0])); };
  return <main lang="fi" className="rs-stage rs-stage--panel">
    <section className="rs-panel">
      <h1 ref={focusRef as RefObject<HTMLHeadingElement | null>} tabIndex={-1} className="rs-h1">Vastauksesi</h1>
      {rs.assessment.completedAt && <p className="rs-muted">Muutos laskee kehityskohteet ja ohjelman uudelleen.</p>}
      {missing.length > 0 && <p className="rs-notice">Vastaa vielä {missing.length} kysymykseen, niin näet tuloksen.</p>}
      <ol className="rs-review">
        {QUESTIONS.map((q, i) => {
          const v = rs.assessment.answers[q.id];
          return <li key={q.id}>
            <span>{q.name}</span>
            <span className="rs-review__score">{v === null ? '–' : `${v} / 10`}</span>
            <button type="button" className="rs-link" onClick={() => onEdit(i)} aria-label={`Muokkaa: ${q.name}`}>Muokkaa</button>
          </li>;
        })}
      </ol>
      <div className="rs-actions">
        <button type="button" className="pill white-pill rs-btn" onClick={show}>{missing.length ? 'Jatka vastaamista' : 'Näytä tulos'} <span aria-hidden="true">→</span></button>
      </div>
      <Notices rs={rs} />
    </section>
  </main>;
}

// --- Tulos -------------------------------------------------------------------

function Result({ rs, focusRef }: ViewProps) {
  const ev = rs.evaluation;
  const a = rs.assessment;
  const [picking, setPicking] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  if (!ev.ok) return null;

  const selected = a.selectedPriorities ?? ev.recommendedPriorities;
  const userChoice = a.prioritySource === 'user';
  const scores = a.answers as Record<PId, Score>;
  const plans = selected.map(id => buildAreaPlan(id, scores[id])) as [AreaPlan, AreaPlan];
  const type = OWNER_TYPES[ev.band];
  const start = a.planStartDate ?? localDateString(new Date());
  const completed = formatFi(a.completedAt ? localDateString(new Date(a.completedAt)) : start);

  const remove = () => {
    if (window.confirm('Tallennettu tulos poistuu tältä laitteelta. Haluatko poistaa sen?')) rs.deleteFromDevice();
  };

  return <main lang="fi" className="rs-stage rs-stage--panel">
    <article className="rs-panel rs-result">
      <p className="rs-eyebrow">Restart Score · {completed}</p>
      <h1 ref={focusRef as RefObject<HTMLHeadingElement | null>} tabIndex={-1} className="rs-total">{ev.total}<span className="rs-total__max"> / 120</span></h1>
      <p className="rs-type">Olet <strong>{type.name}</strong></p>
      <p className="rs-lead">{type.tagline} {BANDS[ev.band].text}</p>
      <p className="rs-muted rs-small">Tulos perustuu omaan arvioosi viimeisten 90 päivän arjesta.</p>

      <section className="rs-section" aria-labelledby="rs-areas-title">
        <h2 id="rs-areas-title" className="rs-h2">Osa-alueet</h2>
        <ul className="rs-areas">
          {QUESTIONS.map(q => {
            const s = scores[q.id];
            const prio = selected.includes(q.id);
            return <li key={q.id} className={prio ? 'is-priority' : undefined}>
              <span className="rs-areas__name">{q.name}{prio && <span className="sr-only"> (kehityskohde)</span>}</span>
              <span className="rs-areas__dots" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < s ? 'on' : undefined} />)}</span>
              <span className="rs-areas__score">{s}</span>
            </li>;
          })}
        </ul>
      </section>

      <section className="rs-section" aria-labelledby="rs-prio-title">
        <h2 id="rs-prio-title" className="rs-h2">{ev.maintenanceOnly ? 'Kaksi vahvuutta varmistettavaksi' : 'Kaksi kehityskohdetta'}</h2>
        <p className="rs-muted">{userChoice ? 'Oma valintasi.' : ev.maintenanceOnly ? 'Heikkoa osa-aluetta ei löytynyt – varmista, että vahvuudet kestävät myös muutoksia.' : 'Pienimmät pisteesi.'}
          {!userChoice && ev.tieBroken && ' Tasapisteissä järjestys seuraa kysymysten järjestystä.'}</p>
        <div className="rs-priorities">
          {plans.map((p, i) => <div key={p.id} className="rs-priority">
            <p className="rs-priority__n">{i + 1}</p>
            <h3 className="rs-h3">{QUESTION_BY_ID[p.id].name} <span className="rs-priority__score">{p.score} / 10</span></h3>
            <p>{p.goal}</p>
            <p className="rs-priority__first"><span className="rs-label">Aloita näin</span>{p.steps[0].task}</p>
          </div>)}
        </div>
        <div className="rs-actions rs-noprint">
          <button type="button" className="rs-link" onClick={() => setPicking(v => !v)} aria-expanded={picking}>Vaihda kehityskohteita</button>
          {userChoice && <button type="button" className="rs-link" onClick={rs.resetPriorities}>Palauta ehdotus</button>}
        </div>
        {picking && <PriorityPicker scores={scores} initial={selected} onCancel={() => setPicking(false)}
          onApply={pair => { rs.choosePriorities(pair); setPicking(false); }} />}
      </section>

      <section className="rs-section" aria-labelledby="rs-plan-title">
        <div className="rs-plan-head">
          <h2 id="rs-plan-title" className="rs-h2">90 päivän ohjelma</h2>
          <button type="button" className="pill outline-pill rs-btn rs-noprint" aria-expanded={planOpen} aria-controls="rs-plan" onClick={() => setPlanOpen(v => !v)}>{planOpen ? 'Piilota' : 'Näytä ohjelma'}</button>
        </div>
        <p className="rs-muted">Alkaa {formatFi(start)} · 20 minuutin katsaus kerran viikossa · tarkistus päivinä 30, 60 ja 90.</p>
        <Plan id="rs-plan" open={planOpen} plans={plans} start={start} />
      </section>

      <section className="rs-section rs-noprint">
        <div className="rs-actions">
          <button type="button" className="pill white-pill rs-btn" onClick={() => window.print()}>Tulosta tai tallenna PDF</button>
          <button type="button" className="pill outline-pill rs-btn" onClick={() => rs.go('review')}>Muokkaa vastauksia</button>
          {rs.persist
            ? <button type="button" className="pill outline-pill rs-btn" onClick={remove}>Poista tallennus</button>
            : <button type="button" className="pill outline-pill rs-btn" onClick={rs.saveToDevice}>Tallenna tälle laitteelle</button>}
        </div>
        <p className="rs-muted rs-small" role="status" aria-live="polite">{rs.persist ? 'Tulos on tallennettu tähän selaimeen 120 päiväksi.' : ''}</p>
        <Notices rs={rs} />
      </section>

      <Contact />
    </article>
  </main>;
}

function PriorityPicker({ scores, initial, onApply, onCancel }: {
  scores: Record<PId, Score>; initial: [PId, PId];
  onApply: (pair: [PId, PId]) => void; onCancel: () => void;
}) {
  const [sel, setSel] = useState<PId[]>([...initial]);
  const legendRef = useRef<HTMLLegendElement>(null);
  useEffect(() => { legendRef.current?.focus(); }, []);
  const toggle = (id: PId) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : s.length < 2 ? [...s, id] : s);

  return <fieldset className="rs-picker rs-noprint">
    <legend ref={legendRef} tabIndex={-1}>Valitse kaksi <span className="rs-muted" aria-live="polite">({sel.length} / 2)</span></legend>
    <ul>
      {QUESTIONS.map(q => {
        const checked = sel.includes(q.id);
        return <li key={q.id}>
          <label className="rs-check">
            <input type="checkbox" checked={checked} disabled={!checked && sel.length >= 2} onChange={() => toggle(q.id)} />
            <span>{q.name}</span>
            <span className="rs-picker__score">{scores[q.id]}</span>
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
  const name = (pid: PId) => QUESTION_BY_ID[pid].name;
  return <div id={id} className={`rs-plan${open ? '' : ' is-collapsed'}`}>
    {PHASES.map((phase, i) => <section key={phase.from} className="rs-phase">
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
