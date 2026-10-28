// Kyselyn tila. Pidetään sovelluksen ylimmällä tasolla, jotta etusivulla
// käynti ei tyhjennä muistissa olevaa arviointia.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ORDER, type PId, type Score } from './content.ts';
import { evaluate, isValidPair, localDateString, missingIds } from './engine.ts';
import {
  loadAssessment, newAssessment, removeAssessment, saveAssessment, type Assessment, type View,
} from './storage.ts';
import { HOME_PATH } from '../router.ts';

export const MSG = {
  restoreFailed: 'Tallennettua testiä ei voitu palauttaa. Voit aloittaa uuden.',
  saveFailed: 'Tallennus tälle laitteelle ei onnistunut. Voit jatkaa ja tulostaa tuloksen.',
  noResult: 'Tulos muodostuu, kun olet vastannut kaikkiin kysymyksiin.',
  savedExit: 'Testi on tallennettu tähän selaimeen. Voit jatkaa sitä myöhemmin. Älä käytä tallennusta yhteiskäyttölaitteella.',
  deleted: 'Tallennettu testi on poistettu tältä laitteelta.',
} as const;

type HistoryState = { rs?: { view: View; step: number } };

const hasProgress = (a: Assessment) =>
  ORDER.some(id => a.answers[id] !== null) || a.deferred.length > 0 || a.completedAt !== null;

/** Palautetun tietueen johdetut tiedot lasketaan aina uudelleen. */
function normalize(a: Assessment): Assessment {
  const ev = evaluate(a.answers);
  if (!ev.ok) {
    return {
      ...a,
      recommendedPriorities: null, selectedPriorities: null, prioritySource: 'recommended',
      completedAt: null, planStartDate: null,
      view: a.view === 'result' ? 'review' : a.view,
    };
  }
  const recommended = ev.recommendedPriorities;
  const keepUser = a.prioritySource === 'user' && isValidPair(a.selectedPriorities);
  return {
    ...a,
    recommendedPriorities: recommended,
    selectedPriorities: keepUser ? a.selectedPriorities : recommended,
    prioritySource: keepUser ? 'user' : 'recommended',
  };
}

function finalize(a: Assessment, now = new Date()): Assessment {
  const ev = evaluate(a.answers);
  if (!ev.ok) return a;
  if (a.completedAt && a.planStartDate && isValidPair(a.selectedPriorities)) {
    return { ...a, recommendedPriorities: ev.recommendedPriorities, view: 'result' };
  }
  return {
    ...a,
    view: 'result',
    recommendedPriorities: ev.recommendedPriorities,
    selectedPriorities: ev.recommendedPriorities,
    prioritySource: 'recommended',
    completedAt: now.toISOString(),
    planStartDate: localDateString(now),
  };
}

/** Vastauksen muutos valmiin tuloksen jälkeen muodostaa ehdotuksen ja ohjelman uudelleen. */
const invalidateResult = (a: Assessment): Assessment => a.completedAt === null ? a : {
  ...a,
  completedAt: null, planStartDate: null,
  recommendedPriorities: null, selectedPriorities: null, prioritySource: 'recommended',
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
    const s = step ?? ref.current.currentStep;
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
    const step = Math.max(0, Math.min(11, Math.trunc(rs.step) || 0));
    if (rs.view === 'result') {
      if (missingIds(ref.current.answers).length > 0) {
        window.history.replaceState({ rs: { view: 'intro', step: 0 } } satisfies HistoryState, '', window.location.href);
        setAssessment(a => ({ ...a, view: 'intro' }));
        setNotice(MSG.noResult);
        return;
      }
      setAssessment(a => finalize(a));
      return;
    }
    setAssessment(a => ({ ...a, view: rs.view, currentStep: step }));
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
    const target: View = source.view === 'intro' ? (source.completedAt ? 'result' : 'question') : source.view;
    let next: Assessment = { ...source, view: target };
    if (target === 'result') {
      next = missingIds(source.answers).length > 0 ? { ...source, view: 'review' } : finalize(source);
    }
    setAssessment(next);
    setNotice(null);
    pushView(next.view, next.currentStep);
  }, [deviceDraft, persist, pushView]);

  const setScore = useCallback((id: PId, score: Score) => {
    setAssessment(a => {
      if (a.answers[id] === score && !a.deferred.includes(id)) return a;
      const next = { ...a, answers: { ...a.answers, [id]: score }, deferred: a.deferred.filter(d => d !== id) };
      return a.answers[id] === score ? next : invalidateResult(next);
    });
  }, []);

  const showResult = useCallback(() => {
    const a = ref.current;
    if (missingIds(a.answers).length > 0) return false;
    const next = finalize(a);
    setAssessment(next);
    pushView('result', next.currentStep);
    return true;
  }, [pushView]);

  const choosePriorities = useCallback((pair: [PId, PId]) => {
    if (!isValidPair(pair)) return;
    setAssessment(a => {
      const rec = a.recommendedPriorities;
      const same = rec && rec[0] === pair[0] && rec[1] === pair[1];
      return { ...a, selectedPriorities: pair, prioritySource: same ? 'recommended' : 'user' };
    });
  }, []);

  const resetPriorities = useCallback(() => {
    setAssessment(a => ({ ...a, selectedPriorities: a.recommendedPriorities, prioritySource: 'recommended' }));
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

  const deleteFromDevice = useCallback(() => {
    removeAssessment();
    setPersist(false);
    setDeviceDraft(null);
    setNotice(MSG.deleted);
  }, []);

  const derived = useMemo(() => {
    const ev = evaluate(assessment.answers);
    return { evaluation: ev, missing: missingIds(assessment.answers) };
  }, [assessment.answers]);

  return {
    assessment, ...derived, persist, deviceDraft, notice, storageError,
    hasMemoryProgress: hasProgress(assessment),
    go, syncFromHistory, start, resume, setScore, showResult,
    choosePriorities, resetPriorities, saveToDevice, saveAndExit, deleteFromDevice,
    clearNotice: () => setNotice(null),
  };
}

export type RestartScoreState = ReturnType<typeof useRestartScore>;
