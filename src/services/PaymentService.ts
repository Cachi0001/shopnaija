
import { supabase } from "@/integrations/supabase/client";

export class PaymentService {
  static async updatePaymentStatus(adminId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('update-payment-status', {
        body: { adminId, paymentStatus: 'paid' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  static async setTempPassword(adminId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('set-temp-password', {
        body: { adminId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting temporary password:', error);
      throw error;
    }
  }

  static async processPayment(paymentData: {
    adminId: string;
    amount: number;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-process-payment', {
        body: paymentData
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  static async getPaymentAccounts() {
    const { data, error } = await supabase
      .from('payment_accounts')
      .select(`
        *,
        users!payment_accounts_user_id_fkey (
          id,
          name,
          email,
          role,
          is_active,
          payment_status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
