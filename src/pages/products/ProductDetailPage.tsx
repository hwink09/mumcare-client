import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "@/services/productService";
import type { Product } from "@/types/product";

// ui components
import { Button } from "@/components/ui/button";

interface ProductDetailPageProps {
  onAddToCart?: (product: Product) => void;
}

export function ProductDetailPage({ onAddToCart }: ProductDetailPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getProductById(id);
        if (mounted) setProduct((res?.data || res) as Product);
      } catch {
        if (mounted) {
          setError("Failed to load product. Please try again.");
          setProduct(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const mainImage = useMemo(() => {
    const img = product?.image;
    const imgs = product?.images;
  
    if (typeof img === "string" && img) return img;
    if (Array.isArray(imgs) && imgs.length) return imgs[0];
    if (typeof imgs === "string" && imgs) return imgs;
  
    return "https://placehold.co/800x500?text=MomCare";
  }, [product]);
  
  const handleAddToCartClick = () => {
    if (!product) return;
    onAddToCart?.(product);
    setAddedMessage("Added to cart");
    setTimeout(() => setAddedMessage(null), 2000);
  };


  if (loading) return <div className="py-20 text-center">Loading product...</div>;

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10">
        <Button variant="outline" onClick={() => navigate("/products")} className="mb-6">Back to products</Button>

        {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
        {addedMessage && <div className="mb-4 p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">{addedMessage}</div>}

        {!product ? (
          <div className="text-center text-muted-foreground">Product not found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden bg-gray-100 h-85">
              <img src={mainImage} alt={product.title || product.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title || product.name}</h1>
              <p className="text-muted-foreground mb-4">{product.description}</p>
              <div className="text-3xl font-bold text-primary mb-4">${Number(product.price || 0).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mb-6">Brand: {product.brand || "MomCare"}</div>

              <div className="flex gap-3">
                <Button onClick={handleAddToCartClick}>Add to cart</Button>
                <Button variant="outline" onClick={() => navigate("/cart")}>Go to cart</Button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
