import React, { createContext, useContext, useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

/**
 * Lightweight local-credential admin auth.
 * - Default password: admin123 (changeable from Settings tab → stored in RTDB)
 * - Session persisted in localStorage so refreshes / tab switches never log out.
 * - No Firebase Auth popup; no domain allow-listing needed.
 */

const STORAGE_KEY = 'satarupa_admin_authenticated';

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  loginWithPassword: (password: string, correctPassword: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  loading: false,
  loginWithPassword: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const loginWithPassword = (password: string, correctPassword: string): boolean => {
    if (password === correctPassword) {
      setIsAdmin(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEY);
    // Also sign out of Firebase Auth silently (no-op if not signed in)
    signOut(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading: false, loginWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
