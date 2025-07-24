import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

interface User {
  id: string;
  email?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ supabase: any; children: React.ReactNode }> = ({ supabase, children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        const storedUser = localStorage.getItem('tonjam_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('tonjam_user', JSON.stringify(userData));
  };

  const loginAsGuest = async () => {
    const guestUser = { id: `guest_${Date.now()}`, isGuest: true }; // Unique guest ID
    setUser(guestUser);
    localStorage.setItem('tonjam_user', JSON.stringify(guestUser));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('tonjam_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
