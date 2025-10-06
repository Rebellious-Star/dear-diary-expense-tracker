import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  username: string;
  forumWarnings: number;
  isBanned: boolean;
  banExpiry?: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
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

  const USERS_KEY = 'users';

  const readUsers = (): Array<User & { passwordHash: string }> => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const writeUsers = (users: Array<User & { passwordHash: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  useEffect(() => {
    // Check for stored auth token on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you'd validate the token with the server
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Find user and verify password
      const users = readUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!existing) return false;
      const ok = bcrypt.compareSync(password, existing.passwordHash);
      if (!ok) return false;

      const signedIn: User = {
        id: existing.id,
        email: existing.email,
        username: existing.username,
        forumWarnings: existing.forumWarnings || 0,
        isBanned: existing.isBanned || false,
        banExpiry: existing.banExpiry ? new Date(existing.banExpiry) : undefined,
      };

      setUser(signedIn);
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userData', JSON.stringify(signedIn));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Basic checks
      if (!email || !password || !username) return false;
      const users = readUsers();
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) return false;

      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser: User & { passwordHash: string } = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        email,
        username,
        forumWarnings: 0,
        isBanned: false,
        passwordHash,
      };
      const updated = [newUser, ...users];
      writeUsers(updated);

      const signedIn: User = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        forumWarnings: 0,
        isBanned: false,
      };
      setUser(signedIn);
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userData', JSON.stringify(signedIn));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
