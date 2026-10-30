/** Taustavideon toisto / pysäytys testin aikana. Valinta muistetaan tällä laitteella. */

const KEY = 'gettowork.video-paused';

export function loadVideoPaused(): boolean {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function saveVideoPaused(paused: boolean) {
  try {
    if (paused) window.localStorage.setItem(KEY, '1');
    else window.localStorage.removeItem(KEY);
  } catch { /* ei tallennusta, valinta pysyy vain tämän käynnin ajan */ }
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function VideoToggle({ paused, onToggle, visible }: { paused: boolean; onToggle: () => void; visible: boolean }) {
  // Vähennetyn liikkeen asetuksella looppi ei pyöri lainkaan, joten painiketta ei tarvita.
  const show = visible && !reducedMotion();
  const label = paused ? 'Toista taustavideo' : 'Pysäytä taustavideo';
  return <button type="button" lang="fi" className={`video-toggle${show ? '' : ' is-hidden'}`} onClick={onToggle}
    aria-label={label} aria-pressed={paused} title={label} inert={!show}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paused
        ? <path d="M8 5.5v13l10.5-6.5z" />
        : <><rect x="6.5" y="5.5" width="3.6" height="13" rx="1" /><rect x="13.9" y="5.5" width="3.6" height="13" rx="1" /></>}
    </svg>
    <span className="video-toggle__text">{paused ? 'Toista video' : 'Pysäytä video'}</span>
  </button>;
}
