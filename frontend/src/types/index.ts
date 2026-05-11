// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  verified: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: 'client' | 'vendor';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  dailyPrice: number;
  category: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  discountPercent?: number;
  aiTags?: string;
  weightKg?: number;
  thicknessMm?: number;
  colorDetected?: string;
  detectedBrand?: string;
  detectedModel?: string;
  modelConfidence?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  username: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductReviewSummary {
  productId: number;
  averageRating: number;
  reviewCount: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  dailyPrice: number;
  category: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  discountPercent?: number;
}

export interface Inventory {
  id: number;
  serialNumber: string;
  status: 'AVAILABLE' | 'LOST' | 'MAINTENANCE' | 'ON_RENTAL' | 'PENDING_RETURN';
  productId: number;
  product?: Product;
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryRequest {
  productId: number;
  serialNumber: string;
}

// Rental Types
export type RentalStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'ACTIVE' 
  | 'RETURNED' 
  | 'COMPLETED' 
  | 'CANCELED' 
  | 'OVERDUE';

export type ItemCondition = 'PENDING_CHECK' | 'GOOD' | 'DAMAGED';
export type DeliveryType = 'PERSONAL_PICKUP' | 'DELIVERY';
export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';

export interface Rental {
  id: number;
  userId: number;
  renterUsername?: string;
  renterName?: string;
  renterEmail?: string;
  inventoryId: number;
  inventoryUnit?: Inventory;
  productName?: string;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  status: RentalStatus;
  totalPrice: number;
  depositAmount: number;
  depositReturned: boolean;
  itemCondition: ItemCondition;
  conditionNotes?: string;
  createdAt: string;
  // Delivery/Pickup fields
  deliveryType?: DeliveryType;
  awbNumber?: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
  deliveryStatus?: DeliveryStatus;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  pickupDate?: string;
  returnRequested?: boolean;
  flaggedForReview?: boolean;
  aiComparisonScore?: number;
  aiPredictedCondition?: string;
  aiLastRunAt?: string;
}

export interface RentalRequest {
  inventoryId: number;
  startDate: string;
  endDate: string;
  // Delivery/Pickup fields
  deliveryType?: DeliveryType;
  deliveryAddress?: string;
  deliveryPhone?: string;
  twoDayDelivery?: boolean;
}

export interface ConditionCheckRequest {
  condition: ItemCondition;
  notes?: string;
}

export interface ReviewReturnDecisionRequest {
  condition: ItemCondition;
  notes?: string;
  markCompleted: boolean;
}

export interface RentalPhotoUploadResponse {
  success: boolean;
  message: string;
  imageUrl: string;
}

export interface RentalImage {
  id: number;
  imageUrl: string;
  createdAt: string;
  uploadedBy: string;
}

export interface RentalAiComparison {
  id: number;
  score?: number;
  predictedCondition?: string;
  needsReview: boolean;
  status: string;
  message?: string;
  createdAt: string;
  triggeredBy: string;
}

export interface RentalReturnWorkflow {
  minRequiredReturnPhotos: number;
  baselinePhotoCount: number;
  returnPhotoCount: number;
  returnRequested: boolean;
  flaggedForReview: boolean;
  aiComparisonScore?: number;
  aiPredictedCondition?: string;
  aiLastRunAt?: string;
  baselinePhotos: RentalImage[];
  returnPhotos: RentalImage[];
  latestComparison?: RentalAiComparison;
  latestBaselineVerification?: RentalPhotoVerification;
  latestReturnVerification?: RentalPhotoVerification;
}

export interface RentalPhotoVerification {
  id: number;
  stage: 'BASELINE' | 'RETURN';
  damageScore?: number;
  newDamageScore?: number;
  modelMatchScore?: number;
  ocrText?: string;
  powerOnDetected?: boolean;
  errorCodesDetected?: boolean;
  errorCodes?: string;
  detectedBrand?: string;
  detectedModel?: string;
  serialNumberDetected?: string;
  verdict: 'MATCH' | 'MISMATCH' | 'REVIEW_REQUIRED' | 'FAILED';
  needsReview: boolean;
  message?: string;
  createdAt: string;
}

// Payment Types
export interface PaymentIntentRequest {
  rentalId: number;
  amount: number;
  currency?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// API Response Types
export interface ApiResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface ProductFinancialStats {
  productId: number;
  productName: string;
  category?: string;
  brand?: string;
  model?: string;
  rentalCount: number;
  income: number;
  expenses: number;
  netProfit: number;
}

export interface SuperOwnerStatistics {
  totalIncome: number;
  totalExpenses: number;
  totalNetProfit: number;
  totalRentals: number;
  products: ProductFinancialStats[];
}

export interface ProviderDeviceIncomeMetric {
  productId: number;
  productName: string;
  totalRevenue: number;
  rentalCount: number;
}

export interface ProviderMonthlyIncome {
  month: string;
  income: number;
}

export interface ProviderDashboard {
  totalIncome: number;
  totalRentals: number;
  devices: ProviderDeviceIncomeMetric[];
  monthly: ProviderMonthlyIncome[];
}

// Auth Context Types
export interface UserProfile {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  billingFullName?: string;
}

export interface ProfilePatchPayload {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  billingFullName?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<JwtResponse>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperOwner: boolean;
  /** ROLE_ADMIN fără SuperOwner — poate gestiona doar produse în catalog */
  isVendorAdminOnly: boolean;
  /** Admin, SuperOwner sau Vendor înregistrat — acces la pagina de produse */
  canEditCatalog: boolean;
  isLoading: boolean;
}
