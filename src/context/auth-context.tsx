'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client';

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
}

const AuthContext = createContext<{
  user: User | null;
  session: any;
  loading: boolean;
  login: () => void;
  logout: () => void;
}>({
  user: null,
  session: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: any) => {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      try {
        const session: any = await authClient.getSession();

        setUser(session?.data?.user);
        setSession(session?.data?.session);
      } catch (error) {
        console.error('Error fetching session:', error);

        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setUser, setSession]);

  const login = async () => {
    setLoading(true);

    try {
      await authClient.signIn.social({
        provider: 'google',
      });
    } catch (error) {
      console.error('Login error:', error);

      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();

      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return <AuthContext.Provider value={{ user, session, loading, login, logout }}>{children}</AuthContext.Provider>;
};
