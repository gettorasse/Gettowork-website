import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BackgroundVideo, type Character } from './BackgroundVideo.tsx';
import { CharacterSwitch, loadCharacter, saveCharacter } from './CharacterSwitch.tsx';
import { UnderlayNav } from './UnderlayNav.tsx';
import { CookieBanner } from './CookieBanner.tsx';
import { initLogoStackLoader } from './logoLoader.ts';
import { HOME_PATH, isLegacyPath, routeFromPath, type Route } from './router.ts';
import { About } from './restart-score/About.tsx';
import { Privacy } from './restart-score/Privacy.tsx';
import { RestartScore } from './restart-score/RestartScore.tsx';
import { useRestartScore } from './restart-score/useRestartScore.ts';

function App() {
  const [route, setRoute] = useState<Route>(() => {
    if (isLegacyPath(window.location.pathname)) window.history.replaceState(null, '', HOME_PATH);
    return routeFromPath(window.location.pathname);
  });
  const rs = useRestartScore();
  const [character, setCharacter] = useState<Character>(loadCharacter);
  const chooseCharacter = (c: Character) => { setCharacter(c); saveCharacter(c); };

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
    document.title = route === 'about' ? 'Kysely · gettowork' : route === 'privacy' ? 'Tietosuojaseloste · gettowork' : 'gettowork';
    window.scrollTo(0, 0);
  }, [route]);

  const startFromAbout = () => {
    const stored = Boolean(rs.deviceDraft) || rs.persist;
    if (stored && !window.confirm('Uusi testi korvaa tälle laitteelle tallennetun testin. Jatketaanko?')) return;
    setRoute('home');
    rs.start(stored);
  };

  const view = rs.assessment.view;
  const dim = route !== 'home' || view === 'result';
  const question = route === 'home' && view === 'question';

  return <>
    <UnderlayNav route={route} />
    {/* Kaikki sivun sisältö yhdessä kääreessä: valikko avautuu sen alta (UnderlayNav). */}
    <div data-main className="underlay-main">
    {/* Tausta pysyy samana koko ajan: etusivu, kysymykset ja tulos vaihtuvat sen päällä. */}
    <BackgroundVideo character={character} />
    <div className={`stage-dim${dim ? ' is-on' : ''}${question ? ' is-soft' : ''}`} aria-hidden="true" />
    <div className={`stage-floor${question ? ' is-on' : ''}`} aria-hidden="true" />
    <div className={`stage-top${dim ? ' is-on' : ''}${question ? ' is-soft' : ''}`} aria-hidden="true" />
    <CharacterSwitch value={character} onChange={chooseCharacter} visible={route === 'home' && view === 'intro'} />
    {route === 'about' ? <About onStart={startFromAbout} /> : route === 'privacy' ? <Privacy /> : <RestartScore rs={rs} />}
    </div>
    <CookieBanner />
  </>;
}

initLogoStackLoader();
createRoot(document.getElementById('root')!).render(<App />);
