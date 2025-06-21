import { supabase } from "@/integrations/supabase/client";
import { AuthService } from "./AuthService";
import { Admin, AdminCreateData } from "@/types";


export class AdminService {
  static async createAdmin(adminData: AdminCreateData) {
    try {
      console.log("Attempting to create admin via edge function with data:", adminData);

      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: adminData,
      }); // adminData now includes subaccount_code if present

      if (error) {
        throw error;
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      console.log("Admin created successfully via edge function:", data);
      return data;

    } catch (error: any) {
      console.error('Error in AdminService.createAdmin:', error);
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }

  static async getAllAdmins() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getAdminById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error(`Error fetching admin with id ${id}:`, error);
      throw error;
    }
    
    return data;
  }

  static async getAdminBySubdomain(subdomain: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error(`Error fetching admin for subdomain ${subdomain}:`, error);
      throw error;
    }
    
    return data;
  }

  // NEW: Get admin by slug
  static async getAdminBySlug(slug?: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('slug', slug)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error(`Error fetching admin for slug ${slug}:`, error);
      throw error;
    }
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: 'phone' in data ? data.phone ?? null : null,
      role: data.role,
      subdomain: 'subdomain' in data ? data.subdomain ?? null : null,
      slug: 'slug' in data ? data.slug ?? null : null,
      logo_url: 'logo_url' in data ? data.logo_url ?? null : null,
      website_name: 'website_name' in data ? data.website_name ?? null : null,
      primary_color: 'primary_color' in data ? data.primary_color ?? null : null,
      account_name: 'account_name' in data ? data.account_name ?? null : null,
      account_number: 'account_number' in data ? data.account_number ?? null : null,
      bank_name: 'bank_name' in data ? data.bank_name ?? null : null,
      bank_code: 'bank_code' in data ? data.bank_code ?? null : null,
      location: 'location' in data ? data.location ?? null : null,
      nin: 'nin' in data ? data.nin ?? null : null,
      is_active: 'is_active' in data ? data.is_active ?? null : null,
      referral_code: 'referral_code' in data ? data.referral_code ?? null : null,
      referral_discount: 'referral_discount' in data ? data.referral_discount ?? null : null,
      referred_by: 'referred_by' in data ? data.referred_by ?? null : null,
      email_verified: 'email_verified' in data ? data.email_verified ?? null : null,
      phone_verified: 'phone_verified' in data ? data.phone_verified ?? null : null,
      created_at: 'created_at' in data ? data.created_at ?? null : null,
      updated_at: 'updated_at' in data ? data.updated_at ?? null : null,
      payment_status: 'payment_status' in data ? data.payment_status ?? null : null,
      must_reset_password: 'must_reset_password' in data ? data.must_reset_password ?? null : null,
      is_plan_active: 'is_plan_active' in data ? data.is_plan_active ?? null : null,
      paystack_subaccount_code: 'paystack_subaccount_code' in data ? data.paystack_subaccount_code ?? null : null,
      temp_password: 'temp_password' in data ? data.temp_password ?? null : null,
    } as Admin;
  }

  static async updateAdmin(id: string, updates: Partial<AdminCreateData>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .eq('role', 'admin')
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async activateAdmin(id: string) {
    return this.updateAdmin(id, { is_active: true });
  }

  static async deactivateAdmin(id: string) {
    return this.updateAdmin(id, { is_active: false });
  }

  static async deleteAdmin(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'admin');

    if (error) throw error;
  }

  static async generateReferralCode(): Promise<string> {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REF-${randomId}`;
  }

  static async updateReferralCode(adminId: string, referralCode: string) {
    return this.updateAdmin(adminId, { referral_code: referralCode });
  }

  static async getAdminByReferralCode(referralCode: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('referral_code', referralCode)
      .eq('role', 'admin')
      .single();

    if (error) throw error;
    return data;
  }

}
