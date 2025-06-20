import { supabase } from "@/integrations/supabase/client";

export const ProductService = {
  async getProductsByAdmin(adminId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price, locationState, locationAddress, lga, created_at, *')
      .eq('admin_id', adminId);
    if (error) throw error;
    return data || [];
  },

  async getCategoriesByAdminId(adminId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('admin_id', adminId)
      .order('name');
    if (error) throw error;
    return data;
  },

  async createProduct(productData: any) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, productData: any) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async createCategory(categoryData: any) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, categoryData: any) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
