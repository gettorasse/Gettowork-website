import type { MouseEvent } from 'react';

// Pieni polkureititys ilman lisäkirjastoa. Vercel ohjaa /restart-score-polun
// samaan index.html-tiedostoon (vercel.json), joten suora avaus ja päivitys toimivat.

export type Route = 'home' | 'restart-score';
export const QUIZ_PATH = '/restart-score';

export function routeFromPath(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '');
  return clean === QUIZ_PATH ? 'restart-score' : 'home';
}

/** Vaihtaa näkymää sovelluksen sisällä, jotta muistissa olevat vastaukset säilyvät. */
export function navigate(url: string, state: unknown = null) {
  window.history.pushState(state, '', url);
  window.dispatchEvent(new PopStateEvent('popstate', { state }));
}

/** Tavallinen vasen klikkaus navigoidaan sovelluksen sisällä; uusi välilehti toimii kuten ennen. */
export function interceptClick(event: MouseEvent<HTMLAnchorElement>, url: string, state: unknown = null) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(url, state);
}
