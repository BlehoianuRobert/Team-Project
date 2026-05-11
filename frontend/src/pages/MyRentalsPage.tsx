import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { rentalService } from '../services/rentalService';
import { Rental } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate, formatCurrency } from '../utils/helpers';
import { RENTAL_STATUSES } from '../utils/constants';
import { ROUTES } from '../utils/constants';
import './MyRentalsPage.css';

const MyRentalsPage: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setIsLoading(true);
      const data = await rentalService.getMyRentals();
      setRentals(data);
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="my-rentals-page">
      <div className="container">
        <h1>Închirierile mele</h1>
        
        {rentals.length === 0 ? (
          <div className="no-rentals">
            <p>Nu aveți închirieri.</p>
            <Link to={ROUTES.PRODUCTS} className="btn btn-primary">
              Vezi produse disponibile
            </Link>
          </div>
        ) : (
          <div className="rentals-list">
            {rentals.map((rental) => (
              <Link
                key={rental.id}
                to={`/rentals/${rental.id}`}
                className="rental-card"
              >
                <div className="rental-info">
                  <h3>
                    {rental.inventoryUnit?.product?.name || 'Produs'}
                  </h3>
                  <p className="rental-dates">
                    {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                  </p>
                  
                  {/* Delivery & AWB Info */}
                  {rental.deliveryType && (
                    <div className={`rental-delivery-box rental-delivery-box--${rental.deliveryType === 'DELIVERY' ? 'delivery' : 'pickup'}`}>
                      <div className={`rental-delivery-header rental-delivery-header--${rental.deliveryType === 'DELIVERY' ? 'delivery' : 'pickup'}`}>
                        <span>{rental.deliveryType === 'DELIVERY' ? '🚚' : '🚶'}</span>
                        <span>{rental.deliveryType === 'DELIVERY' ? 'Livrare la domiciliu' : 'Ridicare personală'}</span>
                      </div>

                      {rental.awbNumber && (
                        <div className="rental-awb-box">
                          <span className="rental-awb-icon">📦</span>
                          <div className="rental-awb-content">
                            <span className="rental-awb-label">Număr AWB</span>
                            <span className="rental-awb-value">{rental.awbNumber}</span>
                          </div>
                        </div>
                      )}

                      {rental.deliveryStatus && (
                        <span className={`rental-delivery-status rental-delivery-status--${rental.deliveryStatus.toLowerCase()}`}>
                          {rental.deliveryStatus === 'PENDING' && '⏳ În așteptare'}
                          {rental.deliveryStatus === 'IN_TRANSIT' && '🚚 În tranzit'}
                          {rental.deliveryStatus === 'DELIVERED' && '✅ Livrat'}
                          {rental.deliveryStatus === 'RETURNED' && '↩️ Returnat'}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="rental-financial-row">
                    <p className="rental-price">{formatCurrency(rental.totalPrice)}</p>
                    <p className="rental-deposit">
                      Depozit: {formatCurrency(rental.depositAmount)}
                      {rental.depositReturned && (
                        <span className="rental-deposit-returned">✓ Returnat</span>
                      )}
                      {rental.itemCondition === 'DAMAGED' && !rental.depositReturned && (
                        <span className="rental-deposit-kept">✗ Reținut</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="rental-meta">
                  <span className={`status-badge status-${rental.status.toLowerCase()}`}>
                    {RENTAL_STATUSES[rental.status] || rental.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRentalsPage;
