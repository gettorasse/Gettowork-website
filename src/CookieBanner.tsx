import { useEffect, useState } from 'react';
import { LOADED_EVENT, loaderDone } from './logoLoader.ts';
import { PRIVACY_PATH, interceptClick } from './router.ts';

// Pieni evästebanneri: vain Hyväksy ja Hylkää. Valinta tallennetaan selaimeen.
// Sivustolla ei tällä hetkellä ole seuranta- tai markkinointievästeitä; jos sellaisia
// lisätään myöhemmin, ne käynnistetään vain, kun hasCookieConsent() palauttaa true.

const KEY = 'gettowork.cookies';
export type CookieChoice = 'accepted' | 'declined';

function readChoice(): CookieChoice | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch {
    return null;
  }
}

export const hasCookieConsent = () => readChoice() === 'accepted';
export const COOKIE_EVENT = 'gettowork:cookies';

export function CookieBanner() {
  const [choice, setChoice] = useState<CookieChoice | null>(readChoice);
  const [ready, setReady] = useState(loaderDone);
  const [shown, setShown] = useState(false);

  // Näytetään vasta, kun latausnäkymä on poistunut.
  useEffect(() => {
    if (ready) return;
    const on = () => setReady(true);
    window.addEventListener(LOADED_EVENT, on);
    return () => window.removeEventListener(LOADED_EVENT, on);
  }, [ready]);
  useEffect(() => {
    if (!ready || choice) return;
    const t = window.setTimeout(() => setShown(true), 400);
    return () => window.clearTimeout(t);
  }, [ready, choice]);

  const decide = (c: CookieChoice) => {
    try { window.localStorage.setItem(KEY, c); } catch { /* valinta pätee tämän käynnin ajan */ }
    setShown(false);
    window.setTimeout(() => setChoice(c), 300);
    window.dispatchEvent(new CustomEvent(COOKIE_EVENT, { detail: c }));
  };

  if (choice) return null;
  return <section className={`cookie-banner${shown ? ' is-shown' : ''}`} lang="fi" aria-label="Evästeet" aria-hidden={!shown} inert={!shown}>
    <p className="cookie-banner__text">Saammeko käyttää evästeitä sivuston kehittämiseen? <a href={PRIVACY_PATH} onClick={e => interceptClick(e, PRIVACY_PATH)}>Lue lisää</a></p>
    <div className="cookie-banner__actions">
      <button type="button" className="cookie-banner__btn" onClick={() => decide('declined')}>Hylkää</button>
      <button type="button" className="cookie-banner__btn is-primary" onClick={() => decide('accepted')}>Hyväksy</button>
    </div>
  </section>;
}
