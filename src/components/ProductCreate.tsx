import React, { useState, useEffect } from 'react';
import { ProductFormState, productCategories } from '../types/product';
import { createProduct } from '../utils/api';
import { nigeriaStates } from '../data/nigeriaStates';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL!, process.env.REACT_APP_SUPABASE_ANON_KEY!);

interface ProductCreateProps {
  adminId?: string;
  onProductCreated?: () => void;
}

const ProductCreate: React.FC<ProductCreateProps> = ({ onProductCreated }) => {
  const { user, session } = useAuth(); // Destructure both user and session
  const initialAdminId = user?.id || '';
  const [formData, setFormData] = useState<ProductFormState>({
    admin_id: initialAdminId,
    title: '',
    description: '',
    price: '',
    adjusted_price: '',
    paystack_fee: '',
    superadmin_fee: '',
    image_url: '',
    image_public_id: '',
    locationState: '',
    locationAddress: '',
    lga: '',
    units_available: '',
    original_price: '',
    name: '',
    category: '',
    agerange: '',
    size: '',
    color: '',
    skintype: '',
    material: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedStateLGAs, setSelectedStateLGAs] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id && formData.admin_id !== user.id) {
      setFormData(prev => ({ ...prev, admin_id: user.id }));
    }
  }, [user, formData.admin_id]);

  useEffect(() => {
    const selectedState = nigeriaStates.find(state => state.name === formData.locationState);
    setSelectedStateLGAs(selectedState ? selectedState.lgas : []);
    setFormData(prev => ({ ...prev, lga: '' }));
  }, [formData.locationState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (['price', 'adjusted_price', 'paystack_fee', 'superadmin_fee', 'units_available', 'original_price'].includes(name)) {
      setFormData({ ...formData, [name]: value === '' ? '' : parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    if (!user) return "You must be logged in to create a product.";
    if (!formData.admin_id) return "Admin ID is missing from form data.";
    if (!formData.title.trim()) return "Title is required.";
    if (formData.price === null || formData.price === '' || isNaN(Number(formData.price))) return "Valid Price is required.";
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.category.trim()) return "Category is required.";
    if (!formData.locationState.trim()) return "State is required.";
    if (!formData.locationAddress.trim()) return "Detailed address is required.";
    if (!formData.lga.trim()) return "Local Government Area is required.";
    if (formData.units_available === null || formData.units_available === '' || isNaN(Number(formData.units_available))) return "Units Available is required.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const authToken = session?.access_token; // Use session directly from context
      if (!authToken) {
        toast.error("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const dataToSend = {
        ...formData,
        admin_id: user?.id || '',
        price: Number(formData.price),
        adjusted_price: formData.adjusted_price !== '' && formData.adjusted_price !== null ? Number(formData.adjusted_price) : null,
        paystack_fee: formData.paystack_fee !== '' && formData.paystack_fee !== null ? Number(formData.paystack_fee) : null,
        superadmin_fee: formData.superadmin_fee !== '' && formData.superadmin_fee !== null ? Number(formData.superadmin_fee) : null,
        units_available: formData.units_available !== '' && formData.units_available !== null ? Number(formData.units_available) : 1,
        original_price: formData.original_price !== '' && formData.original_price !== null ? Number(formData.original_price) : 0.00,
      };

      await createProduct(dataToSend, authToken);
      toast.success('Product created successfully!');
      setFormData({
        admin_id: user?.id || '',
        title: '',
        description: '',
        price: '',
        adjusted_price: '',
        paystack_fee: '',
        superadmin_fee: '',
        image_url: '',
        image_public_id: '',
        locationState: '',
        locationAddress: '',
        lga: '',
        units_available: '',
        original_price: '',
        name: '',
        category: '',
        agerange: '',
        size: '',
        color: '',
        skintype: '',
        material: '',
      });
      if (onProductCreated) onProductCreated();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during product creation.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormInvalid = !!validateForm();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create New Product</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required />
        </div>
        <div className="col-span-1">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required />
        </div>
        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" name="description" rows={3} value={formData.description || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div className="col-span-1">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price <span className="text-red-500">*</span></label>
          <input type="number" id="price" name="price" value={formData.price || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required min="0" step="0.01" />
        </div>
        <div className="col-span-1">
          <label htmlFor="original_price" className="block text-sm font-medium text-gray-700">Original Price</label>
          <input type="number" id="original_price" name="original_price" value={formData.original_price || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" min="0" step="0.01" />
        </div>
        <div className="col-span-1">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
          <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required>
            <option value="">Select a category</option>
            {productCategories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div className="col-span-1">
          <label htmlFor="units_available" className="block text-sm font-medium text-gray-700">Units Available <span className="text-red-500">*</span></label>
          <input type="number" id="units_available" name="units_available" value={formData.units_available || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required min="1" step="1" />
        </div>
        <div className="col-span-1">
          <label htmlFor="locationState" className="block text-sm font-medium text-gray-700">State <span className="text-red-500">*</span></label>
          <select id="locationState" name="locationState" value={formData.locationState} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required>
            <option value="">Select a state</option>
            {nigeriaStates.map(state => <option key={state.name} value={state.name}>{state.name}</option>)}
          </select>
        </div>
        <div className="col-span-1">
          <label htmlFor="lga" className="block text-sm font-medium text-gray-700">Local Government Area <span className="text-red-500">*</span></label>
          <select id="lga" name="lga" value={formData.lga} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required disabled={!formData.locationState}>
            <option value="">Select an LGA</option>
            {selectedStateLGAs.map(lga => <option key={lga} value={lga}>{lga}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700">Detailed Address <span className="text-red-500">*</span></label>
          <textarea id="locationAddress" name="locationAddress" rows={2} value={formData.locationAddress || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required />
        </div>
        <div className="col-span-1">
          <label htmlFor="adjusted_price" className="block text-sm font-medium text-gray-700">Adjusted Price</label>
          <input type="number" id="adjusted_price" name="adjusted_price" value={formData.adjusted_price || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" min="0" step="0.01" />
        </div>
        <div className="col-span-1">
          <label htmlFor="paystack_fee" className="block text-sm font-medium text-gray-700">Paystack Fee</label>
          <input type="number" id="paystack_fee" name="paystack_fee" value={formData.paystack_fee || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" min="0" step="0.01" />
        </div>
        <div className="col-span-1">
          <label htmlFor="superadmin_fee" className="block text-sm font-medium text-gray-700">Superadmin Fee</label>
          <input type="number" id="superadmin_fee" name="superadmin_fee" value={formData.superadmin_fee || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" min="0" step="0.01" />
        </div>
        <div className="col-span-1">
          <label htmlFor="agerange" className="block text-sm font-medium text-gray-700">Age Range</label>
          <input type="text" id="agerange" name="agerange" value={formData.agerange || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div className="col-span-1">
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
          <input type="text" id="size" name="size" value={formData.size || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div className="col-span-1">
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
          <input type="text" id="color" name="color" value={formData.color || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div className="col-span-1">
          <label htmlFor="skintype" className="block text-sm font-medium text-gray-700">Skin Type</label>
          <input type="text" id="skintype" name="skintype" value={formData.skintype || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div className="col-span-1">
          <label htmlFor="material" className="block text-sm font-medium text-gray-700">Material</label>
          <input type="text" id="material" name="material" value={formData.material || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div className="col-span-1">
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
          <input type="text" id="image_url" name="image_url" value={formData.image_url || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div className="col-span-1">
          <label htmlFor="image_public_id" className="block text-sm font-medium text-gray-700">Image Public ID</label>
          <input type="text" id="image_public_id" name="image_public_id" value={formData.image_public_id || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div className="col-span-2">
          <button onClick={handleSubmit} disabled={isLoading || !user} className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
            {isLoading ? 'Submitting...' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCreate;