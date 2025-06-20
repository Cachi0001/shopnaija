import { supabase } from "@/integrations/supabase/client";
import { User as CustomUser } from "@/types"; // Your custom User type
import { User as SupabaseAuthUser } from '@supabase/supabase-js'; // Import Supabase's Auth User type

export class AuthService {
    static async signUp(email: string, password: string, userData: {
        name: string;
        role: 'superadmin' | 'admin' | 'customer';
        subdomain?: string;
        website_name?: string;
        primary_color?: string;
        phone?: string;
        location?: string;
        account_name?: string;
        account_number?: string;
        bank_name?: string;
        logo_url?: string;
        is_active?: boolean;
        nin?: string;
    }) {
        // Validate NIN for admin users (This part can remain if needed for client-side validation before invoking function)
        if (userData.role === 'admin' && userData.nin) {
            const ninValidation = await this.validateNIN(userData.nin);
            if (!ninValidation.valid) {
                throw new Error(ninValidation.error || "Invalid NIN format");
            }
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData,
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) throw error;
        return data;
    }

    // --- The createAdminWithPassword method has been REMOVED from here ---
    // Its functionality is now handled entirely by the 'create-admin' Supabase Edge Function,
    // which is invoked by AdminService.createAdmin.

    static async validateNIN(nin: string): Promise<{ valid: boolean; error?: string }> {
        try {
            const { data, error } = await supabase.functions.invoke('validate-nin', {
                body: { nin }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('NIN validation error:', error);
            const ninRegex = /^\d{11}$/;
            return {
                valid: ninRegex.test(nin.replace(/[\s-]/g, '')),
                error: ninRegex.test(nin.replace(/[\s-]/g, '')) ? undefined : "Please enter a valid 11-digit NIN"
            };
        }
    }

    static async signUpWithPhone(phone: string, password: string, userData: {
        name: string;
        role: 'customer';
    }) {
        const { data, error } = await supabase.auth.signUp({
            phone,
            password,
            options: {
                data: userData
            }
        });

        if (error) throw error;
        return data;
    }

    static async signIn(email: string, password: string) {
        console.log('Attempting to sign in with email:', email);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Sign in error:', error);
            throw error;
        }

        console.log('Sign in successful:', data);
        return data;
    }

    static async signInWithPhone(phone: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            phone,
            password
        });

        if (error) throw error;
        return data;
    }

    static async signInWithOAuth(provider: 'google' | 'github' | 'twitter') {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });

        if (error) throw error;
        return data;
    }

    static async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    static async resetPassword(email: string, redirectTo?: string) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo || `${window.location.origin}/reset-password`
        });

        if (error) throw error;
        return data;
    }

    static async updatePassword(password: string) {
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        return data;
    }

    static async verifyOtp(email: string, token: string, type: 'signup' | 'recovery' | 'email_change') {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type
        });

        if (error) throw error;
        return data;
    }

    static async verifyPhoneOtp(phone: string, token: string, type: 'sms') {
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type
        });

        if (error) throw error;
        return data;
    }

    static async getCurrentUser(authSupabaseUser?: SupabaseAuthUser | null): Promise<CustomUser | null> {
        let user: SupabaseAuthUser | null = authSupabaseUser || null;

        if (!user) {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error("Error getting session in getCurrentUser:", sessionError);
                return null;
            }
            user = session?.user || null;
        }

        if (!user) {
            console.log('No authenticated user found after session check.');
            return null;
        }

        console.log('Current auth user (from session or initial parameter):', user.id, user.email);

        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        console.log('User profile from database:', profile, 'Error:', error);

        if (error) {
            console.error('Error fetching user profile from database:', error);
            return null;
        }

        if (!profile) {
            console.log('No profile found in public.users, creating basic user object from auth data');
            const defaultRole = (user.user_metadata?.role || 'customer') as 'superadmin' | 'admin' | 'customer';

            return {
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.name || user.email!,
                role: defaultRole,
                phone: user.phone || undefined,
                subdomain: user.user_metadata?.subdomain || undefined,
                website_name: user.user_metadata?.website_name || undefined,
                primary_color: user.user_metadata?.primary_color || '#00A862',
                is_active: true,
                email_verified: user.email_confirmed_at !== null,
                phone_verified: user.phone_confirmed_at !== null,
                created_at: user.created_at,
                updated_at: new Date().toISOString()
            } as CustomUser;
        }

        return profile as CustomUser;
    }

    static onAuthStateChange(callback: (user: CustomUser | null) => void) {
        return supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);

            if (session?.user) {
                const user = await this.getCurrentUser(session.user);
                console.log('Retrieved user profile on auth state change:', user);
                callback(user);
            } else {
                callback(null);
            }
        });
    }

    static async resendConfirmation(email: string) {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) throw error;
        return data;
    }

    static async checkSession() {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session);
        return session;
    }

    static async updateUserMetadata(metadata: Partial<CustomUser>) {
        const { data, error } = await supabase.auth.updateUser({
             data: metadata
        });

        if (error) throw error;
        return data;
    }
}
