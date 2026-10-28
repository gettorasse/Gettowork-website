import type { MouseEvent } from 'react';

// Pieni polkureititys ilman lisäkirjastoa. Etusivu (/) on testin aloitus ja
// testi etenee samalla sivulla. /kysely on testin tietosivu. Vercel ohjaa
// polut index.html-tiedostoon (vercel.json), joten suora avaus ja päivitys toimivat.

export type Route = 'home' | 'about';
export const HOME_PATH = '/';
export const ABOUT_PATH = '/kysely';
/** Aiempi esikatseluosoite ohjataan etusivulle. */
const LEGACY_QUIZ_PATH = '/restart-score';

export function routeFromPath(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '');
  return clean === ABOUT_PATH ? 'about' : 'home';
}

export function isLegacyPath(pathname: string) {
  return pathname.replace(/\/+$/, '') === LEGACY_QUIZ_PATH;
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
