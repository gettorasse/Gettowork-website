// Kyselyn tila. Pidetään sovelluksen ylimmällä tasolla, jotta etusivulla
// käynti ei tyhjennä muistissa olevaa arviointia.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type Answer, type PId } from './content.ts';
import { defaultPriorities, evaluate, isValidPair, localDateString, missingIndexes, sectionOf } from './engine.ts';
import {
  SECTIONS, loadAssessment, newAssessment, removeAssessment, saveAssessment, type Assessment, type View,
} from './storage.ts';
import { HOME_PATH } from '../router.ts';

export const MSG = {
  restoreFailed: 'Tallennettua testiä ei voitu palauttaa. Voit aloittaa uuden.',
  saveFailed: 'Tallennus tälle laitteelle ei onnistunut. Voit jatkaa ja tulostaa tuloksen.',
  noResult: 'Tulos muodostuu, kun olet vastannut kaikkiin väittämiin.',
  savedExit: 'Testi on tallennettu tähän selaimeen. Voit jatkaa sitä myöhemmin. Älä käytä tallennusta yhteiskäyttölaitteella.',
  deleted: 'Tallennettu testi on poistettu tältä laitteelta.',
} as const;

type HistoryState = { rs?: { view: View; step: number } };

const hasProgress = (a: Assessment) => a.answers.some(v => v !== null) || a.completedAt !== null;
const clampStep = (n: number) => Math.max(0, Math.min(SECTIONS - 1, Math.trunc(n) || 0));

/** Palautettu tietue: tulosnäkymä vain, jos kaikkiin on vastattu. */
function normalize(a: Assessment): Assessment {
  const missing = missingIndexes(a.answers);
  if (missing.length === 0) return a;
  return {
    ...a,
    selectedPriorities: null, prioritySource: 'recommended', completedAt: null, planStartDate: null,
    view: a.view === 'result' ? 'question' : a.view,
    currentStep: a.view === 'result' ? sectionOf(missing[0]) : a.currentStep,
  };
}

function finalize(a: Assessment, now = new Date()): Assessment {
  const ev = evaluate(a.answers);
  if (!ev.ok) return a;
  if (a.completedAt && a.planStartDate && isValidPair(a.selectedPriorities)) return { ...a, view: 'result' };
  return {
    ...a,
    view: 'result',
    selectedPriorities: defaultPriorities(ev),
    prioritySource: 'recommended',
    completedAt: now.toISOString(),
    planStartDate: localDateString(now),
  };
}

/** Vastauksen muutos valmiin tuloksen jälkeen laskee tuloksen ja ohjelman uudelleen. */
const invalidateResult = (a: Assessment): Assessment => a.completedAt === null ? a : {
  ...a, completedAt: null, planStartDate: null, selectedPriorities: null, prioritySource: 'recommended',
};

export function useRestartScore() {
  const [assessment, setAssessment] = useState<Assessment>(() => newAssessment());
  const [persist, setPersist] = useState(false);
  const [deviceDraft, setDeviceDraft] = useState<Assessment | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const ref = useRef(assessment);
  ref.current = assessment;

  // Tallennettu luonnos luetaan kerran sivun avautuessa (vanhentunut poistetaan).
  useEffect(() => {
    const loaded = loadAssessment();
    if (loaded.status === 'ok') setDeviceDraft(normalize(loaded.assessment));
    if (loaded.status === 'invalid') setNotice(MSG.restoreFailed);
  }, []);

  // Laitetallennuksen ollessa päällä muutokset tallennetaan samaan luonnokseen.
  useEffect(() => {
    if (!persist) return;
    if (!saveAssessment(assessment)) {
      setPersist(false);
      setStorageError(MSG.saveFailed);
    }
  }, [assessment, persist]);

  // Tallentamattomat vastaukset: selaimen varoitus tukena sivua suljettaessa tai päivitettäessä.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (persist || !hasProgress(ref.current)) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [persist]);

  const pushView = useCallback((view: View, step: number) => {
    const state: HistoryState = { rs: { view, step } };
    window.history.pushState(state, '', HOME_PATH);
  }, []);

  const go = useCallback((view: View, step?: number) => {
    const s = clampStep(step ?? ref.current.currentStep);
    setAssessment(a => ({ ...a, view, currentStep: s }));
    setNotice(null);
    pushView(view, s);
  }, [pushView]);

  /** Kutsutaan, kun selaimen historia vaihtuu (Takaisin/Eteenpäin) tai sivu avataan. */
  const syncFromHistory = useCallback((state: unknown, initial = false) => {
    const rs = (state as HistoryState | null)?.rs;
    if (initial || !rs) {
      window.history.replaceState({ rs: { view: 'intro', step: 0 } } satisfies HistoryState, '', window.location.href);
      setAssessment(a => ({ ...a, view: 'intro' }));
      return;
    }
    const step = clampStep(rs.step);
    if (rs.view === 'result') {
      if (missingIndexes(ref.current.answers).length > 0) {
        window.history.replaceState({ rs: { view: 'intro', step: 0 } } satisfies HistoryState, '', window.location.href);
        setAssessment(a => ({ ...a, view: 'intro' }));
        setNotice(MSG.noResult);
        return;
      }
      setAssessment(a => finalize(a));
      return;
    }
    setAssessment(a => ({ ...a, view: rs.view === 'question' ? 'question' : 'intro', currentStep: step }));
  }, []);

  const start = useCallback((replaceDeviceDraft = false) => {
    const fresh = { ...newAssessment(), view: 'question' as View, currentStep: 0 };
    setAssessment(fresh);
    setDeviceDraft(null);
    setNotice(null);
    if (replaceDeviceDraft) setPersist(true);
    pushView('question', 0);
  }, [pushView]);

  const resume = useCallback(() => {
    const source = deviceDraft && !persist ? deviceDraft : ref.current;
    if (deviceDraft && !persist) { setPersist(true); setDeviceDraft(null); }
    const missing = missingIndexes(source.answers);
    const next: Assessment = missing.length === 0
      ? finalize(source)
      : { ...source, view: 'question', currentStep: source.view === 'question' ? source.currentStep : sectionOf(missing[0]) };
    setAssessment(next);
    setNotice(null);
    pushView(next.view, next.currentStep);
  }, [deviceDraft, persist, pushView]);

  const setAnswer = useCallback((index: number, value: Answer) => {
    setAssessment(a => {
      if (a.answers[index] === value) return a;
      const answers = [...a.answers];
      answers[index] = value;
      return invalidateResult({ ...a, answers });
    });
  }, []);

  const showResult = useCallback(() => {
    const a = ref.current;
    if (missingIndexes(a.answers).length > 0) return false;
    const next = finalize(a);
    setAssessment(next);
    pushView('result', next.currentStep);
    return true;
  }, [pushView]);

  const choosePriorities = useCallback((pair: [PId, PId]) => {
    if (!isValidPair(pair)) return;
    setAssessment(a => {
      const ev = evaluate(a.answers);
      const rec = ev.ok ? defaultPriorities(ev) : null;
      const same = rec && rec[0] === pair[0] && rec[1] === pair[1];
      return { ...a, selectedPriorities: pair, prioritySource: same ? 'recommended' : 'user' };
    });
  }, []);

  const resetPriorities = useCallback(() => {
    setAssessment(a => {
      const ev = evaluate(a.answers);
      return ev.ok ? { ...a, selectedPriorities: defaultPriorities(ev), prioritySource: 'recommended' } : a;
    });
  }, []);

  const saveToDevice = useCallback(() => {
    if (saveAssessment(ref.current)) {
      setPersist(true);
      setStorageError(null);
      return true;
    }
    setStorageError(MSG.saveFailed);
    return false;
  }, []);

  const saveAndExit = useCallback(() => {
    const saved = saveToDevice();
    go('intro');
    if (saved) setNotice(MSG.savedExit);
  }, [go, saveToDevice]);

  const unlockReport = useCallback(() => {
    setAssessment(a => (a.leadSubmittedAt ? a : { ...a, leadSubmittedAt: new Date().toISOString() }));
  }, []);

  const deleteFromDevice = useCallback(() => {
    removeAssessment();
    setPersist(false);
    setDeviceDraft(null);
    setNotice(MSG.deleted);
  }, []);

  const derived = useMemo(() => ({
    evaluation: evaluate(assessment.answers),
    missing: missingIndexes(assessment.answers),
  }), [assessment.answers]);

  return {
    assessment, ...derived, persist, deviceDraft, notice, storageError,
    hasMemoryProgress: hasProgress(assessment),
    go, syncFromHistory, start, resume, setAnswer, showResult,
    choosePriorities, resetPriorities, saveToDevice, saveAndExit, deleteFromDevice, unlockReport,
    clearNotice: () => setNotice(null),
  };
}

export type RestartScoreState = ReturnType<typeof useRestartScore>;
