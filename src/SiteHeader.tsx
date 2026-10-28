import React, { useEffect, useState } from 'react';
import { interceptClick, type Route } from './router.ts';

const links = ['Labs', 'Studio', 'Openings', 'Shop'];
const destinations = ['#labs', '#studio', '#openings', '#shop'];

/** Sivuston yhteinen yläosa. Etusivulla linkit toimivat täsmälleen kuten ennen. */
export function SiteHeader({ route }: { route: Route }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const onHome = route === 'home';
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useEffect(() => setMenuOpen(false), [route]);

  const href = (i: number) => (onHome ? destinations[i] : `/${destinations[i]}`);
  const onLink = (i: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (!onHome) interceptClick(e, href(i));
  };
  const onLogo = (e: React.MouseEvent<HTMLAnchorElement>) => { if (!onHome) interceptClick(e, '/'); };

  return <>
    <header className={`site-header fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5${onHome ? '' : ' site-header--solid'}`}>
      <a href="/" aria-label="Home" onClick={onLogo}><img src="/group-2.svg" className="h-[35px] w-auto sm:h-[44px]" alt="Agency logo" /></a>
      <nav aria-label="Main navigation" className="hidden text-[23px] text-white md:flex">
        {links.map((link, i) => <React.Fragment key={link}><a href={href(i)} onClick={onLink(i)} className="transition-opacity hover:opacity-60">{link}</a>{i < links.length - 1 && <span className="whitespace-pre">, </span>}</React.Fragment>)}
      </nav>
      <a href="mailto:rasmus@gettowork.fi" className="hidden text-[23px] text-white underline underline-offset-2 transition-opacity hover:opacity-60 md:block">Get in touch</a>
      <button aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-[5px] md:hidden">
        <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
        <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
      </button>
    </header>
    <nav id="mobile-menu" aria-label="Mobile navigation" aria-hidden={!menuOpen} inert={!menuOpen} className="fixed inset-0 z-[9] flex flex-col items-start justify-center gap-8 bg-black/90 px-8 text-[32px] font-medium text-white backdrop-blur-md transition-opacity duration-300 md:hidden" style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none' }}>
      {links.map((link, i) => <a key={link} href={href(i)} onClick={onLink(i)}>{link}</a>)}
      <a href="mailto:rasmus@gettowork.fi" className="underline underline-offset-2">Get in touch</a>
    </nav>
  </>;
}
