import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  createdAt: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const userDataRef = React.useRef<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = React.useRef<string | null>(null);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: if loading is still true after 10 seconds, force clear it
    // to prevent complete screen lock, though this is a fallback.
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout triggered.');
        setLoading(false);
      }
    }, 10000);

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchUserData(currentUser.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (event === 'SIGNED_OUT') {
        setUserData(null);
        fetchingRef.current = null;
        setLoading(false);
        return;
      }

      if (currentUser) {
        // Debounce/Prevent duplicate fetches
        if (fetchingRef.current !== currentUser.id || !userDataRef.current) {
          await fetchUserData(currentUser.id);
        }
      } else {
        setUserData(null);
        fetchingRef.current = null;
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []); // Dependencies empty to run once on mount

  const fetchUserData = async (uid: string) => {
    // Return if already fetching THIS specific UID and we have data
    if (fetchingRef.current === uid && userDataRef.current) {
      setLoading(false);
      return;
    }
    
    // If we are already mid-fetch for this exact user, just let the previous one finish
    if (fetchingRef.current === uid) return;
    
    fetchingRef.current = uid;
    setLoading(true);
    
    try {
      console.log('Fetching user data for:', uid);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();

      if (error) {
        console.error('Supabase profile fetch error:', error);
      }

      if (!data) {
        console.log('No profile found, checking session for creation...');
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        
        if (currentUser && currentUser.id === uid) {
          const referredBy = localStorage.getItem('referredBy');
          
          const newUser = {
            uid: currentUser.id,
            email: currentUser.email ?? null,
            displayName: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
            photoURL: currentUser.user_metadata?.avatar_url || null,
            balances: {
              main: 0,
              bonus: 500,
              referral: 0,
              investment: 0
            },
            referralCode: `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            referredBy: referredBy,
            isAdmin: false,
            createdAt: new Date().toISOString(),
            transactions: [],
            enrolledCourses: []
          };

          console.log('Creating new profile node...');
          const { data: createdData, error: createError } = await supabase
            .from('profiles')
            .upsert([newUser], { onConflict: 'uid' })
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Profile creation error:', createError);
          } else if (createdData) {
            setUserData(createdData as UserData);
          }
          localStorage.removeItem('referredBy');
        }
      } else {
        // Special case: Promote specific user to admin if they are the owner/developer
        if (data.email === 'denacchy@gmail.com' && !data.isAdmin) {
          const { data: updatedData, error: updateError } = await supabase
            .from('profiles')
            .update({ isAdmin: true })
            .eq('uid', uid)
            .select()
            .maybeSingle();
          
          setUserData((updatedData || data) as UserData);
        } else {
          setUserData(data as UserData);
        }
      }
    } catch (err) {
      console.error('Critical auth flow error:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = null;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
        }
      }
    });

    if (authError) {
      if (authError.message.includes('rate limit')) {
        throw new Error('Action blocked by security protocols. Please wait 15 minutes before the next attempt or use a different network node.');
      }
      throw authError;
    }
    
    // We don't manually insert the profile here anymore.
    // fetchUserData handles it when onAuthStateChange fires.
    // This avoids double-inserts and race conditions.
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signIn,
      signUp,
      signOut,
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
