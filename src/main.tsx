import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BackgroundVideo } from './BackgroundVideo.tsx';
import { SiteHeader } from './SiteHeader.tsx';
import { QUIZ_PATH, interceptClick, routeFromPath, type Route } from './router.ts';
import { RestartScore } from './restart-score/RestartScore.tsx';
import { useRestartScore } from './restart-score/useRestartScore.ts';

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

function Home({ onOpenQuiz }: { onOpenQuiz: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  const [pillsVisible, setPillsVisible] = useState(false);
  const { displayed, done } = useTypewriter('Glad you stopped in. Good taste tends to find us. Now, what are we building?');
  useEffect(() => { const timer = setTimeout(() => setPillsVisible(true), 400); return () => clearTimeout(timer); }, []);
  return <>
    <BackgroundVideo />
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
          <a className="pill white-pill restart-pill" href={QUIZ_PATH} onClick={onOpenQuiz} lang="fi">Tee Restart Score</a>
        </div>
      </div>
    </main>
    <div className="mobile-scroll-spacer" aria-hidden="true" />
  </>;
}

function App() {
  const [route, setRoute] = useState<Route>(() => routeFromPath(window.location.pathname));
  const rs = useRestartScore();

  useEffect(() => {
    if (route === 'restart-score') rs.syncFromHistory(window.history.state, true);
    const onPop = (e: PopStateEvent) => {
      const next = routeFromPath(window.location.pathname);
      setRoute(next);
      if (next === 'restart-score') rs.syncFromHistory(e.state);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = route === 'home' ? 'gettowork' : 'Restart Score · gettowork';
    window.scrollTo(0, 0);
  }, [route]);

  const openQuiz = (e: React.MouseEvent<HTMLAnchorElement>) => interceptClick(e, QUIZ_PATH, { rs: { view: 'intro', step: 0 } });

  return <>
    <SiteHeader route={route} />
    {route === 'home' ? <Home onOpenQuiz={openQuiz} /> : <RestartScore rs={rs} />}
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
