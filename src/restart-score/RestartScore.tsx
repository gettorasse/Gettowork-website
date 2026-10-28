import { useEffect, useRef, useState, type RefObject } from 'react';
import { BackgroundVideo } from '../BackgroundVideo.tsx';
import {
  BANDS, CONTACT_BODY, CONTACT_EMAIL, CONTACT_SUBJECT, ORDER, PHASES, QUESTIONS, QUESTION_BY_ID,
  type PId, type Score,
} from './content.ts';
import { areaLevel, areaStatus, buildAreaPlan, formatFi, localDateString, planDay, type AreaPlan } from './engine.ts';
import type { RestartScoreState } from './useRestartScore.ts';
import './restart-score.css';

type HeadingRef = RefObject<HTMLHeadingElement | null>;
type ViewProps = { rs: RestartScoreState; headingRef: HeadingRef };

const SOLO_NOTE = 'Arvioi sinulle sopivaa toimintamallia; hyvä tulos ei edellytä työntekijöiden palkkaamista.';
const SHARED_DEVICE_NOTE = 'Tallennus koskee tätä selainta ja laitetta. Älä käytä sitä yhteiskäyttölaitteella.';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function RestartScore({ rs }: { rs: RestartScoreState }) {
  const { view, currentStep } = rs.assessment;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const [fromReview, setFromReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
  }, [view, currentStep]);

  useEffect(() => { if (view === 'intro' || view === 'result') setFromReview(false); }, [view]);

  return (
    <main lang="fi" className={`rs-root rs-root--${view}`}>
      {view === 'intro' && <Intro rs={rs} headingRef={headingRef} />}
      {view === 'question' && <QuestionView key={currentStep} rs={rs} headingRef={headingRef} fromReview={fromReview} />}
      {view === 'review' && <Review rs={rs} headingRef={headingRef} onEdit={step => { setFromReview(true); rs.go('question', step); }} />}
      {view === 'result' && (rs.evaluation.ok
        ? <Result rs={rs} headingRef={headingRef} />
        : <Review rs={rs} headingRef={headingRef} onEdit={step => { setFromReview(true); rs.go('question', step); }} />)}
    </main>
  );
}

function Notices({ rs }: { rs: RestartScoreState }) {
  const messages = [rs.notice, rs.storageError].filter(Boolean) as string[];
  return <div role="status" aria-live="polite" className="rs-notices">
    {messages.map(m => <p key={m} className="rs-notice">{m}</p>)}
  </div>;
}

// --- Aloitus -----------------------------------------------------------------

function Intro({ rs, headingRef }: ViewProps) {
  const desktop = useMediaQuery('(min-width: 769px)');
  const draft = rs.deviceDraft;
  const canResume = Boolean(draft) || rs.hasMemoryProgress;
  const storedOnDevice = Boolean(draft) || rs.persist;

  const startNew = () => {
    if (storedOnDevice && !window.confirm('Uusi arviointi korvaa tälle laitteelle tallennetun arvioinnin. Haluatko jatkaa?')) return;
    rs.start(storedOnDevice);
  };
  const remove = () => {
    if (window.confirm('Tallennettu arviointi poistuu tältä laitteelta. Haluatko poistaa sen?')) rs.deleteFromDevice();
  };

  return <>
    {desktop && <BackgroundVideo />}
    <section className="rs-intro">
      <p className="rs-eyebrow">GETTOWORK RESTART SCORE</p>
      <h1 ref={headingRef} tabIndex={-1} className="rs-h1">Toimiiko yrityksesi myös ilman sinua?</h1>
      <p className="rs-lead">Arvioi yrityksesi 12 osa-aluetta. Saat kokonaiskuvan tilanteestasi, kaksi kehityskohdetta ja 90 päivän ohjelman, jonka avulla rakennat toimivampaa arkea.</p>
      <p className="rs-meta">12 kysymystä · noin 5–8 minuuttia · tulos heti</p>
      <Notices rs={rs} />
      {draft && <p className="rs-muted">Tälle laitteelle on tallennettu kesken jäänyt arviointi (päivitetty {formatFi(localDateString(new Date(draft.updatedAt)))}).</p>}
      <div className="rs-actions">
        {canResume
          ? <>
              <button type="button" className="pill white-pill rs-btn" onClick={rs.resume}>Jatka kesken jäänyttä</button>
              <button type="button" className="pill outline-pill rs-btn" onClick={startNew}>Aloita uusi arviointi</button>
            </>
          : <button type="button" className="pill white-pill rs-btn" onClick={() => rs.start(false)}>Aloita arviointi</button>}
      </div>
      <div className="rs-intro-details">
        <p>Yrityksen omistajalle tai sen arjesta vastaavalle vetäjälle. Vastaa yhden yrityksen tai liiketoimintayksikön näkökulmasta.</p>
        <p>Arvioi viimeisten 90 päivän toteutunutta arkea, älä suunnitelmia. Käytä kirjanpitoa, asiakaspalautetta ja muita havaintoja apuna. Jos yritys on nuorempi, arvioi sen tähänastista toimintaa. Jos et tunne tilannetta, voit merkitä vastauksen keskeneräiseksi ja palata siihen.</p>
        <p>{SOLO_NOTE}</p>
        <p className="rs-muted">Vastaukset käsitellään tässä selaimessa. Voit tallentaa ne tälle laitteelle jatkamista varten. Tulos ei edellytä yhteystietoja.</p>
        {storedOnDevice && <button type="button" className="rs-link" onClick={remove}>Poista tallennettu arviointi</button>}
      </div>
    </section>
  </>;
}

// --- Kysymys -----------------------------------------------------------------

function QuestionView({ rs, headingRef, fromReview }: ViewProps & { fromReview: boolean }) {
  const step = rs.assessment.currentStep;
  const q = QUESTIONS[step];
  const value = rs.assessment.answers[q.id];
  const deferred = rs.assessment.deferred.includes(q.id);
  const [error, setError] = useState(false);
  const [errorTick, setErrorTick] = useState(0);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const last = step === QUESTIONS.length - 1;
  const ids = { help: `rs-help-${q.id}`, anchors: `rs-anchors-${q.id}`, error: `rs-error-${q.id}` };

  const ensureAnswered = () => {
    if (value !== null || deferred) return true;
    setError(true);
    setErrorTick(t => t + 1);
    return false;
  };
  useEffect(() => { if (errorTick > 0) errorRef.current?.focus(); }, [errorTick]);
  const next = () => { if (ensureAnswered()) rs.go(last ? 'review' : 'question', last ? step : step + 1); };
  const prev = () => (step === 0 ? rs.go('intro') : rs.go('question', step - 1));
  const backToReview = () => { if (ensureAnswered()) rs.go('review'); };

  return <section className="rs-panel rs-question">
    <div className="rs-progress">
      <p className="rs-step">Kysymys {step + 1} / {QUESTIONS.length}</p>
      <div className="rs-progress__track" role="progressbar" aria-label="Eteneminen" aria-valuemin={1} aria-valuemax={QUESTIONS.length} aria-valuenow={step + 1} aria-valuetext={`Kysymys ${step + 1} / ${QUESTIONS.length}`}>
        <span style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>
    </div>

    <h1 ref={headingRef} tabIndex={-1} className="rs-h2">{q.name} <span className="rs-pname" lang="en">{q.p}</span></h1>

    <fieldset className="rs-fieldset" aria-describedby={`${ids.help} ${ids.anchors}${error ? ` ${ids.error}` : ''}`}>
      <legend className="rs-legend">{q.question}</legend>
      <p id={ids.help} className="rs-help">{q.help}</p>

      <div className="rs-scale">
        {Array.from({ length: 11 }, (_, n) => (
          <label key={n} className="rs-score">
            <input type="radio" className="rs-score__input" name={`rs-score-${q.id}`} value={n} checked={value === n}
              onChange={() => { rs.setScore(q.id, n as Score); setError(false); }} />
            <span className="rs-score__face" aria-hidden="true">{n}</span>
            <span className="sr-only">{n} pistettä 10:stä</span>
          </label>
        ))}
      </div>

      <dl id={ids.anchors} className="rs-anchors">
        {([0, 5, 10] as const).map(n => <div key={n}><dt>{n} pistettä</dt><dd>{q.anchors[n]}</dd></div>)}
      </dl>

      <p className="rs-selected" aria-hidden="true">{value !== null ? `Valintasi: ${value} / 10 · ${areaStatus(value)}` : deferred ? 'Merkitty keskeneräiseksi' : 'Ei vielä valintaa'}</p>

      <label className="rs-check">
        <input type="checkbox" checked={deferred} onChange={e => { rs.setDeferred(q.id, e.target.checked); setError(false); }} />
        <span>En osaa vielä arvioida</span>
      </label>
      {(q.id === 'people' || q.id === 'protect') && <p className="rs-muted rs-small">{SOLO_NOTE}</p>}
    </fieldset>

    {error && <p ref={errorRef} id={ids.error} tabIndex={-1} role="alert" className="rs-error">Valitse pisteet tai merkitse, ettet osaa vielä arvioida.</p>}

    <div className="rs-nav">
      <button type="button" className="pill outline-pill rs-btn" onClick={prev}>Edellinen</button>
      {fromReview && !last && <button type="button" className="pill outline-pill rs-btn" onClick={backToReview}>Palaa tarkistukseen</button>}
      <button type="button" className="pill white-pill rs-btn" onClick={next}>{last ? 'Tarkista vastaukset' : 'Seuraava'}</button>
    </div>

    <div className="rs-save">
      <button type="button" className="rs-link" onClick={rs.saveAndExit}>Tallenna tälle laitteelle ja poistu</button>
      <p className="rs-muted rs-small">{SHARED_DEVICE_NOTE}</p>
      {!rs.persist && <p className="rs-muted rs-small">Vastaukset ovat tallessa vain tässä välilehdessä. Sivun päivitys tai sulkeminen tyhjentää ne, ellet tallenna niitä tälle laitteelle.</p>}
      <Notices rs={rs} />
    </div>
  </section>;
}

// --- Tarkistus ---------------------------------------------------------------

function Review({ rs, headingRef, onEdit }: ViewProps & { onEdit: (step: number) => void }) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const missing = rs.missing;
  const firstMissing = missing.length ? ORDER.indexOf(missing[0]) : -1;
  const show = () => {
    if (missing.length) { summaryRef.current?.focus(); return; }
    rs.showResult();
  };

  return <section className="rs-panel rs-review">
    <h1 ref={headingRef} tabIndex={-1} className="rs-h2">Tarkista vastauksesi</h1>
    {rs.assessment.completedAt && <p className="rs-muted">Vastausten muokkaaminen muodostaa kehityskohteet ja ohjelman uudelleen.</p>}

    {missing.length > 0 && <div ref={summaryRef} tabIndex={-1} className="rs-summary" role="region" aria-label="Puuttuvat arviot">
      <p>Vastaa vielä {missing.length} osa-alueeseen, jotta voimme laskea tuloksen.</p>
      <button type="button" className="rs-link" onClick={() => onEdit(firstMissing)}>Siirry ensimmäiseen puuttuvaan: {QUESTION_BY_ID[missing[0]].name}</button>
    </div>}

    <ol className="rs-review-list">
      {QUESTIONS.map((q, i) => {
        const v = rs.assessment.answers[q.id];
        return <li key={q.id}>
          <span className="rs-review-name">{q.name} <span className="rs-pname" lang="en">{q.p}</span></span>
          <span className={v === null ? 'rs-review-missing' : 'rs-review-score'}>{v === null ? <><span aria-hidden="true">! </span>Arvio puuttuu</> : `${v} / 10`}</span>
          <button type="button" className="pill outline-pill rs-btn rs-btn--small" onClick={() => onEdit(i)} aria-label={`Muokkaa: ${q.name}`}>Muokkaa</button>
        </li>;
      })}
    </ol>

    <div className="rs-nav">
      <button type="button" className="pill outline-pill rs-btn" onClick={() => rs.go('question', QUESTIONS.length - 1)}>Edellinen</button>
      <button type="button" className="pill white-pill rs-btn" aria-disabled={missing.length > 0} onClick={show}>Näytä tulos</button>
    </div>
    <Notices rs={rs} />
  </section>;
}

// --- Tulos -------------------------------------------------------------------

function Result({ rs, headingRef }: ViewProps) {
  const ev = rs.evaluation;
  const a = rs.assessment;
  const [picking, setPicking] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  if (!ev.ok) return null;

  const selected = a.selectedPriorities ?? ev.recommendedPriorities;
  const userChoice = a.prioritySource === 'user';
  const scores = a.answers as Record<PId, Score>;
  const plans = selected.map(id => buildAreaPlan(id, scores[id])) as [AreaPlan, AreaPlan];
  const band = BANDS[ev.band];
  const start = a.planStartDate ?? localDateString(new Date());
  const completed = a.completedAt ? formatFi(localDateString(new Date(a.completedAt))) : formatFi(start);

  const save = () => setSaveStatus(rs.saveToDevice() ? 'Arviointi tallennettiin tälle laitteelle.' : null);
  const remove = () => {
    if (!window.confirm('Tallennettu tulos poistuu tältä laitteelta. Tämän sivun tulos säilyy, kunnes suljet tai päivität sivun.')) return;
    rs.deleteFromDevice();
    setSaveStatus(null);
  };

  return <article className="rs-panel rs-panel--wide rs-result">
    <header className="rs-result-head">
      <p className="rs-eyebrow">GETTOWORK RESTART SCORE</p>
      <p className="rs-muted">Valmistunut {completed}</p>
      <h1 ref={headingRef} tabIndex={-1} className="rs-total"><span>{ev.total}</span><span className="rs-total__max"> / 120</span></h1>
      <h2 className="rs-h2">{band.title}</h2>
      <p className="rs-lead">{band.text}</p>
      <p className="rs-muted">Tulos perustuu omaan arvioosi viimeisten 90 päivän arjesta. Käytä sitä keskustelun ja kehittämisen lähtökohtana.</p>
    </header>

    <section className="rs-section" aria-labelledby="rs-areas-title">
      <h2 id="rs-areas-title" className="rs-h3">Osa-alueet</h2>
      <ul className="rs-areas">
        {QUESTIONS.map(q => {
          const s = scores[q.id];
          const isPriority = selected.includes(q.id);
          return <li key={q.id} className={`rs-area rs-area--${areaLevel(s)}`}>
            <span className="rs-area__name">{q.name} <span className="rs-pname" lang="en">{q.p}</span>{isPriority && <span className="rs-tag">Prioriteetti</span>}</span>
            <span className="rs-area__bar" aria-hidden="true"><span style={{ width: `${s * 10}%` }} /></span>
            <span className="rs-area__score">{s} / 10</span>
            <span className="rs-area__status">{areaStatus(s)}</span>
          </li>;
        })}
      </ul>
    </section>

    <section className="rs-section" aria-labelledby="rs-prio-title">
      <h2 id="rs-prio-title" className="rs-h3">{ev.maintenanceOnly ? 'Kaksi ylläpidettävää vahvuutta' : 'Kaksi seuraavaa kehityskohdettasi'}</h2>
      {userChoice
        ? <p><strong>Oma valintasi.</strong> Laskettu ehdotus: {ev.recommendedPriorities.map(id => QUESTION_BY_ID[id].name).join(' · ')}.</p>
        : <>
            <p>{ev.maintenanceOnly
              ? 'Vastauksissa ei ole selvästi heikkoa osa-aluetta. Näillä kahdella varmistat, että vahva käytäntö kestää myös muutoksia.'
              : 'Nämä osa-alueet saivat arvioinnissasi pienimmät pisteet.'}</p>
            {ev.tieBroken && <p className="rs-muted">Tasapisteissä ehdotus käyttää kyselyn järjestystä. Se ei tarkoita, että muut saman pistemäärän osa-alueet olisivat vähemmän tärkeitä.</p>}
          </>}
      <p className="rs-muted rs-small">Ehdotus on itsearvioinnin pohjalta tehty aloitusehdotus, ei todennettu juurisyy tai taloudellisen vaikutuksen analyysi.</p>

      <div className="rs-priorities">
        {plans.map((p, i) => <div key={p.id} className="rs-priority">
          <p className="rs-priority__index">Prioriteetti {i + 1}</p>
          <h3 className="rs-h4">{QUESTION_BY_ID[p.id].name} <span className="rs-pname" lang="en">{QUESTION_BY_ID[p.id].p}</span></h3>
          <p className="rs-priority__score">{p.score} / 10 · {areaStatus(p.score)}</p>
          <dl className="rs-dl">
            <dt>Valinnan peruste</dt>
            <dd>{userChoice ? 'Oma valintasi' : ev.maintenanceOnly ? `Ylläpidettävä vahvuus, arviosi ${p.score} / 10` : `Arvioinnin pienimpiä pisteitä, ${p.score} / 10`}</dd>
            <dt>90 päivän tavoite</dt><dd>{p.goal}</dd>
            <dt>Työskentelyohje</dt><dd>{p.guidance}</dd>
            <dt>Ensimmäinen tehtävä</dt><dd>{p.steps[0].task} <span className="rs-done">Valmis, kun {p.steps[0].done}</span></dd>
          </dl>
        </div>)}
      </div>

      <div className="rs-actions rs-noprint">
        {!picking && <button type="button" className="pill outline-pill rs-btn" onClick={() => setPicking(true)}>Vaihda kehityskohteita</button>}
        {userChoice && !picking && <button type="button" className="pill outline-pill rs-btn" onClick={rs.resetPriorities}>Palauta ehdotus</button>}
      </div>
      {picking && <PriorityPicker scores={scores} initial={selected}
        onCancel={() => setPicking(false)}
        onApply={pair => { rs.choosePriorities(pair); setPicking(false); }} />}
    </section>

    <Plan plans={plans} start={start} />

    <section className="rs-section rs-noprint" aria-labelledby="rs-actions-title">
      <h2 id="rs-actions-title" className="rs-h3">Tallenna ja jatka</h2>
      <div className="rs-actions">
        <button type="button" className="pill white-pill rs-btn" onClick={() => window.print()}>Tulosta tai tallenna PDF</button>
        <button type="button" className="pill outline-pill rs-btn" onClick={() => rs.go('review')}>Muokkaa vastauksia</button>
        {!rs.persist && <button type="button" className="pill outline-pill rs-btn" onClick={save}>Tallenna tälle laitteelle</button>}
        {rs.persist && <button type="button" className="pill outline-pill rs-btn" onClick={remove}>Poista tallennettu arviointi</button>}
      </div>
      <div role="status" aria-live="polite">
        {rs.persist && <p className="rs-muted rs-small">{saveStatus ?? 'Arviointi on tallennettu tälle laitteelle.'} Tallennus vanhenee 120 päivää viimeisestä muutoksesta.</p>}
      </div>
      {!rs.persist && <p className="rs-muted rs-small">{SHARED_DEVICE_NOTE}</p>}
      <Notices rs={rs} />
    </section>

    <Contact />
  </article>;
}

function PriorityPicker({ scores, initial, onApply, onCancel }: {
  scores: Record<PId, Score>; initial: [PId, PId];
  onApply: (pair: [PId, PId]) => void; onCancel: () => void;
}) {
  const [sel, setSel] = useState<PId[]>([...initial]);
  const legendRef = useRef<HTMLLegendElement>(null);
  useEffect(() => { legendRef.current?.focus(); }, []);
  const toggle = (id: PId) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : s.length < 2 ? [...s, id] : s);

  return <fieldset id="rs-picker" className="rs-picker">
    <legend ref={legendRef} tabIndex={-1} className="rs-h4">Valitse kaksi kehityskohdetta</legend>
    <p className="rs-muted rs-small" aria-live="polite">Valittu {sel.length} / 2. Kokonaispisteet eivät muutu.</p>
    <ul>
      {QUESTIONS.map(q => {
        const checked = sel.includes(q.id);
        return <li key={q.id}>
          <label className="rs-check">
            <input type="checkbox" checked={checked} disabled={!checked && sel.length >= 2} onChange={() => toggle(q.id)} />
            <span>{q.name} <span className="rs-pname" lang="en">{q.p}</span></span>
            <span className="rs-picker__score">{scores[q.id]} / 10</span>
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

// --- 90 päivän ohjelma -------------------------------------------------------

function Plan({ plans, start }: { plans: [AreaPlan, AreaPlan]; start: string }) {
  const name = (id: PId) => QUESTION_BY_ID[id].name;
  return <section className="rs-section rs-plan" aria-labelledby="rs-plan-title">
    <h2 id="rs-plan-title" className="rs-h3">90 päivän ohjelma</h2>
    <p className="rs-plan-areas">Kehityskohteet: {name(plans[0].id)} · {name(plans[1].id)}</p>
    <dl className="rs-plan-meta">
      <div><dt>Aloitus</dt><dd>Päivä 1 · {formatFi(start)}</dd></div>
      <div><dt>Rytmi</dt><dd>20 minuutin katsaus kerran viikossa</dd></div>
      <div><dt>Tarkistuspisteet</dt><dd>{[30, 60, 90].map(d => `päivä ${d} (${formatFi(planDay(start, d))})`).join(', ')}</dd></div>
      <div><dt>Vastuuhenkilö</dt><dd>Sinä / yrityksen vetäjä <span className="rs-print-only">· muu vastuuhenkilö: ____________________</span></dd></div>
    </dl>

    {PHASES.map((phase, i) => <section key={phase.from} className="rs-phase" aria-labelledby={`rs-phase-${i}`}>
      <div className="rs-phase__head">
        <h3 id={`rs-phase-${i}`} className="rs-h4">Päivät {phase.from}–{phase.to}: {phase.title}</h3>
        <p className="rs-muted rs-small">{formatFi(planDay(start, phase.from))}–{formatFi(planDay(start, phase.to))}</p>
        <p>{phase.text}</p>
      </div>
      <div className="rs-phase__tasks">
        {plans.map(p => <div key={p.id} className="rs-task">
          <p className="rs-task__area">{name(p.id)}</p>
          <p>{p.steps[i].task}</p>
          <p className="rs-done">Valmis, kun {p.steps[i].done}</p>
        </div>)}
      </div>
      {i === 2 && <p className="rs-phase__note">Päivänä 90 tee Restart Score uudelleen kaikille 12 osa-alueelle ja vertaa tulosta tallentamaasi tai tulostamaasi raporttiin.</p>}
    </section>)}

    <section className="rs-phase" aria-labelledby="rs-metrics-title">
      <h3 id="rs-metrics-title" className="rs-h4">Seurantamittarit</h3>
      <div className="rs-phase__tasks">
        {plans.map(p => <div key={p.id} className="rs-task">
          <p className="rs-task__area">{name(p.id)}</p>
          <p>{p.metric}</p>
          <p className="rs-print-only">Lähtöarvo: ____________ · Tavoite: ____________ · Havaintoja: ______</p>
        </div>)}
      </div>
      <p className="rs-muted rs-small">Kirjaa mittarin lähtöarvo, tavoite ja havaintojen lukumäärä itse, jotta pienestä aineistosta ei tehdä liian vahvoja johtopäätöksiä. Kokeilujen määrät ovat oletuksia; sovita ne toimintasi rytmiin.</p>
    </section>
  </section>;
}

// --- Yhteydenotto ------------------------------------------------------------

function Contact() {
  const [copied, setCopied] = useState(false);
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}&body=${encodeURIComponent(CONTACT_BODY)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return <section className="rs-section rs-contact" aria-labelledby="rs-contact-title">
    <h2 id="rs-contact-title" className="rs-h3">Haluatko sparrata seuraavat askeleet?</h2>
    <p>Ota tulos mukaan keskusteluun. Voimme käydä läpi, mistä muutoksesta kannattaa aloittaa.</p>
    <div className="rs-actions rs-noprint">
      <a className="pill white-pill rs-btn" href={href}>Keskustele tuloksesta</a>
      <button type="button" className="pill outline-pill rs-btn" onClick={copy}>Kopioi osoite</button>
    </div>
    <p className="rs-email"><span className="rs-muted">Sähköposti: </span><span className="rs-select">{CONTACT_EMAIL}</span></p>
    <p role="status" aria-live="polite" className="rs-muted rs-small">{copied ? 'Osoite kopioitu.' : ''}</p>
  </section>;
}
