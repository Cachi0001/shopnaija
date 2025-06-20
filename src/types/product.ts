export interface Product {
  id?: string; // uuid, NOT NULL, default gen_random_uuid()
  admin_id: string; // uuid, NOT NULL (Assuming this is managed by authentication context)
  category_id?: string | null; // uuid, NULLABLE (If you use category IDs instead of names)
  title: string; // text, NOT NULL
  description?: string | null; // text, NULLABLE
  price: number; // numeric, NOT NULL
  adjusted_price?: number | null; // numeric, NULLABLE
  paystack_fee?: number | null; // numeric, NULLABLE
  superadmin_fee?: number | null; // numeric, NULLABLE
  image_url?: string | null; // text, NULLABLE
  image_public_id?: string | null; // text, NULLABLE
  location_state: string; // text, NOT NULL
  location_address: string; // text, NOT NULL
  lga: string; // text, NOT NULL
  created_at?: string | null; // timestamp with time zone, NULLABLE, default now()
  updated_at?: string | null; // timestamp with time zone, NULLABLE, default now()
  units_available: number; // integer, NOT NULL, default 1
  original_price: number; // numeric, NOT NULL, default 0.00
  name: string; // text, NOT NULL
  category: string; // text, NOT NULL
  agerange?: string | null; // text, NULLABLE
  size?: string | null; // text, NULLABLE
  color?: string | null; // text, NULLABLE
  skintype?: string | null; // text, NULLABLE
  material?: string | null; // text, NULLABLE
}

export interface ProductFormState {
  admin_id: string;
  category_id?: string | null;
  title: string;
  description?: string | null;
  price: number | null | '';
  adjusted_price?: number | null | '';
  paystack_fee?: number | null | '';
  superadmin_fee?: number | null | '';
  image_url?: string | null;
  image_public_id?: string | null;
  locationState: string; // Mandatory state
  locationAddress: string; // Mandatory address
  lga: string; // Mandatory LGA
  units_available: number | null | '';
  original_price: number | null | '';
  name: string;
  category: string;
  agerange?: string | null;
  size?: string | null;
  color?: string | null;
  skintype?: string | null;
  material?: string | null;
}

export type ProductCategory =
  | 'Babies & Kids'
  | 'Fashion'
  | 'Beauty & Personal Care'
  | 'Shoes'
  | 'Electronics'
  | 'Food, Agriculture & Farming'
  | 'Commercial Equipment & Tools'
  | 'Home, Appliances & Furniture'
  | 'Jobs'
  | 'Leisure & Activities'
  | 'Pets'
  | 'Phones & Tablets'
  | 'Property'
  | 'Repair & Construction'
  | 'Seeking Work CVs'
  | 'Services'
  | 'Vehicles'
  | 'Uncategorized';

export const productCategories: ProductCategory[] = [
  'Babies & Kids',
  'Fashion',
  'Beauty & Personal Care',
  'Shoes',
  'Electronics',
  'Food, Agriculture & Farming',
  'Commercial Equipment & Tools',
  'Home, Appliances & Furniture',
  'Jobs',
  'Leisure & Activities',
  'Pets',
  'Phones & Tablets',
  'Property',
  'Repair & Construction',
  'Seeking Work CVs',
  'Services',
  'Vehicles',
  'Uncategorized',
];
