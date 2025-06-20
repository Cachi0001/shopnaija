
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileImage } from "lucide-react";
import { Category } from "@/types";
import { ProductService } from "@/services/ProductService";

interface BulkUploadDialogProps {
  user: any;
  categories: Category[];
  onProductSaved: () => void;
  remainingProducts: number;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}

export const BulkUploadDialog = ({ 
  user, 
  categories, 
  onProductSaved, 
  remainingProducts,
  uploading,
  setUploading 
}: BulkUploadDialogProps) => {
  const { toast } = useToast();
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [bulkFormData, setBulkFormData] = useState({
    baseTitle: "",
    description: "",
    price: "",
    location: "",
    category_id: ""
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => {
        // Check file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file",
            description: `${file.name} is not an image file`,
            variant: "destructive"
          });
          return false;
        }
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive"
          });
          return false;
        }
        return true;
      });
      
      setSelectedFiles(files);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkFormData.baseTitle || !bulkFormData.price || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select images",
        variant: "destructive"
      });
      return;
    }

    const remainingSlots = remainingProducts;
    if (remainingSlots <= 0) {
      toast({
        title: "Monthly limit reached",
        description: "You've reached your monthly product limit",
        variant: "destructive"
      });
      return;
    }

    const filesToProcess = selectedFiles.slice(0, remainingSlots);
    
    if (filesToProcess.length < selectedFiles.length) {
      toast({
        title: "Partial upload",
        description: `Only ${filesToProcess.length} out of ${selectedFiles.length} products will be uploaded due to monthly limit`,
        variant: "default"
      });
    }

    try {
      setUploading(true);
      const price = parseFloat(bulkFormData.price);
      const fees = calculateFees(price);
      
      // Create products (assuming ImageUploadService would handle image uploads)
      const uploadPromises = filesToProcess.map(async (file, index) => {
        const productData = {
          title: `${bulkFormData.baseTitle}-${index + 1}`,
          description: bulkFormData.description,
          admin_id: user.id,
          price,
          units_available: 1,
          adjusted_price: fees.adjustedPrice,
          paystack_fee: fees.paystackFee,
          superadmin_fee: fees.superadminFee,
          location: bulkFormData.location,
          category_id: bulkFormData.category_id || null,
          image_url: URL.createObjectURL(file) // Temporary URL for demo
        };

        return ProductService.createProduct(productData);
      });

      await Promise.all(uploadPromises);
      
      toast({
        title: "Success",
        description: `${filesToProcess.length} products uploaded successfully`
      });
      
      setBulkDialogOpen(false);
      setBulkFormData({
        baseTitle: "",
        description: "",
        price: "",
        location: "",
        category_id: ""
      });
      setSelectedFiles([]);
      onProductSaved();
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload products",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-blue-50 hover:bg-blue-100 w-full sm:w-auto sm:min-w-[140px] h-10 text-sm font-medium"
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Products</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <div>
            <Label htmlFor="baseTitle">Base Title *</Label>
            <Input
              id="baseTitle"
              value={bulkFormData.baseTitle}
              onChange={(e) => setBulkFormData({...bulkFormData, baseTitle: e.target.value})}
              placeholder="Product will be named: Title-1, Title-2, etc."
              required
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="bulkDescription">Description</Label>
            <Textarea
              id="bulkDescription"
              value={bulkFormData.description}
              onChange={(e) => setBulkFormData({...bulkFormData, description: e.target.value})}
              className="min-h-[80px]"
            />
          </div>
          <div>
            <Label htmlFor="bulkPrice">Price (₦) *</Label>
            <Input
              id="bulkPrice"
              type="number"
              value={bulkFormData.price}
              onChange={(e) => setBulkFormData({...bulkFormData, price: e.target.value})}
              required
              className="h-11"
            />
            {bulkFormData.price && (
              <p className="text-xs text-gray-500 mt-1">
                Customer pays: ₦{(parseFloat(bulkFormData.price) + (parseFloat(bulkFormData.price) * 0.015) + 100).toFixed(2)}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="bulkCategory">Category</Label>
            <Select value={bulkFormData.category_id} onValueChange={(value) => setBulkFormData({...bulkFormData, category_id: value})}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bulkLocation">Location</Label>
            <Input
              id="bulkLocation"
              value={bulkFormData.location}
              onChange={(e) => setBulkFormData({...bulkFormData, location: e.target.value})}
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="imageFiles">Images *</Label>
            <Input
              id="imageFiles"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="cursor-pointer h-11"
            />
            <p className="text-xs text-gray-500 mt-1">
              Select multiple images (max 10MB each). Can upload up to {remainingProducts} products.
            </p>
          </div>
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files: {selectedFiles.length}</p>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {selectedFiles.slice(0, 6).map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-16 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                      <FileImage className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ))}
                {selectedFiles.length > 6 && (
                  <div className="flex items-center justify-center bg-gray-100 rounded h-16">
                    <span className="text-xs text-gray-600">+{selectedFiles.length - 6} more</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1 h-11 font-medium" disabled={selectedFiles.length === 0 || uploading}>
              {uploading ? "Uploading..." : `Upload ${selectedFiles.length} Products`}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setBulkDialogOpen(false)}
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
