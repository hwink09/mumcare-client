import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Star, ShoppingBag, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/userService";
import { MOCK_CURRENT_USER } from "@/constants/mockData";

export function LoyaltyPage() {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await getCurrentUser();
        const user = res?.data || res?.user || res;
        if (mounted) setPoints(Number(user?.loyaltyPoint || 0));
      } catch {
        if (mounted) setPoints(Number(MOCK_CURRENT_USER.loyaltyPoint || 0));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Loyalty & Voucher</h1>
            <p className="text-muted-foreground">Track your points and use vouchers at checkout</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>Back Home</Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Current Points</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground">Loading points...</div>
            ) : (
              <div className="text-4xl font-bold text-primary">{points.toLocaleString()} pts</div>
            )}
            <p className="text-sm text-muted-foreground mt-2">Points are awarded when your order is delivered.</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2"><ShoppingBag className="h-4 w-4" /> <span className="font-medium">From Purchase</span></div>
              <p className="text-sm text-muted-foreground">Earn points when your order status becomes delivered.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2"><Star className="h-4 w-4" /> <span className="font-medium">From Review</span></div>
              <p className="text-sm text-muted-foreground">Submit product rating & comment to join engagement programs.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2"><Megaphone className="h-4 w-4" /> <span className="font-medium">From Campaign</span></div>
              <p className="text-sm text-muted-foreground">Campaign points can be added in future promotion events.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Voucher usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You can enter voucher code directly in checkout.</p>
            <Button onClick={() => navigate("/checkout")}>Go to Checkout</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
