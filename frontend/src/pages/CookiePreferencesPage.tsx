import React, { useState } from 'react';
import './LegalPage.css';

const CookiePreferencesPage: React.FC = () => {
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="legal-page">
      <div className="container legal-container">

        {/* ── Hero ── */}
        <header className="legal-hero">
          <div className="legal-hero-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="8" cy="9" r="1" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="8" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="9" cy="15" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="14" cy="14" r="0.9" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <div className="legal-hero-title">
            <span className="legal-badge">Setari · Cookie-uri</span>
            <h1>Cookie preferences</h1>
            <p>
              Alege cum doresti sa fie folosite cookie-urile in platforma. Cookie-urile necesare
              nu pot fi dezactivate deoarece asigura functionarea de baza a serviciului.
            </p>
          </div>
        </header>

        {/* ── Cookie toggles ── */}
        <section className="cookie-section">

          {/* Necessary — always on */}
          <div className="cookie-row">
            <div className="cookie-row-info">
              <div className="cookie-row-icon" style={{ background: 'var(--c2-pale)', color: 'var(--c2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="cookie-row-text">
                <h3>
                  Cookie-uri necesare
                  <span className="cookie-required-badge">Mereu active</span>
                </h3>
                <p>
                  Obligatorii pentru autentificare, sesiunea utilizatorului si securitatea platformei.
                  Nu pot fi dezactivate.
                </p>
              </div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked disabled />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Functional */}
          <div className="cookie-row">
            <div className="cookie-row-info">
              <div className="cookie-row-icon" style={{ background: 'var(--c1-pale)', color: 'var(--c1)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                </svg>
              </div>
              <div className="cookie-row-text">
                <h3>Cookie-uri functionale</h3>
                <p>
                  Retin preferintele tale: limba, filtrele salvate, ultima cautare. Dezactivarea acestora
                  poate afecta confortul utilizarii.
                </p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={functional}
                onChange={e => { setFunctional(e.target.checked); setSaved(false); }}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Analytics */}
          <div className="cookie-row">
            <div className="cookie-row-info">
              <div className="cookie-row-icon" style={{ background: 'var(--c4-pale)', color: '#9a6e00' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6"  y1="20" x2="6"  y2="14"/>
                </svg>
              </div>
              <div className="cookie-row-text">
                <h3>Cookie-uri analitice</h3>
                <p>
                  Ne ajuta sa intelegem cum este folosita platforma si sa imbunatatim experienta pentru
                  toti utilizatorii. Datele sunt anonime si agregate.
                </p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={analytics}
                onChange={e => { setAnalytics(e.target.checked); setSaved(false); }}
              />
              <span className="toggle-slider" />
            </label>
          </div>

        </section>

        {/* ── Info section ── */}
        <section className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-icon legal-section-icon--blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </div>
            <h2>Gestionarea preferintelor</h2>
          </div>
          <ul>
            <li>
              <span className="legal-li-dot" />
              <span>Modificarile se aplica incepand cu urmatoarea sesiune sau dupa un refresh al paginii.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Poti reveni oricand pe aceasta pagina pentru a actualiza preferintele.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span>Pentru detalii complete consulta <strong>Politica de confidentialitate</strong>.</span>
            </li>
          </ul>
        </section>

        {/* ── Save row ── */}
        <div className="cookie-save-row">
          {saved && (
            <span className="cookie-saved-msg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Preferintele au fost salvate.
            </span>
          )}
          {!saved && <span className="cookie-save-note">Schimbarile nu sunt salvate automat.</span>}
          <button className="btn-primary" onClick={handleSave}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Salveaza preferintele
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookiePreferencesPage;
