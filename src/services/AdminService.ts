
import { supabase } from "@/integrations/supabase/client";
import { AuthService } from "./AuthService";
import { AdminCreateData } from "@/types/index"; 


export class AdminService {
  static async createAdmin(adminData: AdminCreateData) {
    try {
      console.log("Attempting to create admin via edge function with data:", adminData);

      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: adminData,
      });

      if (error) {
        // This handles network errors or if the function itself crashes.
        throw error;
      }

      // The edge function might return its own error message inside the data object.
      if (data && data.error) {
        throw new Error(data.error);
      }

      console.log("Admin created successfully via edge function:", data);
      return data; // Return the data sent back from the edge function.

    } catch (error: any) {
      console.error('Error in AdminService.createAdmin:', error);
      // Re-throw the error so the UI can catch it and display a message.
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
      .maybeSingle(); // Use maybeSingle to handle cases where admin doesn't exist

    if (error) {
      console.error(`Error fetching admin with id ${id}:`, error);
      throw error;
    }
    
    return data; // Will return null if admin not found
  }

  static async getAdminBySubdomain(subdomain: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('role', 'admin')
      .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

    if (error) {
      console.error(`Error fetching admin for subdomain ${subdomain}:`, error);
      throw error;
    }
    
    return data; // Will return null if no admin found, which is what we want
  }

  static async updateAdmin(id: string, updates: Partial<AdminCreateData & { is_active: boolean; referral_code: string }>) {
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
