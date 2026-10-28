import React, { useEffect, useState } from 'react';
import { ABOUT_PATH, HOME_PATH, interceptClick, type Route } from './router.ts';

const MARKETING_URL = 'https://webshow.fi';
const CONTACT = 'mailto:rasmus@gettowork.fi';

/** Sivuston yläosa ilman omaa taustaa: hahmo näkyy ylhäältä alas. */
export function SiteHeader({ route }: { route: Route }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useEffect(() => setMenuOpen(false), [route]);

  const go = (url: string, state: unknown = null) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    interceptClick(e, url, state);
  };
  const toHome = go(HOME_PATH, { rs: { view: 'intro', step: 0 } });
  const toAbout = go(ABOUT_PATH);
  const current = (r: Route) => (route === r ? 'page' : undefined);

  return <>
    <header className="site-header fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5" lang="fi">
      <a href={HOME_PATH} aria-label="Etusivu" onClick={toHome}><img src="/group-2.svg" className="h-[35px] w-auto sm:h-[44px]" alt="gettowork" /></a>
      <nav aria-label="Päävalikko" className="hidden text-[23px] text-white md:flex">
        <a href={ABOUT_PATH} onClick={toAbout} aria-current={current('about')} className="transition-opacity hover:opacity-60">Kysely</a>
        <span className="whitespace-pre">, </span>
        <a href={MARKETING_URL} target="_blank" rel="noopener" className="transition-opacity hover:opacity-60">Aloita markkinointi</a>
      </nav>
      <a href={CONTACT} className="hidden text-[23px] text-white underline underline-offset-2 transition-opacity hover:opacity-60 md:block">Tavoita minut</a>
      <button aria-label={menuOpen ? 'Sulje valikko' : 'Avaa valikko'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-[5px] md:hidden">
        <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
        <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
      </button>
    </header>
    <nav id="mobile-menu" lang="fi" aria-label="Mobiilivalikko" aria-hidden={!menuOpen} inert={!menuOpen} className="fixed inset-0 z-[9] flex flex-col items-start justify-center gap-8 bg-black/90 px-8 text-[32px] font-medium text-white backdrop-blur-md transition-opacity duration-300 md:hidden" style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none' }}>
      <a href={HOME_PATH} onClick={toHome}>Testi</a>
      <a href={ABOUT_PATH} onClick={toAbout}>Kysely</a>
      <a href={MARKETING_URL} target="_blank" rel="noopener">Aloita markkinointi</a>
      <a href={CONTACT} className="underline underline-offset-2">Tavoita minut</a>
    </nav>
  </>;
}
