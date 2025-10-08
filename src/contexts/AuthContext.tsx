import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setAuthToken } from '../api';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  username: string;
  forumWarnings: number;
  isBanned: boolean;
  banExpiry?: Date;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  requestResetOtp: (email: string) => Promise<{ success: boolean; cooldownMs?: number; expiresAt?: number; emailSent?: boolean; errorMessage?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  requestOtp: (email: string) => Promise<{ success: boolean; cooldownMs?: number; expiresAt?: number; /** devOnly */ code?: string; emailSent?: boolean; errorMessage?: string }>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
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
  const OTP_KEY = 'otpStore';

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

  type OtpEntry = {
    code: string;
    expiresAt: number; // epoch ms
    lastSentAt: number; // epoch ms
    verified: boolean;
  };

  const readOtpStore = (): Record<string, OtpEntry> => {
    try {
      const raw = localStorage.getItem(OTP_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  const writeOtpStore = (store: Record<string, OtpEntry>) => {
    localStorage.setItem(OTP_KEY, JSON.stringify(store));
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('apiToken');
      const userData = localStorage.getItem('userData');
      if (token) setAuthToken(token);
      if (userData) setUser(JSON.parse(userData));
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      const { token, user: u } = res.data;
      setAuthToken(token);
      const signedIn: User = { 
        id: u.id, 
        email: u.email, 
        username: u.username, 
        forumWarnings: 0, 
        isBanned: u.isBanned || false, 
        banExpiry: u.banExpiry ? new Date(u.banExpiry) : undefined,
        isAdmin: u.role === 'admin' 
      };
      setUser(signedIn);
      localStorage.setItem('userData', JSON.stringify(signedIn));

      // Migrate any legacy global expenses to per-user key on first login
      try {
        const legacy = localStorage.getItem('expenses');
        const perKey = `expenses:${signedIn.id}`;
        const havePer = localStorage.getItem(perKey);
        if (legacy && !havePer) {
          localStorage.setItem(perKey, legacy);
          localStorage.removeItem('expenses');
        }
      } catch {}
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (email: string): Promise<{ success: boolean; cooldownMs?: number; expiresAt?: number; code?: string; emailSent?: boolean; errorMessage?: string }> => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return { success: false };
      const users = readUsers();
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      // For registration OTP, email must NOT already exist
      if (emailExists) return { success: false };

      const store = readOtpStore();
      const now = Date.now();
      const cooldownMs = 30_000; // 30s cooldown
      const ttlMs = 15 * 60_000; // 15 minutes expiry (align with template)
      const existing = store[email.toLowerCase()];
      if (existing && now - existing.lastSentAt < cooldownMs) {
        return { success: false, cooldownMs: cooldownMs - (now - existing.lastSentAt), expiresAt: existing.expiresAt };
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = now + ttlMs;
      store[email.toLowerCase()] = {
        code,
        expiresAt,
        lastSentAt: now,
        verified: false,
      };
      writeOtpStore(store);

      // Try sending email via EmailJS if available
      const w = window as any;
      if (w && w.emailjs && typeof w.emailjs.send === 'function') {
        try {
          // Optional: initialize if needed (EmailJS v3+ may auto-init)
          if (typeof w.emailjs.init === 'function') {
            const publicKey = (process.env.REACT_APP_EMAILJS_PUBLIC_KEY as string) || 'erbkC2RmaMPXfGCE2';
            if (publicKey) {
              try {
                // Try object form first (v4)
                w.emailjs.init({ publicKey });
              } catch {
                // Fallback to string form
                w.emailjs.init(publicKey);
              }
            }
          }
          const serviceId = (process.env.REACT_APP_EMAILJS_SERVICE_ID as string) || 'service_xg9cwnq';
          const templateId = (process.env.REACT_APP_EMAILJS_TEMPLATE_ID as string) || 'template_7bndh9q';
          if (serviceId && templateId) {
            await w.emailjs.send(serviceId, templateId, {
              // Match user's EmailJS template variables
              passcode: code,
              time: new Date(expiresAt).toLocaleString(),
              email: email,
              // Optional extras if your template uses them
              subject: 'Your Dear Diary OTP',
              message: `Your Dear Diary OTP is: ${code}. It expires in 15 minutes.`,
              reply_to: 'dhruveloper2005@gmail.com',
            });
            return { success: true, cooldownMs, expiresAt, emailSent: true };
          }
        } catch (err: any) {
          // Email send failed; still return success so user can retry, but include error
          return { success: true, cooldownMs, expiresAt, emailSent: false, errorMessage: err?.text || err?.message || 'Email send failed' };
        }
      }

      // EmailJS not available; return success without email sent
      return { success: true, cooldownMs, expiresAt, emailSent: false, errorMessage: 'Email service unavailable' };
    } catch {
      return { success: false };
    }
  };

  // Forgot password: allow OTP for existing email
  const requestResetOtp = async (email: string): Promise<{ success: boolean; cooldownMs?: number; expiresAt?: number; emailSent?: boolean; errorMessage?: string }> => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return { success: false };
      const users = readUsers();
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!emailExists) return { success: false };

      const store = readOtpStore();
      const now = Date.now();
      const cooldownMs = 30_000;
      const ttlMs = 15 * 60_000;
      const existing = store[email.toLowerCase()];
      if (existing && now - existing.lastSentAt < cooldownMs) {
        return { success: false, cooldownMs: cooldownMs - (now - existing.lastSentAt), expiresAt: existing.expiresAt };
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = now + ttlMs;
      store[email.toLowerCase()] = {
        code,
        expiresAt,
        lastSentAt: now,
        verified: false,
      };
      writeOtpStore(store);

      const w = window as any;
      try {
        if (w && w.emailjs && typeof w.emailjs.send === 'function') {
          if (typeof w.emailjs.init === 'function') {
            const publicKey = (process.env.REACT_APP_EMAILJS_PUBLIC_KEY as string) || 'erbkC2RmaMPXfGCE2';
            try { w.emailjs.init({ publicKey }); } catch { w.emailjs.init(publicKey); }
          }
          const serviceId = (process.env.REACT_APP_EMAILJS_SERVICE_ID as string) || 'service_xg9cwnq';
          const templateId = (process.env.REACT_APP_EMAILJS_RESET_TEMPLATE_ID as string) || (process.env.REACT_APP_EMAILJS_TEMPLATE_ID as string) || 'template_7bndh9q';
          await w.emailjs.send(serviceId, templateId, {
            passcode: code,
            time: new Date(expiresAt).toLocaleString(),
            email,
            subject: 'Your Dear Diary password reset code',
            message: `Your Dear Diary reset code is: ${code}. It expires in 15 minutes.`,
            reply_to: 'dhruveloper2005@gmail.com',
          });
          return { success: true, cooldownMs, expiresAt, emailSent: true };
        }
      } catch (err: any) {
        return { success: true, cooldownMs, expiresAt, emailSent: false, errorMessage: err?.text || err?.message };
      }
      return { success: true, cooldownMs, expiresAt, emailSent: false, errorMessage: 'Email service unavailable' };
    } catch {
      return { success: false };
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    try {
      const store = readOtpStore();
      const entry = store[email.toLowerCase()];
      if (!entry) return false;
      if (Date.now() > entry.expiresAt) return false;
      if (entry.code !== code) return false;

      const users = readUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (idx === -1) return false;
      const passwordHash = bcrypt.hashSync(newPassword, 10);
      users[idx] = { ...users[idx], passwordHash };
      writeUsers(users);
      entry.verified = true; // mark used
      writeOtpStore(store);
      return true;
    } catch {
      return false;
    }
  };

  const verifyOtp = async (email: string, code: string): Promise<boolean> => {
    try {
      const store = readOtpStore();
      const entry = store[email.toLowerCase()];
      if (!entry) return false;
      const now = Date.now();
      if (now > entry.expiresAt) return false;
      if (entry.code !== code) return false;
      entry.verified = true;
      writeOtpStore(store);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', { email, password, username });
      const { token, user: u } = res.data;
      setAuthToken(token);
      const signedIn: User = { 
        id: u.id, 
        email: u.email, 
        username: u.username, 
        forumWarnings: 0, 
        isBanned: u.isBanned || false, 
        banExpiry: u.banExpiry ? new Date(u.banExpiry) : undefined,
        isAdmin: u.role === 'admin' 
      };
      setUser(signedIn);
      localStorage.setItem('userData', JSON.stringify(signedIn));
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      // Log the actual error for debugging
      if (error.response?.data?.error) {
        console.error('Backend error:', error.response.data.error);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(undefined);
    localStorage.removeItem('userData');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    requestResetOtp,
    resetPassword,
    requestOtp,
    verifyOtp,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
