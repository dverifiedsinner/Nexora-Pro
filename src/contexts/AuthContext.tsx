import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  balances: {
    main: number;
    bonus: number;
    referral: number;
    investment: number;
  };
  referralCode: string;
  referredBy: string | null;
  isAdmin: boolean;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        
        // Initial check/setup
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          const referredBy = localStorage.getItem('referredBy');
          const newUser: UserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            balances: {
              main: 0,
              bonus: 500, // Welcome bonus
              referral: 0,
              investment: 0
            },
            referralCode: `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            referredBy: referredBy || null,
            isAdmin: false,
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, newUser);
          localStorage.removeItem('referredBy');
        }

        // Listen for real-time updates
        const unsubUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore user data error:", error);
          setLoading(false);
        });

        return () => unsubUser();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signIn: async () => {}, // Handled in components
      signOut: () => auth.signOut(),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
