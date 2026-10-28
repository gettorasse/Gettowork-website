// Valinnainen tallennus tälle laitteelle. Vain yksi localStorage-avain; muuta
// sivuston tallennustilaa ei kosketa. Vastauksia ei lähetetä minnekään.
import { CONTENT_VERSION, ORDER, type PId, type Score } from './content.ts';
import { emptyAnswers, isDateString, isPId, isScore, isValidPair, type Answers } from './engine.ts';

export const STORAGE_KEY = 'gettowork.restart-score.v1';
export const RETENTION_DAYS = 120;
const DAY_MS = 24 * 60 * 60 * 1000;

export type View = 'intro' | 'question' | 'review' | 'result';
const VIEWS: readonly View[] = ['intro', 'question', 'review', 'result'];

export type Assessment = {
  schemaVersion: 1;
  contentVersion: typeof CONTENT_VERSION;
  answers: Answers;
  deferred: PId[];
  currentStep: number;
  view: View;
  recommendedPriorities: [PId, PId] | null;
  selectedPriorities: [PId, PId] | null;
  prioritySource: 'recommended' | 'user';
  completedAt: string | null;
  planStartDate: string | null;
  updatedAt: string;
  expiresAt: string;
};

export function newAssessment(now = new Date()): Assessment {
  return {
    schemaVersion: 1,
    contentVersion: CONTENT_VERSION,
    answers: emptyAnswers(),
    deferred: [],
    currentStep: 0,
    view: 'intro',
    recommendedPriorities: null,
    selectedPriorities: null,
    prioritySource: 'recommended',
    completedAt: null,
    planStartDate: null,
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + RETENTION_DAYS * DAY_MS).toISOString(),
  };
}

const isIsoDate = (v: unknown) => typeof v === 'string' && !Number.isNaN(Date.parse(v));

/** Tiukka rakennetarkistus. Palauttaa null, jos tietue ei kelpaa sellaisenaan. */
export function parseAssessment(raw: unknown): Assessment | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.schemaVersion !== 1 || r.contentVersion !== CONTENT_VERSION) return null;

  const a = r.answers;
  if (!a || typeof a !== 'object' || Array.isArray(a)) return null;
  const answerRecord = a as Record<string, unknown>;
  if (Object.keys(answerRecord).length !== ORDER.length) return null;
  for (const id of ORDER) {
    const v = answerRecord[id];
    if (v !== null && !isScore(v)) return null;
  }

  if (!Array.isArray(r.deferred) || !r.deferred.every(isPId)) return null;
  if (r.deferred.some(id => answerRecord[id as PId] !== null)) return null;
  if (typeof r.currentStep !== 'number' || !Number.isInteger(r.currentStep) || r.currentStep < 0 || r.currentStep > 11) return null;
  if (!VIEWS.includes(r.view as View)) return null;
  if (r.recommendedPriorities !== null && !isValidPair(r.recommendedPriorities)) return null;
  if (r.selectedPriorities !== null && !isValidPair(r.selectedPriorities)) return null;
  if (r.prioritySource !== 'recommended' && r.prioritySource !== 'user') return null;
  if (r.completedAt !== null && !isIsoDate(r.completedAt)) return null;
  if (r.planStartDate !== null && !isDateString(r.planStartDate)) return null;
  if (!isIsoDate(r.updatedAt) || !isIsoDate(r.expiresAt)) return null;

  return {
    schemaVersion: 1,
    contentVersion: CONTENT_VERSION,
    answers: Object.fromEntries(ORDER.map(id => [id, answerRecord[id] as Score | null])) as Answers,
    deferred: [...new Set(r.deferred as PId[])],
    currentStep: r.currentStep as number,
    view: r.view as View,
    recommendedPriorities: r.recommendedPriorities as [PId, PId] | null,
    selectedPriorities: r.selectedPriorities as [PId, PId] | null,
    prioritySource: r.prioritySource as 'recommended' | 'user',
    completedAt: r.completedAt as string | null,
    planStartDate: r.planStartDate as string | null,
    updatedAt: r.updatedAt as string,
    expiresAt: r.expiresAt as string,
  };
}

export type LoadResult =
  | { status: 'none' }
  | { status: 'ok'; assessment: Assessment }
  | { status: 'invalid' }
  | { status: 'unavailable' };

export function loadAssessment(now = new Date()): LoadResult {
  let text: string | null;
  try {
    text = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'unavailable' };
  }
  if (text === null) return { status: 'none' };

  let assessment: Assessment | null = null;
  try {
    assessment = parseAssessment(JSON.parse(text));
  } catch {
    assessment = null;
  }
  if (!assessment) {
    removeAssessment();
    return { status: 'invalid' };
  }
  if (Date.parse(assessment.expiresAt) <= now.getTime()) {
    removeAssessment();
    return { status: 'none' };
  }
  return { status: 'ok', assessment };
}

/** Tallentaa ja päivittää vanhenemisajan. Palauttaa false, jos selain estää tallennuksen. */
export function saveAssessment(assessment: Assessment, now = new Date()): boolean {
  const record: Assessment = {
    ...assessment,
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + RETENTION_DAYS * DAY_MS).toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function removeAssessment(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
