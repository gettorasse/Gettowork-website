import { useEffect, useRef } from 'react';

/** Taustavideo: työpöydällä kursorin vaakasijainti koko näytön leveydeltä kelaa videota, mobiilissa vieritys. */
export function BackgroundVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current!;
    const mobile = window.matchMedia('(max-width: 768px)');
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
      if (mobile.matches || !Number.isFinite(video.duration) || window.innerWidth <= 0) return;
      // Koko näytön leveys on seuranta-alue: vasen reuna = videon alku, oikea reuna = loppu.
      const fraction = Math.max(0, Math.min(1, event.clientX / window.innerWidth));
      targetTime = fraction * video.duration;
      scheduleSeek();
    };
    const syncViewport = () => { onScroll(); };
    window.addEventListener('mousemove', onMove);
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
