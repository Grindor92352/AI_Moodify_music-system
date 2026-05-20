import { createContext } from 'react';

export interface User {
  email: string;
  name?: string;
  age?: number;
  preferredSingers?: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
