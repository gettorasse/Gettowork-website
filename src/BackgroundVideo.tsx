import { useEffect, useRef } from 'react';

const GAZE_EVENT = 'gtw:gaze';

/** Kääntää A.R.I.An katseen: 0 = vasen reuna, 1 = oikea reuna. */
export function lookAt(fraction: number) {
  window.dispatchEvent(new CustomEvent<number>(GAZE_EVENT, { detail: fraction }));
}

/** Taustavideo, jota hiiri (työpöytä), vieritys (mobiili) tai lookAt() kelaa. */
export function BackgroundVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current!;
    const mobile = window.matchMedia('(max-width: 768px)');
    let prevX: number | null = null;
    let targetTime = video.currentTime;
    let frame = 0;
    let seeking = false;
    const seek = () => {
      frame = 0;
      if (seeking || video.readyState < 2 || !Number.isFinite(video.duration) || Math.abs(video.currentTime - targetTime) < 0.01) return;
      seeking = true;
      video.currentTime = targetTime;
    };
    const scheduleSeek = () => { if (!frame) frame = requestAnimationFrame(seek); };
    const onSeeked = () => { seeking = false; scheduleSeek(); };
    const onScroll = () => {
      if (!mobile.matches || !Number.isFinite(video.duration)) return;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
      targetTime = progress * video.duration;
      scheduleSeek();
    };
    const onMove = (event: MouseEvent) => {
      if (mobile.matches) return;
      if (prevX === null) { prevX = event.clientX; return; }
      const delta = event.clientX - prevX;
      prevX = event.clientX;
      if (!Number.isFinite(video.duration)) return;
      targetTime = Math.max(0, Math.min(video.duration, targetTime + (delta / window.innerWidth) * 0.8 * video.duration));
      scheduleSeek();
    };
    const onGaze = (event: Event) => {
      const fraction = (event as CustomEvent<number>).detail;
      if (!Number.isFinite(video.duration) || !Number.isFinite(fraction)) return;
      // Videon alussa hahmo katsoo oikealle, lopussa vasemmalle: käännetään, jotta katse osuu kohteeseen.
      targetTime = (1 - Math.max(0, Math.min(1, fraction))) * video.duration;
      scheduleSeek();
    };
    const syncViewport = () => { prevX = null; onScroll(); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener(GAZE_EVENT, onGaze);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncViewport);
    mobile.addEventListener('change', syncViewport);
    video.addEventListener('loadedmetadata', onScroll);
    video.addEventListener('loadeddata', onScroll);
    video.addEventListener('seeked', onSeeked);
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener(GAZE_EVENT, onGaze);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncViewport);
      mobile.removeEventListener('change', syncViewport);
      video.removeEventListener('loadedmetadata', onScroll);
      video.removeEventListener('loadeddata', onScroll);
      video.removeEventListener('seeked', onSeeked);
    };
  }, []);
  return <div className="video-backdrop" aria-hidden="true"><video ref={ref} className="background-video" src="/getto-video.mp4" muted playsInline preload="auto" /><div className="video-gradient" /></div>;
}
