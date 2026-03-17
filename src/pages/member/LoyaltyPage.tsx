import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Star, ShoppingBag, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Coupon = {
  _id: string;
  name: string;
  discount: number;
  expiry: string;
  pointCost?: number;
  createdAt?: string;
};

export function LoyaltyPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [exchangeableCoupons, setExchangeableCoupons] = useState<Coupon[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      if (mounted) navigate("/login");
      return;
    }

    const loadData = async () => {
      setError(null);
      setLoading(true);
      try {
        const { default: couponService } = await import("@/services/couponService");
        const { default: orderService } = await import("@/services/orderService");
        
        const results = await Promise.allSettled([
          couponService.getMyCoupons(),
          orderService.getMyOrders()
        ]);

        if (!mounted) return;

        const userCoupons = results[0].status === 'fulfilled' ? (results[0].value || []) : [];
        const rawOrders = results[1].status === 'fulfilled' ? results[1].value : [];
        const userOrders = Array.isArray(rawOrders) ? rawOrders : (rawOrders.data || []);

        // Hardcoded coupons because the server restricts `GET /coupons` to ADMIN/STAFF
        // IDs are the real MongoDB ObjectId values from the database
        const allCouponsData: Coupon[] = [
          {
            _id: "69b5f58d8a40d02072e8aa37",
            name: "GIAMGIA15",
            discount: 15,
            expiry: "2026-03-20T00:01:37.407Z",
            pointCost: 15
          },
          {
            _id: "69b5f6f2758082d068530129",
            name: "GIAMGIA35",
            discount: 35,
            expiry: "2026-03-22T19:09:33.862Z",
            pointCost: 35
          },
          {
            _id: "69b703fc988b1df0c8d91721",
            name: "GIAMGIA40",
            discount: 40,
            expiry: "2026-03-25T19:09:48.415Z",
            pointCost: 40
          }
        ];
        
        // Frontend Point Calculation Workaround
        // 1. Earned points from delivered orders (finalTotal / 10000)
        let earnedPoints = 0;
        const deliveredOrderCouponCodes = new Set<string>(); // coupons in delivered orders → consumed
        const activeOrderCouponCodes = new Set<string>();    // coupons in pending/shipped orders → locked but not consumed
        
        userOrders.forEach((order: any) => {
          if (order.status === 'delivered') {
            const final = order.finalTotal || 0;
            earnedPoints += Math.floor(final / 10000);
            if (order.couponCode) deliveredOrderCouponCodes.add(order.couponCode);
          } else if (order.couponCode && order.status !== 'canceled') {
            activeOrderCouponCodes.add(order.couponCode);
          }
        });

        // 2. Spent points = points for all redeemed coupons user currently holds
        //    + points for coupons already consumed in delivered orders
        let spentPoints = 0;
        userCoupons.forEach((c: any) => {
          const matched = allCouponsData.find(ac => ac._id === c._id || ac.name === c.name);
          if (matched && matched.pointCost) spentPoints += matched.pointCost;
        });
        Array.from(deliveredOrderCouponCodes).forEach(code => {
          // If coupon is from delivered order but no longer in getMyCoupons (already removed), skip
          // If it IS still in user's coupons list, it was already counted above
          const stillOwned = userCoupons.some((c: any) => c.name === code);
          if (!stillOwned) {
            const matched = allCouponsData.find(ac => ac.name === code);
            if (matched && matched.pointCost) spentPoints += matched.pointCost;
          }
        });

        const calculatedPoints = Math.max(0, earnedPoints - spentPoints);
        
        // My Coupons: hide coupons that belong to delivered orders (they're consumed)
        const visibleCoupons = userCoupons.filter(
          (c: any) => !deliveredOrderCouponCodes.has(c.name)
        );
        setCoupons(visibleCoupons);
        setPoints(calculatedPoints);

        // Rewards Exchange: hide coupons already owned OR already tied to any active order
        const userCouponIds = new Set(userCoupons.map((c: Coupon) => c._id));
        const allUsedCodes = new Set([...deliveredOrderCouponCodes, ...activeOrderCouponCodes]);
        const availableToExchange = allCouponsData
          .filter((c: Coupon) => {
            if (c.pointCost === undefined || c.pointCost <= 0) return false;
            if (userCouponIds.has(c._id)) return false;          // already owned
            if (allUsedCodes.has(c.name)) return false;          // already used/applied
            return new Date(c.expiry) >= new Date();
          });

        setExchangeableCoupons(availableToExchange);
      } catch (err: any) {
        if (mounted) setError(err?.response?.data?.message || err?.message || "Failed to load loyalty data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleExchange = async (coupon: Coupon) => {
    if (points < (coupon.pointCost || 0)) {
        alert(`Not enough points. Required: ${coupon.pointCost}, available: ${points}`);
        return;
    }
    if (!window.confirm(`Exchange ${coupon.pointCost} points for ${coupon.discount}% OFF voucher?`)) return;

    setExchangeLoading(coupon._id);
    try {
        const { default: authService } = await import("@/services/userService");
        await authService.redeemCoupon(coupon._id);
        alert("Voucher exchanged successfully!");
        // Optimistically update
        setPoints(prev => prev - (coupon.pointCost || 0));
        setCoupons(prev => [...prev, coupon]);
        setExchangeableCoupons(prev => prev.filter(c => c._id !== coupon._id));
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
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Loyalty & Voucher</h1>
            <p className="text-muted-foreground">Track your points and use vouchers at checkout</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>Back Home</Button>
        </div>

        {/* Current Points Dashboard */}
        <Card className="mb-8 border-0 shadow-lg shadow-indigo-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-indigo-500" /> Current Points</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground">Loading points...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="text-5xl font-bold text-indigo-600">{points.toLocaleString()} pts</div>
            )}
            <p className="text-sm text-muted-foreground mt-2">Points are awarded when your order is delivered.</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2"><ShoppingBag className="h-4 w-4 text-emerald-500" /> <span className="font-medium">From Purchase</span></div>
              <p className="text-sm text-muted-foreground">Earn points when your order status becomes delivered.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2"><Star className="h-4 w-4 text-amber-500" /> <span className="font-medium">From Review</span></div>
              <p className="text-sm text-muted-foreground">Submit product rating & comment to join engagement programs.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2"><Megaphone className="h-4 w-4 text-blue-500" /> <span className="font-medium">From Campaign</span></div>
              <p className="text-sm text-muted-foreground">Campaign points can be added in future promotion events.</p>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Exchange Section */}
        {exchangeableCoupons.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-amber-700">Rewards Exchange</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exchangeableCoupons.map((coupon) => (
                <Card key={coupon._id} className="border-2 border-dashed border-amber-200 bg-amber-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-amber-600 mb-2">
                        {coupon.discount}% OFF
                      </div>
                      <div className="text-lg font-semibold mb-1">
                        {coupon.name}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Valid until {formatExpiry(coupon.expiry)}
                      </div>
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
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
          </div>
        )}

        {/* My Coupons Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-slate-800">My Coupons</h2>
          {loading ? (
             <div className="text-muted-foreground py-4">Loading your coupons...</div>
          ) : coupons.length === 0 ? (
             <Card className="bg-slate-50 border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  You don't have any active coupons yet.
                </CardContent>
             </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon) => (
                <Card key={coupon._id} className="border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-2">
                        {coupon.discount}% OFF
                      </div>
                      <div className="text-lg font-semibold mb-1">
                        {coupon.name}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Exp. {formatExpiry(coupon.expiry)}
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
        </div>

      </div>
    </div>
  );
}
