// Gettowork Restart Score — laskenta. Ei riippuvuuksia käyttöliittymään.
//
// Jokainen väittämä antaa "heikkouspisteitä" asteikolla −3 … +3 (täysin eri mieltä …
// täysin samaa mieltä). Pisteet menevät väittämän omalle osa-alueelle täysinä ja
// jokaiselle lisäosa-alueelle kolmanneksen painolla. Osa-alueen kunto 0–100:
//   M = 3 × omien väittämien määrä + lisäkosketusten määrä
//   T = omien pisteiden summa + lisäpisteiden summa (⅓)
//   kunto = rajaa(pyöristä(100 × (M − T) / (2M)), 0, 100)
// Kokonaispisteet = pyöristä(12 osa-alueen kuntojen summa / 10) → 0–120.
import {
  FLAT, LEVELS, LEVER_BY_ID, MAINTENANCE_STEPS, ORDER, PER_SECTION, PLAN_LIBRARY, TOTAL_Q,
  type Answer, type Level, type PId, type PlanStep, type Zone,
} from './content.ts';

export type Answers = (Answer | null)[];

export function isPId(value: unknown): value is PId {
  return typeof value === 'string' && (ORDER as readonly string[]).includes(value);
}

/** Hyväksyy vain kokonaisluvut 0–6. */
export function isAnswer(value: unknown): value is Answer {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 6;
}

export function emptyAnswers(): Answers {
  return Array.from({ length: TOTAL_Q }, () => null);
}

/** Vastaamattomien väittämien indeksit. */
export function missingIndexes(answers: readonly unknown[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < TOTAL_Q; i++) if (!isAnswer(answers[i])) out.push(i);
  return out;
}

/** Osion (0–11) väittämien indeksit. */
export const sectionIndexes = (section: number) => Array.from({ length: PER_SECTION }, (_, i) => section * PER_SECTION + i);
export const sectionComplete = (answers: readonly unknown[], section: number) => sectionIndexes(section).every(i => isAnswer(answers[i]));
export const sectionOf = (index: number) => Math.floor(index / PER_SECTION);

const trapPoints = (a: Answer) => a - 3;

export function levelFor(total: number): Level {
  return LEVELS.find(l => total <= l.max) ?? LEVELS[LEVELS.length - 1];
}

export function zoneFor(health: number): Zone {
  return health < 40 ? 'red' : health < 70 ? 'gold' : 'strong';
}

const PHASE_RANK = { base: 0, work: 1, owner: 2 } as const;

export type Evaluation =
  | { ok: false; missing: number[] }
  | {
      ok: true;
      health: Record<PId, number>;
      total: number;
      level: Level;
      /** Heikoin osa-alue → yrittäjätyyppi. */
      dominant: PId;
      /** Toiseksi heikoin. */
      shadow: PId;
      /** Vahvin. */
      strongest: PId;
      /** Ensimmäinen korjattava: punaisista varhaisin vaihe, sen sisällä heikoin. */
      fixFirst: PId;
      redCount: number;
      /** Heikoimmasta vahvimpaan, tasapisteissä osa-alueiden järjestys. */
      ranked: PId[];
      /** Pisteet seuraavalle tasolle (null, jos jo ylimmällä). */
      toNextLevel: number | null;
      nextLevel: Level | null;
    };

/** Laskee osa-alueiden kunnon. Puuttuvat vastaukset lasketaan neutraaleiksi. */
export function healthOf(answers: readonly unknown[]): Record<PId, number> {
  const max = Object.fromEntries(ORDER.map(id => [id, 0])) as Record<PId, number>;
  const trap = Object.fromEntries(ORDER.map(id => [id, 0])) as Record<PId, number>;
  FLAT.forEach((q, i) => {
    const a = answers[i];
    const t = isAnswer(a) ? trapPoints(a) : 0;
    max[q.lever] += 3;
    trap[q.lever] += t;
    for (const other of q.also) {
      max[other] += 1;
      trap[other] += t / 3;
    }
  });
  return Object.fromEntries(ORDER.map(id => {
    const m = max[id];
    const h = Math.round((100 * (m - trap[id])) / (2 * m));
    return [id, Math.max(0, Math.min(100, h))];
  })) as Record<PId, number>;
}

export function evaluate(answers: readonly unknown[]): Evaluation {
  const missing = missingIndexes(answers);
  if (missing.length > 0) return { ok: false, missing };

  const health = healthOf(answers);
  const total = Math.round(ORDER.reduce((sum, id) => sum + health[id], 0) / 10);
  const level = levelFor(total);
  const ranked = [...ORDER].sort((a, b) => health[a] - health[b] || ORDER.indexOf(a) - ORDER.indexOf(b));
  const reds = ORDER.filter(id => zoneFor(health[id]) === 'red');
  const fixFirst = reds.length
    ? [...reds].sort((a, b) => PHASE_RANK[LEVER_BY_ID[a].phase] - PHASE_RANK[LEVER_BY_ID[b].phase] || health[a] - health[b] || ORDER.indexOf(a) - ORDER.indexOf(b))[0]
    : ranked[0];
  const strongest = [...ORDER].sort((a, b) => health[b] - health[a] || ORDER.indexOf(a) - ORDER.indexOf(b))[0];
  const levelIndex = LEVELS.indexOf(level);
  const nextLevel = levelIndex < LEVELS.length - 1 ? LEVELS[levelIndex + 1] : null;

  return {
    ok: true,
    health,
    total,
    level,
    dominant: ranked[0],
    shadow: ranked[1],
    strongest,
    fixFirst,
    redCount: reds.length,
    ranked,
    toNextLevel: nextLevel ? nextLevel.min - total : null,
    nextLevel,
  };
}

/** Kaksi oletuskehityskohdetta 90 päivän ohjelmaan: ensin korjattava ja seuraava heikoin. */
export function defaultPriorities(ev: Extract<Evaluation, { ok: true }>): [PId, PId] {
  const second = ev.ranked.find(id => id !== ev.fixFirst)!;
  return [ev.fixFirst, second];
}

export function isValidPair(pair: unknown): pair is [PId, PId] {
  return Array.isArray(pair) && pair.length === 2 && isPId(pair[0]) && isPId(pair[1]) && pair[0] !== pair[1];
}

export type AreaPlan = {
  id: PId;
  health: number;
  goal: string;
  steps: [PlanStep, PlanStep, PlanStep];
  metric: string;
  verification: boolean;
};

/** Ohjelma valitulle osa-alueelle. Vahvalla osa-alueella (70+) tehtävät painottavat varmistamista. */
export function buildAreaPlan(id: PId, health: number): AreaPlan {
  const entry = PLAN_LIBRARY[id];
  const verification = health >= 70;
  return {
    id,
    health,
    goal: entry.goal,
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
