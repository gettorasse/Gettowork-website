import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HOME_PATH, PRIVACY_PATH, interceptClick, type Route } from './router.ts';
import './UnderlayNav.css';

// Osmo Supply "Fixed Underlay Navigation" Reactiin sovitettuna. Valikko on kiinteästi
// oikealla sivun sisällön alla (z-index 1); [data-main] (z-index 2) liukuu vasemmalle
// ja paljastaa sen. Animaatio: GSAP 3.15 + CustomEase "energy" (ladataan index.html:ssä).

const EMAIL = 'rasmus@gettowork.fi';
const PHONE_LABEL = '044 236 1914';
const PHONE_HREF = 'tel:+358442361914';
const IDEA_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('Kerro ideastasi')}&body=${encodeURIComponent('Hei Rasmus,\n\nidea, josta haluaisin jutella:\n\n')}`;
const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/gettorasse/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@gettorasse?_r=1&_t=ZN-9AxQ1UF0XLC' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rasmusrautavirta/' },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UCTyWli6IvwlC5pc7Ccuxlcw' },
];

// GSAP tulee CDN:stä globaalina (window.gsap), joten tyypit ovat tarkoituksella väljät.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Gsap = any;
declare global { interface Window { gsap?: Gsap; CustomEase?: Gsap } }

let easeReady = false;
function getGsap(): Gsap | null {
  const gsap = window.gsap;
  if (!gsap) return null;
  if (!easeReady && window.CustomEase) {
    gsap.registerPlugin(window.CustomEase);
    window.CustomEase.create('energy', 'M0,0 C0.32,0.72 0,1 1,1');
    easeReady = true;
  }
  return gsap;
}

export function UnderlayNav({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<Gsap>(null);
  const enterEnd = useRef(0);

  /** Liikkuvat osat: kaikki [data-main]-kääreen lapset (tausta, kerrokset ja sisältö) sekä overlay. */
  const movingTargets = () => {
    const main = document.querySelector('[data-main]');
    return [...(main ? Array.from(main.children) : []), overlayRef.current].filter(Boolean) as Element[];
  };

  const buildTimeline = useCallback(() => {
    const gsap = getGsap();
    const toggleBtn = toggleRef.current;
    const menuEl = menuRef.current;
    const overlayEl = overlayRef.current;
    if (!gsap || !toggleBtn || !menuEl || !overlayEl) return null;
    tlRef.current?.kill();

    const toggleLabels = toggleBtn.querySelectorAll('.underlay-nav__toggle-label');
    const toggleBars = toggleBtn.querySelectorAll('.underlay-nav__toggle-bar');
    const largeItems = menuEl.querySelectorAll('[data-reveal-l]');
    const smallItems = menuEl.querySelectorAll('[data-reveal-s]');
    const menuBorder = menuEl.querySelector('.underlay-nav__bottom-border');
    const darkEl = overlayEl.querySelector('.underlay-nav__dark');
    const corners = overlayEl.querySelectorAll('.underlay-nav__corner');
    const overlayBorders = overlayEl.querySelectorAll('.underlay-nav__border-row');
    const targets = movingTargets();
    const closedColor = getComputedStyle(toggleBtn).color;
    const openColor = getComputedStyle(menuEl).color;
    const getMenuOffset = () => -menuEl.offsetWidth;

    gsap.set(overlayEl, { visibility: 'hidden', pointerEvents: 'none' });
    gsap.set(darkEl, { autoAlpha: 0 });
    gsap.set(toggleLabels, { yPercent: 0 });
    gsap.set(toggleBars, { y: 0, rotation: 0 });
    gsap.set(menuBorder, { scaleX: 0 });
    gsap.set(overlayBorders[0], { yPercent: -100 });
    gsap.set(overlayBorders[1], { yPercent: 100 });
    gsap.set(corners, { scale: 0 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: easeReady ? 'energy' : 'power3.out', easeReverse: 'power2.inOut' } });
    tl.set(overlayEl, { visibility: 'visible', pointerEvents: 'auto' }, 0);
    tl.to(targets, { x: getMenuOffset, duration: 0.7 }, 0)
      .to(darkEl, { autoAlpha: 1, duration: 0.5 }, 0)
      .to(corners, { scale: 1, duration: 0.5 }, 0)
      .to(overlayBorders, { yPercent: 0, duration: 0.5 }, 0)
      .to(toggleLabels, { yPercent: -100, duration: 0.4 }, 0)
      .to(toggleBtn, { color: openColor, duration: 0.4 }, 0)
      .to(toggleBars[0], { y: '0.25em', rotation: 45, duration: 0.35, ease: 'back.out(1.4)', easeReverse: 'power3.out' }, 0.05)
      .to(toggleBars[1], { y: '-0.25em', rotation: -45, duration: 0.35, ease: 'back.out(1.4)', easeReverse: 'power3.out' }, 0.05)
      .fromTo(largeItems, { autoAlpha: 0, xPercent: 25 }, { autoAlpha: 1, xPercent: 0, duration: 0.7, stagger: 0.05 }, 0)
      .fromTo(smallItems, { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, duration: 0.5, stagger: 0.03, ease: 'power3.out' }, 0.3)
      .to(menuBorder, { scaleX: 1, duration: 0.5 }, '<');

    enterEnd.current = tl.duration();
    tl.addPause();

    tl.to([largeItems, smallItems], { autoAlpha: 0, duration: 0.3 }, '<')
      .to(targets, { x: 0, duration: 0.6 }, '<')
      .to(darkEl, { autoAlpha: 0, duration: 0.35, ease: 'power2.inOut' }, '<')
      .to(corners, { scale: 0, duration: 0.5 }, '<')
      .to(overlayBorders[0], { yPercent: -100, duration: 0.5 }, '<')
      .to(overlayBorders[1], { yPercent: 100, duration: 0.5 }, '<')
      .to(toggleBtn, { color: closedColor, duration: 0.25 }, '<+=0.1')
      .to(toggleLabels, { yPercent: 0, duration: 0.25, ease: 'power3.in' }, '<')
      .to(toggleBars, { y: 0, rotation: 0, duration: 0.25, ease: 'power3.in' }, '<')
      .set(overlayEl, { visibility: 'hidden', pointerEvents: 'none' })
      // Siivotaan siirrot pois, jotta sivun kiinteät elementit toimivat normaalisti.
      .set(targets, { clearProps: 'transform' });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) tl.timeScale(4);
    tlRef.current = tl;
    return tl;
  }, []);

  const setState = useCallback((next: boolean) => {
    if (openRef.current === next) return;
    openRef.current = next;
    setOpen(next);
    document.body.setAttribute('data-menu-status', next ? 'open' : '');
    const tl = tlRef.current;

    if (!getGsap()) {
      // Varatoiminto, jos GSAP ei latautunut: siirto ilman animaatiokirjastoa.
      const offset = next ? `translateX(${-(menuRef.current?.offsetWidth ?? 0)}px)` : '';
      for (const el of movingTargets()) (el as HTMLElement).style.transform = offset;
      if (overlayRef.current) { overlayRef.current.style.visibility = next ? 'visible' : 'hidden'; overlayRef.current.style.pointerEvents = next ? 'auto' : 'none'; }
      return;
    }

    if (next) {
      // Keskeytetty avaus jatkuu; muuten aikajana rakennetaan uudelleen nykyisillä elementeillä.
      if (tl && tl.time() > 0 && tl.time() < enterEnd.current && tl.reversed()) tl.timeScale(tl.timeScale()).play();
      else buildTimeline()?.play(0);
    } else if (tl) {
      if (tl.time() < enterEnd.current) tl.reverse();
      else tl.play();
    }
  }, [buildTimeline]);

  const toggle = useCallback(() => setState(!openRef.current), [setState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openRef.current) { setState(false); toggleRef.current?.focus(); }
    };
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const gsap = getGsap();
        if (openRef.current && gsap && menuRef.current) gsap.set(movingTargets(), { x: -menuRef.current.offsetWidth });
      }, 150);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
      tlRef.current?.kill();
    };
  }, [setState]);

  // Avattaessa fokus valikkoon.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }), 300);
    return () => window.clearTimeout(t);
  }, [open]);

  const go = (url: string, state: unknown = null) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    setState(false);
    interceptClick(e, url, state);
  };
  const toHome = go(HOME_PATH, { rs: { view: 'intro', step: 0 } });
  const closeAfter = () => setState(false);

  return <div className="underlay-nav" lang="fi">
    <header className="underlay-nav__header">
      <div className="underlay-nav__bar">
        <div className="underlay-nav__container">
          <a href={HOME_PATH} className="underlay-nav__logo" aria-label="gettowork – etusivu" onClick={toHome}>
            <img src="/group-2.svg" alt="" className="underlay-nav__logo-img" />
          </a>
          <button ref={toggleRef} type="button" data-underlay-nav-toggle aria-expanded={open} aria-controls="underlay-menu"
            aria-label={open ? 'Sulje valikko' : 'Avaa valikko'} className="underlay-nav__toggle" onClick={toggle}>
            <span className="underlay-nav__toggle-text" aria-hidden="true">
              <span className="underlay-nav__toggle-label">Valikko</span>
              <span className="underlay-nav__toggle-label">Sulje</span>
            </span>
            <span className="underlay-nav__toggle-icon" aria-hidden="true">
              <span className="underlay-nav__toggle-bar" />
              <span className="underlay-nav__toggle-bar" />
            </span>
          </button>
        </div>
      </div>
    </header>

    <nav ref={menuRef} id="underlay-menu" data-underlay-nav-menu className="underlay-nav__menu" aria-label="Valikko" inert={!open}>
      <div className="underlay-nav__inner">
        <ul className="underlay-nav__list">
          <li data-reveal-l>
            <a href={HOME_PATH} onClick={toHome} aria-current={route === 'home' ? 'page' : undefined}
              className={`underlay-nav__link-large${route === 'home' ? ' w--current' : ''}`}><span className="underlay-nav__link-label">Tee testi</span></a>
          </li>
          <li data-reveal-l>
            <a href={IDEA_HREF} onClick={closeAfter} className="underlay-nav__link-large"><span className="underlay-nav__link-label">Kerro ideastasi</span></a>
          </li>
          <li data-reveal-l>
            <a href="https://webshow.fi" target="_blank" rel="noopener" onClick={closeAfter} className="underlay-nav__link-large">
              <span className="underlay-nav__link-label">Webshow.fi ↗</span>
              <span className="underlay-nav__link-sub">Markkinointipalvelut</span>
            </a>
          </li>
        </ul>

        <div className="underlay-nav__footer">
          <div className="underlay-nav__bottom">
            <div className="underlay-nav__bottom-col">
              <div data-reveal-s><span className="underlay-nav__link-small is--faded">Yhteystiedot</span></div>
              <ul className="underlay-nav__list is--small">
                <li data-reveal-s><a href={`mailto:${EMAIL}`} className="underlay-nav__link-small">{EMAIL}</a></li>
                <li data-reveal-s><a href={PHONE_HREF} className="underlay-nav__link-small">{PHONE_LABEL}</a></li>
              </ul>
            </div>
            <div className="underlay-nav__bottom-col">
              <div data-reveal-s><span className="underlay-nav__link-small is--faded">Some</span></div>
              <ul className="underlay-nav__list is--small">
                {SOCIALS.map(s => <li key={s.label} data-reveal-s>
                  <a href={s.href} target="_blank" rel="noopener" className="underlay-nav__link-small">{s.label} ↗</a>
                </li>)}
              </ul>
            </div>
            <div className="underlay-nav__bottom-border" />
          </div>
          <div className="underlay-nav__legal" data-reveal-s>
            <p>© 2026 Gettowork Oy</p>
            <p>Y-tunnus 3196576-1</p>
            <p>Espoo, FI · <a href={PRIVACY_PATH} onClick={go(PRIVACY_PATH)}>Tietosuojaseloste</a></p>
          </div>
        </div>
      </div>
    </nav>

    <div ref={overlayRef} data-underlay-nav-overlay="" className="underlay-nav__overlay" onClick={() => { if (openRef.current) setState(false); }}>
      <div className="underlay-nav__dark" />
      <div className="underlay-nav__borders">
        <div className="underlay-nav__border-row">
          <div className="underlay-nav__border" />
          <div className="underlay-nav__corner" />
        </div>
        <div className="underlay-nav__border-row">
          <div className="underlay-nav__corner is--bottom" />
          <div className="underlay-nav__border" />
        </div>
      </div>
    </div>
  </div>;
}
