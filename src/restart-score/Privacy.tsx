import { useEffect, useRef } from 'react';
import { CONTACT_EMAIL } from './content.ts';
import './restart-score.css';

/** Tietosuojaseloste Restart Score -testin yhteystietolomakkeelle. */
export function Privacy() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  return <main lang="fi" className="rs-stage rs-stage--panel">
    <article className="rs-panel rs-about">
      <p className="rs-eyebrow">Päivitetty 28.10.2026</p>
      <h1 ref={headingRef} tabIndex={-1} className="rs-h1">Tietosuojaseloste</h1>
      <p className="rs-lead">Näin käsittelemme tietoja, jotka jätät Restart Score -testin yhteydessä.</p>

      <section className="rs-section">
        <h2 className="rs-h2">Rekisterinpitäjä</h2>
        <p>Get to Work, Rasmus Rautavirta. Yhteydenotot: <a className="rs-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </section>

      <section className="rs-section">
        <h2 className="rs-h2">Mitä tietoja keräämme</h2>
        <p>Kun avaat raporttisi lomakkeella, tallennamme nimesi, sähköpostiosoitteesi, puhelinnumerosi (jos annat sen) sekä testin tuloksen: kokonaispisteet, osa-alueiden pisteet, yrittäjätyypin, kehityskohteet ja testin valmistumisajan.</p>
        <p>Testin vastaukset käsitellään selaimessasi. Niitä ei lähetetä meille ennen kuin lähetät lomakkeen.</p>
      </section>

      <section className="rs-section">
        <h2 className="rs-h2">Mihin tietoja käytetään</h2>
        <p>Käytämme tietoja ollaksemme sinuun yhteydessä tuloksesi tiimoilta ja kertoaksemme palveluista, joista voisi olla sinulle apua. Käsittely perustuu suostumukseesi, jonka annat lähettämällä lomakkeen. Voit perua suostumuksen milloin tahansa ilmoittamalla siitä sähköpostilla.</p>
      </section>

      <section className="rs-section">
        <h2 className="rs-h2">Säilytys ja käsittelijät</h2>
        <p>Säilytämme tietoja niin kauan kuin niitä tarvitaan yhteydenpitoon, kuitenkin enintään 24 kuukautta viimeisestä yhteydenotosta, tai kunnes pyydät poistamaan ne.</p>
        <p>Tiedot tallennetaan Notioniin (Notion Labs, Inc.), ja sivusto toimii Vercelin (Vercel Inc.) palveluissa. Palveluntarjoajat voivat käsitellä tietoja myös EU:n ja ETA:n ulkopuolella. Tällöin siirrot perustuvat EU:n komission vakiosopimuslausekkeisiin tai EU–Yhdysvallat-tietosuojakehykseen. Emme myy emmekä luovuta tietoja muille.</p>
      </section>

      <section className="rs-section">
        <h2 className="rs-h2">Oikeutesi</h2>
        <p>Sinulla on oikeus tarkastaa tietosi, pyytää niiden oikaisemista tai poistamista, rajoittaa niiden käsittelyä ja perua suostumuksesi. Lähetä pyyntö osoitteeseen {CONTACT_EMAIL}. Jos katsot, että tietojasi käsitellään lainvastaisesti, voit tehdä valituksen tietosuojavaltuutetun toimistolle (tietosuoja.fi).</p>
      </section>

      <section className="rs-section">
        <h2 className="rs-h2">Selaimeen tallennettavat tiedot</h2>
        <p>Jos valitset tallennuksen tälle laitteelle, testin vastaukset tallennetaan selaimesi paikalliseen tallennustilaan 120 päiväksi. Selain muistaa myös valitsemasi taustahahmon ja evästevalintasi (hyväksy tai hylkää). Näitä tietoja ei lähetetä meille. Sivustolla ei tällä hetkellä käytetä seuranta- tai markkinointievästeitä; jos niitä otetaan käyttöön, ne käynnistyvät vain, jos olet hyväksynyt evästeet.</p>
      </section>
    </article>
  </main>;
}
