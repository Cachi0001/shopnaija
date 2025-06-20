
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "./AddProductDialog";
import { Category } from "@/types";

interface AdminHeaderProps {
  user: any;
  categories: Category[];
  editingProduct: any;
  onProductSaved: () => void;
  remainingProducts: number;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}

export const AdminHeader = ({
  user,
  categories,
  editingProduct,
  onProductSaved,
  remainingProducts,
  uploading,
  setUploading
}: AdminHeaderProps) => {
  return (
    <div className="hidden lg:flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening in your store today.
        </p>
      </div>
      <div className="mt-4 md:mt-0">
        <AddProductDialog
          user={user}
          categories={categories}
          editingProduct={editingProduct}
          onProductSaved={onProductSaved}
          remainingProducts={remainingProducts}
          uploading={uploading}
          setUploading={setUploading}
        />
      </div>
    </div>
  );
};
