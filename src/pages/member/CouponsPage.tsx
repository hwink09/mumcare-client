import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CurrentUser } from "@/hooks/useAuth";
import couponService from "@/services/couponService";
import authService from "@/services/userService";

type CouponsPageProps = {
  user?: CurrentUser | null;
};

type Coupon = {
  _id: string;
  name: string;
  discount: number;
  expiry: string;
  pointCost?: number;
  createdAt?: string;
};

export function CouponsPage({ user }: CouponsPageProps) {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [exchangeableCoupons, setExchangeableCoupons] = useState<Coupon[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    void loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [myCouponsData, allCouponsData, meData] = await Promise.all([
        couponService.getMyCoupons(),
        couponService.getAll(),
        authService.getMe()
      ]);

      const userCoupons = myCouponsData || [];
      const userPoints = meData?.loyaltyPoint || 0;
      setCoupons(userCoupons);
      setPoints(userPoints);

      const userCouponIds = new Set(userCoupons.map((c: Coupon) => c._id));
      const availableToExchange = (Array.isArray(allCouponsData) ? allCouponsData : allCouponsData.data || [])
        .filter((c: Coupon) => c.pointCost !== undefined && c.pointCost > 0 && !userCouponIds.has(c._id) && new Date(c.expiry) >= new Date());

      setExchangeableCoupons(availableToExchange);
    } catch (err: any) {
      setError(err?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async (coupon: Coupon) => {
    if (points < (coupon.pointCost || 0)) {
        alert(`Not enough points. Required: ${coupon.pointCost}, available: ${points}`);
        return;
    }
    if (!window.confirm(`Exchange ${coupon.pointCost} points for ${coupon.discount}% OFF voucher?`)) return;

    setExchangeLoading(coupon._id);
    try {
        await authService.redeemCoupon(coupon._id);
        alert("Voucher exchanged successfully!");
        void loadData();
    } catch (err: any) {
        alert(err?.response?.data?.message || err?.message || "Exchange failed.");
    } finally {
        setExchangeLoading(null);
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
    <div className="min-h-screen bg-linear-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
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

          <Card className="border-0 shadow-lg shadow-slate-100 mb-8">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>My Coupons</CardTitle>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                <span>Loyalty Points:</span>
                <span className="text-xl">{points}</span>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-muted-foreground">Loading coupons...</div>
              ) : error ? (
                <div className="py-12 text-center text-red-600">{error}</div>
              ) : coupons.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No coupons available. Complete orders to earn points and exchange for vouchers!
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

          {exchangeableCoupons.length > 0 && (
            <Card className="border-0 shadow-lg shadow-amber-100">
              <CardHeader>
                <CardTitle className="text-amber-700">Rewards Exchange</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {exchangeableCoupons.map((coupon) => (
                      <Card key={coupon._id} className="border-2 border-dashed border-amber-200 bg-amber-50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600 mb-2">
                              {coupon.discount}% OFF
                            </div>
                            <div className="text-lg font-semibold mb-1">
                              {coupon.name}
                            </div>
                            <div className="text-sm text-muted-foreground mb-4">
                              Valid until {formatExpiry(coupon.expiry)}
                            </div>
                            <Button 
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                              disabled={exchangeLoading === coupon._id || points < (coupon.pointCost || 0)}
                              onClick={() => handleExchange(coupon)}
                            >
                              {exchangeLoading === coupon._id ? "Exchanging..." : `Exchange for ${coupon.pointCost} pts`}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
