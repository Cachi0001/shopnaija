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
  const [loading, setLoading] = useState(true); // Start with loading as true
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Stable toast function
  const showToast = useCallback((message: { title: string; description: string; variant?: "destructive" }) => {
    toast(message);
  }, [toast]);

  // Stable navigation function
  const navigateToPath = useCallback((path: string, options?: { replace: boolean }) => {
    navigate(path, options);
  }, [navigate]);

  const getDashboardPath = (role: 'superadmin' | 'admin' | 'customer' | string | undefined) => {
    if (role === 'superadmin') return '/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
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
      if (parts.length >= 3 && (parts[1] === 'growthsmallbeez' || parts[1] === 'shopnaija')) {
        potentialSubdomain = parts[0];
      }
    }
    setSubdomain(potentialSubdomain);
  }, [location.pathname]);

  useEffect(() => {
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log(`[AuthContext] Auth state change event: ${event}`);

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (session) {
            const fetchedUser = await AuthService.getCurrentUser(session.user);
            setUser(fetchedUser);
            setSession(session);
            setIsSuperAdmin(fetchedUser?.role === 'superadmin');
            setIsAdmin(fetchedUser?.role === 'admin');

            // Redirect only if on a public/auth page
            const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
            if (publicPaths.includes(location.pathname) || location.pathname.startsWith('/auth')) {
                const redirectPath = getDashboardPath(fetchedUser?.role);
                navigateToPath(redirectPath, { replace: true });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsSuperAdmin(false);
          setIsAdmin(false);
          const protectedPaths = ['/dashboard', '/admin/dashboard'];
          if (protectedPaths.some(p => location.pathname.startsWith(p))) {
            navigateToPath('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        showToast({
          title: "Authentication Error",
          description: "An error occurred. Please try refreshing.",
          variant: "destructive",
        });
        setUser(null);
        setSession(null);
        setIsSuperAdmin(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    // Initial check for session, in case onAuthStateChange doesn't fire immediately
    const checkInitialSession = async () => {
        try {
            const { data: { session: initialSession } } = await supabase.auth.getSession();
            if (!session && initialSession) { // If no session is set yet
                const fetchedUser = await AuthService.getCurrentUser(initialSession.user);
                setUser(fetchedUser);
                setSession(initialSession);
                setIsSuperAdmin(fetchedUser?.role === 'superadmin');
                setIsAdmin(fetchedUser?.role === 'admin');
            }
        } catch (error) {
            console.error('Error in initial session check:', error);
        } finally {
            // This is crucial for the very first load
            if (loading) setLoading(false);
        }
    };
    
    checkInitialSession();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigateToPath, showToast, location.pathname]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.signIn(email, password);
      // onAuthStateChange will handle navigation and state updates
    } catch (error: any) {
      console.error('Login function error:', error);
      showToast({ title: "Login Failed", description: error.message || "Invalid credentials.", variant: "destructive" });
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      // onAuthStateChange will handle state updates and navigation
    } catch (error: any) {
      console.error('Logout function error:', error);
      showToast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    } finally {
      // Set user/session to null immediately for faster UI response
      setUser(null);
      setSession(null);
      setLoading(false);
      navigateToPath('/login', { replace: true });
    }
  };

  useEffect(() => {
    console.log(`[AuthContext] State Update: loading=${loading}, user=${!!user}, session=${!!session}, isAdmin=${isAdmin}, isSuperAdmin=${isSuperAdmin}`);
  }, [loading, user, session, isAdmin, isSuperAdmin]);

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
