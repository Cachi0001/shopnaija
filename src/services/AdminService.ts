import { supabase } from "@/integrations/supabase/client";
import { AuthService } from "./AuthService";

export type AdminCreateData = {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'superadmin' | 'customer';
  subdomain?: string;
  slug?: string;
  referral_code?: string;
  is_active?: boolean;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_code?: string;
  subaccount_code?: string;
  website_name?: string;
  primary_color?: string;
  nin?: string;
  phone?: string;
  location?: string;
};

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
  static async getAdminBySlug(slug?: string) {
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
    
    return data;
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
