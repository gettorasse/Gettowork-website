// Yhteystietolomake ennen raporttia. Tallennuskohde (esim. HubSpot) kytketään
// myöhemmin submitLead-funktioon; siihen asti tietoja ei lähetetä minnekään.
import type { PId, Score } from './content.ts';

export type Lead = { name: string; email: string; phone: string };
export type LeadErrors = Partial<Record<keyof Lead, string>>;

export type LeadPayload = Lead & {
  total: number;
  ownerType: string;
  scores: Record<PId, Score>;
  priorities: [PId, PId];
  completedAt: string | null;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()-]{6,20}$/;

export function validateLead(lead: Lead): LeadErrors {
  const errors: LeadErrors = {};
  if (lead.name.trim().length < 2) errors.name = 'Kirjoita nimesi.';
  if (!EMAIL.test(lead.email.trim())) errors.email = 'Tarkista sähköpostiosoite.';
  if (lead.phone.trim() && !PHONE.test(lead.phone.trim())) errors.phone = 'Tarkista puhelinnumero.';
  return errors;
}

/**
 * Lähettää yhteystiedot ja tuloksen. Toistaiseksi kohdetta ei ole kytketty, joten funktio
 * vain odottaa hetken, jotta käyttöliittymän eteneminen näyttää samalta kuin valmiina.
 */
export async function submitLead(payload: LeadPayload): Promise<{ ok: boolean }> {
  void payload;
  await new Promise(resolve => setTimeout(resolve, 900));
  return { ok: true };
}
