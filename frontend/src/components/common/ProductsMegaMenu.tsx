import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { ROUTES } from '../../utils/constants';
import {
  parseProductFiltersFromSearchParams,
  buildProductFiltersSearchParams,
  ProductListFilters,
  SortByOption,
} from '../../utils/productFilterParams';
import { formatCurrency } from '../../utils/helpers';
import './ProductsMegaMenu.css';

const LEAVE_MS = 220;

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

const ProductsMegaMenu: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const urlFilters = useMemo(() => parseProductFiltersFromSearchParams(searchParams), [searchParams]);

  const [draft, setDraft] = useState<ProductListFilters>(urlFilters);
  const [priceLo, setPriceLo] = useState(0);
  const [priceHi, setPriceHi] = useState(1000);

  useEffect(() => {
    setDraft(urlFilters);
  }, [urlFilters]);

  const bounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 1000 };
    let min = Infinity;
    let max = -Infinity;
    for (const p of products) {
      if (p.dailyPrice < min) min = p.dailyPrice;
      if (p.dailyPrice > max) max = p.dailyPrice;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1000 };
    if (min === max) return { min: Math.max(0, min - 1), max: max + 1 };
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [products]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const { min, max } = bounds;
    const lo =
      typeof draft.minPrice === 'number' ? Math.min(Math.max(draft.minPrice, min), max) : min;
    const hi =
      typeof draft.maxPrice === 'number' ? Math.min(Math.max(draft.maxPrice, min), max) : max;
    setPriceLo(lo);
    setPriceHi(Math.max(lo, hi));
  }, [bounds, draft.minPrice, draft.maxPrice, open]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const brands = useMemo(() => {
    let list = products;
    if (draft.categories.length) {
      list = list.filter((p) => draft.categories.includes(p.category));
    }
    const set = new Set<string>();
    for (const p of list) {
      if (p.brand) set.add(p.brand);
    }
    return [...set].sort();
  }, [products, draft.categories]);

  const models = useMemo(() => {
    let list = products;
    if (draft.categories.length) {
      list = list.filter((p) => draft.categories.includes(p.category));
    }
    if (draft.brands.length) {
      list = list.filter((p) => p.brand && draft.brands.includes(p.brand));
    }
    const set = new Set<string>();
    for (const p of list) {
      if (p.model) set.add(p.model);
    }
    return [...set].sort();
  }, [products, draft.categories, draft.brands]);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setOpen(false), LEAVE_MS);
  }, [clearLeaveTimer]);

  const onEnterZone = useCallback(() => {
    clearLeaveTimer();
    setOpen(true);
  }, [clearLeaveTimer]);

  const onLeaveZone = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  useEffect(() => () => clearLeaveTimer(), [clearLeaveTimer]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearLeaveTimer();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, clearLeaveTimer]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      const el = hostRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  const apply = () => {
    const next: ProductListFilters = {
      ...draft,
      minPrice: priceLo > bounds.min ? priceLo : undefined,
      maxPrice: priceHi < bounds.max ? priceHi : undefined,
    };
    if (priceLo <= bounds.min && priceHi >= bounds.max) {
      next.minPrice = undefined;
      next.maxPrice = undefined;
    }
    const q = buildProductFiltersSearchParams(next).toString();
    navigate(q ? `${ROUTES.PRODUCTS}?${q}` : ROUTES.PRODUCTS);
    setOpen(false);
  };

  const clearAll = () => {
    setDraft({
      categories: [],
      brands: [],
      models: [],
      search: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'relevance',
    });
    setPriceLo(bounds.min);
    setPriceHi(bounds.max);
    navigate(ROUTES.PRODUCTS);
    setOpen(false);
  };

  const setSort = (sortBy: SortByOption) => setDraft((d) => ({ ...d, sortBy }));

  const onLowChange = (v: number) => {
    const next = Math.min(Math.max(v, bounds.min), priceHi);
    setPriceLo(next);
  };

  const onHighChange = (v: number) => {
    const next = Math.max(Math.min(v, bounds.max), priceLo);
    setPriceHi(next);
  };

  const hasActiveUrl =
    urlFilters.categories.length > 0 ||
    urlFilters.brands.length > 0 ||
    urlFilters.models.length > 0 ||
    urlFilters.search ||
    typeof urlFilters.minPrice === 'number' ||
    typeof urlFilters.maxPrice === 'number' ||
    (urlFilters.sortBy && urlFilters.sortBy !== 'relevance');

  const toggleFiltersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearLeaveTimer();
    setOpen((v) => !v);
  };

  return (
    <div ref={hostRef} className="products-mega-host">
      <div
        className="products-mega-trigger-wrap"
        onMouseEnter={onEnterZone}
        onMouseLeave={onLeaveZone}
      >
        <div className="products-mega-trigger-cluster">
          <NavLink
            to={ROUTES.PRODUCTS}
            end
            className={({ isActive }) =>
              [
                'products-mega-trigger',
                hasActiveUrl ? 'has-filters' : '',
                isActive || hasActiveUrl ? 'is-route-active' : '',
              ]
                .filter(Boolean)
                .join(' ')
            }
          >
            <span className="products-mega-trigger-label">Produse</span>
            <span className="products-mega-trigger-hint" aria-hidden>
              ▾
            </span>
          </NavLink>
          <button
            type="button"
            id="products-mega-filtre-trigger"
            className={`products-mega-filtre-btn ${open ? 'is-open' : ''} ${hasActiveUrl ? 'has-filters' : ''}`}
            aria-expanded={open}
            aria-controls="products-mega-panel"
            onClick={toggleFiltersClick}
          >
            Filtre
            <span className="products-mega-filtre-chevron" aria-hidden>
              ▾
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="products-mega-panel"
          className="products-mega-panel"
          onMouseEnter={onEnterZone}
          onMouseLeave={onLeaveZone}
          role="region"
          aria-label="Filtre catalog"
        >
          <div className="products-mega-panel-inner">
            {loading ? (
              <div className="products-mega-loading">Se încarcă filtrele…</div>
            ) : (
              <>
                <div className="products-mega-columns">
                  <div className="products-mega-col">
                    <h3 className="products-mega-col-title">Căutare &amp; sortare</h3>
                    <label className="products-mega-label">Căutare</label>
                    <input
                      type="text"
                      className="products-mega-input"
                      placeholder="Nume, descriere, brand, model…"
                      value={draft.search || ''}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, search: e.target.value || undefined }))
                      }
                    />
                    <label className="products-mega-label">Sortare</label>
                    <select
                      className="products-mega-select"
                      value={draft.sortBy}
                      onChange={(e) => setSort(e.target.value as SortByOption)}
                    >
                      <option value="relevance">Relevanță</option>
                      <option value="priceAsc">Preț crescător</option>
                      <option value="priceDesc">Preț descrescător</option>
                      <option value="nameAsc">Nume A–Z</option>
                      <option value="newest">Cele mai noi</option>
                    </select>
                  </div>

                  <div className="products-mega-col">
                    <h3 className="products-mega-col-title">Categorii</h3>
                    <ul className="products-mega-options">
                      {categories.map((c) => (
                        <li key={c}>
                          <label className="products-mega-option">
                            <input
                              type="checkbox"
                              checked={draft.categories.includes(c)}
                              onChange={() =>
                                setDraft((d) => ({
                                  ...d,
                                  categories: toggleInList(d.categories, c),
                                }))
                              }
                            />
                            <span>{c}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {categories.length === 0 && (
                      <p className="products-mega-empty">Nu există categorii.</p>
                    )}
                  </div>

                  <div className="products-mega-col">
                    <h3 className="products-mega-col-title">Brand</h3>
                    <ul className="products-mega-options products-mega-options-scroll">
                      {brands.map((b) => (
                        <li key={b}>
                          <label className="products-mega-option">
                            <input
                              type="checkbox"
                              checked={draft.brands.includes(b)}
                              onChange={() =>
                                setDraft((d) => ({
                                  ...d,
                                  brands: toggleInList(d.brands, b),
                                }))
                              }
                            />
                            <span>{b}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {brands.length === 0 && (
                      <p className="products-mega-empty">Selectează categorii sau lasă gol pentru toate.</p>
                    )}
                  </div>

                  <div className="products-mega-col">
                    <h3 className="products-mega-col-title">Specificații (model)</h3>
                    <ul className="products-mega-options products-mega-options-scroll">
                      {models.map((m) => (
                        <li key={m}>
                          <label className="products-mega-option">
                            <input
                              type="checkbox"
                              checked={draft.models.includes(m)}
                              onChange={() =>
                                setDraft((d) => ({
                                  ...d,
                                  models: toggleInList(d.models, m),
                                }))
                              }
                            />
                            <span>{m}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {models.length === 0 && (
                      <p className="products-mega-empty">Ajustează categoria / brandul pentru modele.</p>
                    )}
                  </div>

                  <div className="products-mega-col products-mega-col-price">
                    <h3 className="products-mega-col-title">Interval preț / zi</h3>
                    <p className="products-mega-price-readout">
                      {formatCurrency(priceLo)} – {formatCurrency(priceHi)}
                    </p>
                    <div className="products-mega-dual-range">
                      <div
                        className="products-mega-dual-track"
                        style={
                          {
                            '--p1': `${((priceLo - bounds.min) / (bounds.max - bounds.min || 1)) * 100}%`,
                            '--p2': `${((priceHi - bounds.min) / (bounds.max - bounds.min || 1)) * 100}%`,
                          } as React.CSSProperties
                        }
                      />
                      <input
                        type="range"
                        className="products-mega-range products-mega-range-min"
                        min={bounds.min}
                        max={bounds.max}
                        value={priceLo}
                        onChange={(e) => onLowChange(Number(e.target.value))}
                      />
                      <input
                        type="range"
                        className="products-mega-range products-mega-range-max"
                        min={bounds.min}
                        max={bounds.max}
                        value={priceHi}
                        onChange={(e) => onHighChange(Number(e.target.value))}
                      />
                    </div>
                    <p className="products-mega-hint">
                      Catalog: {bounds.min} – {bounds.max} RON/zi
                    </p>
                  </div>
                </div>

                <div className="products-mega-footer">
                  <button type="button" className="btn btn-secondary" onClick={clearAll}>
                    Șterge tot
                  </button>
                  <button type="button" className="btn btn-primary" onClick={apply}>
                    Aplică
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsMegaMenu;
