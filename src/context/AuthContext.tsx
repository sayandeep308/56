import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isDemoAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  enableDemoAdmin: () => void;
  disableDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  isDemoAdmin: false,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  enableDemoAdmin: () => {},
  disableDemoAdmin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(() => {
    return localStorage.getItem('artisancraft_demo_admin') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check if user is known admin email or has document in admins
        const isEmailAdmin = user.email === 'sayandipbera42@gmail.com' || user.email === 'deep.007.sayan@gmail.com';
        if (isEmailAdmin) {
          setIsAdmin(true);
          try {
            // Guarantee admin doc exists
            await setDoc(doc(db, 'admins', user.uid), {
              uid: user.uid,
              email: user.email,
              role: 'super_admin',
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          } catch (e) {
            console.warn('Could not update admin doc:', e);
          }
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            setIsAdmin(adminDoc.exists());
          } catch {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email === 'sayandipbera42@gmail.com' || user.email === 'deep.007.sayan@gmail.com') {
        setIsAdmin(true);
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: user.email,
            role: 'super_admin',
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    setIsDemoAdmin(false);
    localStorage.removeItem('artisancraft_demo_admin');
  };

  const enableDemoAdmin = () => {
    setIsDemoAdmin(true);
    localStorage.setItem('artisancraft_demo_admin', 'true');
  };

  const disableDemoAdmin = () => {
    setIsDemoAdmin(false);
    localStorage.removeItem('artisancraft_demo_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin: isAdmin || isDemoAdmin,
        isDemoAdmin,
        loading,
        loginWithGoogle,
        logout,
        enableDemoAdmin,
        disableDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
