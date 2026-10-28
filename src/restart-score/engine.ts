// Gettowork Restart Score — laskenta. Ei riippuvuuksia käyttöliittymään.
import {
  AREA_GUIDANCE, AREA_STATUS, MAINTENANCE_STEPS, ORDER, PLAN_LIBRARY,
  type AreaLevel, type BandKey, type PId, type PlanStep, type Score,
} from './content.ts';

export type Answers = Record<PId, Score | null>;

export function isPId(value: unknown): value is PId {
  return typeof value === 'string' && (ORDER as readonly string[]).includes(value);
}

/** Hyväksyy vain kokonaisluvut 0–10. Merkkijonoja, desimaaleja tai NaN-arvoa ei korjata. */
export function isScore(value: unknown): value is Score {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10;
}

export function emptyAnswers(): Answers {
  return Object.fromEntries(ORDER.map(id => [id, null])) as Answers;
}

export function missingIds(answers: Record<string, unknown>): PId[] {
  return ORDER.filter(id => !isScore(answers[id]));
}

export function bandFor(total: number): BandKey {
  return total <= 39 ? 'foundation'
    : total <= 69 ? 'stabilise'
    : total <= 99 ? 'independence' : 'resilience';
}

export function areaLevel(score: number): AreaLevel {
  return score <= 3 ? 'build' : score <= 6 ? 'stabilise' : score <= 8 ? 'strengthen' : 'maintain';
}

export const areaStatus = (score: number) => AREA_STATUS[areaLevel(score)];
export const areaGuidance = (score: number) => AREA_GUIDANCE[areaLevel(score)];

export type Evaluation =
  | { ok: false; invalidIds: PId[] }
  | {
      ok: true;
      total: number;
      band: BandKey;
      recommendedPriorities: [PId, PId];
      /** Kahden ensimmäisen järjestys tai toinen valinta ratkesi tasapisteillä. */
      tieBroken: boolean;
      maintenanceOnly: boolean;
    };

export function evaluate(answers: Record<string, unknown>): Evaluation {
  const rows = ORDER.map((id, index) => ({ id, index, score: answers[id] }));
  const invalid = rows.filter(row => !isScore(row.score));
  if (invalid.length > 0) return { ok: false, invalidIds: invalid.map(row => row.id) };

  const complete = rows.map(row => ({ ...row, score: row.score as Score }));
  const total = complete.reduce((sum, row) => sum + row.score, 0);
  const ranked = [...complete].sort((a, b) => a.score - b.score || a.index - b.index);

  return {
    ok: true,
    total,
    band: bandFor(total),
    recommendedPriorities: [ranked[0].id, ranked[1].id],
    tieBroken: ranked[0].score === ranked[1].score || ranked[1].score === ranked[2].score,
    maintenanceOnly: complete.every(row => row.score >= 9),
  };
}

export function isValidPair(pair: unknown): pair is [PId, PId] {
  return Array.isArray(pair) && pair.length === 2 && isPId(pair[0]) && isPId(pair[1]) && pair[0] !== pair[1];
}

export type AreaPlan = {
  id: PId;
  score: Score;
  goal: string;
  guidance: string;
  steps: [PlanStep, PlanStep, PlanStep];
  metric: string;
  verification: boolean;
};

/** Ohjelma vain valitulle osa-alueelle. Pisteillä 9–10 tehtävät painottavat varmistamista. */
export function buildAreaPlan(id: PId, score: Score): AreaPlan {
  const entry = PLAN_LIBRARY[id];
  const verification = score >= 9;
  return {
    id,
    score,
    goal: entry.goal,
    guidance: areaGuidance(score),
    steps: verification ? MAINTENANCE_STEPS : entry.steps,
    metric: entry.metric,
    verification,
  };
}

// --- Kalenteripäivät (paikallinen päivä, ei kellonaikaa → kesäaika ei vaikuta) ---

const pad = (n: number) => String(n).padStart(2, '0');

export function localDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function addCalendarDays(start: string, days: number): string {
  const [y, m, d] = start.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Ohjelman päivä N (1 = aloituspäivä). */
export const planDay = (start: string, day: number) => addCalendarDays(start, day - 1);

/** Suomalainen muoto 28.10.2026. */
export function formatFi(dateString: string): string {
  const [y, m, d] = dateString.split('-').map(Number);
  return `${d}.${m}.${y}`;
}
