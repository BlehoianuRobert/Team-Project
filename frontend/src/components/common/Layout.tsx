import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../utils/constants';
import ProductsMegaMenu from './ProductsMegaMenu';
import Logo, { LogoMark } from './Logo';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

/** Work pages get the one-line footer so it doesn't take space from tables and forms. */
const COMPACT_FOOTER_PREFIXES = ['/admin', '/superowner', ROUTES.PAYMENT];

const subNavClass = ({ isActive }: { isActive: boolean }) =>
  `app-subnav-link${isActive ? ' is-active' : ''}`;

const Icon: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Comută la tema luminoasă' : 'Comută la tema întunecată';
  return (
    <button type="button" className="nav-icon-btn theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      {isDark ? (
        <Icon>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </Icon>
      ) : (
        <Icon>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </Icon>
      )}
    </button>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout, isSuperOwner, canEditCatalog } = useAuth();
  const { theme } = useTheme();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const compactFooter = COMPACT_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() ||
    (user?.username ?? '?').slice(0, 2).toUpperCase();
  const year = new Date().getFullYear();

  return (
    <div className={`app-layout${!isAuthenticated ? ' app-layout--guest-nav' : ''}`}>
      <header className="app-header">
        <div className="app-header-tier1">
          <nav className="app-nav app-nav-primary" aria-label="Navigare principală">
            <div className="nav-brand">
              <Link to={ROUTES.PRODUCTS} aria-label="Online Rental – catalog">
                <Logo />
              </Link>
            </div>

            <div className="nav-links nav-links-primary">
              {!isAuthenticated && (
                <NavLink to={ROUTES.PRODUCTS} end className="nav-catalog-link">
                  Catalog
                </NavLink>
              )}
              <ProductsMegaMenu />
              {isAuthenticated && <NavLink to={ROUTES.MY_RENTALS}>Închirieri</NavLink>}
              {isSuperOwner && <NavLink to={ROUTES.ADMIN}>Admin</NavLink>}
              <NavLink to={ROUTES.HELP}>Ajutor</NavLink>
            </div>

            <div className="nav-actions">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <span className="nav-user-divider" aria-hidden />
                  <Link to={ROUTES.ACCOUNT} className="nav-account" title="Contul meu">
                    <span className="nav-account-avatar" aria-hidden>{initials}</span>
                    <span className="nav-user-name">{user?.username}</span>
                  </Link>
                  <button type="button" onClick={logout} className="btn-nav-logout">
                    Deconectare
                  </button>
                </>
              ) : (
                <>
                  <NavLink to={ROUTES.LOGIN} className="nav-guest-link">
                    Autentificare
                  </NavLink>
                  <NavLink to={ROUTES.REGISTER} className="btn-nav-register">
                    Înregistrare
                  </NavLink>
                </>
              )}

              <button
                type="button"
                className="nav-icon-btn nav-menu-btn"
                aria-label={menuOpen ? 'Închide meniul' : 'Deschide meniul'}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? (
                  <Icon size={22}><path d="M6 6l12 12M18 6L6 18" /></Icon>
                ) : (
                  <Icon size={22}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
                )}
              </button>
            </div>
          </nav>
        </div>

        {isAuthenticated && (
          <div
            className={`app-header-tier2${isSuperOwner ? ' app-header-tier2--super' : ''}`}
            aria-label={isSuperOwner ? 'Navigare super-admin' : 'Navigare rapidă'}
          >
            <nav className="app-nav app-nav-secondary">
              <NavLink to={ROUTES.PRODUCTS} end className={subNavClass}>
                Catalog Produse
              </NavLink>
              <NavLink to={ROUTES.ACCOUNT} className={subNavClass}>
                Contul meu
              </NavLink>
              <NavLink to={ROUTES.CREATE_RENTAL} className={subNavClass}>
                Creare închiriere
              </NavLink>
              {isSuperOwner && (
                <>
                  <span className="app-subnav-sep" aria-hidden />
                  <NavLink to={ROUTES.ADMIN} end className={subNavClass}>
                    Admin Dashboard
                  </NavLink>
                  <NavLink to={ROUTES.ADMIN_PRODUCTS} className={subNavClass}>
                    Gestionare Produse
                  </NavLink>
                  <NavLink to={ROUTES.ADMIN_RENTALS} className={subNavClass}>
                    Gestionare Închirieri
                  </NavLink>
                  <NavLink to={ROUTES.SUPEROWNER_STATS} className={subNavClass}>
                    Statistici financiare
                  </NavLink>
                </>
              )}
              {!isSuperOwner && canEditCatalog && (
                <NavLink to={ROUTES.ADMIN_PRODUCTS} className={subNavClass}>
                  Gestionare Produse
                </NavLink>
              )}
            </nav>
          </div>
        )}

        {menuOpen && (
          <div id="mobile-menu" className="mobile-menu">
            <nav className="mobile-menu-links" aria-label="Meniu">
              <NavLink to={ROUTES.PRODUCTS} end>Catalog produse</NavLink>
              {isAuthenticated && <NavLink to={ROUTES.MY_RENTALS}>Închirierile mele</NavLink>}
              {isAuthenticated && <NavLink to={ROUTES.CREATE_RENTAL}>Creare închiriere</NavLink>}
              {isAuthenticated && <NavLink to={ROUTES.ACCOUNT}>Contul meu</NavLink>}
              <NavLink to={ROUTES.HELP}>Ajutor</NavLink>
            </nav>
            {(isSuperOwner || canEditCatalog) && (
              <nav className="mobile-menu-links mobile-menu-links--admin" aria-label="Administrare">
                <p className="mobile-menu-heading">Administrare</p>
                {isSuperOwner && <NavLink to={ROUTES.ADMIN} end>Admin Dashboard</NavLink>}
                <NavLink to={ROUTES.ADMIN_PRODUCTS}>Gestionare produse</NavLink>
                {isSuperOwner && <NavLink to={ROUTES.ADMIN_RENTALS}>Gestionare închirieri</NavLink>}
                {isSuperOwner && <NavLink to={ROUTES.SUPEROWNER_STATS}>Statistici financiare</NavLink>}
              </nav>
            )}
            <div className="mobile-menu-actions">
              {isAuthenticated ? (
                <button type="button" onClick={logout} className="btn btn-secondary">
                  Deconectare ({user?.username})
                </button>
              ) : (
                <>
                  <Link to={ROUTES.REGISTER} className="btn btn-primary">Înregistrare</Link>
                  <Link to={ROUTES.LOGIN} className="btn btn-secondary">Autentificare</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="app-main">
        {children}
      </main>

      {compactFooter ? (
        <footer className="app-footer app-footer--compact">
          <div className="footer-compact-inner">
            <div className="footer-compact-brand">
              <LogoMark size={26} />
              <p>© {year} Online Rental System</p>
            </div>
            <nav className="footer-compact-links" aria-label="Legal și suport">
              <Link to={ROUTES.PRIVACY_POLICY}>Privacy Policy</Link>
              <Link to={ROUTES.TERMS_AND_CONDITIONS}>Terms and Conditions</Link>
              <Link to={ROUTES.SUPPORT}>Support</Link>
              <Link to={ROUTES.COOKIE_PREFERENCES}>Cookie preferences</Link>
            </nav>
            <p className="footer-credit">powered by Bricked Up Team</p>
          </div>
        </footer>
      ) : (
        <footer className="app-footer app-footer--full">
          <div className="footer-inner">
            {theme === 'light' && (
              <section className="footer-cta" aria-labelledby="footer-cta-title">
                <div className="footer-cta-copy">
                  <h2 id="footer-cta-title">Ai nevoie de ceva doar pentru câteva zile?</h2>
                  <p>Alegi produsul, perioada și plătești online. Depozitul se returnează la predare.</p>
                </div>
                <div className="footer-cta-actions">
                  <Link to={ROUTES.PRODUCTS} className="footer-cta-primary">Explorează catalogul</Link>
                  {isAuthenticated ? (
                    <Link to={ROUTES.CREATE_RENTAL} className="footer-cta-secondary">Creare închiriere</Link>
                  ) : (
                    <Link to={ROUTES.REGISTER} className="footer-cta-secondary">Creează cont</Link>
                  )}
                </div>
              </section>
            )}

            <div className="footer-grid">
              <div className="footer-brand">
                <Link to={ROUTES.PRODUCTS} className="footer-brand-link" aria-label="Online Rental – catalog">
                  <Logo />
                </Link>
                <p>Închiriezi echipamente foto, video, audio și tech pe zi, cu livrare sau ridicare personală.</p>
                <ul className="footer-badges" aria-label="Avantaje">
                  <li>
                    <Icon size={15}>
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </Icon>
                    Plăți prin Stripe
                  </li>
                  <li>
                    <Icon size={15}>
                      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
                      <circle cx="7" cy="18" r="1.6" />
                      <circle cx="17" cy="18" r="1.6" />
                    </Icon>
                    Livrare în 2 zile
                  </li>
                </ul>
              </div>

              <nav className="footer-col" aria-labelledby="footer-col-rent">
                <h2 id="footer-col-rent">Închiriere</h2>
                <Link to={ROUTES.PRODUCTS}>Catalog produse</Link>
                <Link to={ROUTES.CREATE_RENTAL}>Creare închiriere</Link>
                <Link to={ROUTES.MY_RENTALS}>Închirierile mele</Link>
              </nav>

              <nav className="footer-col" aria-labelledby="footer-col-account">
                <h2 id="footer-col-account">Cont</h2>
                {isAuthenticated ? (
                  <Link to={ROUTES.ACCOUNT}>Contul meu</Link>
                ) : (
                  <>
                    <Link to={ROUTES.LOGIN}>Autentificare</Link>
                    <Link to={ROUTES.REGISTER}>Înregistrare</Link>
                  </>
                )}
              </nav>

              <nav className="footer-col" aria-labelledby="footer-col-help">
                <h2 id="footer-col-help">Ajutor &amp; legal</h2>
                <Link to={ROUTES.HELP}>Ajutor</Link>
                <Link to={ROUTES.SUPPORT}>Support</Link>
                <Link to={ROUTES.PRIVACY_POLICY}>Privacy Policy</Link>
                <Link to={ROUTES.TERMS_AND_CONDITIONS}>Terms and Conditions</Link>
                <Link to={ROUTES.COOKIE_PREFERENCES}>Cookie preferences</Link>
              </nav>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-inner">
              <p>© {year} Online Rental System · powered by Bricked Up Team</p>
              <p>Prețuri în RON, pe zi</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
