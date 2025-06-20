
import { supabase } from "@/integrations/supabase/client";
import { AdminCreateData } from "@/types/index";
import { PaymentService } from "./PaymentService";

export class EnhancedAdminService {
  static async createAdminWithBankDetails(adminData: AdminCreateData & {
    account_name: string;
    account_number: string;
    bank_name: string;
  }) {
    try {
      console.log("Creating admin with bank details:", adminData);

      // Use the database function to create admin
      const { data, error } = await supabase.rpc('create_admin', {
        p_email: adminData.email,
        p_name: adminData.name,
        p_nin: adminData.nin,
        p_subdomain: adminData.subdomain,
        p_website_name: adminData.website_name,
        p_account_name: adminData.account_name,
        p_account_number: adminData.account_number,
        p_bank_name: adminData.bank_name,
        p_phone: adminData.phone || null
      });

      if (error) throw error;

      console.log("Admin created successfully with ID:", data);

      // Set temporary password and send email
      await PaymentService.setTempPassword(data);

      return { success: true, adminId: data };
    } catch (error: any) {
      console.error('Error in EnhancedAdminService.createAdminWithBankDetails:', error);
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }

  static async activateAdmin(adminId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', adminId)
        .eq('role', 'admin')
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error activating admin:', error);
      throw error;
    }
  }

  static async deactivateAdmin(adminId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', adminId)
        .eq('role', 'admin')
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error deactivating admin:', error);
      throw error;
    }
  }

  static async confirmPayment(adminId: string) {
    try {
      return await PaymentService.updatePaymentStatus(adminId);
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  static async getAdminWithPaymentDetails(adminId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        payment_accounts!payment_accounts_user_id_fkey (*)
      `)
      .eq('id', adminId)
      .eq('role', 'admin')
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllAdminsWithPaymentStatus() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        subdomain,
        website_name,
        is_active,
        payment_status,
        account_number,
        bank_name,
        must_reset_password,
        created_at,
        updated_at
      `)
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
