import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { refreshSession } from '../api/client';
import { AuthContext, type User } from './authContextValue';

function stripValidFlag(data: User & { valid?: boolean }): User {
  const { valid: _omit, ...profile } = data;
  void _omit;
  return profile;
}

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await api.get<User & { valid?: boolean }>('/api/verify');
    return stripValidFlag(res.data);
  } catch {
    const refreshed = await refreshSession();
    if (!refreshed) return null;
    const res = await api.get<User & { valid?: boolean }>('/api/verify');
    return stripValidFlag(res.data);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const profile = await fetchCurrentUser();
        setUser(profile);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async () => {
    const profile = await fetchCurrentUser();
    setUser(profile);
    navigate('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/api/logout');
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      setUser(null);
      navigate('/signin');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
