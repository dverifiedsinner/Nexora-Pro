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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserData(currentUser.id);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create profile
        const session = await supabase.auth.getSession();
        const user = session.data.session?.user;
        
        if (user) {
          const referredBy = localStorage.getItem('referredBy');
          const newUser: UserData = {
            uid: user.id,
            email: user.email ?? null,
            displayName: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
            photoURL: user.user_metadata?.avatar_url ?? null,
            balances: {
              main: 0,
              bonus: 1000,
              referral: 0,
              investment: 0
            },
            referralCode: `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            referredBy: referredBy || null,
            isAdmin: false,
            createdAt: new Date().toISOString()
          };

          const { data: createdData, error: createError } = await supabase
            .from('profiles')
            .insert([newUser])
            .select()
            .single();

          if (createError) throw createError;
          setUserData(createdData);
          localStorage.removeItem('referredBy');
        }
      } else if (data) {
        setUserData(data);
      }
    } catch (err) {
      console.error('Supabase profile error:', err);
    } finally {
      setLoading(false);
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authData.user) {
      const referredBy = localStorage.getItem('referredBy');
      const newUser: UserData = {
        uid: authData.user.id,
        email: authData.user.email ?? null,
        displayName: username,
        photoURL: null,
        balances: {
          main: 0,
          bonus: 1000,
          referral: 0,
          investment: 0
        },
        referralCode: `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        referredBy: referredBy || null,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        transactions: [],
        enrolledCourses: []
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([newUser]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Even if profile fails, user is signed up in auth
      }
      localStorage.removeItem('referredBy');
    }
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
