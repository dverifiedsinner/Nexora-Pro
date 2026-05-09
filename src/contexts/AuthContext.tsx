import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  type Unsubscribe,
  collection,
  query,
  where,
  orderBy,
  limit 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface UserBalances {
  main: number;
  bonus: number;
  referral: number;
  investment: number;
}

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  balances: UserBalances;
  referralCode: string;
  referredBy: string | null;
  isAdmin: boolean;
  createdAt: any;
  transactions?: any[];
  enrolledCourses?: string[];
  profileUpdated?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: Unsubscribe | null = null;
    let unsubscribeTxs: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }
      if (unsubscribeTxs) {
        unsubscribeTxs();
        unsubscribeTxs = null;
      }

      if (currentUser) {
        setLoading(true);
        console.log(`[Auth] User detected: ${currentUser.email} (${currentUser.uid})`);
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef).catch(e => {
            console.error("[Auth] Initial Profile Fetch Failed", e);
            handleFirestoreError(e, OperationType.GET, `users/${currentUser.uid}`);
          });

          if (!userSnap.exists()) {
            console.log("[Auth] Profile not found. Initializing...");
            const referredBy = localStorage.getItem('referredBy');
            const isBootstrapAdmin = currentUser.email?.toLowerCase() === 'denacchy@gmail.com';
            
            const newUserData: UserData = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Member',
              photoURL: currentUser.photoURL,
              balances: {
                main: 0,
                bonus: 1000,
                referral: 0,
                investment: 0
              },
              referralCode: `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
              referredBy: referredBy,
              isAdmin: isBootstrapAdmin,
              createdAt: serverTimestamp(),
            };

            await setDoc(userRef, newUserData).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${currentUser.uid}`));
            localStorage.removeItem('referredBy');

            if (isBootstrapAdmin) {
              console.log("[Auth] Bootstrapping SuperAdmin privileges...");
              await setDoc(doc(db, 'admins', currentUser.uid), { email: currentUser.email }).catch(e => {
                 console.warn("[Auth] Admin doc creation warning (may already exist)", e);
              });
            }
          } else {
            // Ensure flag is up to date for bootstrap user
            const isBootstrapAdmin = currentUser.email?.toLowerCase() === 'denacchy@gmail.com';
            if (isBootstrapAdmin && !userSnap.data().isAdmin) {
              console.log("[Auth] Rectifying missing Admin flag for SuperUser");
              await setDoc(userRef, { isAdmin: true }, { merge: true });
              await setDoc(doc(db, 'admins', currentUser.uid), { email: currentUser.email }, { merge: true });
            }
          }

          // Real-time listener for profile
          unsubscribeUserDoc = onSnapshot(userRef, (userDoc) => {
            if (userDoc.exists()) {
              const uData = userDoc.data() as UserData;
              setUserData(prev => prev ? { ...uData, transactions: prev.transactions } : { ...uData, transactions: [] });
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          });

          // Real-time listener for transactions
          const txQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
          );

          unsubscribeTxs = onSnapshot(txQuery, (txSnap) => {
            const txs = txSnap.docs.map(t => ({
              ...t.data(),
              id: t.id,
              time: t.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            }));
            setUserData(prev => prev ? { ...prev, transactions: txs } : null);
          }, (error) => {
            console.error("TX Fetch Error:", error);
          });

        } catch (error) {
          console.error('Error fetching/creating user profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      if (unsubscribeTxs) unsubscribeTxs();
    };
  }, []);

  const refreshUserData = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data() as UserData);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signIn,
      signUp,
      signOut,
      refreshUserData,
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
