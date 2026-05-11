import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { User, RegisterRequest, JwtResponse, AuthContextType } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      // Load user and token from localStorage on mount
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);

        // Validate stored token against backend to avoid stale sessions after restarts/config changes.
        await profileService.getProfile();
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const login = async (username: string, password: string): Promise<JwtResponse> => {
    const response: JwtResponse = await authService.login({ username, password });

    const userData: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      firstName: '',
      lastName: '',
      role: response.role,
      verified: true,
    };

    setToken(response.token);
    setUser(userData);

    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    return response;
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      await authService.register(data);
      // After registration, user needs to confirm email before logging in
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // Check if user has admin or superowner role
  const hasAdminRole = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPEROWNER';
  const hasSuperOwnerRole = user?.role === 'ROLE_SUPEROWNER';
  const vendorAdminOnly = user?.role === 'ROLE_ADMIN';
  const canEditCatalog =
    user?.role === 'ROLE_ADMIN' ||
    user?.role === 'ROLE_SUPEROWNER' ||
    user?.role === 'ROLE_VENDOR';

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: hasAdminRole,
    isSuperOwner: hasSuperOwnerRole,
    isVendorAdminOnly: vendorAdminOnly,
    canEditCatalog,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
