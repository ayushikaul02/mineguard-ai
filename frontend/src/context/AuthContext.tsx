import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginApi, getMeApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  quickLogin: (role: 'inspector' | 'manager' | 'admin' | 'auditor') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mineguard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('mineguard_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const userData = await getMeApi();
          setUser(userData);
          localStorage.setItem('mineguard_user', JSON.stringify(userData));
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (username: string, password: string) => {
    const data = await loginApi({ username, password });
    localStorage.setItem('mineguard_token', data.access_token);
    localStorage.setItem('mineguard_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('mineguard_token');
    localStorage.removeItem('mineguard_user');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (role: 'inspector' | 'manager' | 'admin' | 'auditor') => {
    const pass = `${role}123`;
    await login(role, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
