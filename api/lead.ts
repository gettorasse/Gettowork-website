// Vercel-funktio: vastaanottaa Restart Score -lomakkeen ja lisää rivin Notion-tietokantaan.
// Avaimet ovat Vercelin ympäristömuuttujissa, eivät sivun koodissa:
//   NOTION_TOKEN        – Notion-integraation salainen avain
//   NOTION_DATABASE_ID  – tietokanta, joka on jaettu integraatiolle
// Tietokannan sarakkeet: Nimi (otsikko), Sähköposti (sähköposti), Puhelin (puhelinnumero),
// Pisteet (numero), Yrittäjätyyppi (valinta), Kehityskohteet (monivalinta),
// Osa-alueet (teksti), Valmistunut (päivämäärä).

type AreaScore = { name: string; score: number };
type Incoming = {
  name?: unknown; email?: unknown; phone?: unknown;
  total?: unknown; ownerType?: unknown; areas?: unknown; priorities?: unknown; completedAt?: unknown;
  website?: unknown; // roskapostiansa: oikea kävijä ei täytä tätä
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()-]{6,20}$/;
const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isInt = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

export async function POST(request: Request): Promise<Response> {
  let data: Incoming;
  try {
    data = await request.json() as Incoming;
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }
  if (str(data.website, 200)) return json(200, { ok: true }); // botti: kuitataan, ei tallenneta

  const name = str(data.name, 120);
  const email = str(data.email, 200);
  const phone = str(data.phone, 30);
  if (name.length < 2 || !EMAIL.test(email) || (phone && !PHONE.test(phone))) return json(400, { ok: false, error: 'invalid_contact' });
  if (!isInt(data.total, 0, 120)) return json(400, { ok: false, error: 'invalid_score' });

  const areas: AreaScore[] = Array.isArray(data.areas)
    ? data.areas.slice(0, 12).filter((a): a is AreaScore => Boolean(a) && typeof (a as AreaScore).name === 'string' && isInt((a as AreaScore).score, 0, 10))
    : [];
  const priorities = Array.isArray(data.priorities) ? data.priorities.slice(0, 2).map(p => str(p, 60)).filter(Boolean) : [];
  const ownerType = str(data.ownerType, 40);
  const completed = typeof data.completedAt === 'string' && !Number.isNaN(Date.parse(data.completedAt)) ? data.completedAt : new Date().toISOString();

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) return json(500, { ok: false, error: 'not_configured' });

  const properties: Record<string, unknown> = {
    'Nimi': { title: [{ text: { content: name } }] },
    'Sähköposti': { email },
    'Puhelin': { phone_number: phone || null },
    'Pisteet': { number: data.total },
    'Yrittäjätyyppi': ownerType ? { select: { name: ownerType } } : { select: null },
    'Kehityskohteet': { multi_select: priorities.map(p => ({ name: p })) },
    'Osa-alueet': { rich_text: [{ text: { content: areas.map(a => `${a.name} ${a.score}`).join(', ').slice(0, 1900) } }] },
    'Valmistunut': { date: { start: completed } },
  };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'notion-version': '2022-06-28' },
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
  if (!res.ok) {
    // Virheen syy lokiin ilman kävijän tietoja.
    const detail = await res.json().catch(() => ({})) as { code?: string };
    console.error('Notion error', res.status, detail.code);
    return json(502, { ok: false, error: 'notion_failed' });
  }
  return json(200, { ok: true });
}
