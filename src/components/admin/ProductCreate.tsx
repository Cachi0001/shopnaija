import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ProductFormState {
  title: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  locationState: string;
  locationAddress: string;
  lga: string;
  imageFile: File | null;
}

const ProductCreate: React.FC<{
  user: any;
  categories: any[];
  editingProduct: any;
  onProductSaved: () => void;
  remainingProducts: number;
  uploading: boolean;
  setUploading: (value: boolean) => void;
}> = ({ user, categories, editingProduct, onProductSaved, remainingProducts, uploading, setUploading }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProductFormState>({
    title: editingProduct?.title || '',
    description: editingProduct?.description || '',
    price: editingProduct?.price || 0,
    stockQuantity: editingProduct?.stockQuantity || 0,
    categoryId: editingProduct?.categoryId || '',
    locationState: editingProduct?.locationState || '',
    locationAddress: editingProduct?.locationAddress || '',
    lga: editingProduct?.lga || '',
    imageFile: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingProducts <= 0 && !editingProduct) {
      toast({ title: "Limit Reached", description: "Monthly product limit exceeded.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      // Simulate API call (replace with actual service call)
      console.log('Submitting product:', formData);
      toast({ title: "Success", description: "Product saved!" });
      onProductSaved();
      setFormData({
        title: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        categoryId: '',
        locationState: '',
        locationAddress: '',
        lga: '',
        imageFile: null,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="price">Price (₦) *</Label>
        <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required />
      </div>
      <div>
        <Label htmlFor="stockQuantity">Stock Quantity *</Label>
        <Input id="stockQuantity" type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} required min="0" />
      </div>
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, categoryId: value })} value={formData.categoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="locationState">Location State</Label>
        <Input id="locationState" value={formData.locationState} onChange={(e) => setFormData({ ...formData, locationState: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="locationAddress">Location Address</Label>
        <Input id="locationAddress" value={formData.locationAddress} onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="lga">LGA</Label>
        <Input id="lga" value={formData.lga} onChange={(e) => setFormData({ ...formData, lga: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="image">Product Image</Label>
        <Input id="image" type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })} />
      </div>
      <Button type="submit" disabled={uploading} className="w-full">Create Product</Button>
    </form>
  );
};

export default ProductCreate; 