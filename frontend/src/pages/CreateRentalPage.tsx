import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { rentalService } from '../services/rentalService';
import { Product, Inventory } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency, calculateRentalDays, calculateTotalPrice, calculateDiscount } from '../utils/helpers';
import { getPrimaryImageUrl } from '../utils/imageHelper';
import { ROUTES } from '../utils/constants';
import './CreateRentalPage.css';

const CreateRentalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [rentableInventory, setRentableInventory] = useState<Inventory[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);
  /** IDs free for [startDate, endDate]; undefined = interval invalid or not computed yet */
  const [calendarFreeIds, setCalendarFreeIds] = useState<number[] | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [inventoryError, setInventoryError] = useState('');
  const [rentableLoading, setRentableLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Delivery/Pickup fields
  const [deliveryType, setDeliveryType] = useState<'PERSONAL_PICKUP' | 'DELIVERY' | undefined>(undefined);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [twoDayDelivery, setTwoDayDelivery] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
    } else {
      navigate(ROUTES.PRODUCTS);
    }
  }, [productId, navigate]);

  useEffect(() => {
    if (!productId) {
      return;
    }
    if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) {
      setCalendarFreeIds(undefined);
      setInventoryError('');
      return;
    }

    setCalendarFreeIds(undefined);
    let cancelled = false;
    (async () => {
      try {
        setCalendarLoading(true);
        setInventoryError('');
        const freeUnits = await productService.getAvailableInventory(
          Number(productId),
          startDate,
          endDate
        );
        if (cancelled) {
          return;
        }
        const ids = freeUnits.map((u) => u.id);
        setCalendarFreeIds(ids);
        setSelectedInventoryId((prev) => {
          if (ids.length === 1) {
            return ids[0];
          }
          if (prev != null && ids.includes(prev)) {
            return prev;
          }
          return null;
        });
      } catch (invError: unknown) {
        console.error('Error loading calendar availability:', invError);
        if (cancelled) {
          return;
        }
        setCalendarFreeIds(undefined);
        setSelectedInventoryId(null);
        const msg =
          invError && typeof invError === 'object' && 'response' in invError
            ? (invError as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        setInventoryError(msg ? String(msg) : 'Nu s-a putut verifica disponibilitatea pe perioadă.');
      } finally {
        if (!cancelled) {
          setCalendarLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId, startDate, endDate]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      setError('');
      setRentableLoading(true);
      const [data, inventoryList] = await Promise.all([
        productService.getProductById(Number(productId)),
        productService.getAvailableInventory(Number(productId)),
      ]);
      setProduct(data);
      setRentableInventory(inventoryList);
      if (inventoryList.length === 1) {
        setSelectedInventoryId(inventoryList[0].id);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Eroare la încărcarea produsului. Vă rugăm să reîncercați.');
    } finally {
      setIsLoading(false);
      setRentableLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedInventoryId) {
      setError('Vă rugăm să selectați o unitate de inventar');
      return;
    }

    if (!startDate || !endDate) {
      setError('Vă rugăm să selectați datele de început și sfârșit');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('Data de început trebuie să fie înainte de data de sfârșit');
      return;
    }

    if (
      calendarFreeIds !== undefined &&
      selectedInventoryId != null &&
      !calendarFreeIds.includes(selectedInventoryId)
    ) {
      setError('Unitatea selectată nu este liberă în perioada aleasă. Alegeți altă serie sau alte date.');
      return;
    }

    // Validate delivery type is selected
    if (!deliveryType) {
      setError('Vă rugăm să selectați metoda de preluare (Ridicare personală sau Livrare)');
      return;
    }

    // Validate delivery fields if delivery is selected
    if (deliveryType === 'DELIVERY') {
      if (!deliveryAddress || deliveryAddress.trim() === '') {
        setError('Vă rugăm să introduceți adresa de livrare');
        return;
      }
      if (!deliveryPhone || deliveryPhone.trim() === '') {
        setError('Vă rugăm să introduceți numărul de telefon pentru livrare');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const rental = await rentalService.createRental({
        inventoryId: selectedInventoryId,
        startDate,
        endDate,
        deliveryType: deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress : undefined,
        deliveryPhone: deliveryType === 'DELIVERY' ? deliveryPhone : undefined,
        twoDayDelivery: deliveryType === 'DELIVERY' ? twoDayDelivery : undefined,
      });

      // Redirect to payment page after creating rental
      navigate(`/payment/${rental.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Eroare la crearea închirierii');
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = startDate && endDate ? calculateRentalDays(startDate, endDate) : 0;
  const productDiscountPercent = product?.discountPercent || 0;
  const discountInfo = product && days > 0 
    ? calculateDiscount(product.dailyPrice, days, productDiscountPercent) 
    : { productDiscountPercent: 0, productDiscountAmount: 0, durationDiscountPercent: 0, durationDiscountAmount: 0, totalDiscountAmount: 0, subtotal: 0 };
  const totalPrice = product && days > 0 ? calculateTotalPrice(product.dailyPrice, days, productDiscountPercent) : 0;
  const depositAmount = totalPrice * 0.30; // 30% deposit

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  const datesValid =
    Boolean(startDate && endDate && new Date(startDate) < new Date(endDate));
  const calendarResolved = datesValid && !calendarLoading && calendarFreeIds !== undefined;
  const isUnitBusyInRange = (unitId: number) =>
    calendarResolved && !calendarFreeIds!.includes(unitId);
  const selectedIsFree =
    selectedInventoryId != null &&
    (!datesValid || (calendarFreeIds !== undefined && calendarFreeIds.includes(selectedInventoryId)));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="create-rental-page">
        <div className="container">
          <div className="error-state">
            <h2>Produsul nu a fost găsit</h2>
            <Link to={ROUTES.PRODUCTS} className="btn btn-primary">
              Înapoi la produse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-rental-page">
      <div className="container">
        <Link to={`/products/${product.id}`} className="back-link">
          Înapoi la produs
        </Link>

        <div className="create-rental-layout">
          {/* Left Side - Product Info */}
          <div className="product-info-section">
            <div className="product-card">
              <div className="product-image-container">
                {product.imageUrl ? (
                  <img src={getPrimaryImageUrl(product.imageUrl)} alt={product.name} className="product-image" />
                ) : (
                  <div className="product-image-placeholder">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="product-details">
                <h2 className="product-name">{product.name}</h2>
                {product.category && (
                  <span className="product-category">{product.category}</span>
                )}
                <p className="product-description">{product.description}</p>
                
                <div className="product-price-section">
                  <span className="price-label">Preț pe zi</span>
                  <span className="price-value">{formatCurrency(product.dailyPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Rental Form */}
          <div className="rental-form-section">
            <div className="form-card">
              <h1 className="form-title">Creează Închiriere</h1>
              <p className="form-subtitle">Completează detaliile pentru a rezerva produsul</p>

              <form onSubmit={handleSubmit} className="rental-form">
                {error && (
                  <div className="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <span>Data început</span>
                    </label>
                    <div className="input-wrapper">
                      <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <input
                        type="date"
                        className="form-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={today}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Data sfârșit</span>
                    </label>
                    <div className="input-wrapper">
                      <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <input
                        type="date"
                        className="form-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || today}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Unitate de inventar (serie)</span>
                    {rentableInventory.length > 0 && !rentableLoading && (
                      <span className="label-badge">
                        {rentableInventory.length} în stoc
                        {datesValid && calendarResolved && (
                          <> · {calendarFreeIds!.length} libere în perioadă</>
                        )}
                      </span>
                    )}
                  </label>
                  {rentableLoading ? (
                    <p className="form-subtitle" style={{ marginTop: 0 }}>
                      Se încarcă unitățile…
                    </p>
                  ) : rentableInventory.length === 0 ? (
                    <div className="alert alert-warning">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <div>
                        <p className="alert-title">Nu există unități de inventar</p>
                        <p className="alert-text">Acest produs nu are încă serii înregistrate.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="form-subtitle" style={{ marginTop: 0 }}>
                        Toate seriile sunt listate mai jos. După ce alegi perioada, seriile deja rezervate în acel
                        interval apar ca indisponibile.
                      </p>
                      {inventoryError ? (
                        <div className="alert alert-error">
                          <span>{inventoryError}</span>
                        </div>
                      ) : null}
                      {datesValid && calendarLoading ? (
                        <p className="form-subtitle" style={{ marginTop: 0 }}>
                          Se verifică disponibilitatea pe calendar…
                        </p>
                      ) : null}
                      {datesValid && calendarResolved && calendarFreeIds!.length === 0 ? (
                        <div className="alert alert-warning">
                          <p className="alert-text">
                            În perioada selectată toate unitățile sunt deja rezervate. Alegeți alte date.
                          </p>
                        </div>
                      ) : null}
                      <select
                        className="form-input form-select"
                        value={selectedInventoryId || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSelectedInventoryId(v ? Number(v) : null);
                        }}
                        required
                      >
                        <option value="">Selectați o unitate...</option>
                        {rentableInventory.map((unit) => {
                          const busy = isUnitBusyInRange(unit.id);
                          return (
                            <option key={unit.id} value={unit.id} disabled={busy}>
                              {unit.serialNumber}
                              {busy ? ' — indisponibil în perioada aleasă' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Metodă de preluare</span>
                  </label>
                  <div className="delivery-options">
                    <label className={`delivery-option ${deliveryType === 'PERSONAL_PICKUP' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="PERSONAL_PICKUP"
                        checked={deliveryType === 'PERSONAL_PICKUP'}
                        onChange={() => {
                          setDeliveryType('PERSONAL_PICKUP');
                          setDeliveryAddress('');
                          setDeliveryPhone('');
                          setTwoDayDelivery(false);
                        }}
                      />
                      <div className="delivery-option-content">
                        <span className="delivery-option-icon">🚶</span>
                        <div>
                          <span className="delivery-option-title">Ridicare personală</span>
                          <span className="delivery-option-desc">Ridicați produsul de la locația noastră</span>
                        </div>
                      </div>
                    </label>
                    <label className={`delivery-option ${deliveryType === 'DELIVERY' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="DELIVERY"
                        checked={deliveryType === 'DELIVERY'}
                        onChange={() => setDeliveryType('DELIVERY')}
                      />
                      <div className="delivery-option-content">
                        <span className="delivery-option-icon">🚚</span>
                        <div>
                          <span className="delivery-option-title">Livrare la domiciliu</span>
                          <span className="delivery-option-desc">Livrare prin curier</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {deliveryType === 'DELIVERY' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <span>Adresă de livrare</span>
                      </label>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Strada, număr, oraș, județ..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span>Telefon pentru livrare</span>
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                      />
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={twoDayDelivery}
                          onChange={(e) => setTwoDayDelivery(e.target.checked)}
                        />
                        <span>Livrare în 2 zile (produsul va fi livrat cu 2 zile înainte de data de început)</span>
                      </label>
                    </div>
                  </>
                )}

                {days > 0 && (
                  <div className="rental-summary-card">
                    <h3 className="summary-title">Rezumat comandă</h3>
                    <div className="summary-content">
                      <div className="summary-row">
                        <span className="summary-label">Perioadă</span>
                        <span className="summary-value">{days} {days === 1 ? 'zi' : 'zile'}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Preț pe zi</span>
                        <span className="summary-value">{formatCurrency(product.dailyPrice)}</span>
                      </div>
                      <div className="summary-divider"></div>
                      <div className="summary-row">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">{formatCurrency(discountInfo.subtotal)}</span>
                      </div>
                      {discountInfo.productDiscountPercent > 0 && (
                        <div className="summary-row" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                          <span className="summary-label">
                            🏷️ Reducere produs ({discountInfo.productDiscountPercent}%)
                          </span>
                          <span className="summary-value" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                            -{formatCurrency(discountInfo.productDiscountAmount)}
                          </span>
                        </div>
                      )}
                      {discountInfo.durationDiscountPercent > 0 && (
                        <div className="summary-row" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                          <span className="summary-label">
                            🎉 Reducere perioadă ({discountInfo.durationDiscountPercent}%)
                          </span>
                          <span className="summary-value" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                            -{formatCurrency(discountInfo.durationDiscountAmount)}
                          </span>
                        </div>
                      )}
                      <div className="summary-row">
                        <span className="summary-label">Depozit (30%)</span>
                        <span className="summary-value">{formatCurrency(depositAmount)}</span>
                      </div>
                      <div className="summary-divider"></div>
                      <div className="summary-row summary-total">
                        <span className="summary-label">Total de plată</span>
                        <span className="summary-value">{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="summary-row" style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
                        <span className="summary-label" style={{ fontSize: '0.875rem' }}>
                          * Depozitul va fi returnat după verificarea stării produsului
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="submit-button-wrapper">
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={
                      isSubmitting ||
                      rentableLoading ||
                      rentableInventory.length === 0 ||
                      !selectedInventoryId ||
                      !startDate ||
                      !endDate ||
                      (datesValid && calendarLoading) ||
                      (datesValid && calendarResolved && !selectedIsFree)
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        <span>Se procesează...</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                        <span>Confirmă Închirierea</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRentalPage;
