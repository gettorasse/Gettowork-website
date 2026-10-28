import { useEffect, useRef } from 'react';
import { OWNER_TYPES, BANDS, QUESTIONS, type BandKey } from './content.ts';
import './restart-score.css';

const TYPE_ORDER: BandKey[] = ['foundation', 'stabilise', 'independence', 'resilience'];

/** Kysely-alasivu: kaikki testin tieto yhdessä paikassa. */
export function About({ onStart }: { onStart: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  return <main lang="fi" className="rs-stage rs-stage--panel">
    <article className="rs-panel rs-about">
      <p className="rs-eyebrow">Restart Score</p>
      <h1 ref={headingRef} tabIndex={-1} className="rs-h1">Testaa, kuinka hyvin yrityksesi toimii</h1>
      <p className="rs-lead">12 kysymystä yrityksesi arjesta. Saat pisteet, yrittäjätyyppisi, kaksi kehityskohdetta ja 90 päivän ohjelman.</p>
      <p className="rs-facts">12 kysymystä <span aria-hidden="true">·</span> 0–10 pistettä <span aria-hidden="true">·</span> noin 5 minuuttia <span aria-hidden="true">·</span> tulos heti</p>
      <div className="rs-actions">
        <button type="button" className="pill white-pill rs-btn rs-btn--big" onClick={onStart}>Aloita testi <span aria-hidden="true">→</span></button>
      </div>

      <section className="rs-section" aria-labelledby="about-types">
        <h2 id="about-types" className="rs-h2">Minkälainen yrittäjä olet?</h2>
        <ul className="rs-types">
          {TYPE_ORDER.map(key => <li key={key}>
            <span className="rs-types__range">{BANDS[key].range}</span>
            <span className="rs-types__name">{OWNER_TYPES[key].name}</span>
            <span className="rs-muted">{OWNER_TYPES[key].tagline}</span>
          </li>)}
        </ul>
      </section>

      <section className="rs-section" aria-labelledby="about-areas">
        <h2 id="about-areas" className="rs-h2">Mitä testi mittaa</h2>
        <ol className="rs-area-list">
          {QUESTIONS.map(q => <li key={q.id}><span>{q.name}</span> <span className="rs-muted" lang="en">{q.p}</span></li>)}
        </ol>
      </section>

      <section className="rs-section" aria-labelledby="about-how">
        <h2 id="about-how" className="rs-h2">Näin vastaat</h2>
        <p>Arvioi viimeisen 90 päivän toteutunutta arkea, älä suunnitelmia. 0 tarkoittaa, että toimintatapa puuttuu, ja 10, että se toimii joka kerta. Hyvä tulos ei edellytä työntekijöitä: kumppanit, rajattu tarjooma ja automaatio käyvät yhtä hyvin.</p>
        <p>Kaksi pienintä pistettä nousevat kehityskohteiksi. Voit vaihtaa ne itse, ja niistä muodostuu 90 päivän ohjelma, jonka voit tulostaa tai tallentaa PDF:nä.</p>
      </section>

      <section className="rs-section" aria-labelledby="about-privacy">
        <h2 id="about-privacy" className="rs-h2">Vastauksesi pysyvät sinulla</h2>
        <p>Testi toimii kokonaan selaimessasi. Vastauksia ei lähetetä minnekään, eikä tulos vaadi yhteystietoja. Halutessasi voit tallentaa testin tähän selaimeen 120 päiväksi – älä tee sitä yhteiskäyttölaitteella.</p>
        <p className="rs-muted rs-small">Tulos on itsearvio ja keskustelun lähtökohta, ei mitattu diagnoosi. Testin rakenne on saanut innoituksensa omistajariippuvuutta käsittelevästä Own or Be Owned -ajattelusta, mutta kysymykset ovat Get to Workin omia.</p>
      </section>

      <div className="rs-actions">
        <button type="button" className="pill white-pill rs-btn rs-btn--big" onClick={onStart}>Aloita testi <span aria-hidden="true">→</span></button>
      </div>
    </article>
  </main>;
}
