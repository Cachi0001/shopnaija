import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash } from "lucide-react";
import { Product } from "@/types";

interface ProductCardProps {
  product: {
    title: string;
    price: number | string;
    locationState?: string;
    locationAddress?: string;
    lga?: string;
    created_at?: string;
    [key: string]: any;
  };
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  uploading: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, uploading }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate">{product.title}</CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(product as Product)}
              disabled={uploading}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(product.id)}
              disabled={uploading}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-32 object-cover rounded mb-3"
          />
        )}
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="space-y-1">
          <p className="font-semibold">Original Price: ₦{product.original_price?.toFixed(2)}</p>
          <p className="font-semibold">Price: ₦{product.price?.toFixed(2)}</p>
          <p className="text-xs text-gray-500">
            Customer pays: ₦{product.adjusted_price?.toFixed(2)}
          </p>
          <p className="text-sm font-medium text-blue-600">
            Stock: {product.units_available || 0} units
          </p>
          {product.locationState && (
            <p className="text-xs text-gray-500">State: {product.locationState}</p>
          )}
          {product.lga && (
            <p className="text-xs text-gray-500">LGA: {product.lga}</p>
          )}
          {product.locationAddress && (
            <p className="text-xs text-gray-500">Address: {product.locationAddress}</p>
          )}
          {product.created_at && (
            <p className="text-xs text-gray-500">Last Updated: {new Date(product.created_at).toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;