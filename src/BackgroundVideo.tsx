import { useEffect, useRef, useState } from 'react';

export type Character = 'woman' | 'man';

/** Lyhyt (4 s) video, jota kursori kelaa: katse liikkuu ylhäältä alas. Ladataan heti. */
const SCRUB: Record<Character, string> = {
  woman: '/getto-scrub-woman-2.mp4',
  man: '/getto-scrub-man.mp4',
};

/** Pidempi, rauhallinen looppi testin taustalle. Ladataan laiskasti, kun sivu on valmis. */
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

/**
 * Taustavideo kahdessa tilassa:
 * - scrub (etusivu): työpöydällä kursorin pystysijainti kelaa lyhyttä videota, mobiilissa vieritys.
 * - loop (testi käynnissä): pidempi video pyörii itsestään 0,8-nopeudella, ristiinhäivytettynä.
 * Hahmon vaihto häivyttää videot ristiin; toisen hahmon videot ladataan vasta, kun se valitaan.
 */
export function BackgroundVideo({ character, mode, paused = false }: { character: Character; mode: 'scrub' | 'loop'; paused?: boolean }) {
  const [mounted, setMounted] = useState<Character[]>([character]);
  const [ready, setReady] = useState<Record<Character, boolean>>({ woman: false, man: false });
  const [loopMounted, setLoopMounted] = useState<Character[]>([]);
  const [loopReady, setLoopReady] = useState<Record<Character, boolean>>({ woman: false, man: false });
  const refs = useRef<Record<Character, HTMLVideoElement | null>>({ woman: null, man: null });
  const loopRefs = useRef<Record<Character, HTMLVideoElement | null>>({ woman: null, man: null });
  const active = useRef(character);
  const modeRef = useRef(mode);
  /** Mobiilissa vierityksen osuus 0–1, työpöydällä kursorin pystysijainti 0–1. */
  const pointer = useRef<{ kind: 'scroll' | 'cursor'; value: number }>({ kind: 'scroll', value: 0 });
  const seeking = useRef(new WeakSet<HTMLVideoElement>());
  const schedule = useRef<() => void>(() => {});
  active.current = character;
  modeRef.current = mode;

  useEffect(() => setMounted(m => (m.includes(character) ? m : [...m, character])), [character]);

  // Looppi: heti, jos testi on jo käynnissä; muuten laiskasti, kun sivu on valmis ja selain joutilas.
  useEffect(() => {
    const add = () => setLoopMounted(m => (m.includes(character) ? m : [...m, character]));
    if (mode === 'loop') { add(); return; }
    return whenIdle(add);
  }, [character, mode]);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)');
    let frame = 0;
    const seek = () => {
      frame = 0;
      if (modeRef.current !== 'scrub') return;
      const video = refs.current[active.current];
      if (!video || seeking.current.has(video) || video.readyState < 2 || !Number.isFinite(video.duration)) return;
      const { kind, value } = pointer.current;
      const g = gazeFor(active.current);
      const fraction = kind === 'cursor' ? Math.max(0, Math.min(1, (value - g.top) / (g.bottom - g.top))) : value;
      // Viimeinen kuva on aivan lopussa; pieni marginaali estää videon "päättymisen".
      const target = fraction * Math.max(0, video.duration - 0.05);
      if (Math.abs(video.currentTime - target) < 0.01) return;
      seeking.current.add(video);
      video.currentTime = target;
    };
    schedule.current = () => { if (!frame) frame = requestAnimationFrame(seek); };
    const onScroll = () => {
      if (!mobile.matches) return;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      pointer.current = { kind: 'scroll', value: distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0 };
      schedule.current();
    };
    const onMove = (event: MouseEvent) => {
      if (mobile.matches || window.innerHeight <= 0) return;
      // Koko näytön korkeus on seuranta-alue; GAZE kohdistaa katseen hahmokohtaisesti.
      pointer.current = { kind: 'cursor', value: event.clientY / window.innerHeight };
      schedule.current();
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    mobile.addEventListener('change', onScroll);
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mobile.removeEventListener('change', onScroll);
    };
  }, []);

  // Uusi hahmo tai paluu etusivulle: kelattava video hyppää heti kursorin kohtaan.
  useEffect(() => { schedule.current(); }, [character, mode]);

  // Näytetään valittu hahmo, kun sen video on valmis; siihen asti edellinen pysyy näkyvissä.
  // Looppi on kelattavan videon päällä ja häivyttyy esiin; kelattava pysyy alla valmiina paluuseen.
  const shown: Character = ready[character] ? character : (mounted.find(c => ready[c]) ?? character);
  const looping = mode === 'loop' && loopReady[shown] && !reducedMotion();

  // Looppi käynnistyy alusta, kun se tulee näkyviin, ja pysähtyy häivytyksen jälkeen.
  // Käyttäjä voi pysäyttää sen (paused); jatkaessa toisto jatkuu samasta kohdasta.
  const playingLoop = useRef<Character | null>(null);
  useEffect(() => {
    const timers: number[] = [];
    (Object.keys(loopRefs.current) as Character[]).forEach(c => {
      const video = loopRefs.current[c];
      if (!video) return;
      if (looping && c === shown) {
        if (playingLoop.current !== c) { video.currentTime = 0; playingLoop.current = c; }
        video.playbackRate = LOOP_RATE;
        if (paused) video.pause();
        else if (video.paused) video.play().catch(() => {});
      } else if (!video.paused) {
        timers.push(window.setTimeout(() => video.pause(), 700));
      }
    });
    if (!looping) playingLoop.current = null;
    return () => timers.forEach(t => window.clearTimeout(t));
  }, [looping, shown, paused]);

  return <div className="video-backdrop" aria-hidden="true">
    {mounted.map(c => (
      <video key={c} ref={el => { refs.current[c] = el; }}
        className={`background-video${c === shown ? '' : ' is-hidden'}`}
        src={SCRUB[c]} muted playsInline preload="auto"
        onLoadedData={() => { setReady(r => (r[c] ? r : { ...r, [c]: true })); schedule.current(); }}
        onSeeked={e => { seeking.current.delete(e.currentTarget); schedule.current(); }} />
    ))}
    {loopMounted.map(c => (
      <video key={`loop-${c}`} ref={el => { loopRefs.current[c] = el; }}
        className={`background-video background-video--loop${c === shown && looping ? '' : ' is-hidden'}`}
        src={LOOP[c]} muted playsInline loop preload="auto"
        onLoadedMetadata={e => { e.currentTarget.defaultPlaybackRate = LOOP_RATE; e.currentTarget.playbackRate = LOOP_RATE; }}
        onLoadedData={() => setLoopReady(r => (r[c] ? r : { ...r, [c]: true }))} />
    ))}
    <div className="video-gradient" />
  </div>;
}
