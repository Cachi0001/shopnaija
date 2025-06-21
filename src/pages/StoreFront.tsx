import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminService } from "@/services/AdminService";
import { ProductService } from "@/services/ProductService";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingCart, 
  Star, 
  MapPin,
  Heart,
  Minus,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Product, type CartItem } from "@/types/index";

const StoreFront = () => {
  try {
    // Changed from subdomain to adminSlug
    const { adminSlug } = useParams<{ adminSlug: string }>();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [adminData, setAdminData] = useState<any>(null);
    const [customerDetails, setCustomerDetails] = useState({ 
      name: "", 
      email: "", 
      phone: "" 
    });
    const [showCart, setShowCart] = useState(false);

    // Updated to use getAdminBySlug
    const { data: fetchedAdminData, isLoading: isAdminLoading } = useQuery({
      queryKey: ['adminBySlug', adminSlug],
      queryFn: () => adminSlug ? AdminService.getAdminBySlug(adminSlug) : null,
      enabled: !!adminSlug,
      staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
      if (fetchedAdminData) {
        setAdminData(fetchedAdminData);
      }
    }, [fetchedAdminData]);

    const { data: products, isLoading: isProductsLoading } = useQuery<Product[]>({
      queryKey: ['products', adminData?.id],
      queryFn: (): Promise<Product[]> => adminData?.id ? ProductService.getProductsByAdmin(adminData.id) : Promise.resolve([]),
      enabled: !!adminData?.id,
      staleTime: 2 * 60 * 1000,
    });

    const { data: categories } = useQuery<any[]>({
      queryKey: ['categories', adminData?.id],
      queryFn: () => ProductService.getCategoriesByAdminId(adminData.id),
      enabled: !!adminData?.id,
      staleTime: 5 * 60 * 1000,
    });

    const getImageUrl = (publicId: string | null) => {
      if (!publicId) {
        return `https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop&crop=center`;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(publicId);
      return data.publicUrl;
    };

    const addToCart = (product: Product) => {
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
        setCart([...cart, {
          product_id: product.id,
          quantity: 1,
          title: product.title,
          price: product.price,
          original_price: product.original_price,
          image_url: product.image_url || getImageUrl(product.image_public_id),
        }]);
      }

      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart`,
      });
      setShowCart(true);
    };

    const removeFromCart = (productId: string) => {
      setCart(cart.filter(item => item.product_id !== productId));
      toast({
        title: "Removed from cart",
        description: `Item removed from cart`,
      });
      if (cart.filter(item => item.product_id !== productId).length === 0) {
        setShowCart(false);
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
        if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
          throw new Error("Please fill in all customer details.");
        }

        const orderDetails = cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        }));

        const totalAmount = cart.reduce((sum, item) => {
          const priceToCustomer = (item.original_price ?? item.price) * 1.05;
          return sum + priceToCustomer * item.quantity;
        }, 0);

        const { data, error } = await supabase
          .from('orders')
          .insert({
            admin_id: adminData.id,
            customer_name: customerDetails.name,
            customer_email: customerDetails.email,
            customer_phone: customerDetails.phone,
            order_details: orderDetails,
            total_amount: totalAmount,
            payment_status: 'pending',
            tracking_status: 'processing',
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating order:", error);
          throw new Error(`Failed to create order: ${error.message}`);
        }

        return data;
      },
      onSuccess: (order) => {
        toast({ title: "Order Created", description: `Order ${order.id} created.` });
        handlePaymentInitiation(order.id, order.total_amount);
      },
      onError: (error: any) => {
        console.error("Create order mutation failed:", error);
        toast({ 
          title: "Error", 
          description: error.message || "Failed to create order", 
          variant: "destructive" 
        });
      }
    });

    const handlePaymentInitiation = async (orderId: string, totalAmount: number) => {
      const adminId = adminData?.id;

      if (!adminId) {
        toast({ 
          title: "Error", 
          description: "Admin ID not available for payment.", 
          variant: "destructive" 
        });
        return;
      }

      const backendEndpointUrl = `/api/initiate-payment`;

      try {
        const response = await fetch(backendEndpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            email: customerDetails.email,
            amount: totalAmount,
            admin_id: adminId,
            customer_name: customerDetails.name,
            customer_phone: customerDetails.phone,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Backend payment initiation failed:", data);
          throw new Error(data.error || 'Failed to initiate payment via backend.');
        }

        if (data.authorization_url) {
          window.location.href = data.authorization_url;
          toast({ 
            title: "Redirecting", 
            description: "You will be redirected to Paystack to complete your payment.", 
            duration: 5000 
          });
        } else {
          console.error("Payment authorization URL not received from backend:", data);
          throw new Error("Payment authorization URL not received.");
        }

      } catch (error: any) {
        console.error("Error initiating payment:", error);
        toast({ 
          title: "Payment Error", 
          description: error.message || "Failed to initiate payment.", 
          variant: "destructive" 
        });
      }
    };

    const handleCheckout = async () => {
      await createOrder.mutateAsync();
    };

    const filteredProducts = products?.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
      const hasOriginalPrice = typeof product.original_price === 'number';
      return matchesSearch && matchesCategory && hasOriginalPrice;
    }) || [];

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

    return (
      <div className="min-h-screen bg-gray-50">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <img
                    src={product.image_public_id ? getImageUrl(product.image_public_id) : (product.image_url || getImageUrl(null))}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
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
                        <p className="text-2xl font-bold" style={{ color: adminData.primary_color || '#16a34a' }}>
                          ₦{((product.original_price ?? product.price) * 1.05).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center">
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

          {filteredProducts.length === 0 && !isProductsLoading && (
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

        {showCart && (
          <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md shadow-lg z-50">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Shopping Cart</h3>
              {cart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.product_id} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0 last:pb-0">
                      <div className="flex-1 pr-2">
                        <p className="font-medium line-clamp-1">{item.title}</p>
                        <p className="text-muted-foreground">₦{((item.original_price ?? item.price) * 1.05).toLocaleString()} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-5 text-center">{item.quantity}</span>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => removeFromCart(item.product_id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-2">Your Details</h3>
                  <div className="grid gap-2">
                    <div>
                      <Input 
                        placeholder="Full Name" 
                        value={customerDetails.name} 
                        onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <Input 
                        type="email" 
                        placeholder="Email" 
                        value={customerDetails.email} 
                        onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <Input 
                        type="tel" 
                        placeholder="Phone" 
                        value={customerDetails.phone} 
                        onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <Button
                  className="mt-4 w-full"
                  style={{ backgroundColor: adminData?.primary_color || '#16a34a', color: '#fff' }}
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || createOrder.isPending || !customerDetails.name || !customerDetails.email || !customerDetails.phone}
                >
                  {createOrder.isPending ? "Processing..." : `Checkout (₦${cart.reduce((sum, item) => sum + ((item.original_price ?? item.price) * 1.05) * item.quantity, 0).toLocaleString()})`}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (err) {
    console.error('[StoreFront] Error during render:', err);
    throw err;
  }
};

export default StoreFront;