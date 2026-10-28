import { useEffect, useState } from 'react';

/** Kirjoittaa tekstin merkki kerrallaan. skip = näytä heti kokonaan (esim. paluu etusivulle). */
export function useTypewriter(text: string, speed = 38, startDelay = 600, skip = false) {
  const [displayed, setDisplayed] = useState(skip ? text : '');
  useEffect(() => {
    if (skip) { setDisplayed(text); return; }
    setDisplayed('');
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      let index = 0;
      interval = setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [text, speed, startDelay, skip]);
  return { displayed, done: displayed.length === text.length };
}
