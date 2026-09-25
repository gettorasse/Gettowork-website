import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      let index = 0;
      interval = setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [text, speed, startDelay]);
  return { displayed, done: displayed.length === text.length };
}

function BackgroundVideo() {
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
    const syncViewport = () => { prevX = null; onScroll(); };
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

const links = ['Labs', 'Studio', 'Openings', 'Shop'];
const destinations = ['#labs', '#studio', '#openings', '#shop'];
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const { displayed, done } = useTypewriter('Glad you stopped in. Good taste tends to find us. Now, what are we building?');
  useEffect(() => { const timer = setTimeout(() => setPillsVisible(true), 400); return () => clearTimeout(timer); }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  return <>
    <BackgroundVideo />
    <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
      <a href="/" aria-label="Home"><img src="/group-2.svg" className="h-[35px] w-auto sm:h-[44px]" alt="Agency logo" /></a>
      <nav aria-label="Main navigation" className="hidden text-[23px] text-white md:flex">
        {links.map((link, i) => <React.Fragment key={link}><a href={destinations[i]} className="transition-opacity hover:opacity-60">{link}</a>{i < links.length - 1 && <span className="whitespace-pre">, </span>}</React.Fragment>)}
      </nav>
      <a href="mailto:rasmus@gettowork.fi" className="hidden text-[23px] text-white underline underline-offset-2 transition-opacity hover:opacity-60 md:block">Get in touch</a>
      <button aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-[5px] md:hidden">
        <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
        <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
      </button>
    </header>
    <nav id="mobile-menu" aria-label="Mobile navigation" aria-hidden={!menuOpen} inert={!menuOpen} className="fixed inset-0 z-[9] flex flex-col items-start justify-center gap-8 bg-black/90 px-8 text-[32px] font-medium text-white backdrop-blur-md transition-opacity duration-300 md:hidden" style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none' }}>
      {links.map((link, i) => <a key={link} href={destinations[i]} onClick={() => setMenuOpen(false)}>{link}</a>)}
      <a href="mailto:rasmus@gettowork.fi" className="underline underline-offset-2">Get in touch</a>
    </nav>
    <main className="hero relative z-[1] flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
      <div className="relative z-10 max-w-xl">
        <div className="intro pointer-events-none mb-5 select-none sm:mb-6">Hey there, meet A.R.I.A,<br />Mainframe's Adaptive Response Interface Agent</div>
        <p className="typewriter mb-5 min-h-[54px] text-white sm:mb-6">{displayed}{!done && <span className="cursor ml-[2px] inline-block h-[1.1em] w-[2px] bg-white align-middle" />}</p>
        <div className="flex flex-wrap gap-y-1" style={{ opacity: pillsVisible ? 1 : 0, transform: `translateY(${pillsVisible ? 0 : 8}px)`, transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <a className="pill white-pill" href="mailto:rasmus@gettowork.fi">Pitch us an idea</a>
          <a className="pill white-pill" href="mailto:rasmus@gettowork.fi">Get to Work Here</a>
          <a className="pill white-pill" href="mailto:rasmus@gettowork.fi">Send a brief hello</a>
          <a className="pill white-pill" href="mailto:rasmus@gettowork.fi">See how we operate</a>
          <a className="pill outline-pill gap-2 sm:gap-3" href="mailto:rasmus@gettowork.fi"><span>Reach us: <span className="underline underline-offset-1">rasmus@gettowork.fi</span></span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8 10-8"/></svg></a>
        </div>
      </div>
    </main>
    <div className="mobile-scroll-spacer" aria-hidden="true" />
  </>;
}
createRoot(document.getElementById('root')!).render(<App />);
