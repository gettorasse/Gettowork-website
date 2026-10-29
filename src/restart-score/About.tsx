import { useEffect, useRef } from 'react';
import { ARCHETYPES, LEVELS, LEVERS, PHASE_INFO, TOTAL_Q, type PhaseKey } from './content.ts';
import './restart-score.css';

const PHASE_ORDER: PhaseKey[] = ['base', 'work', 'owner'];

/** Kysely-alasivu: kaikki testin tieto yhdessä paikassa. */
export function About({ onStart }: { onStart: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  return <main lang="fi" className="rs-stage rs-stage--panel">
    <article className="rs-panel rs-about">
      <p className="rs-eyebrow">Restart Score</p>
      <h1 ref={headingRef} tabIndex={-1} className="rs-h1">Minkälainen yrittäjä olet?</h1>
      <p className="rs-lead">{TOTAL_Q} lyhyttä väittämää yrityksesi arjesta. Saat pisteet, tasosi, yrittäjätyyppisi ja tiedon siitä, mistä kannattaa aloittaa.</p>
      <p className="rs-facts">12 osa-aluetta <span aria-hidden="true">·</span> {TOTAL_Q} väittämää <span aria-hidden="true">·</span> noin 10 minuuttia <span aria-hidden="true">·</span> tulos heti</p>
      <div className="rs-actions">
        <button type="button" className="pill white-pill rs-btn rs-btn--big" onClick={onStart}>Aloita testi <span aria-hidden="true">→</span></button>
      </div>

      <section className="rs-section" aria-labelledby="about-levels">
        <h2 id="about-levels" className="rs-h2">Kolme tasoa</h2>
        <ul className="rs-types">
          {LEVELS.map(l => <li key={l.key}>
            <span className="rs-types__range">{l.min}–{l.max}</span>
            <span className="rs-types__name">{l.name}</span>
            <span className="rs-muted">{l.tag}</span>
          </li>)}
        </ul>
      </section>

      <section className="rs-section" aria-labelledby="about-areas">
        <h2 id="about-areas" className="rs-h2">Mitä testi mittaa</h2>
        {PHASE_ORDER.map(phase => <div key={phase} className="rs-about__phase">
          <h3 className="rs-h3">{PHASE_INFO[phase].label} <span className="rs-muted">· {PHASE_INFO[phase].blurb}</span></h3>
          <ul className="rs-types">
            {LEVERS.filter(l => l.phase === phase).map(l => <li key={l.id}>
              <span className="rs-types__range" lang="en">{l.p}</span>
              <span className="rs-types__name">{l.name}</span>
              <span className="rs-muted">{ARCHETYPES[l.id].name}</span>
            </li>)}
          </ul>
        </div>)}
      </section>

      <section className="rs-section" aria-labelledby="about-how">
        <h2 id="about-how" className="rs-h2">Näin vastaat</h2>
        <p>Jokaisessa osassa on kuusi väittämää. Kerro, kuinka hyvin väittämä pitää paikkansa juuri nyt – ei sen mukaan, miten haluaisit asioiden olevan. Mitä enemmän olet samaa mieltä, sitä enemmän osa-alueessa on korjattavaa.</p>
        <p>Heikoin osa-alueesi kertoo yrittäjätyyppisi. Raportti näyttää kaikki 12 osa-aluetta, tasosi ja 90 päivän ohjelman, jonka voit tulostaa tai tallentaa PDF:nä.</p>
      </section>

      <section className="rs-section" aria-labelledby="about-privacy">
        <h2 id="about-privacy" className="rs-h2">Tulos ja yhteystiedot</h2>
        <p>Pisteet, tason ja yrittäjätyypin näet heti. Koko raportin saat, kun jätät nimesi ja sähköpostisi – käytämme niitä vain ollaksemme sinuun yhteydessä tuloksesi tiimoilta. Halutessasi voit tallentaa testin tähän selaimeen 120 päiväksi; älä tee sitä yhteiskäyttölaitteella.</p>
        <p className="rs-muted rs-small">Tulos on itsearvio ja keskustelun lähtökohta, ei mitattu diagnoosi. Testin rakenne on saanut innoituksensa omistajariippuvuutta käsittelevästä Own or Be Owned -ajattelusta, mutta väittämät ja tekstit ovat Get to Workin omia.</p>
      </section>

      <div className="rs-actions">
        <button type="button" className="pill white-pill rs-btn rs-btn--big" onClick={onStart}>Aloita testi <span aria-hidden="true">→</span></button>
      </div>
    </article>
  </main>;
}
