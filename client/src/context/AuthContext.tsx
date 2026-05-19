import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Ensure all Axios requests send and receive cookies automatically
axios.defaults.withCredentials = true;

interface User {
  email: string;
  name?: string;
  age?: number;
  preferredSingers?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/verify');
        setUser(res.data);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async () => {
    // Optionally fetch user details again after login
    try {
      const res = await axios.get('http://localhost:5000/api/verify');
      setUser(res.data);
    } catch {
      setUser({ email: 'user@example.com' }); // Fallback
    }
    navigate('/profile');
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout');
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
