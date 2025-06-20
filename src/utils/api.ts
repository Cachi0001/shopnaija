import { ProductFormState } from '../types/product';

  const SUPABASE_FUNCTION_URL = 'https://kpzunjxdvodgprxtqnej.supabase.co/functions/v1/manage-product';

  export const createProduct = async (productData: ProductFormState, authToken: string | null) => {
    try {
      if (!productData.admin_id) throw new Error("Admin ID is required.");
      if (!productData.title) throw new Error("Title is required.");
      // Check if price is null or empty string before checking isNaN
      if (productData.price === null || productData.price === '' || isNaN(Number(productData.price))) throw new Error("Valid Price is required.");
      if (!productData.name) throw new Error("Name is required.");
      if (!productData.category) throw new Error("Category is required.");
      if (!productData.locationState) throw new Error("State is required.");
      if (!productData.locationAddress) throw new Error("Detailed address is required.");
      if (!productData.lga) throw new Error("Local Government Area is required.");
      // Check if units_available is null or empty string before checking isNaN
      if (productData.units_available === null || productData.units_available === '' || isNaN(Number(productData.units_available))) throw new Error("Units Available is required.");

      const dataToSend = {
        admin_id: productData.admin_id,
        category_id: productData.category_id || null,
        title: productData.title,
        description: productData.description || null,
        // Ensure numeric values are actually numbers or null before sending based on schema nullable
        price: Number(productData.price), // Price is NOT NULL
        adjusted_price: productData.adjusted_price !== '' && productData.adjusted_price !== null ? Number(productData.adjusted_price) : null,
        paystack_fee: productData.paystack_fee !== '' && productData.paystack_fee !== null ? Number(productData.paystack_fee) : null,
        superadmin_fee: productData.superadmin_fee !== '' && productData.superadmin_fee !== null ? Number(productData.superadmin_fee) : null,
        image_url: productData.image_url || null,
        image_public_id: productData.image_public_id || null,
        location_state: productData.locationState,
        location_address: productData.locationAddress,
        lga: productData.lga,
        units_available: productData.units_available !== '' && productData.units_available !== null ? Number(productData.units_available) : 1, // Units Available is NOT NULL with default 1
        original_price: productData.original_price !== '' && productData.original_price !== null ? Number(productData.original_price) : 0.00, // Original Price is NOT NULL with default 0.00
        name: productData.name,
        category: productData.category,
        agerange: productData.agerange || null,
        size: productData.size || null,
        color: productData.color || null,
        skintype: productData.skintype || null,
        material: productData.material || null,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        // Use the provided authToken - Anon key fallback removed for production security
        'Authorization': `Bearer ${authToken}`,
      };

      // Optional: Add a check here to ensure authToken is not null if you want to prevent unauthenticated calls entirely at the api level
      if (!authToken) {
           console.error("Authentication token is required for createProduct.");
           // Depending on desired behavior, you might throw an error or return a specific response
           throw new Error("Authentication required.");
      }

      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
         // Include status code in error message for better debugging
        throw new Error(`Failed to create product: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('createProduct failed:', error);
      throw error; // Re-throw the error to be handled by the component
    }
  };
