import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query"; // Import useMutation
import { AdminService } from "@/services/AdminService";
import { ProductService } from "@/services/ProductService";
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Import Label for the form
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingCart, 
  Star, 
  MapPin,
  Heart,
  Filter,
  Minus, // Import for quantity buttons
  Plus, // Import for quantity buttons
  X // Import for remove button
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Product, type CartItem } from "@/types/index"; // Import types

const StoreFront = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  // Define cart state with explicit type
  const [cart, setCart] = useState<CartItem[]>([]);
  // State to hold admin data fetched by subdomain
  const [adminData, setAdminData] = useState<any>(null);
  // State to hold customer details for checkout form
  const [customerDetails, setCustomerDetails] = useState({ name: "", email: "", phone: "" });
  // State to control visibility of cart/checkout section
  const [showCart, setShowCart] = useState(false);

  // Fetch admin details based on subdomain
  const { data: fetchedAdminData, isLoading: isAdminLoading } = useQuery({
    queryKey: ['adminBySubdomain', subdomain],
    queryFn: () => subdomain ? AdminService.getAdminBySubdomain(subdomain) : null,
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (fetchedAdminData) {
      setAdminData(fetchedAdminData);
    }
  }, [fetchedAdminData]);


  // Fetch products for this admin
   const { data: products, isLoading: isProductsLoading } = useQuery<Product[]>({ // Use Product type
    queryKey: ['products', adminData?.id],
    queryFn: () => adminData?.id ? ProductService.getProductsByAdminId(adminData.id) : [], // Assuming getProductsByAdminId
    enabled: !!adminData?.id, // Only run if adminData.id is available
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch categories for this admin (assuming similar service method)
   const { data: categories } = useQuery<any[]>({ // Replace any[] with your Category type
    queryKey: ['categories', adminData?.id],
    queryFn: () => ProductService.getCategoriesByAdminId(adminData.id), // Assuming getCategoriesByAdminId
    enabled: !!adminData?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });


  const getImageUrl = (publicId: string | null) => {
    if (!publicId) {
      // Return a placeholder image URL
      return `https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop&crop=center`;
    }

    // Assuming publicId is the image_public_id from Supabase Storage
    // Replace 'product-images' with your actual storage bucket name
    const { data } = supabase.storage.from('product-images').getPublicUrl(publicId);
    return data.publicUrl;
  };

  const addToCart = (product: Product) => {
    // Ensure product has an id before adding to cart
    if (!product.id) {
        console.error("Product is missing ID, cannot add to cart.", product);
        toast({
          title: "Error",
          description: "Cannot add product to cart (missing ID).",
          variant: "destructive"
        });
        return;
    }

    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Store necessary product details in cart item, including original_price
      setCart([...cart, {
        product_id: product.id,
        quantity: 1,
        title: product.title,
        price: product.price, // Price with markup for display
        original_price: product.original_price, // Store original price for checkout calculation
        image_url: product.image_url || getImageUrl(product.image_public_id), // Prefer image_url if available
      }]);
    }

    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart`,
    });
     setShowCart(true); // Show cart when an item is added
  };

   const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
     toast({
      title: "Removed from cart",
      description: `Item removed from cart`, // Use a generic message
    });
      if (cart.filter(item => item.product_id !== productId).length === 0) {
        setShowCart(false); // Hide cart if empty after removal
      }
  };

   const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };


  const createOrder = useMutation({
    mutationFn: async () => {
      if (!adminData?.id) {
        throw new Error("Admin data not loaded.");
      }
      if (cart.length === 0) {
           throw new Error("Cart is empty.");
      }
      // Validate customer details before creating order
      if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
        throw new Error("Please fill in all customer details.");
      }

      // order_details structure MUST match what process-payment expects ({ product_id, quantity })
      const orderDetails = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        // process-payment fetches original_price from products table,
        // so it's not strictly necessary to include it here, but can be for redundancy
        // original_price: item.original_price 
      }));

       // Calculate total amount including 5% markup for the customer
       // This is the amount that will be charged to the customer via Paystack
       const totalAmount = cart.reduce((sum, item) => {
          // Use the price shown to the customer (which includes the markup)
         // Fallback to item.price if original_price is unexpectedly missing in cart item
         const priceToCustomer = (item.original_price ?? item.price) * 1.05;
         return sum + priceToCustomer * item.quantity;
      }, 0);

       // Optional: Add a check for a minimum transaction amount if required by Paystack or your logic
       // const minimumAmount = 150; // Example minimum amount in Naira (covers 100 + ~50 fee on small tx)
       // if (totalAmount * 100 < minimumAmount * 100) { // Compare in kobo
       //     throw new Error(`Minimum order amount is ₦${minimumAmount}.`);
       // }


      const { data, error } = await supabase
        .from('orders')
        .insert({
          admin_id: adminData.id,
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
          order_details: orderDetails, // Insert the structured order details
          total_amount: totalAmount, // Store total amount including markup
          payment_status: 'pending', // Initial status before payment is confirmed by webhook
          tracking_status: 'processing', // Initial status
        })
        .select() // Select the inserted row to get the order ID and other data
        .single();

      if (error) {
        console.error("Error creating order:", error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      return data; // Return the created order data
    },
     onSuccess: (order) => {
        toast({ title: "Order Created", description: `Order ${order.id} created.` });
        // Proceed to payment initiation after order is successfully created
        handlePaymentInitiation(order.id, order.total_amount); // Pass order ID and total amount
     },
     onError: (error: any) => {
       console.error("Create order mutation failed:", error);
       toast({ title: "Error", description: error.message || "Failed to create order", variant: "destructive" });
     }
  });

   // Function to initiate payment by calling the backend endpoint
   const handlePaymentInitiation = async (orderId: string, totalAmount: number) => {
        // IMPORTANT: Replace '/api/initiate-payment' with the actual endpoint that calls your
        // process-payment Supabase Edge Function.
        // This endpoint acts as a proxy to protect your SUPABASE_SERVICE_ROLE_KEY
        // and to potentially add extra logic before calling process-payment.

        const adminId = adminData?.id; // Get admin ID from state

        if (!adminId) {
             toast({ title: "Error", description: "Admin ID not available for payment.", variant: "destructive" });
             return;
        }

        const backendEndpointUrl = `/api/initiate-payment`; // This should be the URL of your proxy function/endpoint

        try {
            // Make a request to your backend endpoint to initiate payment
            const response = await fetch(backendEndpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary authentication headers for your backend endpoint here
                },
                body: JSON.stringify({
                    order_id: orderId,
                    email: customerDetails.email, // Pass customer email
                    amount: totalAmount, // Pass total amount (including markup) in Naira
                    admin_id: adminId, // Pass admin ID
                    customer_name: customerDetails.name, // Pass customer name
                    customer_phone: customerDetails.phone, // Pass customer phone
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                 console.error("Backend payment initiation failed:", data);
                throw new Error(data.error || 'Failed to initiate payment via backend.');
            }

            // Assuming your backend endpoint returns the authorization_url from process-payment
            if (data.authorization_url) {
                 window.location.href = data.authorization_url; // Redirect to Paystack
                 // The user will be redirected back to your callback_url after payment
                 toast({ title: "Redirecting", description: "You will be redirected to Paystack to complete your payment.", duration: 5000 });
            } else {
                 console.error("Payment authorization URL not received from backend:", data);
                 throw new Error("Payment authorization URL not received.");
            }

        } catch (error: any) {
            console.error("Error initiating payment:", error);
            toast({ title: "Payment Error", description: error.message || "Failed to initiate payment.", variant: "destructive" });
        }
   }

    // This is the main checkout handler, now it just triggers order creation
  const handleCheckout = async () => {
      // createOrder mutation will handle validation and call handlePaymentInitiation on success
    await createOrder.mutateAsync();
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    // Ensure product.original_price exists before displaying/adding to cart
    // You might adjust this if you want to allow adding products without original_price (though payment would fail)
     const hasOriginalPrice = typeof product.original_price === 'number';
    return matchesSearch && matchesCategory && hasOriginalPrice;
  }) || [];

  // Show loading state
  if (isAdminLoading || isProductsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  // Show store not found/inactive state
  if (!adminData || !adminData.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Store Not Available</h1>
          <p className="text-xl text-gray-600">This store is currently inactive or doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Main Storefront JSX
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="bg-white shadow-sm border-b-4"
        style={{ borderBottomColor: adminData.primary_color || '#16a34a' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-3">
              {adminData.logo_url && (
                <img 
                  src={adminData.logo_url} 
                  alt={adminData.website_name}
                  className="h-10 w-auto"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {adminData.website_name || 'Store'}
                </h1>
                <p className="text-sm text-gray-600">Powered by GrowthSmallBeez</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {/* Cart Button - Toggles visibility of cart section */}
              <Button 
                variant="outline" 
                className="relative"
                onClick={() => setShowCart(!showCart)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cart.length > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                    style={{ backgroundColor: adminData.primary_color || '#16a34a' }}
                  >
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                {categories?.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Filtered products are rendered here */} 
          {filteredProducts.map((product: Product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="aspect-square bg-gray-200 relative overflow-hidden">
                {/* Use image_public_id if available, fallback to image_url or placeholder */}
                <img
                  src={product.image_public_id ? getImageUrl(product.image_public_id) : (product.image_url || getImageUrl(null))}
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop&crop=center`;
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => toast({ title: "Wishlist", description: "Added to wishlist!" })}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {product.title}
                </CardTitle>
                {product.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-3 w-3 mr-1" />
                    {product.location}
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      {/* Display the price with the 5% markup */} 
                      <p className="text-2xl font-bold" style={{ color: adminData.primary_color || '#16a34a' }}>
                        ₦{((product.original_price ?? product.price) * 1.05).toLocaleString()}
                      </p>
                      {/* Optional: Show original price for transparency/debugging if needed */}
                      {/* {typeof product.original_price === 'number' && product.original_price !== (product.price * 1.05) && (
                         <p className="text-sm text-gray-500 line-through">
                           ₦{product.original_price.toLocaleString()}
                         </p>
                      )} */}
                    </div>
                    <div className="flex items-center">
                      {/* Assuming you have a rating system, replace with actual data */} 
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.5</span>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <Button 
                    className="w-full"
                    style={{ backgroundColor: adminData.primary_color || '#16a34a' }}
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Display message if no products */}
        {filteredProducts.length === 0 && !isProductsLoading && ( !adminData ? null : // Don't show if admin data is not loaded yet
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filter criteria" 
                : "This store doesn't have any products yet"}
            </p>
          </div>
        )}
      </div>

      {/* Cart and Checkout Section (Conditional Rendering)*/}
       {showCart && ( // Conditionally render based on showCart state
           <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md shadow-lg z-50"> {/* Added z-50 */}
               <CardContent className="p-4">
                   <h3 className="text-lg font-semibold mb-2">Shopping Cart</h3>
                   {cart.length === 0 ? (
                       <p className="text-gray-500">Your cart is empty.</p>
                   ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar for potential styling */}
                       {cart.map(item => (
                           <div key={item.product_id} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0 last:pb-0"> {/* Added last child styling */}
                               <div className="flex-1 pr-2">
                                   <p className="font-medium line-clamp-1">{item.title}</p>
                                   {/* Display the price per item with markup */} 
                                   <p className="text-muted-foreground">₦{((item.original_price ?? item.price) * 1.05).toLocaleString()} x {item.quantity}</p>
                               </div>
                               <div className="flex items-center gap-2 flex-shrink-0">
                                   <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                                   <span className="w-5 text-center">{item.quantity}</span>
                                   <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => removeFromCart(item.product_id)}><X className="h-4 w-4" /></Button>
                               </div>
                           </div>
                       ))}
                   </div>
                   )}

                   {/* Customer Details Form - Show only if cart is not empty */}
                    {cart.length > 0 && ( 
                       <div className="mt-4 pt-4 border-t">
                           <h3 className="text-lg font-semibold mb-2">Your Details</h3>
                           <div className="grid gap-2">
                             <div>
                               <Label htmlFor="customerName" className="sr-only">Full Name</Label>
                               <Input id="customerName" placeholder="Full Name" value={customerDetails.name} onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })} required />
                             </div>
                              <div>
                                <Label htmlFor="customerEmail" className="sr-only">Email</Label>
                                <Input id="customerEmail" type="email" placeholder="Email" value={customerDetails.email} onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })} required />
                              </div>
                               <div>
                                 <Label htmlFor="customerPhone" className="sr-only">Phone</Label>
                                 <Input id="customerPhone" type="tel" placeholder="Phone" value={customerDetails.phone} onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })} required />
                               </div>
                           </div>
                       </div>
                    )}

                    {/* Checkout Button - Show only if cart is not empty */}
                    {cart.length > 0 && (
                       <Button
                           variant="default" // Use default variant, color will be based on adminPrimaryColor
                           className="mt-4 w-full"
                           style={{ backgroundColor: adminData?.primary_color || '#16a34a', color: '#fff' }} // Ensure text color is white
                           onClick={handleCheckout}
                           disabled={cart.length === 0 || createOrder.isLoading || !customerDetails.name || !customerDetails.email || !customerDetails.phone} // Disable if details are missing
                       >
                           {createOrder.isLoading ? "Processing..." : `Checkout (₦${cart.reduce((sum, item) => sum + ((item.original_price ?? item.price) * 1.05) * item.quantity, 0).toLocaleString()})`}
                       </Button>
                    )}
               </CardContent>
           </Card>
       )}

    </div>
  );
};

export default StoreFront;
