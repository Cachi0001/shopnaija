import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User } from "@/types"; // Your custom User type
import { AuthService } from "@/services/AuthService";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js'; // Import Supabase Session type

interface AuthContextType {
  user: User | null;
  session: Session | null; // Use Supabase Session type for session
  subdomain: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Store session using Supabase Session type
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Create stable callbacks to prevent unnecessary re-renders
  const showToast = useCallback((message: { title: string; description: string; variant?: "destructive" }) => {
    toast(message);
  }, [toast]);

  const navigateToPath = useCallback((path: string) => {
    navigate(path, { replace: true });
  }, [navigate]);

  const getDashboardPath = (role: 'superadmin' | 'admin' | 'customer' | string | undefined) => {
    switch (role) {
      case 'superadmin': return '/dashboard';
      case 'admin': return '/admin/dashboard';
      case 'customer': return '/';
      default: return '/';
    }
  };

  useEffect(() => {
    const hostname = window.location.hostname;
    let potentialSubdomain: string | null = null;
    if (hostname === 'localhost') {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0 && !['login', 'auth', 'forgot-password', 'reset-password', 'auth/callback'].includes(pathSegments[0])) {
        potentialSubdomain = pathSegments[0];
      }
    } else {
      const parts = hostname.split('.');
      if (parts.length >= 3 && parts[1] === 'growthsmallbeez') {
        potentialSubdomain = parts[0];
      }
    }
    setSubdomain(potentialSubdomain);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        let authenticatedUser: User | null = null;
        if (session?.user) {
          authenticatedUser = await AuthService.getCurrentUser(session.user);
        }

        if (mounted) {
          setUser(authenticatedUser);
          setSession(session || null); // Store session
          setIsSuperAdmin(authenticatedUser?.role === 'superadmin');
          setIsAdmin(authenticatedUser?.role === 'admin');

          if (authenticatedUser && authenticatedUser.id) {
            const currentPath = location.pathname;
            const targetPath = getDashboardPath(authenticatedUser.role);
            if (currentPath.startsWith('/auth') || currentPath === '/login' || (targetPath && currentPath !== targetPath)) {
              navigateToPath(targetPath);
            }
          }
        }
      } catch (error: any) {
        console.error('Auth initialization failed:', error);
        showToast({ title: "Authentication Error", description: error.message || "Failed to initialize authentication.", variant: "destructive" });
        if (mounted) {
          setUser(null);
          setSession(null);
          setIsSuperAdmin(false);
          setIsAdmin(false);
          navigateToPath('/login');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = AuthService.onAuthStateChange(async (eventUser) => {
      if (!mounted) return;

      if (eventUser) {
        const fetchedUser = await AuthService.getCurrentUser(eventUser);
        setUser(fetchedUser);
        // Get and set the latest session when auth state changes
        setSession(await supabase.auth.getSession().then(({ data }) => data.session || null));
        setIsSuperAdmin(fetchedUser?.role === 'superadmin');
        setIsAdmin(fetchedUser?.role === 'admin');

        if (location.pathname.startsWith('/auth') || location.pathname === '/login') {
          const redirectPath = getDashboardPath(fetchedUser?.role);
          navigateToPath(redirectPath);
        }
      } else {
        setUser(null);
        setSession(null); // Clear session on logout
        setIsSuperAdmin(false);
        setIsAdmin(false);
        if (location.pathname !== '/login') navigateToPath('/login');
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [location.pathname, showToast, navigateToPath]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Assuming AuthService.signIn throws an error on failure
      await AuthService.signIn(email, password);
      // State change listener will handle setting user/session and navigation on success
    } catch (error: any) {
      console.error('Login function caught error:', error);
      showToast({ title: "Login Failed", description: error.message || "An unexpected error occurred during login.", variant: "destructive" });
      // No need to throw here, handled by toast and finally block
    } finally {
      // Loading is set to false by initializeAuth or onAuthStateChange based on final state
      // or explicitly setting here if there was an error *before* state change listener fires
       setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Assuming AuthService.signOut throws an error on failure
      await AuthService.signOut();
      // State change listener will handle clearing user/session and navigation on success
    } catch (error: any) {
      console.error('Logout function caught error:', error);
      showToast({ title: "Logout Failed", description: error.message || "An error occurred during logout.", variant: "destructive" });
      // No need to throw here, handled by toast and finally block
    } finally {
      // Loading is set to false by the state change listener on SIGNED_OUT
       setLoading(false);
    }
  };

  const value = { user, session, subdomain, loading, login, logout, isSuperAdmin, isAdmin };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
