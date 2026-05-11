import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Admin sau SuperOwner (nu include vendor) */
  requireAdmin?: boolean;
  requireSuperOwner?: boolean;
  /** Admin, SuperOwner sau Vendor — gestionare catalog */
  requireCatalogEditor?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireSuperOwner = false,
  requireCatalogEditor = false,
}) => {
  const { isAuthenticated, isAdmin, isSuperOwner, canEditCatalog, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTES.PRODUCTS} replace />;
  }

  if (requireSuperOwner && !isSuperOwner) {
    return <Navigate to={ROUTES.PRODUCTS} replace />;
  }

  if (requireCatalogEditor && !canEditCatalog) {
    return <Navigate to={ROUTES.PRODUCTS} replace />;
  }

  return <>{children}</>;
};
