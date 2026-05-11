export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  HELP: '/ajutor',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_AND_CONDITIONS: '/terms-and-conditions',
  SUPPORT: '/support',
  COOKIE_PREFERENCES: '/cookie-preferences',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CREATE_RENTAL: '/rentals/create',
  MY_RENTALS: '/rentals/my',
  RENTAL_DETAIL: '/rentals/:id',
  RENTAL_BASELINE_PHOTOS: '/rentals/:id/start-photos',
  RENTAL_RETURN_PHOTOS: '/rentals/:id/return-photos',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_RENTALS: '/admin/rentals',
  SUPEROWNER_STATS: '/superowner/statistici',
  PAYMENT: '/payment',
  ACCOUNT: '/cont',
} as const;

export const RENTAL_STATUSES: Record<string, string> = {
  PENDING: 'În așteptare',
  CONFIRMED: 'Confirmată',
  ACTIVE: 'Activă',
  RETURNED: 'Returnată',
  COMPLETED: 'Finalizată',
  CANCELED: 'Anulată',
  OVERDUE: 'Restanță',
};

export const INVENTORY_STATUSES: Record<string, string> = {
  AVAILABLE: 'Disponibil',
  ON_RENTAL: 'Închiriat',
  MAINTENANCE: 'În întreținere',
  LOST: 'Pierdut',
  PENDING_RETURN: 'Așteaptă returnare',
};
