import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-logo-wrap">
          <img src="/logo-stacked.svg" alt="Online Rental System" className="hero-logo" draggable={false} />
        </div>
        <h1 className="hero-title">
          Închiriază tot ce ai nevoie,<br />
          <span className="hero-title-accent">simplu și rapid</span>
        </h1>
        <p className="hero-subtitle">
          Platforma ta de încredere pentru gestionarea și accesarea produselor disponibile la închiriere.
          Explorează catalogul, alege produsul potrivit și rezervă online.
        </p>
        <div className="hero-actions">
          <Link to={ROUTES.PRODUCTS} className="btn btn-primary btn-large">
            Explorează Catalogul
          </Link>
          <Link to={ROUTES.REGISTER} className="btn btn-hero-ghost">
            Creează un cont gratuit
          </Link>
        </div>
        <div className="hero-features">
          <div className="hero-feature">
            <span className="hero-feature-icon">🏠</span>
            <span className="hero-feature-label">Catalog bogat de produse</span>
          </div>
          <div className="hero-feature-sep" aria-hidden>·</div>
          <div className="hero-feature">
            <span className="hero-feature-icon">⚡</span>
            <span className="hero-feature-label">Rezervare rapidă online</span>
          </div>
          <div className="hero-feature-sep" aria-hidden>·</div>
          <div className="hero-feature">
            <span className="hero-feature-icon">🔒</span>
            <span className="hero-feature-label">Plăți sigure</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
