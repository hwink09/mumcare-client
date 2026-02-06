export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
}
