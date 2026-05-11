import React from 'react';
import './LegalPage.css';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="container legal-container">

        {/* ── Hero ── */}
        <header className="legal-hero">
          <div className="legal-hero-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="legal-hero-title">
            <span className="legal-badge">Last updated · January 2025</span>
            <h1>Privacy Policy</h1>
            <p>
              Politica noastra de confidentialitate explica ce date colectam, de ce le colectam
              si cum le folosim pentru a-ti oferi cel mai bun serviciu.
            </p>
          </div>
        </header>

        {/* ── Section 1 ── */}
        <section className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon legal-section-icon--blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
              </svg>
            </div>
            <h2>Date colectate</h2>
          </div>
          <p style={{ marginBottom: 'var(--sp-3)' }}>
            Colectam informatii necesare pentru a-ti furniza serviciul de inchiriere online in mod
            sigur si eficient.
          </p>
          <ul>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Date de cont</strong> — nume, adresa de email si parola criptata la inregistrare.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Date de utilizare</strong> — paginile vizitate, produsele vizualizate si actiunile efectuate pe platforma.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Date tehnice</strong> — adresa IP, tipul browserului si sistemul de operare, necesare pentru securitate.</span>
            </li>
          </ul>
        </section>

        {/* ── Section 2 ── */}
        <section className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon legal-section-icon--teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </div>
            <h2>Utilizarea datelor</h2>
          </div>
          <p style={{ marginBottom: 'var(--sp-3)' }}>
            Datele tale sunt folosite exclusiv pentru scopurile mentionate mai jos si nu sunt
            vandute catre terte parti.
          </p>
          <ul>
            <li>
              <span className="legal-li-dot" />
              <span>Procesarea si gestionarea comenzilor de inchiriere.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Comunicari operationale: confirmari de rezervare, notificari de returnare si facturi.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Imbunatatirea calitatii serviciului si prevenirea fraudelor.</span>
            </li>
          </ul>
        </section>

        {/* ── Section 3 ── */}
        <section className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon legal-section-icon--coral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2>Drepturile tale</h2>
          </div>
          <p style={{ marginBottom: 'var(--sp-3)' }}>
            Conform GDPR si legislatiei aplicabile, ai urmatoarele drepturi in legatura cu datele tale personale:
          </p>
          <ul>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Acces</strong> — poti solicita o copie a datelor pe care le detinem despre tine.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Rectificare</strong> — poti corecta informatii incorecte sau incomplete.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Stergere</strong> — poti solicita eliminarea datelor, sub rezerva obligatiilor legale.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Pentru orice solicitare, contacteaza-ne la <strong>privacy@onlinerental.ro</strong>.</span>
            </li>
          </ul>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
