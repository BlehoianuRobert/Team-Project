import React from 'react';
import './HelpPage.css';

const HelpPage: React.FC = () => {
  return (
    <div className="help-page">
      <div className="container">

        {/* ── Hero ── */}
        <header className="help-hero">
          <div className="help-hero-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h1>Centru de Ajutor</h1>
            <p>
              Găsești aici toate informațiile despre cont, închirieri, plată,
              livrare și returnare.
            </p>
          </div>
        </header>

        {/* ── Conturi și drepturi ── */}
        <section className="help-section">
          <div className="help-section-header">
            <div className="help-section-icon help-section-icon--blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2>Conturi și drepturi</h2>
          </div>
          <div className="help-cards">
            <article className="help-card">
              <h3>Trebuie să mă autentific ca să văd produsele?</h3>
              <p>
                Nu. Catalogul și detaliile produselor sunt publice. Contul este necesar pentru a crea
                închirieri, a vedea „Închirierile mele" și a plăti.
              </p>
            </article>
            <article className="help-card">
              <h3>Cine poate adăuga produse în catalog?</h3>
              <p>
                Doar utilizatorii cu rol de <strong>administrator</strong> (și SuperOwner) pot adăuga,
                edita sau șterge produse și stoc.
              </p>
            </article>
            <article className="help-card">
              <h3>După autentificare, unde sunt redirecționat?</h3>
              <p>
                Administratorii ajung în panoul <strong>Admin</strong>. Utilizatorii
                obișnuiți sunt redirecționați la catalogul de produse.
              </p>
            </article>
          </div>
        </section>

        {/* ── Închirieri ── */}
        <section className="help-section">
          <div className="help-section-header">
            <div className="help-section-icon help-section-icon--teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4"/>
                <path d="M7 21v-4"/>
                <path d="M4 21h6"/>
              </svg>
            </div>
            <h2>Întrebări frecvente — Închirieri</h2>
          </div>
          <div className="help-cards">
            <article className="help-card">
              <h3>Cum închiriez un produs?</h3>
              <p>
                Intră în pagina produsului, selectează perioada dorită și
                finalizează comanda urmând pașii afișați.
              </p>
            </article>
            <article className="help-card">
              <h3>Care este durata minimă de închiriere?</h3>
              <p>
                Durata este flexibilă — se stabilește în funcție de intervalul
                ales la creare. Verifică detaliile fiecărui produs.
              </p>
            </article>
            <article className="help-card">
              <h3>Cum returnez produsul?</h3>
              <p>
                Returnarea se face conform termenilor din comandă, prin pașii din
                secțiunea „Închirierile mele". Produsul trebuie predat în starea
                în care a fost primit.
              </p>
            </article>
            <article className="help-card">
              <h3>Pot prelungi perioada de închiriere?</h3>
              <p>
                Da. Din secțiunea „Închirierile mele" poți prelungi înainte ca
                termenul să expire.
              </p>
            </article>
          </div>
        </section>

        {/* ── Plăți ── */}
        <section className="help-section">
          <div className="help-section-header">
            <div className="help-section-icon help-section-icon--coral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <h2>Plăți și facturare</h2>
          </div>
          <div className="help-cards">
            <article className="help-card">
              <h3>Ce metode de plată sunt acceptate?</h3>
              <p>
                Plățile se procesează securizat prin <strong>Stripe</strong>. Sunt
                acceptate cardurile Visa, Mastercard și alte carduri majore.
              </p>
            </article>
            <article className="help-card">
              <h3>Datele cardului meu sunt stocate?</h3>
              <p>
                Nu. Datele cardului nu sunt salvate în aplicație — sunt gestionate
                exclusiv de Stripe, conform standardelor PCI DSS.
              </p>
            </article>
            <article className="help-card">
              <h3>Când primesc rambursarea pentru anulare?</h3>
              <p>
                Rambursările pentru anulările eligibile sunt procesate în
                5–10 zile lucrătoare de la confirmare.
              </p>
            </article>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="help-section">
          <div className="help-section-header">
            <div className="help-section-icon help-section-icon--gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h2>Contact și suport</h2>
          </div>
          <div className="help-contact-grid">
            <div className="help-contact-item">
              <div className="help-contact-item-icon" style={{ background: 'var(--c1-pale)', color: 'var(--c1)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <p className="help-contact-item-label">Email</p>
                <p className="help-contact-item-value">support@onlinerental.ro</p>
              </div>
            </div>
            <div className="help-contact-item">
              <div className="help-contact-item-icon" style={{ background: 'var(--c2-pale)', color: 'var(--c2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 12 18.69a19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.81 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.91 8.78a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <p className="help-contact-item-label">Telefon</p>
                <p className="help-contact-item-value">+40 123 456 789</p>
              </div>
            </div>
            <div className="help-contact-item">
              <div className="help-contact-item-icon" style={{ background: 'var(--c4-pale)', color: '#9a6e00' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <p className="help-contact-item-label">Program</p>
                <p className="help-contact-item-value">Luni–Vineri, 09:00–18:00</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HelpPage;
