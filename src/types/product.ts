export interface Product {
  _id: string;
  id?: string;
  title?: string;
  name?: string;
  slug?: string;
  description: string;
  brand?: string;
  price: number;
  quantity?: number;
  stock?: number;
  sold?: number;
  images?: string[] | null;
  image?: string;
  tags?: string[];
  ratings?: Array<{
    star: number;
    comment?: string | null;
    postedBy: string;
    createdAt: string;
  }>;
  avgRating?: number;
  ratingCount?: number;
  categoryId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  id?: string;
  name: string;
  description?: string;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    totalItems?: number;
    total?: number;
    totalPages: number;
  };
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data: Category[];
}
