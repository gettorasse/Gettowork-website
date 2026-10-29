import { useEffect, useRef, useState } from 'react';

export type Character = 'woman' | 'man';

const SOURCES: Record<Character, string> = {
  woman: '/getto-video.mp4',
  man: '/getto-video-man-4.mp4',
};

/**
 * Taustavideo. Työpöydällä kursorin pystysijainti koko näytön korkeudelta kelaa videota,
 * mobiilissa vieritys. Hahmon vaihto häivyttää videot ristiin; toinen video ladataan
 * vasta, kun se valitaan ensimmäisen kerran, ja se jatkaa samasta katseen kohdasta.
 */
export function BackgroundVideo({ character }: { character: Character }) {
  const [mounted, setMounted] = useState<Character[]>([character]);
  const [ready, setReady] = useState<Record<Character, boolean>>({ woman: false, man: false });
  const refs = useRef<Record<Character, HTMLVideoElement | null>>({ woman: null, man: null });
  const active = useRef(character);
  const fraction = useRef(0);
  const seeking = useRef(new WeakSet<HTMLVideoElement>());
  const schedule = useRef<() => void>(() => {});
  active.current = character;

  useEffect(() => setMounted(m => (m.includes(character) ? m : [...m, character])), [character]);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)');
    let frame = 0;
    const seek = () => {
      frame = 0;
      const video = refs.current[active.current];
      if (!video || seeking.current.has(video) || video.readyState < 2 || !Number.isFinite(video.duration)) return;
      const target = fraction.current * video.duration;
      if (Math.abs(video.currentTime - target) < 0.01) return;
      seeking.current.add(video);
      video.currentTime = target;
    };
    schedule.current = () => { if (!frame) frame = requestAnimationFrame(seek); };
    const onScroll = () => {
      if (!mobile.matches) return;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      fraction.current = distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
      schedule.current();
    };
    const onMove = (event: MouseEvent) => {
      if (mobile.matches || window.innerHeight <= 0) return;
      // Koko näytön korkeus on seuranta-alue: yläreuna = videon alku, alareuna = loppu.
      fraction.current = Math.max(0, Math.min(1, event.clientY / window.innerHeight));
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

  // Uusi hahmo hyppää heti samaan katseen kohtaan.
  useEffect(() => { schedule.current(); }, [character]);

  // Näytetään valittu hahmo, kun sen video on valmis; siihen asti edellinen pysyy näkyvissä.
  const shown: Character = ready[character] ? character : (mounted.find(c => ready[c]) ?? character);

  return <div className="video-backdrop" aria-hidden="true">
    {mounted.map(c => (
      <video key={c} ref={el => { refs.current[c] = el; }}
        className={`background-video${c === shown ? '' : ' is-hidden'}`}
        src={SOURCES[c]} muted playsInline preload="auto"
        onLoadedData={() => { setReady(r => (r[c] ? r : { ...r, [c]: true })); schedule.current(); }}
        onSeeked={e => { seeking.current.delete(e.currentTarget); schedule.current(); }} />
    ))}
    <div className="video-gradient" />
  </div>;
}
