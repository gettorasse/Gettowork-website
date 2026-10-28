import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BackgroundVideo } from './BackgroundVideo.tsx';
import { SiteHeader } from './SiteHeader.tsx';
import { HOME_PATH, isLegacyPath, routeFromPath, type Route } from './router.ts';
import { About } from './restart-score/About.tsx';
import { RestartScore } from './restart-score/RestartScore.tsx';
import { useRestartScore } from './restart-score/useRestartScore.ts';

function App() {
  const [route, setRoute] = useState<Route>(() => {
    if (isLegacyPath(window.location.pathname)) window.history.replaceState(null, '', HOME_PATH);
    return routeFromPath(window.location.pathname);
  });
  const rs = useRestartScore();

  useEffect(() => {
    if (route === 'home') rs.syncFromHistory(window.history.state, true);
    const onPop = (e: PopStateEvent) => {
      const next = routeFromPath(window.location.pathname);
      setRoute(next);
      if (next === 'home') rs.syncFromHistory(e.state);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = route === 'about' ? 'Kysely · gettowork' : 'gettowork';
    window.scrollTo(0, 0);
  }, [route]);

  const startFromAbout = () => {
    const stored = Boolean(rs.deviceDraft) || rs.persist;
    if (stored && !window.confirm('Uusi testi korvaa tälle laitteelle tallennetun testin. Jatketaanko?')) return;
    setRoute('home');
    rs.start(stored);
  };

  const view = rs.assessment.view;
  const dim = route === 'about' || view === 'review' || view === 'result';

  return <>
    {/* Tausta pysyy samana koko ajan: etusivu, kysymykset ja tulos vaihtuvat sen päällä. */}
    <BackgroundVideo />
    <div className={`stage-dim${dim ? ' is-on' : ''}`} aria-hidden="true" />
    <div className={`stage-floor${route === 'home' && view === 'question' ? ' is-on' : ''}`} aria-hidden="true" />
    <div className={`stage-top${dim ? ' is-on' : ''}`} aria-hidden="true" />
    <SiteHeader route={route} />
    {route === 'about' ? <About onStart={startFromAbout} /> : <RestartScore rs={rs} />}
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
