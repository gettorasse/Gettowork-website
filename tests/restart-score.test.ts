// Restart Score -laskennan testit (määrittelyn kohta 12.2).
// Ajo: npm test  (Noden sisäänrakennettu testiajuri, ei lisäriippuvuuksia)
import test from 'node:test';
import assert from 'node:assert/strict';
import { ORDER, QUESTIONS, type PId, type Score } from '../src/restart-score/content.ts';
import {
  addCalendarDays, areaLevel, areaStatus, buildAreaPlan, evaluate, formatFi, isDateString, missingIds, planDay,
} from '../src/restart-score/engine.ts';
import {
  STORAGE_KEY, loadAssessment, newAssessment, parseAssessment, removeAssessment, saveAssessment,
} from '../src/restart-score/storage.ts';

const answersFrom = (scores: unknown[]) => Object.fromEntries(ORDER.map((id, i) => [id, scores[i]]));
const fill = (n: number) => answersFrom(Array(12).fill(n));

function ok(scores: unknown[]) {
  const result = evaluate(answersFrom(scores));
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('unreachable');
  return result;
}

test('12 P:tä oikeassa järjestyksessä, kukin kerran', () => {
  assert.deepEqual(ORDER, ['pricing', 'persona', 'problem', 'product', 'profit', 'pitch', 'people', 'promote', 'process', 'predicament', 'path', 'protect']);
  assert.equal(new Set(QUESTIONS.map(q => q.id)).size, 12);
});

test('12 × 0', () => {
  const r = ok(Array(12).fill(0));
  assert.equal(r.total, 0);
  assert.equal(r.band, 'foundation');
  assert.deepEqual(r.recommendedPriorities, ['pricing', 'persona']);
  assert.equal(r.maintenanceOnly, false);
  assert.equal(areaLevel(0), 'build');
});

test('12 × 10 → ylläpitotila ja varmistusohjelma', () => {
  const r = ok(Array(12).fill(10));
  assert.equal(r.total, 120);
  assert.equal(r.band, 'resilience');
  assert.deepEqual(r.recommendedPriorities, ['pricing', 'persona']);
  assert.equal(r.maintenanceOnly, true);
  const plan = buildAreaPlan('pricing', 10);
  assert.equal(plan.verification, true);
  assert.match(plan.steps[0].task, /^Tarkista nykyinen käytäntö/);
});

test('12 × 5 → tasapisteselite', () => {
  const r = ok(Array(12).fill(5));
  assert.equal(r.total, 60);
  assert.equal(r.band, 'stabilise');
  assert.deepEqual(r.recommendedPriorities, ['pricing', 'persona']);
  assert.equal(r.tieBroken, true);
});

test('[8,3,7,6,4,5,2,6,3,5,8,3] → People ensin, Persona toisena tasapisteillä', () => {
  const r = ok([8, 3, 7, 6, 4, 5, 2, 6, 3, 5, 8, 3]);
  assert.equal(r.total, 60);
  assert.deepEqual(r.recommendedPriorities, ['people', 'persona']);
  assert.equal(r.tieBroken, true);
});

test('Selvä järjestys ilman tasapisteitä ei näytä selitettä', () => {
  const r = ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10]);
  assert.deepEqual(r.recommendedPriorities, ['pricing', 'persona']);
  assert.equal(r.tieBroken, false);
});

test('[0, 11 × 10] → 110, Pricing matala, ei ylläpitotilaa', () => {
  const r = ok([0, ...Array(11).fill(10)]);
  assert.equal(r.total, 110);
  assert.equal(r.band, 'resilience');
  assert.equal(r.recommendedPriorities[0], 'pricing');
  assert.equal(r.maintenanceOnly, false);
  assert.equal(areaStatus(0), 'Rakenna perusta');
});

test('Yksi null → ei tulosta, puuttuva ilmoitetaan', () => {
  const answers = fill(10);
  answers.problem = null;
  const r = evaluate(answers);
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(r.invalidIds, ['problem']);
  assert.deepEqual(missingIds(answers), ['problem']);
});

test('Virheelliset arvot hylätään ilman korjausta', () => {
  for (const bad of [-1, 11, 2.5, '5', undefined, Number.NaN, Infinity, true]) {
    const answers = fill(5);
    answers.pitch = bad;
    const r = evaluate(answers);
    assert.equal(r.ok, false, `arvo ${String(bad)} hyväksyttiin`);
  }
});

test('Kokonaistuloksen rajat 39/40, 69/70, 99/100', () => {
  const totalOf = (t: number) => {
    const scores = Array(12).fill(0);
    let left = t;
    for (let i = 0; i < 12 && left > 0; i++) { scores[i] = Math.min(10, left); left -= scores[i]; }
    return ok(scores);
  };
  const cases: [number, string][] = [[39, 'foundation'], [40, 'stabilise'], [69, 'stabilise'], [70, 'independence'], [99, 'independence'], [100, 'resilience']];
  for (const [t, band] of cases) {
    const r = totalOf(t);
    assert.equal(r.total, t);
    assert.equal(r.band, band, `total ${t}`);
  }
});

test('Osa-alueen rajat 3/4, 6/7, 8/9 ja ohjelman sovitus', () => {
  assert.deepEqual([3, 4, 6, 7, 8, 9].map(areaLevel), ['build', 'stabilise', 'stabilise', 'strengthen', 'strengthen', 'maintain']);
  assert.equal(buildAreaPlan('process', 8).verification, false);
  assert.equal(buildAreaPlan('process', 9).verification, true);
  assert.match(buildAreaPlan('process', 3).guidance, /^Rakenna ensin/);
  assert.match(buildAreaPlan('process', 4).guidance, /^Hyödynnä/);
  assert.match(buildAreaPlan('process', 7).guidance, /^Vahvista/);
});

test('Oma valinta Process + Protect ei muuta kokonaispisteitä', () => {
  const scores = [8, 3, 7, 6, 4, 5, 2, 6, 3, 5, 8, 3];
  const r = ok(scores);
  const plans = (['process', 'protect'] as PId[]).map(id => buildAreaPlan(id, scores[ORDER.indexOf(id)] as Score));
  assert.equal(r.total, 60);
  assert.deepEqual(plans.map(p => p.id), ['process', 'protect']);
  assert.equal(plans[0].steps.length, 3);
});

test('Kalenteripäivät: kuukausi, vuodenvaihde, kesäaika', () => {
  assert.equal(planDay('2026-10-28', 1), '2026-10-28');
  assert.equal(planDay('2026-10-28', 30), '2026-11-26');
  assert.equal(planDay('2026-10-28', 90), '2027-01-25');
  assert.equal(addCalendarDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addCalendarDays('2027-03-27', 1), '2027-03-28'); // kesäaikaan siirtyminen EU
  assert.equal(addCalendarDays('2026-10-24', 2), '2026-10-26'); // talviaikaan siirtyminen EU
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
    removeItem: (k: string) => { map.delete(k); },
  };
  (globalThis as unknown as { window: unknown }).window = { localStorage: ls };
  return map;
}

test('Tallennus, palautus ja poisto koskevat vain omaa avainta', () => {
  const map = mockStorage();
  map.set('muu-avain', 'säilyy');
  const a = newAssessment();
  a.answers.pricing = 7;
  assert.equal(saveAssessment(a), true);
  const loaded = loadAssessment();
  assert.equal(loaded.status, 'ok');
  if (loaded.status === 'ok') assert.equal(loaded.assessment.answers.pricing, 7);
  removeAssessment();
  assert.equal(map.has(STORAGE_KEY), false);
  assert.equal(map.get('muu-avain'), 'säilyy');
});

test('120 päivän vanheneminen poistaa tietueen', () => {
  const map = mockStorage();
  const then = new Date('2026-01-01T10:00:00Z');
  saveAssessment(newAssessment(then), then);
  assert.equal(loadAssessment(new Date('2026-04-30T09:00:00Z')).status, 'ok'); // 119 pv
  assert.equal(loadAssessment(new Date('2026-05-01T10:00:01Z')).status, 'none'); // > 120 pv
  assert.equal(map.has(STORAGE_KEY), false);
});

test('Rikkoutunut tietue ohitetaan eikä kaada', () => {
  const map = mockStorage();
  map.set(STORAGE_KEY, '{rikki');
  assert.equal(loadAssessment().status, 'invalid');
  const a = newAssessment() as unknown as Record<string, unknown>;
  assert.equal(parseAssessment({ ...a, contentVersion: '2.0' }), null);
  assert.equal(parseAssessment({ ...a, answers: { ...(a.answers as object), pricing: '5' } }), null);
  assert.equal(parseAssessment({ ...a, selectedPriorities: ['pricing', 'pricing'] }), null);
  assert.equal(parseAssessment({ ...a, deferred: ['pricing'], answers: { ...(a.answers as object), pricing: 4 } }), null);
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
