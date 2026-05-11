import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { productService } from '../services/productService';
import { UserProfile, ProfilePatchPayload } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/helpers';
import './AccountPage.css';

const emptyProfile: UserProfile = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
};

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const canViewProviderDashboard =
    user?.role === 'ROLE_VENDOR' || user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPEROWNER';
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [provider, setProvider] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [p, providerStats] = await Promise.all([
        profileService.getProfile(),
        canViewProviderDashboard ? productService.getProviderDashboard() : Promise.resolve(null),
      ]);
      setProfile(p);
      setProvider(providerStats);
    } catch {
      setMessage({ type: 'err', text: 'Nu s-au putut încărca datele contului.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (key: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const payload: ProfilePatchPayload = {
      firstName: profile.firstName || undefined,
      lastName: profile.lastName || undefined,
      addressLine1: profile.addressLine1 || undefined,
      addressLine2: profile.addressLine2 || undefined,
      city: profile.city || undefined,
      postalCode: profile.postalCode || undefined,
      country: profile.country || undefined,
      phone: profile.phone || undefined,
      billingFullName: profile.billingFullName || undefined,
    };
    try {
      setSaving(true);
      const updated = await profileService.patchProfile(payload);
      setProfile(updated);
      setMessage({ type: 'ok', text: 'Modificările au fost salvate.' });
    } catch {
      setMessage({ type: 'err', text: 'Salvare eșuată. Încearcă din nou.' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportProfile = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile,
      providerDashboard: provider,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-profile-${profile.username || 'user'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt('Type DELETE to permanently remove your account.');
    if (confirmation !== 'DELETE') {
      return;
    }
    try {
      setDeleting(true);
      const response = await profileService.deleteOwnAccount();
      setMessage({ type: 'ok', text: response.message || 'Cont șters cu succes.' });
      logout();
    } catch (err: any) {
      setMessage({ type: 'err', text: err.response?.data?.message || 'Ștergerea contului a eșuat.' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="account-page">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="container account-page-inner">
        <header className="account-page-header">
          <h1>Contul meu</h1>
          <p>Date personale, adresă de livrare și informații pentru facturare.</p>
        </header>

        {message && (
          <div className={`account-banner ${message.type === 'ok' ? 'account-banner--ok' : 'account-banner--err'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="account-form-grid">
          {canViewProviderDashboard && provider && (
            <section className="account-card account-card--wide">
              <h2>Provider Dashboard</h2>
              <p className="account-muted">Venituri per dispozitiv și breakdown lunar.</p>
              <div className="provider-kpis">
                <div><strong>{formatCurrency(provider.totalIncome || 0)}</strong><span>Total income</span></div>
                <div><strong>{provider.totalRentals || 0}</strong><span>Total rentals</span></div>
              </div>
              <div className="provider-list">
                {(provider.devices || []).map((d: any) => (
                  <div key={d.productId} className="provider-row">
                    <span>{d.productName}</span>
                    <span>{d.rentalCount} închirieri</span>
                    <strong>{formatCurrency(d.totalRevenue || 0)}</strong>
                  </div>
                ))}
              </div>
              <h3 className="provider-subtitle">Breakdown lunar</h3>
              <div className="provider-list">
                {(provider.monthly || []).map((m: any) => (
                  <div key={m.month} className="provider-row">
                    <span>{m.month}</span>
                    <span />
                    <strong>{formatCurrency(m.income || 0)}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}
          <section className="account-card">
            <h2>Date cont</h2>
            <p className="account-muted">Username și email nu pot fi modificate aici.</p>
            <div className="account-field">
              <label>Username</label>
              <input type="text" value={profile.username || user?.username || ''} disabled />
            </div>
            <div className="account-field">
              <label>Email</label>
              <input type="email" value={profile.email || user?.email || ''} disabled />
            </div>
            <div className="account-field-row">
              <div className="account-field">
                <label htmlFor="acc-fn">Prenume</label>
                <input
                  id="acc-fn"
                  type="text"
                  value={profile.firstName || ''}
                  onChange={(e) => setField('firstName', e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="account-field">
                <label htmlFor="acc-ln">Nume</label>
                <input
                  id="acc-ln"
                  type="text"
                  value={profile.lastName || ''}
                  onChange={(e) => setField('lastName', e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>
          </section>

          <section className="account-card">
            <h2>Adresă livrare</h2>
            <p className="account-muted">Folosită ca referință la comenzile cu livrare.</p>
            <div className="account-field">
              <label htmlFor="acc-a1">Adresă (linia 1)</label>
              <input
                id="acc-a1"
                type="text"
                value={profile.addressLine1 || ''}
                onChange={(e) => setField('addressLine1', e.target.value)}
                autoComplete="street-address"
              />
            </div>
            <div className="account-field">
              <label htmlFor="acc-a2">Adresă (linia 2)</label>
              <input
                id="acc-a2"
                type="text"
                value={profile.addressLine2 || ''}
                onChange={(e) => setField('addressLine2', e.target.value)}
              />
            </div>
            <div className="account-field-row">
              <div className="account-field">
                <label htmlFor="acc-city">Localitate</label>
                <input
                  id="acc-city"
                  type="text"
                  value={profile.city || ''}
                  onChange={(e) => setField('city', e.target.value)}
                  autoComplete="address-level2"
                />
              </div>
              <div className="account-field">
                <label htmlFor="acc-post">Cod poștal</label>
                <input
                  id="acc-post"
                  type="text"
                  value={profile.postalCode || ''}
                  onChange={(e) => setField('postalCode', e.target.value)}
                  autoComplete="postal-code"
                />
              </div>
            </div>
            <div className="account-field-row">
              <div className="account-field">
                <label htmlFor="acc-country">Țară</label>
                <input
                  id="acc-country"
                  type="text"
                  value={profile.country || ''}
                  placeholder="România"
                  onChange={(e) => setField('country', e.target.value)}
                  autoComplete="country-name"
                />
              </div>
              <div className="account-field">
                <label htmlFor="acc-phone">Telefon</label>
                <input
                  id="acc-phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setField('phone', e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>
          </section>

          <section className="account-card account-card--wide">
            <h2>Facturare și plată cu cardul</h2>
            <p className="account-muted">
              Datele cardului nu se stochează în aplicație. La finalizarea plății pentru o închiriere vei introduce
              cardul în formularul securizat Stripe. Poți folosi numele de facturare de mai jos pe documente.
            </p>
            <div className="account-field">
              <label htmlFor="acc-bill">Nume pentru facturare</label>
              <input
                id="acc-bill"
                type="text"
                value={profile.billingFullName || ''}
                placeholder="Ex.: Ion Popescu sau Denumire firmă"
                onChange={(e) => setField('billingFullName', e.target.value)}
              />
            </div>
            <div className="account-stripe-note">
              <strong>Adăugare card:</strong> mergi la o rezervare în așteptare și deschide pagina de plată — acolo
              poți introduce datele cardului în siguranță.
            </div>
          </section>

          <section className="account-card account-card--wide">
            <h2>Account Actions</h2>
            <p className="account-muted">
              Funcționalități suplimentare pentru controlul complet al contului: poți exporta datele profilului sau
              poți șterge definitiv contul.
            </p>
            <div className="account-actions-row">
              <button type="button" className="btn btn-secondary" onClick={handleExportProfile}>
                Exportă datele profilului
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleting}
                onClick={() => void handleDeleteAccount()}
              >
                {deleting ? 'Se șterge...' : 'Șterge contul meu'}
              </button>
            </div>
          </section>

          <div className="account-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Se salvează…' : 'Salvează modificările'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
