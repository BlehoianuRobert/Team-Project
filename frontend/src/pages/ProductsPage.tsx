import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { Product } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/helpers';
import { getPrimaryImageUrl } from '../utils/imageHelper';
import { parseProductFiltersFromSearchParams } from '../utils/productFilterParams';
import './ProductsPage.css';

const CARD_VISUALS = ['teal', 'terra', 'olive', 'navy'] as const;

function visualForProductId(id: number): (typeof CARD_VISUALS)[number] {
  return CARD_VISUALS[((id % 4) + 4) % 4];
}

/** Stable tint for brand pill (mock-style accents). */
function brandTintIndex(brand: string): number {
  let h = 0;
  for (let i = 0; i < brand.length; i += 1) {
    h = (h + brand.charCodeAt(i) * (i + 1)) % 4;
  }
  return h;
}

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [smartSearch, setSmartSearch] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [weightMaxFilter, setWeightMaxFilter] = useState('');

  const filters = useMemo(() => parseProductFiltersFromSearchParams(searchParams), [searchParams]);

  const hasActiveFilters = useMemo(
    () =>
      filters.categories.length > 0 ||
      filters.brands.length > 0 ||
      filters.models.length > 0 ||
      Boolean(filters.search?.trim()) ||
      typeof filters.minPrice === 'number' ||
      typeof filters.maxPrice === 'number' ||
      (filters.sortBy && filters.sortBy !== 'relevance'),
    [filters]
  );

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const f = parseProductFiltersFromSearchParams(searchParams);
      const data = await productService.getAllProducts({
        category: f.categories[0],
        brand: f.brands[0],
        model: f.models[0],
        search: smartSearch || f.search || undefined,
        color: colorFilter || searchParams.get('color') || undefined,
        weightMax: Number.isFinite(Number(weightMaxFilter)) && weightMaxFilter !== '' ? Number(weightMaxFilter) : undefined,
      });

      const normalizedSearch = (f.search || '').trim().toLowerCase();
      const filtered = data.filter((product) => {
        if (
          normalizedSearch &&
          !`${product.name} ${product.description} ${product.brand || ''} ${product.model || ''}`
            .toLowerCase()
            .includes(normalizedSearch)
        ) {
          return false;
        }

        if (typeof f.minPrice === 'number' && product.dailyPrice < f.minPrice) {
          return false;
        }

        if (typeof f.maxPrice === 'number' && product.dailyPrice > f.maxPrice) {
          return false;
        }

        return true;
      });

      filtered.sort((a, b) => {
        switch (f.sortBy) {
          case 'priceAsc':
            return a.dailyPrice - b.dailyPrice;
          case 'priceDesc':
            return b.dailyPrice - a.dailyPrice;
          case 'nameAsc':
            return a.name.localeCompare(b.name);
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });

      setProducts(filtered);
    } catch {
      setError('Eroare la încărcarea produselor');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="products-page">
      <div className="container products-page-container">
        <h1>Catalog Produse</h1>
        <p className="products-page-hint">
          Poți vedea catalogul fără cont. Folosește <strong>Produse</strong> din bara de sus (hover sau
          butonul <strong>Filtre</strong>) pentru același panou de filtrare. Doar administratorii pot adăuga
          produse în vânzare.
        </p>

        <div className="products-layout products-layout-full">
          <main className="products-content products-content-full">
            <section className="smart-filter-bar">
              <input
                type="text"
                placeholder="Caută natural: ex. laptop subțire negru"
                value={smartSearch}
                onChange={(e) => setSmartSearch(e.target.value)}
              />
              <input
                type="text"
                placeholder="Culoare (ex: black, silver)"
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Greutate max (kg)"
                value={weightMaxFilter}
                onChange={(e) => setWeightMaxFilter(e.target.value)}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => void loadProducts()}>
                Aplică AI Filters
              </button>
            </section>
            {hasActiveFilters && products.length > 0 && (
              <div className="results-info">
                <p>{`Găsite ${products.length} ${products.length === 1 ? 'produs' : 'produse'}`}</p>
              </div>
            )}
            {hasActiveFilters && products.length === 0 && (
              <div className="no-products-filtered">
                <p>Nu s-au găsit produse pentru filtrele selectate.</p>
              </div>
            )}

            <div className="products-grid">
              {products.map((product) => {
                const visual = visualForProductId(product.id);
                const brandLabel = product.brand || product.model || '';
                const brandTint = brandLabel ? brandTintIndex(brandLabel) : 0;
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="product-card product-card--catalog"
                  >
                    <div
                      className={`product-card-visual product-card-visual--${visual}${
                        product.imageUrl ? ' product-card-visual--has-image' : ''
                      }`}
                    >
                      {product.imageUrl ? (
                        <img src={getPrimaryImageUrl(product.imageUrl)} alt={product.name} />
                      ) : (
                        <span className="product-card-visual-fallback" aria-hidden />
                      )}
                    </div>
                    <div className="product-info">
                      <div className="product-card-badges">
                        <span className="product-pill product-pill-category">{product.category}</span>
                        {brandLabel ? (
                          <span
                            className={`product-pill product-pill-brand product-pill-brand--t${brandTint}`}
                          >
                            {brandLabel}
                          </span>
                        ) : null}
                      </div>
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="product-card-divider" aria-hidden />
                      <div className="product-price">
                        <span className="product-price-amount">{formatCurrency(product.dailyPrice)}</span>
                        <span className="product-price-unit">/ZI</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {products.length === 0 && !hasActiveFilters && (
              <p className="no-products">Nu există produse disponibile.</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
