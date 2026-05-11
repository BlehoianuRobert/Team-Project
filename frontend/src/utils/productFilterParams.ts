export type SortByOption = 'relevance' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'newest';

export interface ProductListFilters {
  categories: string[];
  brands: string[];
  models: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: SortByOption;
}

function splitList(value: string | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseProductFiltersFromSearchParams(searchParams: URLSearchParams): ProductListFilters {
  const categoriesParam = searchParams.get('categories');
  const legacyCategory = searchParams.get('category');
  const categories = categoriesParam
    ? splitList(categoriesParam)
    : legacyCategory
      ? [legacyCategory]
      : [];

  const brandsParam = searchParams.get('brands');
  const legacyBrand = searchParams.get('brand');
  const brands = brandsParam ? splitList(brandsParam) : legacyBrand ? [legacyBrand] : [];

  const modelsParam = searchParams.get('models');
  const legacyModel = searchParams.get('model');
  const models = modelsParam ? splitList(modelsParam) : legacyModel ? [legacyModel] : [];

  const sortRaw = searchParams.get('sortBy');
  const sortBy = (sortRaw as SortByOption) || 'relevance';

  return {
    categories,
    brands,
    models,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: ['relevance', 'priceAsc', 'priceDesc', 'nameAsc', 'newest'].includes(sortBy)
      ? sortBy
      : 'relevance',
  };
}

export function buildProductFiltersSearchParams(f: ProductListFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.categories.length) params.set('categories', f.categories.join(','));
  if (f.brands.length) params.set('brands', f.brands.join(','));
  if (f.models.length) params.set('models', f.models.join(','));
  if (f.search) params.set('search', f.search);
  if (typeof f.minPrice === 'number' && !Number.isNaN(f.minPrice)) params.set('minPrice', String(f.minPrice));
  if (typeof f.maxPrice === 'number' && !Number.isNaN(f.maxPrice)) params.set('maxPrice', String(f.maxPrice));
  if (f.sortBy && f.sortBy !== 'relevance') params.set('sortBy', f.sortBy);
  return params;
}
