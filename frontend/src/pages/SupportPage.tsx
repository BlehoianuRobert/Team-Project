import React from 'react';
import './LegalPage.css';

const SupportPage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="container legal-container">

        {/* ── Hero ── */}
        <header className="legal-hero">
          <div className="legal-hero-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="legal-hero-title">
            <span className="legal-badge">Disponibil · Luni – Vineri</span>
            <h1>Support</h1>
            <p>
              Ai nevoie de ajutor? Echipa noastra de suport iti raspunde cat mai rapid.
              Alege canalul de contact care ti se potriveste cel mai bine.
            </p>
          </div>
        </header>

        {/* ── Contact cards ── */}
        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-card-icon" style={{ background: 'var(--c1-pale)', color: 'var(--c1)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <span className="contact-card-label">Email</span>
            <span className="contact-card-value">support@onlinerental.ro</span>
            <span className="contact-card-sub">Raspuns in max. 24 h lucratoare</span>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon" style={{ background: 'var(--c2-pale)', color: 'var(--c2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <span className="contact-card-label">Telefon</span>
            <span className="contact-card-value">+40 123 456 789</span>
            <span className="contact-card-sub">Apeluri in program</span>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon" style={{ background: 'var(--c4-pale)', color: '#9a6e00' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="contact-card-label">Program</span>
            <span className="contact-card-value">09:00 – 18:00</span>
            <span className="contact-card-sub">Luni – Vineri</span>
          </div>
        </div>

        {/* ── Response time banner ── */}
        <div className="support-response">
          <div className="support-response-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="support-response-text">
            <strong>Timp mediu de raspuns: 24 ore lucratoare</strong>
            <p>
              Pentru solicitarile standard tratam fiecare cerere in ordinea primirii.
              Incidentele critice (pierdere acces cont, frauda) sunt prioritizate si rezolvate
              in cel mai scurt timp posibil.
            </p>
          </div>
        </div>

        {/* ── FAQ section ── */}
        <section className="legal-section" style={{ marginTop: 'var(--sp-4)' }}>
          <div className="legal-section-header">
            <div className="legal-section-icon legal-section-icon--blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2>Intrebari frecvente</h2>
          </div>
          <ul>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Cum anulez o inchiriere?</strong> — Din contul tau, sectiunea „Comenzile mele", selecteaza comanda si apasa „Anuleaza".</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Cand primesc rambursarea?</strong> — In 5–10 zile lucratoare de la confirmarea anularii.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Produsul a sosit defect.</strong> — Contacteaza-ne in termen de 24 h de la livrare cu fotografii si vom aranja inlocuirea imediata.</span>
            </li>
            <li>
              <span className="legal-li-dot" />
              <span><strong>Pot prelungi perioada de inchiriere?</strong> — Da, din aceeasi sectiune „Comenzile mele" inainte ca termenul sa expire.</span>
            </li>
          </ul>
        </section>

      </div>
    </div>
  );
};

export default SupportPage;
