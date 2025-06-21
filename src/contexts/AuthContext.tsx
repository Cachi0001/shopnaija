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
    let loadingTimeout: NodeJS.Timeout | null = null;
    // Timeout for loading state (max 15 seconds)
    loadingTimeout = setTimeout(() => {
      setLoading(false);
      toast({
        title: "Authentication Timeout",
        description: "Authentication took too long. Please try again.",
        variant: "destructive",
      });
      console.error('[AuthProvider] Loading timed out after 15 seconds.');
    }, 15000);

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
              const redirectPath = fetchedUser?.role === 'superadmin' 
                ? '/dashboard' 
                : fetchedUser?.role === 'admin' 
                  ? '/admin/dashboard' 
                  : '/';
              navigate(redirectPath, { replace: true });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsSuperAdmin(false);
          setIsAdmin(false);
          // Clear all Supabase session data (localStorage/sessionStorage)
          try {
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('supabase.auth.token');
          } catch (e) {
            // Ignore if not present
          }
          if (["/dashboard", "/admin"].some(p => location.pathname.startsWith(p))) {
            navigate("/login", { replace: true });
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
        if (loadingTimeout) clearTimeout(loadingTimeout);
      }
    });

    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const user = await AuthService.getCurrentUser(session.user);
          setUser(user);
          setSession(session);
          setIsSuperAdmin(user?.role === 'superadmin');
          setIsAdmin(user?.role === 'admin');
        } else {
          setUser(null);
          setSession(null);
          setIsSuperAdmin(false);
          setIsAdmin(false);
        }
      } catch (err) {
        toast({
          title: "Session Error",
          description: "Could not restore session. Please log in again.",
          variant: "destructive",
        });
        setUser(null);
        setSession(null);
        setIsSuperAdmin(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        if (loadingTimeout) clearTimeout(loadingTimeout);
      }
    };

    checkSession();

    return () => {
      subscription?.unsubscribe();
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [navigate, toast, location.pathname]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    let loadingTimeout: NodeJS.Timeout | null = null;
    // 15s timeout for login
    loadingTimeout = setTimeout(() => {
      setLoading(false);
      toast({
        title: "Login Timeout",
        description: "Login took too long. Please try again.",
        variant: "destructive",
      });
      console.error('[AuthProvider] Login timed out after 15 seconds.');
    }, 15000);
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
      if (loadingTimeout) clearTimeout(loadingTimeout);
    }
  };


  const logout = async () => {
    setLoading(true);
    let loadingTimeout: NodeJS.Timeout | null = null;
    // 15s timeout for logout
    loadingTimeout = setTimeout(() => {
      setLoading(false);
      toast({
        title: "Logout Timeout",
        description: "Logout took too long. Please try again.",
        variant: "destructive",
      });
      console.error('[AuthProvider] Logout timed out after 15 seconds.');
    }, 15000);
    try {
      await AuthService.signOut();
      // Clear all Supabase session data (localStorage/sessionStorage)
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      } catch (e) {
        // Ignore if not present
      }
      setUser(null);
      setSession(null);
      setIsSuperAdmin(false);
      setIsAdmin(false);
      navigate('/login', { replace: true });
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (loadingTimeout) clearTimeout(loadingTimeout);
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