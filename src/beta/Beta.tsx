import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import './beta.css';

// "Let's get to work" – beta-esikatselu Get to Workin prompt-sovelluksesta.
// Ilme on otettu Quote Studio -prototyypistä (valkoinen pohja, keskitetty promptilaatikko,
// keskustelu vasemmalla ja projektiluonnos oikealla). Tämä on vision esittely: tekoälyä tai
// API-kutsuja ei ole, vaan keskustelu etenee käsikirjoituksen mukaan ja mitään ei lähetetä.

const EMAIL = 'rasmus@gettowork.fi';

type Size = 0 | 1 | 2;
type Scenario = {
  key: string;
  title: string;
  steps: string[];
  roles: string[];
  sizeQ: string;
  sizeOpts: [string, string, string];
  team: [number, number, number];
  hours: [number, number, number];
};

const SCENARIOS: (Scenario & { match: RegExp })[] = [
  {
    key: 'varasto', match: /varast|palautu|invent|pakka|tarr|lava|keräil|logist|tuotte/i,
    title: 'Varastotyö', steps: ['Perehdytys kohteeseen ja turvallisuusohjeet', 'Tavaran läpikäynti ja lajittelu', 'Pakkaus, merkintä tai hyllytys ohjeen mukaan', 'Lopputarkastus ja luovutus'],
    roles: ['Varastotyöntekijä', 'Logistiikka-avustaja', 'Tiiminvetäjä'],
    sizeQ: 'Kuinka paljon tavaraa suunnilleen on?', sizeOpts: ['Alle 300 kpl', '300–1 000 kpl', 'Yli 1 000 kpl'],
    team: [2, 3, 5], hours: [4, 7, 8],
  },
  {
    key: 'tapahtuma', match: /tapahtum|messu|juhla|seminaari|konsert|osasto|näyttely/i,
    title: 'Tapahtuman avustavat työt', steps: ['Rakennus ja kalusteiden kokoaminen', 'Opastus ja avustaminen tapahtuman aikana', 'Purku ja tavaroiden pakkaus', 'Tilan luovutus siistinä'],
    roles: ['Tapahtuma-avustaja', 'Rakennus- ja purkutiimi', 'Vastuuhenkilö'],
    sizeQ: 'Kuinka iso tapahtuma on?', sizeOpts: ['Pieni osasto', 'Keskikokoinen', 'Iso tapahtuma'],
    team: [2, 4, 6], hours: [5, 7, 9],
  },
  {
    key: 'toimitila', match: /muut|toimist|tyhjen|kaluste|siivo|toimitil|kierrät/i,
    title: 'Toimitilan tyhjennys ja järjestely', steps: ['Kartoitus ja suunnitelma', 'Pakkaus ja kalusteiden purku', 'Kantaminen, kuljetus ja kierrätys', 'Loppusiivous ja luovutus'],
    roles: ['Muuttoavustaja', 'Kalusteasentaja', 'Siivooja'],
    sizeQ: 'Kuinka iso tila on?', sizeOpts: ['Alle 100 m²', '100–300 m²', 'Yli 300 m²'],
    team: [2, 3, 5], hours: [5, 8, 8],
  },
  {
    key: 'myymala', match: /myymä|kauppa|hylly|kampanja|liike|putiikki/i,
    title: 'Myymälän järjestely', steps: ['Suunnitelma ja pohjapiirros', 'Tuotteiden siirto ja hyllytys', 'Hintamerkinnät ja kampanjamateriaalit', 'Lopputarkastus ennen avaamista'],
    roles: ['Myymäläavustaja', 'Hyllyttäjä', 'Vastuuhenkilö'],
    sizeQ: 'Kuinka iso myymälä on?', sizeOpts: ['Pieni liike', 'Keskikokoinen', 'Iso myymälä'],
    team: [2, 3, 4], hours: [4, 7, 8],
  },
];

const GENERAL: Scenario = {
  key: 'yleinen', title: 'Käytännön työ', steps: ['Tarpeen tarkennus ja suunnitelma', 'Työn toteutus ohjeen mukaan', 'Lopputarkastus', 'Luovutus ja palaute'],
  roles: ['Yleistyöntekijä', 'Avustaja', 'Vastuuhenkilö'],
  sizeQ: 'Kuinka iso työ on?', sizeOpts: ['Muutama tunti', 'Yksi päivä', 'Useampi päivä'],
  team: [1, 2, 4], hours: [4, 7, 8],
};

/** Työt, joita Get to Work ei tee: säännelty asiantuntijatyö ja korkean riskin urakat. */
const OUT_OF_SCOPE = /sähkö|putki|lvi|asbest|katto|kattotyö|rakennusurak|lääk|hoitaj|kirjanpi|juridi|lakimie|sijoit|räjäyt|purkutyö/i;

const CHIPS = [
  'Verkkokaupan palautukset ovat kasaantuneet',
  'Messuosasto pitää pystyttää torstaina',
  'Toimisto pitää tyhjentää muuton jälkeen',
  'Myymälä pitää järjestää uudelleen',
];
const PLACEHOLDERS = [
  'Meille tulee ensi viikolla 1 000 tuotetta, jotka pitäisi tarkistaa ja pakata uudelleen…',
  'Tarvitsemme kaksi avustajaa messuosastolle kolmeksi päiväksi…',
  'Toimisto pitäisi tyhjentää ja siivota ennen kuun vaihdetta…',
];
const WHERE_OPTS = ['Helsinki', 'Espoo', 'Vantaa', 'Muualla'];
const WHEN_OPTS = ['Tällä viikolla', 'Ensi viikolla', 'Joustava'];
const RATE = 38; // esimerkkituntihinta, € alv 0 %

type Msg = { id: number; from: 'user' | 'ai'; text: string; options?: string[] };
type Stage = 'where' | 'when' | 'size' | 'building' | 'done';
type Answers = { where?: string; when?: string; size?: Size; sizeLabel?: string };

const PROGRESS = [
  'Ymmärretään tarve',
  'Määritellään työvaiheet',
  'Haetaan sopivat tekijät verkostosta',
  'Kootaan tiimi',
  'Lasketaan hinta-arvio',
  'Tarkistetaan, voimmeko hoitaa työn',
];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (n: number) => n.toLocaleString('fi-FI');

export function Beta() {
  const [view, setView] = useState<'landing' | 'chat'>('landing');
  const [input, setInput] = useState('');
  const [ph, setPh] = useState(0);
  const [need, setNeed] = useState('');
  const [scenario, setScenario] = useState<Scenario>(GENERAL);
  const [outOfScope, setOutOfScope] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [stage, setStage] = useState<Stage>('where');
  const [answers, setAnswers] = useState<Answers>({});
  const [progress, setProgress] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [reply, setReply] = useState('');
  const [sheet, setSheet] = useState(false);
  const timers = useRef<number[]>([]);
  const nextId = useRef(1);
  const chatEnd = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLTextAreaElement>(null);
  // build() ajetaan ajastimilla, joten luetaan rajauksen tila refistä.
  const outOfScopeRef = useRef(false);
  outOfScopeRef.current = outOfScope;

  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);
  useEffect(() => {
    if (view !== 'landing' || reduced()) return;
    const t = window.setInterval(() => setPh(p => (p + 1) % PLACEHOLDERS.length), 4200);
    return () => window.clearInterval(t);
  }, [view]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'end' }); }, [msgs, typing]);

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, reduced() ? 0 : ms)); };
  const push = (m: Omit<Msg, 'id'>) => setMsgs(list => [...list, { ...m, id: nextId.current++ }]);
  /** Tekoälyn vastaus pienellä "kirjoittaa…"-viiveellä. */
  const aiSay = (text: string, options?: string[], delay = 900) => {
    setTyping(true);
    later(() => { setTyping(false); push({ from: 'ai', text, options }); }, delay);
  };

  const start = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const sc = SCENARIOS.find(s => s.match.test(t)) ?? GENERAL;
    setNeed(t);
    setScenario(sc);
    setOutOfScope(OUT_OF_SCOPE.test(t));
    setView('chat');
    window.scrollTo(0, 0);
    push({ from: 'user', text: t });
    setProgress(1);
    aiSay(`Selvä, tästä saadaan projekti kasaan. Tunnistin työn tyypiksi: ${sc.title.toLowerCase()}.\n\nKysyn pari tarkennusta. Missä työ tehdään?`, WHERE_OPTS, 1300);
  };

  const answer = (text: string) => {
    const t = text.trim();
    if (!t || typing || stage === 'building' || stage === 'done') return;
    push({ from: 'user', text: t });
    setReply('');
    if (stage === 'where') {
      setAnswers(a => ({ ...a, where: t }));
      setStage('when');
      setProgress(2);
      aiSay('Hyvä. Milloin työ pitäisi tehdä?', WHEN_OPTS);
    } else if (stage === 'when') {
      setAnswers(a => ({ ...a, when: t }));
      setStage('size');
      aiSay(scenario.sizeQ, [...scenario.sizeOpts]);
    } else if (stage === 'size') {
      const idx = scenario.sizeOpts.indexOf(t);
      const size: Size = idx === 0 ? 0 : idx === 2 ? 2 : 1;
      setAnswers(a => ({ ...a, size, sizeLabel: t }));
      setStage('building');
      build();
    }
  };

  /** Projektin kokoaminen: edistymisvaiheet etenevät ja tekijähaku "skannaa" verkostoa. */
  const build = () => {
    aiSay('Kiitos, tämä riittää. Kokoan projektin. Näet sen rakentuvan oikealla.', undefined, 700);
    later(() => setProgress(3), 1500);
    if (!reduced()) {
      for (let i = 1; i <= 12; i++) later(() => setScanned(Math.round((i / 12) * 64)), 1500 + i * 110);
    } else setScanned(64);
    later(() => setProgress(4), 3100);
    later(() => setProgress(5), 3900);
    later(() => setProgress(6), 4700);
    later(() => {
      setProgress(7);
      setStage('done');
    }, 5600);
    later(() => aiSay(
      outOfScopeRef.current
        ? 'Kävin tarpeen läpi. Tämä vaatii luvanvaraista erikoisosaamista, jota emme tarjoa. Voimme silti auttaa siihen liittyvissä avustavissa töissä, kuten tyhjennyksessä tai siivouksessa.'
        : 'Valmista. Projektiluonnos on koottu: työvaiheet, ehdotettu tiimi ja hinta-arvio. Voimme hoitaa tämän.',
      undefined, 400), 5600);
  };

  const restart = () => {
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
    setMsgs([]); setTyping(false); setStage('where'); setAnswers({}); setProgress(0); setScanned(0);
    setNeed(''); setInput(''); setReply(''); setSheet(false); setView('landing');
    window.scrollTo(0, 0);
    window.setTimeout(() => heroRef.current?.focus(), 50);
  };

  const onHero = (e: FormEvent) => { e.preventDefault(); start(input); };
  const onHeroKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); start(input); }
  };
  const onReply = (e: FormEvent) => { e.preventDefault(); answer(reply); };
  const onReplyKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); answer(reply); }
  };

  const size = answers.size ?? 1;
  const team = scenario.team[size];
  const hours = scenario.hours[size];
  const base = team * hours * RATE + 70;
  const low = Math.round(base * 0.85 / 10) * 10;
  const high = Math.round(base * 1.15 / 10) * 10;
  const done = stage === 'done';
  const lastAi = [...msgs].reverse().find(m => m.from === 'ai');
  const awaiting = !typing && (stage === 'where' || stage === 'when' || stage === 'size');

  const summary = [
    `Tarve: ${need}`,
    answers.where && `Paikka: ${answers.where}`,
    answers.when && `Aikataulu: ${answers.when}`,
    answers.sizeLabel && `Laajuus: ${answers.sizeLabel}`,
  ].filter(Boolean).join('\n');
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent('Työtarve (Get to Work beta)')}&body=${encodeURIComponent(`Hei,\n\nkokeilin Get to Workin betaa. Tällaista pitäisi saada tehtyä:\n\n${summary}\n\nYritys:\nYhteyshenkilö:\nPuhelin:\n`)}`;

  if (view === 'landing') {
    return <main className="gb" lang="fi">
      <section className="gb-hero" aria-labelledby="gb-title">
        <span className="gb-watermark" aria-hidden="true">BETA</span>
        <p className="gb-beta"><span className="gb-beta__tag">BETA</span><span>Esikatselu siitä, miten Get to Work toimii</span></p>
        <h1 id="gb-title" className="gb-h1">Mitä pitäisi saada <span>tehtyä?</span></h1>
        <p className="gb-sub">Kerro tarve omin sanoin. Näet, miten siitä rakentuu projekti: työvaiheet, tekijät ja hinta-arvio.</p>
        <form className="gb-composer" onSubmit={onHero} autoComplete="off">
          <label htmlFor="gb-hero-input" className="gb-sr">Mitä pitäisi saada tehtyä?</label>
          <textarea id="gb-hero-input" ref={heroRef} rows={3} value={input} placeholder={PLACEHOLDERS[ph]}
            onChange={e => setInput(e.target.value)} onKeyDown={onHeroKey} />
          <div className="gb-crow">
            <span className="gb-hint">Enter lähettää</span>
            <button type="submit" className="gb-send" aria-label="Lähetä" disabled={!input.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </button>
          </div>
        </form>
        <div className="gb-chips">
          {CHIPS.map(c => <button key={c} type="button" className="gb-chip" onClick={() => start(c)}>{c}</button>)}
        </div>
        <p className="gb-trust">Ei rekrytointia. Ei monimutkaista tarjouspyyntöä. Vain työ, joka pitää saada tehtyä.</p>
        <p className="gb-note">Beta-esikatselu: keskustelu on esimerkki, eikä mitään lähetetä.</p>
      </section>
    </main>;
  }

  return <main className="gb gb--ws" lang="fi">
    <div className="gb-strip" role="note">
      <span className="gb-beta__tag gb-beta__tag--big">BETA</span>
      <span>Näin Get to Work tulee toimimaan. Keskustelu, tekijät ja hinnat ovat esimerkkejä, eikä mitään lähetetä.</span>
      <button type="button" className="gb-link" onClick={restart}>Aloita alusta</button>
    </div>
    <div className="gb-ws">
      <section className="gb-chatcol" aria-label="Keskustelu">
        <div className="gb-chat" aria-live="polite">
          {msgs.map(m => <div key={m.id} className={`gb-msg gb-msg--${m.from}`}>
            {m.from === 'ai' && <span className="gb-av" aria-hidden="true">G</span>}
            <div className="gb-b">
              {m.text}
              {m.options && m === lastAi && awaiting && <div className="gb-qrs">
                {m.options.map(o => <button key={o} type="button" className="gb-qr" onClick={() => answer(o)}>{o}</button>)}
              </div>}
            </div>
          </div>)}
          {typing && <div className="gb-msg gb-msg--ai"><span className="gb-av" aria-hidden="true">G</span><div className="gb-typing" aria-label="Kirjoittaa"><i /><i /><i /></div></div>}
          {done && <div className="gb-final">
            {!outOfScope && <a className="gb-btn gb-btn--pri" href={mailHref}>Lähetä tarve Rasmukselle <span aria-hidden="true">→</span></a>}
            <button type="button" className="gb-btn" onClick={restart}>Kokeile toisella tarpeella</button>
            <p>Beta ei vielä ota tilauksia vastaan. Kun lähetät tarpeen, Rasmus vastaa sinulle henkilökohtaisesti.</p>
          </div>}
          <div ref={chatEnd} />
        </div>
        <div className="gb-dock">
          <button type="button" className="gb-btn gb-showplan" onClick={() => setSheet(true)}>Näytä projekti ({Math.min(progress, 6)}/6)</button>
          <form className="gb-composer gb-composer--small" onSubmit={onReply} autoComplete="off">
            <label htmlFor="gb-reply" className="gb-sr">Vastaa</label>
            <textarea id="gb-reply" rows={1} value={reply} disabled={!awaiting}
              placeholder={awaiting ? 'Vastaa tai valitse vaihtoehto…' : done ? 'Projekti on koottu.' : 'Kokoan projektia…'}
              onChange={e => setReply(e.target.value)} onKeyDown={onReplyKey} />
            <div className="gb-crow">
              <button type="submit" className="gb-send" aria-label="Lähetä" disabled={!awaiting || !reply.trim()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </button>
            </div>
          </form>
        </div>
      </section>

      {sheet && <div className="gb-scrim" onClick={() => setSheet(false)} aria-hidden="true" />}
      <aside className={`gb-plancol${sheet ? ' is-open' : ''}`} aria-label="Projektiluonnos">
        <div className="gb-sheet-head"><b>Projektiluonnos</b><button type="button" className="gb-link" onClick={() => setSheet(false)}>Sulje</button></div>
        <div className="gb-doc">
          <div className="gb-doc-h">
            <p className="gb-eyebrow"><span>Projektiluonnos</span>
              <span className={`gb-status${done ? (outOfScope ? ' is-no' : ' is-ok') : ''}`}>
                {done ? (outOfScope ? 'Ei kuulu palveluun' : 'Voimme hoitaa tämän') : 'Rakentuu…'}
              </span>
            </p>
            <h2>{scenario.title}</h2>
            <p className="gb-need">”{need}”</p>
          </div>

          <div className="gb-sec">
            <h4>Tiedot</h4>
            <dl className="gb-kv">
              <dt>Paikka</dt><dd>{answers.where ?? <Pending />}</dd>
              <dt>Aikataulu</dt><dd>{answers.when ?? <Pending />}</dd>
              <dt>Laajuus</dt><dd>{answers.sizeLabel ?? <Pending />}</dd>
            </dl>
          </div>

          <div className="gb-sec">
            <h4>Näin projekti syntyy</h4>
            <ol className="gb-prog">
              {PROGRESS.map((p, i) => <li key={p} className={progress > i + 1 || (done && i === 5) ? 'is-done' : progress === i + 1 ? 'is-now' : ''}>
                <span className="gb-ck" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
                </span>
                <span>{p}{i === 2 && progress >= 3 && <small>{fmt(scanned)} tekijäprofiilia verrattu: osaaminen, sijainti, saatavuus</small>}</span>
              </li>)}
            </ol>
          </div>

          {progress >= 3 && <div className="gb-sec gb-in">
            <h4>Työvaiheet</h4>
            <ol className="gb-steps">{scenario.steps.map(s => <li key={s}>{s}</li>)}</ol>
          </div>}

          {progress >= 4 && !outOfScope && <div className="gb-sec gb-in">
            <h4>Ehdotettu tiimi · {team} henkilöä</h4>
            <ul className="gb-people">
              {scenario.roles.map((r, i) => <li key={r} style={{ animationDelay: `${i * 120}ms` }}>
                <span className="gb-pav" aria-hidden="true">{['A', 'M', 'J'][i]}</span>
                <span className="gb-pinfo"><b>{r}</b><small>{answers.where && answers.where !== 'Muualla' ? answers.where : 'Pääkaupunkiseutu'} · vapaana {answers.when?.toLowerCase() ?? 'pian'}</small></span>
                <span className="gb-match">{[96, 92, 89][i]} %</span>
              </li>)}
            </ul>
            <p className="gb-small">Esimerkkiprofiileja, ei oikeita henkilöitä.</p>
          </div>}

          {progress >= 5 && !outOfScope && <div className="gb-sec gb-price gb-in">
            <h4>Hinta-arvio</h4>
            <p className="gb-pbig">{fmt(low)}–{fmt(high)} € <small>alv 0 %</small></p>
            <p className="gb-small">Noin {team} hlö × {hours} h. Esimerkkihinta: lopullinen hinta vahvistetaan ennen aloitusta.</p>
          </div>}

          {done && <div className={`gb-sec gb-feas gb-in${outOfScope ? ' is-no' : ''}`}>
            <b>{outOfScope ? 'Tämä ei kuulu palveluumme' : 'Voimme hoitaa tämän'}</b>
            <span>{outOfScope
              ? 'Luvanvarainen erikoistyö ohjataan alan ammattilaiselle. Avustavissa töissä voimme auttaa.'
              : 'Sopivat tekijät löytyivät, ja työ on rajattavissa ja hinnoiteltavissa.'}</span>
          </div>}
        </div>
      </aside>
    </div>
  </main>;
}

const Pending = () => <span className="gb-pending">odottaa vastausta</span>;
