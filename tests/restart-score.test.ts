// Restart Score -laskennan testit.
// Ajo: npm test  (Noden sisäänrakennettu testiajuri, ei lisäriippuvuuksia)
import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCHETYPES, FLAT, LEVERS, ORDER, TOTAL_Q, type Answer, type PId } from '../src/restart-score/content.ts';
import {
  addCalendarDays, buildAreaPlan, defaultPriorities, evaluate, formatFi, healthOf, isDateString, levelFor,
  missingIndexes, planDay, sectionComplete, zoneFor,
} from '../src/restart-score/engine.ts';
import {
  LEGACY_STORAGE_KEY, STORAGE_KEY, loadAssessment, newAssessment, parseAssessment, removeAssessment, saveAssessment,
} from '../src/restart-score/storage.ts';

const all = (v: Answer) => Array<Answer>(TOTAL_Q).fill(v);
/** Kohdeosa-alueelle "täysin samaa mieltä", muille neutraali. */
const weakIn = (target: PId, rest: Answer = 3) => FLAT.map(q => (q.lever === target ? 6 : rest)) as Answer[];

function ok(answers: Answer[]) {
  const r = evaluate(answers);
  assert.equal(r.ok, true);
  if (!r.ok) throw new Error('unreachable');
  return r;
}

test('12 osa-aluetta oikeassa järjestyksessä, kuusi väittämää kussakin', () => {
  assert.deepEqual(ORDER, ['pricing', 'persona', 'problem', 'product', 'profit', 'pitch', 'people', 'promote', 'process', 'predicament', 'path', 'protect']);
  assert.equal(TOTAL_Q, 72);
  for (const l of LEVERS) {
    assert.equal(l.statements.length, 6, l.id);
    assert.ok(ARCHETYPES[l.id].name, l.id);
    for (const st of l.statements) assert.ok(!st.also.includes(l.id), `${l.id}: lisäosa-alue ei voi olla oma`);
  }
  assert.equal(new Set(Object.values(ARCHETYPES).map(a => a.name)).size, 12);
});

test('Tasainen vastaus: täysin eri mieltä 120, neutraali 60, täysin samaa mieltä 0', () => {
  const best = ok(all(0));
  assert.equal(best.total, 120);
  assert.equal(best.level.key, 'owner');
  assert.ok(ORDER.every(id => best.health[id] === 100));
  const mid = ok(all(3));
  assert.equal(mid.total, 60);
  assert.equal(mid.level.key, 'operator');
  const worst = ok(all(6));
  assert.equal(worst.total, 0);
  assert.equal(worst.level.key, 'self');
  assert.equal(worst.redCount, 12);
});

test('Tasorajat 40/41 ja 80/81', () => {
  assert.deepEqual([0, 40, 41, 80, 81, 120].map(t => levelFor(t).key), ['self', 'self', 'operator', 'operator', 'owner', 'owner']);
});

test('Vyöhykkeet 39/40 ja 69/70', () => {
  assert.deepEqual([0, 39, 40, 69, 70, 100].map(zoneFor), ['red', 'red', 'gold', 'gold', 'strong', 'strong']);
});

test('Jokainen osa-alue voi olla heikoin ja määrää yrittäjätyypin', () => {
  for (const id of ORDER) {
    const r = ok(weakIn(id));
    assert.equal(r.dominant, id, id);
    assert.equal(zoneFor(r.health[id]), 'red', id);
  }
});

test('Lisäosa-alue saa kolmanneksen painon', () => {
  // Hinnoittelun ensimmäinen väittämä vaikuttaa myös kannattavuuteen.
  const answers = all(3);
  answers[0] = 6;
  const h = healthOf(answers);
  assert.ok(h.pricing < 50);
  assert.ok(h.profit < 50 && h.profit > h.pricing);
  assert.equal(h.persona, 50);
});

test('Korjaa ensin: punaisista varhaisin vaihe, ei välttämättä heikoin', () => {
  // Suunta (owner-vaihe) heikoin, hinnoittelu (base) myös punainen → hinnoittelu ensin.
  const answers = FLAT.map(q => (q.lever === 'path' ? 6 : q.lever === 'pricing' ? 5 : 2)) as Answer[];
  const r = ok(answers);
  assert.equal(r.dominant, 'path');
  assert.equal(r.fixFirst, 'pricing');
  assert.deepEqual(defaultPriorities(r), ['pricing', 'path']);
});

test('Ei punaisia → korjaa ensin heikoin', () => {
  const r = ok(weakIn('people', 0).map(v => (v === 6 ? 3 : v)) as Answer[]);
  assert.equal(r.redCount, 0);
  assert.equal(r.fixFirst, r.dominant);
});

test('Pisteet seuraavalle tasolle', () => {
  const mid = ok(all(3));
  assert.equal(mid.toNextLevel, 21);
  assert.equal(mid.nextLevel?.key, 'owner');
  assert.equal(ok(all(0)).nextLevel, null);
});

test('Puuttuva vastaus → ei tulosta, ja virheelliset arvot hylätään', () => {
  const answers: unknown[] = all(3);
  answers[10] = null;
  const r = evaluate(answers);
  assert.equal(r.ok, false);
  assert.deepEqual(missingIndexes(answers), [10]);
  assert.equal(sectionComplete(answers, 1), false);
  assert.equal(sectionComplete(answers, 0), true);
  for (const bad of [-1, 7, 2.5, '3', undefined, Number.NaN, true]) {
    const a: unknown[] = all(3);
    a[5] = bad;
    assert.equal(evaluate(a).ok, false, `arvo ${String(bad)} hyväksyttiin`);
  }
});

test('Ohjelma: vahvalla osa-alueella varmistustehtävät', () => {
  assert.equal(buildAreaPlan('process', 69).verification, false);
  assert.equal(buildAreaPlan('process', 70).verification, true);
  assert.match(buildAreaPlan('process', 90).steps[0].task, /^Tarkista nykyinen käytäntö/);
});

test('Kalenteripäivät: kuukausi, vuodenvaihde, kesäaika', () => {
  assert.equal(planDay('2026-10-28', 1), '2026-10-28');
  assert.equal(planDay('2026-10-28', 90), '2027-01-25');
  assert.equal(addCalendarDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addCalendarDays('2027-03-27', 1), '2027-03-28');
  assert.equal(addCalendarDays('2028-02-28', 1), '2028-02-29');
  assert.equal(formatFi('2026-01-05'), '5.1.2026');
  assert.equal(isDateString('2026-02-30'), false);
});

// --- Tallennus (localStorage-tynkä) ---

function mockStorage(opts: { failWrite?: boolean; failRead?: boolean } = {}) {
  const map = new Map<string, string>();
  const ls = {
    getItem: (k: string) => { if (opts.failRead) throw new Error('blocked'); return map.has(k) ? map.get(k)! : null; },
    setItem: (k: string, v: string) => { if (opts.failWrite) throw new Error('QuotaExceededError'); map.set(k, v); },
    removeItem: (k: string) => { if (opts.failRead) throw new Error('blocked'); map.delete(k); },
  };
  (globalThis as unknown as { window: unknown }).window = { localStorage: ls };
  return map;
}

test('Tallennus, palautus ja poisto koskevat vain omaa avainta; vanha versio poistetaan', () => {
  const map = mockStorage();
  map.set('muu-avain', 'säilyy');
  map.set(LEGACY_STORAGE_KEY, '{"schemaVersion":1}');
  const a = newAssessment();
  a.answers[0] = 4;
  assert.equal(saveAssessment(a), true);
  const loaded = loadAssessment();
  assert.equal(loaded.status, 'ok');
  if (loaded.status === 'ok') assert.equal(loaded.assessment.answers[0], 4);
  assert.equal(map.has(LEGACY_STORAGE_KEY), false);
  removeAssessment();
  assert.equal(map.has(STORAGE_KEY), false);
  assert.equal(map.get('muu-avain'), 'säilyy');
});

test('120 päivän vanheneminen poistaa tietueen', () => {
  const map = mockStorage();
  const then = new Date('2026-01-01T10:00:00Z');
  saveAssessment(newAssessment(then), then);
  assert.equal(loadAssessment(new Date('2026-04-30T09:00:00Z')).status, 'ok');
  assert.equal(loadAssessment(new Date('2026-05-01T10:00:01Z')).status, 'none');
  assert.equal(map.has(STORAGE_KEY), false);
});

test('Rikkoutunut tietue ohitetaan eikä kaada', () => {
  const map = mockStorage();
  map.set(STORAGE_KEY, '{rikki');
  assert.equal(loadAssessment().status, 'invalid');
  const a = newAssessment() as unknown as Record<string, unknown>;
  assert.equal(parseAssessment({ ...a, contentVersion: '1.0' }), null);
  assert.equal(parseAssessment({ ...a, answers: [...(a.answers as unknown[]).slice(1), '3'] }), null);
  assert.equal(parseAssessment({ ...a, answers: (a.answers as unknown[]).slice(1) }), null);
  assert.equal(parseAssessment({ ...a, selectedPriorities: ['pricing', 'pricing'] }), null);
  assert.equal(parseAssessment({ ...a, currentStep: 12 }), null);
});

test('Estetty tallennus palauttaa false eikä heitä', () => {
  mockStorage({ failWrite: true });
  assert.equal(saveAssessment(newAssessment()), false);
  mockStorage({ failRead: true });
  assert.equal(loadAssessment().status, 'unavailable');
});

// --- Yhteystietolomake ---
import { validateLead } from '../src/restart-score/lead.ts';

test('Yhteystiedot: nimi ja sähköposti pakollisia, puhelin valinnainen', () => {
  assert.deepEqual(validateLead({ name: 'Rasmus', email: 'rasmus@gettowork.fi', phone: '' }), {});
  assert.deepEqual(validateLead({ name: 'Rasmus', email: 'rasmus@gettowork.fi', phone: '+358 40 123 4567' }), {});
  const bad = validateLead({ name: ' ', email: 'ei-osoite', phone: 'abc' });
  assert.ok(bad.name && bad.email && bad.phone);
});

// --- Lähetys Notioniin (api/lead.ts) ---
import { POST } from '../api/lead.ts';
import { toRequestBody } from '../src/restart-score/lead.ts';

function leadBody(over: Record<string, unknown> = {}) {
  const r = ok(all(3));
  return { ...toRequestBody({ name: 'Testi Yrittäjä', email: 'testi@example.com', phone: '', total: r.total, ownerType: ARCHETYPES[r.dominant].name, level: r.level.name, health: r.health, priorities: ['pricing', 'persona'], completedAt: '2026-10-28T18:00:00.000Z' }), ...over };
}
const req = (body: unknown) => new Request('https://x/api/lead', { method: 'POST', body: JSON.stringify(body) });

test('Lähetys: rivi Notioniin oikeilla sarakkeilla', async () => {
  process.env.NOTION_TOKEN = 'test-token'; process.env.NOTION_DATABASE_ID = 'db123';
  let sent: { url: string; body: { parent: { database_id: string }; properties: Record<string, any> } } | null = null;
  globalThis.fetch = (async (url: string, init: RequestInit) => { sent = { url, body: JSON.parse(String(init.body)) }; return new Response('{}', { status: 200 }); }) as typeof fetch;
  const res = await POST(req(leadBody()));
  assert.equal(res.status, 200);
  assert.ok(sent);
  const s = sent as NonNullable<typeof sent>;
  assert.equal(s.url, 'https://api.notion.com/v1/pages');
  assert.equal(s.body.parent.database_id, 'db123');
  assert.equal(s.body.properties['Nimi'].title[0].text.content, 'Testi Yrittäjä');
  assert.equal(s.body.properties['Pisteet'].number, 60);
  assert.equal(s.body.properties['Yrittäjätyyppi'].select.name, 'Mukava tyyppi');
  assert.deepEqual(s.body.properties['Kehityskohteet'].multi_select.map((m: { name: string }) => m.name), ['Hinnoittelu', 'Oikeat asiakkaat']);
  assert.match(s.body.properties['Osa-alueet'].rich_text[0].text.content, /^Taso: Pyörittäjä\. Hinnoittelu 50, Oikeat asiakkaat 50/);
});

test('Lähetys: virheelliset tiedot ja botit hylätään, puuttuva asetus näkyy virheenä', async () => {
  let calls = 0;
  globalThis.fetch = (async () => { calls++; return new Response('{}', { status: 200 }); }) as typeof fetch;
  assert.equal((await POST(req(leadBody({ email: 'ei' })))).status, 400);
  assert.equal((await POST(req(leadBody({ total: 121 })))).status, 400);
  assert.equal((await POST(req(leadBody({ website: 'spam.example' })))).status, 200);
  assert.equal(calls, 0);
  delete process.env.NOTION_TOKEN;
  assert.equal((await POST(req(leadBody()))).status, 500);
});
