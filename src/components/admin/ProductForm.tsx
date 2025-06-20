import React from 'react';
import ProductCreate from './ProductCreate';

const ProductForm: React.FC<{
  user: any;
  categories: any[];
  editingProduct: any;
  onProductSaved: () => void;
  remainingProducts: number;
  uploading: boolean;
  setUploading: (value: boolean) => void;
}> = ({ user, categories, editingProduct, onProductSaved, remainingProducts, uploading, setUploading }) => {
  return (
    <ProductCreate
      user={user}
      categories={categories}
      editingProduct={editingProduct}
      onProductSaved={onProductSaved}
      remainingProducts={remainingProducts}
      uploading={uploading}
      setUploading={setUploading}
    />
  );
};

export default ProductForm;
