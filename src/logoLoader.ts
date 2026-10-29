// Osmo Supply "Logo Stack Loader" Gettoworkin logolla. Merkintä ja tyylit ovat index.html:ssä,
// jotta latausnäkymä peittää sivun heti; GSAP 3.15 ladataan sieltä CDN:stä.
// Kun animaatio päättyy, ikkunaan lähetetään tapahtuma 'gettowork:loaded'.

export const LOADED_EVENT = 'gettowork:loaded';
let done = false;

/** Onko latausnäkymä jo poistunut (tai sitä ei ollut). */
export const loaderDone = () => done;

function finish(root: HTMLElement) {
  root.style.display = 'none';
  done = true;
  window.dispatchEvent(new Event(LOADED_EVENT));
}

/** GSAP ladataan index.html:n defer-skripteillä, jotka ajetaan vasta tämän moduulin jälkeen. */
export function initLogoStackLoader() {
  if (window.gsap || document.readyState !== 'loading') { runLoader(); return; }
  document.addEventListener('DOMContentLoaded', runLoader, { once: true });
}

function runLoader() {
  const root = document.querySelector<HTMLElement>('[data-logo-loader-init]');
  if (!root) { done = true; return; }
  const gsap = window.gsap;

  // Varatoiminto, jos GSAP ei latautunut: logo näkyy hetken ja näkymä häivytetään.
  if (!gsap) {
    root.querySelectorAll<HTMLElement>('[data-logo-loader-reset]').forEach(el => { el.style.opacity = '1'; });
    window.setTimeout(() => {
      root.style.transition = 'opacity 500ms ease';
      root.style.opacity = '0';
      window.setTimeout(() => finish(root), 520);
    }, 900);
    return;
  }

  const logoDuplicateCount = 5; // copies of the logo made behind the original

  const bg = root.querySelector('[data-logo-loader-bg]');
  const stack = root.querySelector<HTMLElement>('[data-logo-loader-stack]');
  const logo = root.querySelector('[data-logo-loader-logo]');
  const bar = root.querySelector('[data-logo-loader-bar]');
  const track = root.querySelector('[data-logo-loader-track]') || bar;
  if (!bg || !stack || !logo) { finish(root); return; }

  const resetTargets = [...root.querySelectorAll('[data-logo-loader-reset]')].filter(element => element !== stack);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const logoDuplicates: Element[] = [];
  for (let i = 0; i < logoDuplicateCount; i += 1) {
    const duplicate = logo.cloneNode(true) as Element;
    duplicate.setAttribute('aria-hidden', 'true');
    stack.appendChild(duplicate);
    logoDuplicates.push(duplicate);
  }

  const em = parseFloat(getComputedStyle(stack).fontSize);

  const timeline = gsap.timeline({
    defaults: {
      duration: 0.4,
      ease: 'power2.out',
    },
  });

  gsap.set(logoDuplicates, {
    opacity: 0,
    z: 0,
  });

  if (resetTargets.length) {
    timeline.set(resetTargets, {
      autoAlpha: 1,
    }, 0);
  }

  timeline.to(stack, {
    autoAlpha: 1,
    duration: 0.5,
  });

  if (reduceMotion) {
    timeline
      .addLabel('impact', '+=0.6')
      .to(root, {
        autoAlpha: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      }, 'impact+=0.5');
  } else {
    timeline
      .addLabel('tilt', '-=0.1')
      .to(stack, {
        rotationY: -40,
        rotationX: 20,
        xPercent: -15,
        duration: 0.6,
        ease: 'power4.out',
      }, 'tilt')
      .to(logoDuplicates, {
        z: (i: number) => -(i + 1) * 2.5 * em,
        opacity: (i: number) => Math.pow(0.5, i + 1),
        duration: 0.55,
        ease: 'power4.out',
        stagger: {
          each: 0.05,
          ease: 'power1.out',
        },
      }, 'tilt+=0.1')
      .addLabel('smash', '+=0.4')
      .to(stack, {
        rotationY: 0,
        rotationX: 0,
        xPercent: 0,
        ease: 'power4.in',
      }, 'smash')
      .to(logoDuplicates, {
        z: 0,
        ease: 'power4.in',
      }, 'smash')
      .addLabel('impact')
      .set(logoDuplicates, {
        opacity: 0,
      }, 'impact')
      .to(stack, {
        scale: 1.05,
        duration: 0.1,
      }, 'impact')
      .to(stack, {
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      })
      .to(stack, {
        autoAlpha: 0,
      }, 'impact+=0.5')
      .to(bg, {
        scaleY: 0,
        duration: 0.5,
        ease: 'expo.inOut',
      }, 'impact+=0.6');
  }

  if (bar) {
    timeline
      .to(bar, {
        scaleX: 1,
        duration: timeline.labels.impact,
        ease: 'power2.inOut',
      }, 0)
      .to(track, {
        autoAlpha: 0,
      }, 'impact+=0.5');
  }

  timeline.set(root, {
    display: 'none',
  });
  timeline.eventCallback('onComplete', () => finish(root));
}
