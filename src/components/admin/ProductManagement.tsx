import React from 'react';
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";
import { Product, Category } from "@/types";
import ProductForm from './ProductForm';
import ProductCard from "./ProductCard";

const ProductManagement: React.FC = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentMonthProducts, setCurrentMonthProducts] = useState(0);
  const [uploading, setUploading] = useState(false);
  const MAX_PRODUCTS = 600; // Monthly limit

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        ProductService.getProductsByAdmin(user!.id),
        CategoryService.getCategoriesByAdmin(user!.id)
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setCurrentMonthProducts(productsData.length);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await ProductService.deleteProduct(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading products...</div>;
  }

  const remainingProducts = MAX_PRODUCTS - currentMonthProducts;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-full overflow-x-hidden">
      <div className="space-y-4">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold">Product Management</h2>
            <p className="text-sm text-gray-600">
              {currentMonthProducts}/{MAX_PRODUCTS} products this month ({remainingProducts} remaining)
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <ProductForm
              user={user}
              categories={categories}
              editingProduct={editingProduct}
              onProductSaved={() => {
                setEditingProduct(null);
                loadData();
              }}
              remainingProducts={remainingProducts}
              uploading={uploading}
              setUploading={setUploading}
            />
          </div>
        </div>

        {remainingProducts <= 0 && !editingProduct && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 text-sm">
              You've reached your monthly limit of {MAX_PRODUCTS} products. You can still edit existing products.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No products yet</p>
              <p className="text-sm text-gray-400 text-center">Click "Add Product" to get started</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              uploading={uploading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
