import React from 'react';
import './LegalPage.css';

const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="container legal-container">

        {/* ── Hero ── */}
        <header className="legal-hero">
          <div className="legal-hero-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div className="legal-hero-title">
            <span className="legal-badge">Last updated · January 2025</span>
            <h1>Terms and Conditions</h1>
            <p>
              Prin folosirea platformei, accepti in totalitate termenii si conditiile de mai jos.
              Te rugam sa le citesti cu atentie inainte de a utiliza serviciile noastre.
            </p>
          </div>
        </header>

        {/* ── Section 1 ── */}
        <section className="legal-section">
          <div className="legal-section-header">
            <span className="legal-section-num">1</span>
            <h2>Eligibilitate si cont</h2>
          </div>
          <p style={{ marginBottom: 'var(--sp-3)' }}>
            Platforma este disponibila persoanelor fizice cu varsta de minimum 18 ani si
            persoanelor juridice inregistrate legal.
          </p>
          <ul>
            <li>
              <span className="legal-li-dot" />
              <span>Esti responsabil pentru confidentialitatea credentialelor de autentificare.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Orice activitate realizata din contul tau iti apartine in intregime.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>In caz de acces neautorizat, notifica-ne imediat la <strong>security@onlinerental.ro</strong>.</span>
            </li>
          </ul>
        </section>

        {/* ── Section 2 ── */}
        <section className="legal-section">
          <div className="legal-section-header">
            <span className="legal-section-num">2</span>
            <h2>Inchirieri si returnari</h2>
          </div>
          <p style={{ marginBottom: 'var(--sp-3)' }}>
            Prin plasarea unei comenzi de inchiriere, esti de acord cu urmatoarele conditii
            de utilizare a produselor.
          </p>
          <ul>
            <li>
              <span className="legal-li-dot" />
              <span>Produsele trebuie utilizate conform specificatiilor tehnice si scopului declarat.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Returnarea se efectueaza in perioada stabilita la plasarea comenzii.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Orice deteriorare poate duce la retinerea partiala sau totala a depozitului de garantie.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Intarzierea la returnare atrage taxe suplimentare calculate zilnic.</span>
            </li>
          </ul>
        </section>

        {/* ── Section 3 ── */}
        <section className="legal-section">
          <div className="legal-section-header">
            <span className="legal-section-num">3</span>
            <h2>Plati si facturare</h2>
          </div>
          <p style={{ marginBottom: 'var(--sp-3)' }}>
            Platile se proceseaza prin furnizori securizati (Stripe). Nu stocam datele cardului tau.
          </p>
          <ul>
            <li>
              <span className="legal-li-dot" />
              <span>Preturile afisate includ TVA si sunt exprimate in RON.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Rambursarile pentru anulari se proceseaza in 5-10 zile lucratoare.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Factura fiscala se emite automat dupa confirmarea platii.</span>
            </li>
          </ul>
        </section>

        {/* ── Section 4 ── */}
        <section className="legal-section">
          <div className="legal-section-header">
            <span className="legal-section-num">4</span>
            <h2>Limitarea raspunderii</h2>
          </div>
          <p style={{ marginBottom: 'var(--sp-3)' }}>
            Platforma depune eforturi rezonabile pentru disponibilitate continua si acuratete
            a informatiilor afisate.
          </p>
          <ul>
            <li>
              <span className="legal-li-dot" />
              <span>Nu garantam functionare neintrerupta in situatii de forta majora sau mentenanta planificata.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Raspunderea noastra este limitata la valoarea comenzii in cauza.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Nu suntem responsabili pentru daunele indirecte sau pierderea de profit.</span>
            </li>
          </ul>
        </section>

      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
