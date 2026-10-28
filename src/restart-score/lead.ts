// Yhteystietolomake ennen raporttia. Lähetys menee sivuston omaan Vercel-funktioon
// (api/lead.ts), joka tallentaa rivin Notion-tietokantaan.
import { QUESTION_BY_ID, ORDER, type PId, type Score } from './content.ts';

export type Lead = { name: string; email: string; phone: string };
export type LeadErrors = Partial<Record<keyof Lead, string>>;

export type LeadPayload = Lead & {
  total: number;
  ownerType: string;
  scores: Record<PId, Score>;
  priorities: [PId, PId];
  completedAt: string | null;
  /** Roskapostiansa; oikea kävijä jättää tyhjäksi. */
  website?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()-]{6,20}$/;
export const LEAD_ENDPOINT = '/api/lead';

export function validateLead(lead: Lead): LeadErrors {
  const errors: LeadErrors = {};
  if (lead.name.trim().length < 2) errors.name = 'Kirjoita nimesi.';
  if (!EMAIL.test(lead.email.trim())) errors.email = 'Tarkista sähköpostiosoite.';
  if (lead.phone.trim() && !PHONE.test(lead.phone.trim())) errors.phone = 'Tarkista puhelinnumero.';
  return errors;
}

/** Muuttaa tuloksen luettavaan muotoon: osa-alueet ja kehityskohteet suomenkielisinä niminä. */
export function toRequestBody(payload: LeadPayload) {
  return {
    name: payload.name, email: payload.email, phone: payload.phone,
    total: payload.total, ownerType: payload.ownerType, completedAt: payload.completedAt,
    areas: ORDER.map(id => ({ name: QUESTION_BY_ID[id].name, score: payload.scores[id] })),
    priorities: payload.priorities.map(id => QUESTION_BY_ID[id].name),
    website: payload.website ?? '',
  };
}

export async function submitLead(payload: LeadPayload): Promise<{ ok: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(toRequestBody(payload)),
      signal: controller.signal,
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}
