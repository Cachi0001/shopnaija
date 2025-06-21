import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User } from "@/types";
import { AuthService } from "@/services/AuthService";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subdomain: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  setSubdomain: (subdomain: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subdomain, setSubdomainState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const setSubdomain = useCallback((newSubdomain: string | null) => {
    setSubdomainState(newSubdomain);
  }, []);

  // Extract subdomain from hostname
  useEffect(() => {
    const extractSubdomain = () => {
      const hostname = window.location.hostname;
      if (hostname.includes('growsmallbeez.vercel.app')) {
        const parts = hostname.split('.');
        if (parts.length > 2) {
          return parts[0];
        }
      }
      return null;
    };

    const detectedSubdomain = extractSubdomain();
    if (detectedSubdomain !== subdomain) {
      setSubdomain(detectedSubdomain);
    }
  }, [location.pathname, subdomain, setSubdomain]);

  // Auth state management
  useEffect(() => {
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (session) {
            const fetchedUser = await AuthService.getCurrentUser(session.user);
            setUser(fetchedUser);
            setSession(session);
            setIsSuperAdmin(fetchedUser?.role === 'superadmin');
            setIsAdmin(fetchedUser?.role === 'admin');

            // Redirect logic
            if (['/login', '/auth'].includes(location.pathname)) {
              let redirectPath = '/';
              if (fetchedUser?.role === 'superadmin') {
                redirectPath = '/dashboard';
              } else if (fetchedUser?.role === 'admin') {
                redirectPath = '/admin/dashboard';
              }
              navigate(redirectPath, { replace: true });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsSuperAdmin(false);
          setIsAdmin(false);
          if (['/dashboard', '/admin'].some(p => location.pathname.startsWith(p))) {
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        toast({
          title: "Authentication Error",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });

    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = await AuthService.getCurrentUser(session.user);
        setUser(user);
        setSession(session);
        setIsSuperAdmin(user?.role === 'superadmin');
        setIsAdmin(user?.role === 'admin');
      }
      setLoading(false);
    };

    checkSession();

    return () => subscription?.unsubscribe();
  }, [navigate, toast, location.pathname]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.signIn(email, password);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      navigate('/login', { replace: true });
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    subdomain,
    loading,
    login,
    logout,
    isSuperAdmin,
    isAdmin,
    setSubdomain
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}