
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Product, Category } from "@/types";
import { ProductService } from "@/services/ProductService";
import { ProductFormFields } from "./ProductFormFields";

interface AddProductDialogProps {
  user: any;
  categories: Category[];
  editingProduct: Product | null;
  onProductSaved: () => void;
  remainingProducts: number;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}

export const AddProductDialog = ({ 
  user, 
  categories, 
  editingProduct, 
  onProductSaved, 
  remainingProducts,
  uploading,
  setUploading 
}: AddProductDialogProps) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category_id: "",
    image_url: "",
    units_available: ""
  });

  const calculateFees = (price: number) => {
    const paystackFee = (price * 0.015) + 100; // 1.5% + ₦100
    const superadminFee = price * 0.015; // 1.5%
    const adjustedPrice = price + paystackFee;
    
    return {
      paystackFee,
      superadminFee,
      adjustedPrice
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.units_available || !formData.image_url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Title, Price, Units Available, and Image URL)",
        variant: "destructive"
      });
      return;
    }

    const unitsAvailable = parseInt(formData.units_available);
    if (unitsAvailable < 0) {
      toast({
        title: "Error",
        description: "Units available must be 0 or greater",
        variant: "destructive"
      });
      return;
    }

    try {
      const price = parseFloat(formData.price);
      const fees = calculateFees(price);
      
      const productData = {
        ...formData,
        admin_id: user.id,
        price,
        units_available: unitsAvailable,
        adjusted_price: fees.adjustedPrice,
        paystack_fee: fees.paystackFee,
        superadmin_fee: fees.superadminFee,
        category_id: formData.category_id || null
      };

      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        await ProductService.createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }

      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        price: "",
        location: "",
        category_id: "",
        image_url: "",
        units_available: ""
      });
      onProductSaved();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description || "",
      price: product.price.toString(),
      location: product.location || "",
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      units_available: (product as any).units_available?.toString() || "1"
    });
    setDialogOpen(true);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-brand-800 hover:bg-brand-700 w-full sm:w-auto sm:min-w-[140px] h-10 text-sm font-medium shadow-lg"
          onClick={() => {
            setFormData({
              title: "",
              description: "",
              price: "",
              location: "",
              category_id: "",
              image_url: "",
              units_available: ""
            });
          }}
          disabled={(!editingProduct && remainingProducts <= 0) || uploading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductFormFields 
            formData={formData}
            setFormData={setFormData}
            categories={categories}
          />
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1 h-11 font-medium" disabled={uploading}>
              {uploading ? "Saving..." : (editingProduct ? "Update" : "Create") + " Product"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={uploading}
              className="h-11 font-medium"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
