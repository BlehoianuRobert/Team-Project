import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { Product, ProductReview, ProductReviewSummary } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/helpers';
import { getImageUrl, splitProductImageGallery } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ProductReviewSummary | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProductById(Number(id));
      setProduct(data);
      setGalleryIndex(0);
      try {
        const [loadedReviews, loadedSummary] = await Promise.all([
          productService.getProductReviews(Number(id)),
          productService.getProductReviewSummary(Number(id)),
        ]);
        setReviews(loadedReviews);
        setReviewSummary(loadedSummary);
        if (isAuthenticated && user) {
          const ownReview = loadedReviews.find((r) => r.userId === user.id);
          if (ownReview) {
            setRating(ownReview.rating);
            setComment(ownReview.comment || '');
          }
        }
      } catch (reviewError) {
        console.error('Error loading reviews:', reviewError);
        setReviews([]);
        setReviewSummary({ productId: Number(id), averageRating: 0, reviewCount: 0 });
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (value: number) => '★'.repeat(value) + '☆'.repeat(5 - value);
  const ownReview = user ? reviews.find((r) => r.userId === user.id) : undefined;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || rating < 1 || rating > 5) {
      return;
    }
    try {
      setIsSubmittingReview(true);
      await productService.createOrUpdateReview(product.id, {
        rating,
        comment: comment.trim() || undefined,
      });
      const [loadedReviews, loadedSummary] = await Promise.all([
        productService.getProductReviews(product.id),
        productService.getProductReviewSummary(product.id),
      ]);
      setReviews(loadedReviews);
      setReviewSummary(loadedSummary);
      setRating(0);
      setHoverRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return <div>Produsul nu a fost găsit.</div>;
  }

  const galleryPaths = splitProductImageGallery(product.imageUrl);
  const mainGallerySrc =
    galleryPaths.length > 0 ? getImageUrl(galleryPaths[Math.min(galleryIndex, galleryPaths.length - 1)]) : '';

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to={ROUTES.PRODUCTS} className="back-link">Înapoi la produse</Link>
        
        <div className="product-detail">
          <div className="product-detail-image">
            {galleryPaths.length > 0 ? (
              <>
                <img src={mainGallerySrc} alt={product.name} />
                {galleryPaths.length > 1 && (
                  <div className="product-gallery-thumbs" role="list">
                    {galleryPaths.map((path, idx) => (
                      <button
                        key={`${path}-${idx}`}
                        type="button"
                        className={`product-gallery-thumb ${idx === galleryIndex ? 'active' : ''}`}
                        onClick={() => setGalleryIndex(idx)}
                      >
                        <img src={getImageUrl(path)} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="product-placeholder">Fără imagine</div>
            )}
          </div>

          <div className="product-detail-info">
            <h1>{product.name}</h1>
            <p className="product-category">{product.category}</p>
            {reviewSummary && (
              <div className="product-rating-summary">
                <strong>{reviewSummary.averageRating.toFixed(1)}</strong>
                <span>{renderStars(Math.round(reviewSummary.averageRating))}</span>
                <span>({reviewSummary.reviewCount} recenzii)</span>
              </div>
            )}
            <p className="product-price-large">{formatCurrency(product.dailyPrice)}/zi</p>
            <div className="product-description-full">
              <h3>Descriere</h3>
              <p>{product.description}</p>
            </div>

            {isAuthenticated ? (
              <Link 
                to={`/rentals/create?productId=${product.id}`}
                className="btn btn-primary btn-large"
              >
                Închiriază acum
              </Link>
            ) : (
              <Link to={ROUTES.LOGIN} className="btn btn-primary btn-large">
                Conectează-te pentru a închiria
              </Link>
            )}
          </div>
        </div>

        <section className="reviews-section">
          <h2>Recenzii produs</h2>

          {isAuthenticated && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <label>Rating (1-5 stele)</label>
              <div className="rating-input" role="radiogroup" aria-label="Selectează numărul de stele">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${(hoverRating || rating) >= star ? 'is-active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} stele`}
                    aria-checked={rating === star}
                    role="radio"
                  >
                    ★
                  </button>
                ))}
                <span className="rating-input-value">
                  {rating > 0 ? `${rating}/5` : 'Selectează rating'}
                </span>
              </div>
              <label>
                Comentariu
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Scrie impresia ta despre produs..."
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={isSubmittingReview || rating === 0}>
                {isSubmittingReview ? 'Se trimite...' : ownReview ? 'Actualizează recenzie' : 'Trimite recenzie'}
              </button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>Nu exista recenzii inca.</p>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="review-card">
                  <div className="review-header">
                    <strong>{review.username}</strong>
                    <span>{renderStars(review.rating)}</span>
                  </div>
                  <p className="review-date">{formatDate(review.updatedAt || review.createdAt)}</p>
                  {review.comment && <p>{review.comment}</p>}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetailPage;
