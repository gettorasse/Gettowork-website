import { useEffect, useRef, useState } from 'react';

export type Character = 'woman' | 'man';

/** Lyhyt (4 s) video testin taustalle: työpöydällä kursori kelaa katsetta ylhäältä alas. Ladataan laiskasti. */
const SCRUB: Record<Character, string> = {
  woman: '/getto-scrub-woman-2.mp4',
  man: '/getto-scrub-man.mp4',
};

/** Pidempi, rauhallinen looppi etusivulle. Ladataan heti. */
const LOOP: Record<Character, string> = {
  woman: '/getto-loop-woman-2.mp4',
  man: '/getto-loop-man-2.mp4',
};

/** Loopin toistonopeus (hieman hidastettu). */
const LOOP_RATE = 0.8;

/**
 * Katseen kohdistus: missä kohtaa näytön korkeutta (0 = yläreuna, 1 = alareuna) video on
 * alussa (top) ja lopussa (bottom). Jos hahmo katsoo kursorin yläpuolelle, siirrä
 * molempia arvoja pienemmiksi; jos alapuolelle, suuremmiksi.
 * Kokeiluun: lisää osoitteeseen ?katse=-0.12,0.88 (koskee valittua hahmoa).
 */
const GAZE: Record<Character, { top: number; bottom: number }> = {
  woman: { top: 0, bottom: 1 },
  man: { top: 0, bottom: 1 },
};

function gazeFor(c: Character) {
  const override = new URLSearchParams(window.location.search).get('katse');
  const parts = override?.split(',').map(Number);
  if (parts && parts.length === 2 && parts.every(Number.isFinite) && parts[1] > parts[0]) return { top: parts[0], bottom: parts[1] };
  return GAZE[c];
}

/** Kutsuu funktiota, kun sivu on ladattu ja selain on joutilas. */
function whenIdle(cb: () => void): () => void {
  let cancelled = false;
  let idle = 0;
  const run = () => {
    if (cancelled) return;
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) idle = ric(() => { if (!cancelled) cb(); }, { timeout: 2500 });
    else idle = window.setTimeout(() => { if (!cancelled) cb(); }, 800);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', run);
    const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
    if (cic) cic(idle); else window.clearTimeout(idle);
  };
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Puhelin ja tabletti: kosketusnäyttö tai kapea näyttö. Niillä testin video pysyy paikallaan. */
const touchQuery = '(hover: none), (pointer: coarse), (max-width: 768px)';

type Layer = 'loop' | 'scrub';

/**
 * Taustavideo kahdessa tilassa:
 * - loop (etusivu): pidempi video pyörii itsestään 0,8-nopeudella. Ladataan heti.
 * - scrub (testi): työpöydällä kursorin pystysijainti kelaa lyhyttä videota; puhelimessa ja
 *   tabletilla video pysähtyy ensimmäiseen kuvaansa. Ladataan laiskasti, kun sivu on valmis.
 * Tilojen ja hahmojen vaihdot häivytetään ristiin; toisen hahmon videot ladataan vasta, kun se valitaan.
 */
export function BackgroundVideo({ character, mode, paused = false }: { character: Character; mode: Layer; paused?: boolean }) {
  const [loopMounted, setLoopMounted] = useState<Character[]>([character]);
  const [scrubMounted, setScrubMounted] = useState<Character[]>([]);
  const [ready, setReady] = useState<Record<Layer, Record<Character, boolean>>>({
    loop: { woman: false, man: false }, scrub: { woman: false, man: false },
  });
  const loopRefs = useRef<Record<Character, HTMLVideoElement | null>>({ woman: null, man: null });
  const scrubRefs = useRef<Record<Character, HTMLVideoElement | null>>({ woman: null, man: null });
  const active = useRef(character);
  const modeRef = useRef(mode);
  /** Kursorin pystysijainti 0–1 (vain työpöydällä). */
  const pointer = useRef(0);
  const seeking = useRef(new WeakSet<HTMLVideoElement>());
  const schedule = useRef<() => void>(() => {});
  active.current = character;
  modeRef.current = mode;

  const markReady = (layer: Layer, c: Character) =>
    setReady(r => (r[layer][c] ? r : { ...r, [layer]: { ...r[layer], [c]: true } }));

  // Etusivun looppi valitulle hahmolle heti.
  useEffect(() => setLoopMounted(m => (m.includes(character) ? m : [...m, character])), [character]);

  // Testin lyhyt video: heti, jos testi on jo käynnissä; muuten laiskasti, kun sivu on valmis.
  useEffect(() => {
    const add = () => setScrubMounted(m => (m.includes(character) ? m : [...m, character]));
    if (mode === 'scrub') { add(); return; }
    return whenIdle(add);
  }, [character, mode]);

  // Kursori kelaa lyhyttä videota (vain työpöydällä ja testin aikana).
  useEffect(() => {
    const touch = window.matchMedia(touchQuery);
    let frame = 0;
    const seek = () => {
      frame = 0;
      if (modeRef.current !== 'scrub') return;
      const video = scrubRefs.current[active.current];
      if (!video || seeking.current.has(video) || video.readyState < 2 || !Number.isFinite(video.duration)) return;
      let target = 0;
      if (!touch.matches) {
        const g = gazeFor(active.current);
        const fraction = Math.max(0, Math.min(1, (pointer.current - g.top) / (g.bottom - g.top)));
        // Viimeinen kuva on aivan lopussa; pieni marginaali estää videon "päättymisen".
        target = fraction * Math.max(0, video.duration - 0.05);
      }
      if (Math.abs(video.currentTime - target) < 0.01) return;
      seeking.current.add(video);
      video.currentTime = target;
    };
    schedule.current = () => { if (!frame) frame = requestAnimationFrame(seek); };
    const onMove = (event: MouseEvent) => {
      if (touch.matches || window.innerHeight <= 0) return;
      // Koko näytön korkeus on seuranta-alue; GAZE kohdistaa katseen hahmokohtaisesti.
      pointer.current = event.clientY / window.innerHeight;
      schedule.current();
    };
    const onChange = () => schedule.current();
    window.addEventListener('mousemove', onMove);
    touch.addEventListener('change', onChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      touch.removeEventListener('change', onChange);
    };
  }, []);

  // Hahmon tai tilan vaihtuessa lyhyt video hyppää heti oikeaan kohtaan.
  useEffect(() => { schedule.current(); }, [character, mode]);

  // Näkyvä hahmo: valittu, kun jokin sen videoista on valmis; siihen asti edellinen pysyy näkyvissä.
  const hasAny = (c: Character) => ready.loop[c] || ready.scrub[c];
  const all: Character[] = ['man', 'woman'];
  const shown: Character = hasAny(character) ? character : (all.find(c => c !== character && hasAny(c)) ?? character);
  // Näkyvä kerros: tilan mukainen, jos se on valmis; muuten se, joka on.
  const other: Layer = mode === 'loop' ? 'scrub' : 'loop';
  const layer: Layer = ready[mode][shown] || !ready[other][shown] ? mode : other;

  // Looppi pyörii, kun se on näkyvissä (ellei kävijä ole pysäyttänyt sitä); muuten se pysähtyy häivytyksen jälkeen.
  const playingLoop = useRef<Character | null>(null);
  useEffect(() => {
    const timers: number[] = [];
    all.forEach(c => {
      const video = loopRefs.current[c];
      if (!video) return;
      if (layer === 'loop' && c === shown) {
        if (playingLoop.current !== c) { video.currentTime = 0; playingLoop.current = c; }
        video.playbackRate = LOOP_RATE;
        if (paused || reducedMotion()) video.pause();
        else if (video.paused) video.play().catch(() => {});
      } else if (!video.paused) {
        timers.push(window.setTimeout(() => video.pause(), 700));
      }
    });
    if (layer !== 'loop') playingLoop.current = null;
    return () => timers.forEach(t => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, shown, paused, ready.loop]);

  return <div className="video-backdrop" aria-hidden="true">
    {/* Lyhyt video on alimpana; looppi sen päällä häivyttyy esiin ja pois. */}
    {scrubMounted.map(c => (
      <video key={`scrub-${c}`} ref={el => { scrubRefs.current[c] = el; }}
        className={`background-video${c === shown ? '' : ' is-hidden'}`}
        src={SCRUB[c]} muted playsInline preload="auto"
        onLoadedData={() => { markReady('scrub', c); schedule.current(); }}
        onSeeked={e => { seeking.current.delete(e.currentTarget); schedule.current(); }} />
    ))}
    {loopMounted.map(c => (
      <video key={`loop-${c}`} ref={el => { loopRefs.current[c] = el; }}
        className={`background-video background-video--loop${c === shown && layer === 'loop' ? '' : ' is-hidden'}`}
        src={LOOP[c]} muted playsInline loop preload="auto"
        onLoadedMetadata={e => { e.currentTarget.defaultPlaybackRate = LOOP_RATE; e.currentTarget.playbackRate = LOOP_RATE; }}
        onLoadedData={() => markReady('loop', c)} />
    ))}
    <div className="video-gradient" />
  </div>;
}
