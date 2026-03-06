import type { Product } from "@/types/product";

export const MOCK_CATEGORIES = [
  { _id: "cat-1", name: "Infant Formula" },
  { _id: "cat-2", name: "Pregnancy Care" },
  { _id: "cat-3", name: "Toddler Nutrition" },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    _id: "p-1",
    id: "p-1",
    title: "Premium Infant Formula",
    name: "Premium Infant Formula",
    slug: "premium-infant-formula",
    description: "Complete nutrition for newborns with essential nutrients.",
    brand: "MomCare",
    price: 49.99,
    quantity: 120,
    image: "https://images.unsplash.com/photo-1584624286477-3a2fb5737ab5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1584624286477-3a2fb5737ab5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"],
    tags: ["Infant", "Organic"],
    categoryId: "cat-1",
    avgRating: 4.6,
    ratingCount: 24,
  },
  {
    _id: "p-2",
    id: "p-2",
    title: "Pregnancy Support Vitamins",
    name: "Pregnancy Support Vitamins",
    slug: "pregnancy-support-vitamins",
    description: "Essential prenatal vitamins for healthy pregnancy.",
    brand: "MomCare",
    price: 34.99,
    quantity: 95,
    image: "https://images.unsplash.com/photo-1699530930175-2e4ff90e0da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1699530930175-2e4ff90e0da0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"],
    tags: ["Pregnancy", "Vitamins"],
    categoryId: "cat-2",
    avgRating: 4.8,
    ratingCount: 31,
  },
  {
    _id: "p-3",
    id: "p-3",
    title: "Toddler Growing Up Milk",
    name: "Toddler Growing Up Milk",
    slug: "toddler-growing-up-milk",
    description: "Specially formulated for toddlers aged 1-3 years.",
    brand: "MomCare",
    price: 39.99,
    quantity: 77,
    image: "https://images.unsplash.com/photo-1599599810694-b5ac4dd33dbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1599599810694-b5ac4dd33dbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"],
    tags: ["Toddler", "Nutrition"],
    categoryId: "cat-3",
    avgRating: 4.5,
    ratingCount: 18,
  },
  {
    _id: "p-4",
    id: "p-4",
    title: "Nursing Pillow Set",
    name: "Nursing Pillow Set",
    slug: "nursing-pillow-set",
    description: "Comfortable pillow designed for nursing mothers.",
    brand: "MomCare",
    price: 54.99,
    quantity: 42,
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    images: ["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"],
    tags: ["Nursing", "Comfort"],
    categoryId: "cat-2",
    avgRating: 4.7,
    ratingCount: 12,
  },
];

export const FEATURED_PRODUCTS: Product[] = MOCK_PRODUCTS;

export const MOCK_BLOG_CATEGORIES = [
  { _id: "bc-1", name: "Pregnancy" },
  { _id: "bc-2", name: "Baby Care" },
  { _id: "bc-3", name: "Postpartum" },
];

export const MOCK_BLOGS = [
  {
    _id: "b-1",
    title: "Essential Nutrients During Pregnancy",
    description: "Learn about key vitamins and minerals for a healthy pregnancy.",
    content: "A balanced pregnancy diet should include folate, iron, calcium, vitamin D, and DHA...",
    categoryId: "bc-1",
    image: "https://images.unsplash.com/photo-1734607404585-bd97529f1f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "b-2",
    title: "First Year Baby Feeding Guide",
    description: "A complete guide to feeding your baby from newborn to 12 months.",
    content: "During the first 6 months, breast milk or formula is the primary source of nutrition...",
    categoryId: "bc-2",
    image: "https://images.unsplash.com/photo-1604599730009-fe273616197c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "b-3",
    title: "Postpartum Nutrition Tips",
    description: "How to nourish your body after childbirth and while breastfeeding.",
    content: "After delivery, focus on hydration, protein-rich meals, and nutrient-dense snacks...",
    categoryId: "bc-3",
    image: "https://images.unsplash.com/photo-1685900464809-5edadb95da37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_ORDERS = [
  {
    _id: "o-1",
    orderCode: "ORD-A12B3",
    status: "delivered",
    address: "123 Nguyen Hue, District 1, HCMC",
    couponCode: "WELCOME10",
    discountAmount: 5,
    createdAt: new Date().toISOString(),
    products: [
      { productId: "p-1", count: 1 },
      { productId: "p-2", count: 2 },
    ],
  },
  {
    _id: "o-2",
    orderCode: "ORD-C45D6",
    status: "shipping",
    address: "22 Le Loi, District 3, HCMC",
    couponCode: null,
    discountAmount: 0,
    createdAt: new Date().toISOString(),
    products: [{ productId: "p-3", count: 1 }],
  },
];

export const MOCK_CURRENT_USER = {
  firstName: "Demo",
  lastName: "User",
  email: "demo@momcare.com",
  loyaltyPoint: 1280,
};
