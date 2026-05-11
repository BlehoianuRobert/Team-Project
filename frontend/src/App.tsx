import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import { ROUTES } from './utils/constants';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import MyRentalsPage from './pages/MyRentalsPage';
import RentalDetailPage from './pages/RentalDetailPage';
import CreateRentalPage from './pages/CreateRentalPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminRentalsPage from './pages/AdminRentalsPage';
import PaymentPage from './pages/PaymentPage';
import HelpPage from './pages/HelpPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import SupportPage from './pages/SupportPage';
import CookiePreferencesPage from './pages/CookiePreferencesPage';
import SuperOwnerStatisticsPage from './pages/SuperOwnerStatisticsPage';
import AccountPage from './pages/AccountPage';
import RentalBaselinePhotosPage from './pages/RentalBaselinePhotosPage';
import RentalReturnPhotosPage from './pages/RentalReturnPhotosPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.PRODUCTS} replace />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.HELP} element={<HelpPage />} />
            <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
            <Route path={ROUTES.TERMS_AND_CONDITIONS} element={<TermsAndConditionsPage />} />
            <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
            <Route path={ROUTES.COOKIE_PREFERENCES} element={<CookiePreferencesPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* Protected Routes - Client */}
            <Route
              path="/rentals/create"
              element={
                <ProtectedRoute>
                  <CreateRentalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.MY_RENTALS}
              element={
                <ProtectedRoute>
                  <MyRentalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rentals/:id"
              element={
                <ProtectedRoute>
                  <RentalDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rentals/:id/start-photos"
              element={
                <ProtectedRoute>
                  <RentalBaselinePhotosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rentals/:id/return-photos"
              element={
                <ProtectedRoute>
                  <RentalReturnPhotosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:id"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ACCOUNT}
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />

            {/* SuperOwner: panou complet. Admin/Vendor: doar produse în catalog */}
            <Route
              path={ROUTES.ADMIN}
              element={
                <ProtectedRoute requireSuperOwner>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_PRODUCTS}
              element={
                <ProtectedRoute requireCatalogEditor>
                  <AdminProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_RENTALS}
              element={
                <ProtectedRoute requireSuperOwner>
                  <AdminRentalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.SUPEROWNER_STATS}
              element={
                <ProtectedRoute requireSuperOwner>
                  <SuperOwnerStatisticsPage />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to={ROUTES.PRODUCTS} replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
