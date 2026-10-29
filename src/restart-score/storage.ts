// Valinnainen tallennus tälle laitteelle. Vain yksi localStorage-avain; muuta
// sivuston tallennustilaa ei kosketa. Vastauksia ei lähetetä minnekään.
import { CONTENT_VERSION, TOTAL_Q, type PId } from './content.ts';
import { emptyAnswers, isAnswer, isDateString, isValidPair, type Answers } from './engine.ts';

export const STORAGE_KEY = 'gettowork.restart-score.v2';
/** Edellisen version tallennus poistetaan, koska kysymykset vaihtuivat. */
export const LEGACY_STORAGE_KEY = 'gettowork.restart-score.v1';
export const RETENTION_DAYS = 120;
export const SECTIONS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

export type View = 'intro' | 'question' | 'result';
const VIEWS: readonly View[] = ['intro', 'question', 'result'];

export type Assessment = {
  schemaVersion: 2;
  contentVersion: typeof CONTENT_VERSION;
  answers: Answers;
  /** Osio 0–11. */
  currentStep: number;
  view: View;
  selectedPriorities: [PId, PId] | null;
  prioritySource: 'recommended' | 'user';
  completedAt: string | null;
  planStartDate: string | null;
  /** Milloin yhteystiedot jätettiin raportin avaamiseksi. Itse yhteystietoja ei tallenneta laitteelle. */
  leadSubmittedAt: string | null;
  updatedAt: string;
  expiresAt: string;
};

export function newAssessment(now = new Date()): Assessment {
  return {
    schemaVersion: 2,
    contentVersion: CONTENT_VERSION,
    answers: emptyAnswers(),
    currentStep: 0,
    view: 'intro',
    selectedPriorities: null,
    prioritySource: 'recommended',
    completedAt: null,
    planStartDate: null,
    leadSubmittedAt: null,
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + RETENTION_DAYS * DAY_MS).toISOString(),
  };
}

const isIsoDate = (v: unknown) => typeof v === 'string' && !Number.isNaN(Date.parse(v));

/** Tiukka rakennetarkistus. Palauttaa null, jos tietue ei kelpaa sellaisenaan. */
export function parseAssessment(raw: unknown): Assessment | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.schemaVersion !== 2 || r.contentVersion !== CONTENT_VERSION) return null;
  if (!Array.isArray(r.answers) || r.answers.length !== TOTAL_Q) return null;
  if (!r.answers.every(v => v === null || isAnswer(v))) return null;
  if (typeof r.currentStep !== 'number' || !Number.isInteger(r.currentStep) || r.currentStep < 0 || r.currentStep >= SECTIONS) return null;
  if (!VIEWS.includes(r.view as View)) return null;
  if (r.selectedPriorities !== null && !isValidPair(r.selectedPriorities)) return null;
  if (r.prioritySource !== 'recommended' && r.prioritySource !== 'user') return null;
  if (r.completedAt !== null && !isIsoDate(r.completedAt)) return null;
  if (r.planStartDate !== null && !isDateString(r.planStartDate)) return null;
  if (r.leadSubmittedAt !== null && !isIsoDate(r.leadSubmittedAt)) return null;
  if (!isIsoDate(r.updatedAt) || !isIsoDate(r.expiresAt)) return null;

  return {
    schemaVersion: 2,
    contentVersion: CONTENT_VERSION,
    answers: [...r.answers] as Answers,
    currentStep: r.currentStep as number,
    view: r.view as View,
    selectedPriorities: r.selectedPriorities as [PId, PId] | null,
    prioritySource: r.prioritySource as 'recommended' | 'user',
    completedAt: r.completedAt as string | null,
    planStartDate: r.planStartDate as string | null,
    leadSubmittedAt: r.leadSubmittedAt as string | null,
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
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
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
