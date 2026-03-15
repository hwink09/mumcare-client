import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CurrentUser } from "@/hooks/useAuth";

type CouponsPageProps = {
  user?: CurrentUser | null;
};

type Coupon = {
  _id: string;
  name: string;
  discount: number;
  expiry: string;
  createdAt?: string;
};

export function CouponsPage({ user }: CouponsPageProps) {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadCoupons();
  }, [user, navigate]);

  const loadCoupons = async () => {
    setError(null);
    setLoading(true);
    try {
      // Import here to avoid circular dependency
      const { default: couponService } = await import("@/services/couponService");
      const data = await couponService.getMyCoupons();
      setCoupons(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const formatExpiry = (expiryString: string) => {
    const expiryDate = new Date(expiryString);
    return expiryDate.toLocaleDateString();
  };

  const isExpired = (expiryString: string) => {
    const expiryDate = new Date(expiryString);
    return expiryDate < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            ← Back to Home
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold tracking-tight">My Coupons</h1>
            <p className="mt-3 text-base text-muted-foreground">
              View and manage your available discount coupons.
            </p>
          </div>

          <Card className="border-0 shadow-lg shadow-slate-100">
            <CardHeader>
              <CardTitle>Available Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-muted-foreground">Loading coupons...</div>
              ) : error ? (
                <div className="py-12 text-center text-red-600">{error}</div>
              ) : coupons.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No coupons available.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {coupons.map((coupon) => (
                    <Card key={coupon._id} className="border-2 border-dashed">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-600 mb-2">
                            {coupon.discount}% OFF
                          </div>
                          <div className="text-lg font-semibold mb-1">
                            {coupon.name}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            Valid until {formatExpiry(coupon.expiry)}
                          </div>
                          <Badge variant={isExpired(coupon.expiry) ? "destructive" : "secondary"}>
                            {isExpired(coupon.expiry) ? "Expired" : "Active"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}