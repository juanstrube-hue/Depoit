import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { client } from '../lib/api';
import type { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('depoit_role');
    return (saved as UserRole) || 'arrendador';
  });

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.auth.me();
      if (response?.data) {
        setUser({
          id: response.data.id || response.data.sub || '',
          email: response.data.email || '',
          name: response.data.name || response.data.display_name || '',
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    client.auth.toLogin();
  };

  const logout = () => {
    client.auth.logout();
    setUser(null);
  };

  const handleSetRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('depoit_role', role);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    currentRole,
    setCurrentRole: handleSetRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};