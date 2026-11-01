import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import Logo from '../components/common/Logo';
import './HomePage.css';

const features = [
  {
    title: 'Catalog bogat de produse',
    text: 'Filtrează după categorie, culoare sau greutate.',
    tone: 'blue',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    title: 'Rezervare rapidă online',
    text: 'Alegi perioada și primești confirmarea imediat.',
    tone: 'blue',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
  },
  {
    title: 'Plăți sigure',
    text: 'Plată cu cardul prin Stripe, criptată.',
    tone: 'green',
    icon: (
      <>
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
];

const steps = [
  { title: 'Alegi produsul', text: 'Caută în catalog sau folosește filtrele.' },
  { title: 'Rezervi perioada', text: 'Selectezi datele de început și de sfârșit.' },
  { title: 'Plătești și ridici', text: 'Plată online, apoi returnezi cu poze la final.' },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `${ROUTES.PRODUCTS}?search=${encodeURIComponent(q)}` : ROUTES.PRODUCTS);
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Închirieri online, fără bătăi de cap</span>
          <h1 className="hero-title">
            Închiriază tot ce ai nevoie, <span className="hero-title-accent">simplu și rapid</span>
          </h1>
          <p className="hero-subtitle">
            Platforma ta de încredere pentru produse disponibile la închiriere. Explorează catalogul,
            alege produsul potrivit și rezervă online.
          </p>
          <form className="home-search" onSubmit={handleSearch} role="search">
            <label htmlFor="home-search-input" className="visually-hidden">Caută produse</label>
            <input
              id="home-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută natural: ex. laptop subțire negru"
            />
            <button type="submit" className="btn btn-primary">Caută</button>
          </form>
          <div className="hero-actions">
            <Link to={ROUTES.PRODUCTS} className="btn btn-primary btn-large">
              Explorează catalogul
            </Link>
            <Link to={ROUTES.REGISTER} className="btn btn-hero-ghost">
              Creează un cont gratuit
            </Link>
          </div>
        </div>
        <div className="home-hero-visual" aria-hidden="true">
          <Logo variant="stacked" />
        </div>
      </section>

      <section className="home-features" aria-label="Avantaje">
        {features.map((f) => (
          <div key={f.title} className="home-feature-card">
            <span className={`home-feature-icon home-feature-icon--${f.tone}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {f.icon}
              </svg>
            </span>
            <div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="home-steps">
        <div className="home-steps-inner">
          <h2>Cum funcționează</h2>
          <ol className="home-steps-list">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="home-step-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <Link to={ROUTES.PRODUCTS} className="btn home-steps-cta">Vezi catalogul</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
