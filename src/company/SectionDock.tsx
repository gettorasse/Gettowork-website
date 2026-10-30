import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './SectionDock.css';

// Osmo Supply "Section Anchor Dock": sivun alareunan pilleri näyttää, missä luvussa ollaan,
// ja avautuu luetteloksi kaikista luvuista. Merkintä ja data-attribuutit ovat Osmon omat;
// alla oleva logiikka on Osmon initSectionAnchorDock yhdelle dockille, siivouksella Reactia varten.
// GSAP ja ScrollTrigger tulevat CDN:stä (index.html).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
declare global { interface Window { ScrollTrigger?: Any } }

export type DockItem = { id: string; label: string };

const pad = (n: number) => String(n).padStart(2, '0');

/** Odottaa, että GSAP ja ScrollTrigger on ladattu (defer-skriptit ajetaan vasta moduulin jälkeen). */
function whenReady(cb: () => void): () => void {
  if (window.gsap && window.ScrollTrigger) { cb(); return () => {}; }
  let done = false;
  const go = () => { if (!done && window.gsap && window.ScrollTrigger) { done = true; cb(); } };
  document.addEventListener('DOMContentLoaded', go);
  window.addEventListener('load', go);
  const timer = window.setInterval(go, 250);
  const stop = window.setTimeout(() => window.clearInterval(timer), 10000);
  return () => {
    done = true;
    document.removeEventListener('DOMContentLoaded', go);
    window.removeEventListener('load', go);
    window.clearInterval(timer); window.clearTimeout(stop);
  };
}

function initSectionAnchorDock(dock: HTMLElement): () => void {
  const gsap = window.gsap as Any;
  const ScrollTrigger = window.ScrollTrigger as Any;
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover)');

  const pill = dock.querySelector<HTMLElement>('[data-section-dock-pill]');
  const toggle = dock.querySelector<HTMLButtonElement>('[data-section-dock-toggle]');
  const labelWrap = dock.querySelector<HTMLElement>('[data-section-dock-label-wrap]');
  const list = dock.querySelector<HTMLElement>('[data-section-dock-list]');
  const indicator = dock.querySelector<HTMLElement>('[data-section-dock-indicator]');
  const links = list ? Array.from(list.querySelectorAll<HTMLAnchorElement>('[data-section-dock-link]')) : [];
  const sections = links.map(link => document.querySelector<HTMLElement>(link.getAttribute('href') || ''));
  const labelTemplate = labelWrap ? labelWrap.firstElementChild : null;
  if (!pill || !toggle || !labelWrap || !labelTemplate || !list || !indicator || links.length < 2 || sections.some(s => !s)) return () => {};

  let activeIndex = Math.max(0, links.findIndex(l => l.hasAttribute('data-active')));
  let open = false;
  let dockTl: Any = null;
  const rect = { x: 0, y: 0, w: 0, h: 0 };

  const motion: 'bouncy' | 'smooth' = 'bouncy';
  const smooth = () => (motion as string) === 'smooth' || reduceMotion.matches;
  const dur = (d: number) => (reduceMotion.matches ? 0 : d);
  const ease = (bouncy: string, calm: string) => (smooth() ? calm : bouncy);

  gsap.set(pill, { transformOrigin: '50% 100%' });

  function syncLinkState() {
    links.forEach((l, i) => {
      l.toggleAttribute('data-active', i === activeIndex);
      if (i === activeIndex) l.setAttribute('aria-current', 'location');
      else l.removeAttribute('aria-current');
    });
  }

  function buildLabel(index: number) {
    const span = labelTemplate!.cloneNode(false) as HTMLElement;
    span.innerHTML = links[index].innerHTML;
    return span;
  }

  function setLabel(index: number) {
    labelWrap!.textContent = '';
    labelWrap!.appendChild(buildLabel(index));
    gsap.set(labelWrap, { width: 'auto' });
  }

  function swapLabel(index: number, movingDown: boolean) {
    const olds = Array.from(labelWrap!.children);
    const startWidth = labelWrap!.offsetWidth;
    gsap.killTweensOf(labelWrap);
    olds.forEach(old => {
      gsap.killTweensOf(old);
      gsap.set(old, { position: 'absolute', top: 0, left: 0 });
      gsap.to(old, {
        yPercent: movingDown ? -120 : 120,
        autoAlpha: 0,
        duration: dur(0.35),
        ease: 'power2.out',
        onComplete: () => old.remove(),
      });
    });

    const next = buildLabel(index);
    labelWrap!.appendChild(next);
    gsap.set(labelWrap, { width: 'auto' });
    const targetWidth = next.offsetWidth;

    gsap.fromTo(labelWrap, { width: startWidth }, { width: targetWidth, duration: dur(0.45), ease: ease('back.out(1.6)', 'power3.out') });
    gsap.fromTo(next, { yPercent: movingDown ? 120 : -120, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: dur(0.45), ease: 'power3.out' });

    if (!smooth()) {
      gsap.killTweensOf(pill, 'scaleY');
      gsap.timeline()
        .to(pill, { scaleY: 0.85, duration: 0.15, ease: 'power2.out' })
        .to(pill, { scaleY: 1, duration: 0.45, ease: 'back.out(2.5)' });
    }
  }

  function rectFor(link: HTMLElement) {
    return { x: link.offsetLeft, y: link.offsetTop, w: link.offsetWidth, h: link.offsetHeight };
  }

  function render() {
    gsap.set(indicator, { x: rect.x, y: rect.y, width: rect.w, height: rect.h });
  }

  function placeIndicator(index: number) {
    Object.assign(rect, rectFor(links[index]));
    gsap.killTweensOf(rect);
    gsap.killTweensOf(indicator);
    gsap.set(indicator, { scaleX: 1, scaleY: 1 });
    render();
  }

  function hopIndicator(index: number) {
    const target = rectFor(links[index]);
    gsap.killTweensOf(rect);
    gsap.killTweensOf(indicator);

    if (smooth()) {
      gsap.set(indicator, { scaleX: 1, scaleY: 1 });
      gsap.to(rect, { x: target.x, y: target.y, w: target.w, h: target.h, duration: dur(0.35), ease: 'power3.out', onUpdate: render });
      return;
    }

    const delta = target.y - rect.y;
    const sign = delta === 0 ? 1 : Math.sign(delta);
    const overshoot = gsap.utils.clamp(6, 12, Math.abs(delta) * 0.08) * sign;
    const apexY = gsap.utils.clamp(0, list!.clientHeight - target.h, target.y + overshoot);

    gsap.set(indicator, { transformOrigin: '50% 50%' });
    gsap.timeline()
      .to(rect, { x: target.x, y: apexY, w: target.w, h: target.h, duration: 0.35, ease: 'power3.out', onUpdate: render })
      .to(rect, { y: target.y, duration: 0.25, ease: 'power2.inOut', onUpdate: render });
    gsap.timeline()
      .to(indicator, { scaleX: 0.78, duration: 0.15, ease: 'power2.out' })
      .to(indicator, { scaleY: 1, scaleX: 1, duration: 0.45, ease: 'back.out(2.5)' });
  }

  function setActive(index: number, movingDown: boolean) {
    if (index === activeIndex) return;
    activeIndex = index;
    syncLinkState();
    if (open) {
      setLabel(index);
      hopIndicator(index);
    } else {
      swapLabel(index, movingDown);
      placeIndicator(index);
    }
  }

  function openDock() {
    if (open) return;
    open = true;
    toggle!.setAttribute('aria-expanded', 'true');
    placeIndicator(activeIndex);

    const fromW = pill!.offsetWidth;
    const fromH = pill!.offsetHeight;

    if (dockTl) dockTl.kill();
    gsap.set(list, { visibility: 'inherit' });
    gsap.set(pill, { width: fromW, height: fromH });
    gsap.set(links[activeIndex], { yPercent: 0, opacity: 1 });

    dockTl = gsap.timeline()
      .to(pill, { width: list!.offsetWidth, height: list!.offsetHeight, duration: dur(0.45), ease: ease('back.out(1.4)', 'power3.out') }, 0)
      .to(toggle, { autoAlpha: 0, duration: dur(0.15), ease: 'power1.out' }, 0)
      .to(list, { opacity: 1, duration: dur(0.25), ease: 'power1.out' }, dur(0.05))
      .fromTo(
        links.filter((_, i) => i !== activeIndex),
        { yPercent: 40, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: dur(0.25), ease: 'power2.out', stagger: { each: dur(0.05), from: 'end' } },
        dur(0.05),
      );
  }

  function closeDock() {
    if (!open) return;
    open = false;
    toggle!.setAttribute('aria-expanded', 'false');

    if (dockTl) dockTl.kill();

    dockTl = gsap.timeline({
      onComplete: () => {
        gsap.set(pill, { clearProps: 'width,height' });
        gsap.set(list, { visibility: 'hidden' });
        gsap.set(links, { yPercent: 0, opacity: 1 });
      },
    })
      .to(pill, { width: toggle!.offsetWidth, height: toggle!.offsetHeight, duration: dur(0.3), ease: 'power3.out' }, 0)
      .to(list, { opacity: 0, duration: dur(0.15), ease: 'power1.out' }, 0)
      .to(toggle, { autoAlpha: 1, duration: dur(0.25), ease: 'power1.out' }, dur(0.1));
  }

  const triggers: Any[] = [];

  sections.forEach((section, i) => {
    triggers.push(ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self: Any) => {
        if (self.isActive) setActive(i, self.direction !== -1);
      },
    }));
  });

  let isHidden = true;
  let hideTriggers: Any[] = [];
  let rangeTrigger: Any = null;

  gsap.set(dock, { yPercent: 40, autoAlpha: 0 });
  dock.toggleAttribute('data-hidden', true);

  function updateHidden() {
    const inRange = rangeTrigger ? rangeTrigger.isActive : true;
    const hidden = !inRange || hideTriggers.some(t => t.isActive);

    if (hidden === isHidden) return;
    isHidden = hidden;
    if (hidden && open) closeDock();
    dock.toggleAttribute('data-hidden', hidden);
    gsap.to(dock, {
      yPercent: hidden ? 40 : 0,
      autoAlpha: hidden ? 0 : 1,
      duration: dur(0.3),
      ease: hidden ? 'power2.out' : ease('back.out(1.4)', 'power3.out'),
    });
  }

  rangeTrigger = ScrollTrigger.create({
    trigger: sections[0],
    endTrigger: sections[sections.length - 1],
    start: 'top 45%',
    end: 'bottom 45%',
    onToggle: updateHidden,
  });
  triggers.push(rangeTrigger);

  hideTriggers = Array.from(document.querySelectorAll('[data-section-dock-hide]')).map(zone => {
    const offset = parseFloat(zone.getAttribute('data-section-dock-hide') || '');
    const line = 100 - gsap.utils.clamp(0, 100, Number.isNaN(offset) ? 10 : offset);
    return ScrollTrigger.create({ trigger: zone, start: 'top ' + line + '%', end: 'bottom top', onToggle: updateHidden });
  });
  triggers.push(...hideTriggers);

  // Linkki vierittää luvun alkuun ilman, että osoiteriville tulee #-osaa (sivun reititin kuuntelee historiaa).
  const onLink = (event: MouseEvent) => {
    const link = event.currentTarget as HTMLAnchorElement;
    const target = document.querySelector<HTMLElement>(link.getAttribute('href') || '');
    closeDock();
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  };
  links.forEach(link => link.addEventListener('click', onLink));

  const onToggle = () => {
    if (open) { closeDock(); return; }
    openDock();
    links[activeIndex].focus();
  };
  toggle.addEventListener('click', onToggle);

  const hover = canHover.matches;
  if (hover) {
    dock.addEventListener('mouseenter', openDock);
    dock.addEventListener('mouseleave', closeDock);
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      closeDock();
      gsap.delayedCall(0.15, () => toggle.focus());
    }
  };
  const onDocClick = (event: MouseEvent) => {
    if (open && !dock.contains(event.target as Node)) closeDock();
  };
  const onFocusOut = (event: FocusEvent) => {
    if (open && !dock.contains(event.relatedTarget as Node | null)) closeDock();
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('click', onDocClick);
  dock.addEventListener('focusout', onFocusOut);

  function refreshLayout() {
    setLabel(activeIndex);
    placeIndicator(activeIndex);
    if (open) gsap.set(pill, { width: list!.offsetWidth, height: list!.offsetHeight });
  }
  window.addEventListener('resize', refreshLayout);
  let alive = true;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (alive) refreshLayout(); });

  syncLinkState();
  refreshLayout();
  // Sivun sisältö (kuvat, fontit) voi muuttaa korkeuksia: lasketaan rajat uudelleen.
  const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 600);
  const refreshAll = () => ScrollTrigger.refresh();
  window.addEventListener('load', refreshAll);
  window.addEventListener('gettowork:loaded', refreshAll);

  return () => {
    alive = false;
    window.clearTimeout(refreshTimer);
    window.removeEventListener('load', refreshAll);
    window.removeEventListener('gettowork:loaded', refreshAll);
    triggers.forEach(t => t.kill());
    if (dockTl) dockTl.kill();
    gsap.killTweensOf([dock, pill, labelWrap, indicator, rect, list, toggle, ...links]);
    links.forEach(link => link.removeEventListener('click', onLink));
    toggle.removeEventListener('click', onToggle);
    if (hover) {
      dock.removeEventListener('mouseenter', openDock);
      dock.removeEventListener('mouseleave', closeDock);
    }
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onDocClick);
    dock.removeEventListener('focusout', onFocusOut);
    window.removeEventListener('resize', refreshLayout);
  };
}

/** Lukujen dock. Renderöidään bodyyn, jotta se pysyy kiinteänä valikon siirtäessä sivua. */
export function SectionDock({ items }: { items: DockItem[] }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    let cleanup = () => {};
    const cancel = whenReady(() => { if (ref.current) cleanup = initSectionAnchorDock(ref.current); });
    return () => { cancel(); cleanup(); };
  }, [items]);

  const first = items[0];
  return createPortal(
    <nav ref={ref} data-section-dock-init aria-label="Tällä sivulla" className="section-dock">
      <div data-section-dock-pill className="section-dock__pill">
        <button type="button" data-section-dock-toggle aria-expanded="false" aria-controls="section-dock-list" className="section-dock__toggle">
          <span data-section-dock-label-wrap className="section-dock__label-wrap">
            <span className="section-dock__label">
              <span className="section-dock__link-num">01</span>
              <span>{first.label}</span>
            </span>
          </span>
        </button>
        <div data-section-dock-list id="section-dock-list" className="section-dock__list">
          <div data-section-dock-indicator className="section-dock__indicator" />
          <ul className="section-dock__items">
            {items.map((item, i) => <li key={item.id}>
              <a data-active={i === 0 ? '' : undefined} data-section-dock-link href={`#${item.id}`} className="section-dock__link">
                <span className="section-dock__link-num">{pad(i + 1)}</span>
                <span>{item.label}</span>
              </a>
            </li>)}
          </ul>
        </div>
      </div>
    </nav>,
    document.body,
  );
}
