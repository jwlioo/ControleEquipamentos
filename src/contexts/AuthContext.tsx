import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { LoginRequest, RegisterRequest } from '../types';

interface AuthContextData {
  isAuthenticated: boolean;
  usuario: string | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState<string | null>(localStorage.getItem('usuario'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const tok = res.token ?? (res as any).accessToken ?? (res as any).jwt ?? '';
      localStorage.setItem('token', tok);
      const nomeUsuario = res.usuario ?? data.email;
      localStorage.setItem('usuario', nomeUsuario);
      setToken(tok);
      setUsuario(nomeUsuario);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    try {
      await authApi.register(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) setToken(stored);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, usuario, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
