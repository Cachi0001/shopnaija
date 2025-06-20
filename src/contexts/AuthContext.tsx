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
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
          console.warn('Supabase not properly configured. Running in offline mode.');
          if (mounted) {
            setUser(null);
            setSession(null);
            setIsSuperAdmin(false);
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        let authenticatedUser: User | null = null;
        if (session?.user) {
          try {
            authenticatedUser = await AuthService.getCurrentUser(session.user);
          } catch (userError) {
            console.error('Error fetching user profile:', userError);
            authenticatedUser = null;
          }
        }

        if (mounted) {
          setUser(authenticatedUser);
          setSession(session || null);
          setIsSuperAdmin(authenticatedUser?.role === 'superadmin');
          setIsAdmin(authenticatedUser?.role === 'admin');

          if (authenticatedUser && authenticatedUser.id) {
            const currentPath = location.pathname;
            const targetPath = getDashboardPath(authenticatedUser.role);
            if (currentPath.startsWith('/auth') || currentPath === '/login') {
              navigateToPath(targetPath);
            }
          }
        }
      } catch (error: any) {
        console.error('Auth initialization failed:', error);
        
        if (!error.message?.includes('placeholder') && !error.message?.includes('Missing')) {
          showToast({ 
            title: "Authentication Error", 
            description: "Unable to connect to authentication service. Some features may be limited.", 
            variant: "destructive" 
          });
        }
        
        if (mounted) {
          setUser(null);
          setSession(null);
          setIsSuperAdmin(false);
          setIsAdmin(false);
          setLoading(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    let subscription: any = { unsubscribe: () => {} };
    
    try {
      const authStateListener = AuthService.onAuthStateChange(async (eventUser) => {
        if (!mounted) return;

        try {
          if (eventUser) {
            const fetchedUser = await AuthService.getCurrentUser(eventUser);
            setUser(fetchedUser);
            
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              setSession(sessionData.session || null);
            } catch (sessionError) {
              console.error('Error getting session:', sessionError);
              setSession(null);
            }
            
            setIsSuperAdmin(fetchedUser?.role === 'superadmin');
            setIsAdmin(fetchedUser?.role === 'admin');

            if (location.pathname.startsWith('/auth') || location.pathname === '/login') {
              const redirectPath = getDashboardPath(fetchedUser?.role);
              navigateToPath(redirectPath);
            }
          } else {
            setUser(null);
            setSession(null);
            setIsSuperAdmin(false);
            setIsAdmin(false);
            if (location.pathname !== '/login' && !location.pathname.startsWith('/auth')) {
              navigateToPath('/login');
            }
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        } finally {
          if (mounted) setLoading(false); // Ensure loading is set to false after auth state change
        }
      });
      
      subscription = authStateListener.data;
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
    }

    return () => { 
      mounted = false; 
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe(); 
      }
    };
  }, [location.pathname, showToast, navigateToPath]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.signIn(email, password);
    } catch (error: any) {
      console.error('Login function caught error:', error);
      showToast({ title: "Login Failed", description: error.message || "An unexpected error occurred during login.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
    } catch (error: any) {
      console.error('Logout function caught error:', error);
      showToast({ title: "Logout Failed", description: error.message || "An error occurred during logout.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[AuthContext] loading:', loading, 'user:', user, 'session:', session, 'subdomain:', subdomain);
  }, [loading, user, session, subdomain]);

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
