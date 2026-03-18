import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Gift,
  Megaphone,
  ShoppingBag,
  Sparkles,
  Star,
  TicketPercent,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import couponService from "@/services/couponService";
import { getMyOrders } from "@/services/orderService";
import authService from "@/services/userService";

type Coupon = {
  _id: string;
  name: string;
  discount: number;
  expiry: string;
  pointCost?: number;
  createdAt?: string;
};

const POINT_EARN_RULE = 10000;

const formatExpiry = (expiryString: string) => {
  const expiryDate = new Date(expiryString);
  if (Number.isNaN(expiryDate.getTime())) return "Date unavailable";
  return expiryDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isExpired = (expiryString: string) => {
  const expiryDate = new Date(expiryString);
  return expiryDate < new Date();
};

export function LoyaltyPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [exchangeableCoupons, setExchangeableCoupons] = useState<Coupon[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCoupons = useMemo(
    () => coupons.filter((coupon) => !isExpired(coupon.expiry)),
    [coupons],
  );

  const expiredCoupons = useMemo(
    () => coupons.filter((coupon) => isExpired(coupon.expiry)),
    [coupons],
  );

  const nextReward = useMemo(() => {
    if (exchangeableCoupons.length === 0) return null;
    return [...exchangeableCoupons].sort((a, b) => Number(a.pointCost || 0) - Number(b.pointCost || 0))[0];
  }, [exchangeableCoupons]);

  const nearestCouponExpiry = useMemo(() => {
    if (activeCoupons.length === 0) return null;
    return [...activeCoupons].sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())[0];
  }, [activeCoupons]);

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
        const results = await Promise.allSettled([
          couponService.getMyCoupons(),
          getMyOrders(),
        ]);

        if (!mounted) return;

        const userCoupons = results[0].status === "fulfilled" ? (results[0].value || []) : [];
        const rawOrders = results[1].status === "fulfilled" ? results[1].value : [];
        const userOrders = Array.isArray(rawOrders) ? rawOrders : ((rawOrders as { data?: any[] }).data || []);

        const allCouponsData: Coupon[] = [
          {
            _id: "69b5f58d8a40d02072e8aa37",
            name: "GIAMGIA15",
            discount: 15,
            expiry: "2026-03-20T00:01:37.407Z",
            pointCost: 15,
          },
          {
            _id: "69b5f6f2758082d068530129",
            name: "GIAMGIA35",
            discount: 35,
            expiry: "2026-03-22T19:09:33.862Z",
            pointCost: 35,
          },
          {
            _id: "69b703fc988b1df0c8d91721",
            name: "GIAMGIA40",
            discount: 40,
            expiry: "2026-03-25T19:09:48.415Z",
            pointCost: 40,
          },
        ];

        let earnedPoints = 0;
        const deliveredOrderCouponCodes = new Set<string>();
        const activeOrderCouponCodes = new Set<string>();

        userOrders.forEach((order: any) => {
          if (order.status === "delivered") {
            const final = order.finalTotal || 0;
            earnedPoints += Math.floor(final / POINT_EARN_RULE);
            if (order.couponCode) deliveredOrderCouponCodes.add(order.couponCode);
          } else if (order.couponCode && order.status !== "canceled") {
            activeOrderCouponCodes.add(order.couponCode);
          }
        });

        let spentPoints = 0;
        userCoupons.forEach((coupon: any) => {
          const matched = allCouponsData.find((item) => item._id === coupon._id || item.name === coupon.name);
          if (matched?.pointCost) spentPoints += matched.pointCost;
        });

        Array.from(deliveredOrderCouponCodes).forEach((code) => {
          const stillOwned = userCoupons.some((coupon: any) => coupon.name === code);
          if (!stillOwned) {
            const matched = allCouponsData.find((item) => item.name === code);
            if (matched?.pointCost) spentPoints += matched.pointCost;
          }
        });

        const calculatedPoints = Math.max(0, earnedPoints - spentPoints);
        const visibleCoupons = userCoupons.filter((coupon: any) => !deliveredOrderCouponCodes.has(coupon.name));
        setCoupons(visibleCoupons);
        setPoints(calculatedPoints);

        const userCouponIds = new Set(userCoupons.map((coupon: Coupon) => coupon._id));
        const allUsedCodes = new Set([...deliveredOrderCouponCodes, ...activeOrderCouponCodes]);
        const availableToExchange = allCouponsData.filter((coupon) => {
          if (!coupon.pointCost || coupon.pointCost <= 0) return false;
          if (userCouponIds.has(coupon._id)) return false;
          if (allUsedCodes.has(coupon.name)) return false;
          return new Date(coupon.expiry) >= new Date();
        });

        setExchangeableCoupons(availableToExchange);
      } catch (err: any) {
        if (mounted) {
          setError(err?.response?.data?.message || err?.message || "Failed to load loyalty data");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();

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
      await authService.redeemCoupon(coupon._id);
      alert("Voucher exchanged successfully!");

      setPoints((prev) => prev - (coupon.pointCost || 0));
      setCoupons((prev) => [...prev, coupon]);
      setExchangeableCoupons((prev) => prev.filter((item) => item._id !== coupon._id));
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Exchange failed.");
    } finally {
      setExchangeLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(253,242,248,0.68),rgba(255,255,255,1)_24%,rgba(239,246,255,0.88)_100%)]">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/")}
          className="rounded-full border-white/80 bg-white/85 px-4 text-slate-700 shadow-sm hover:bg-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Loyalty Program</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Loyalty & Voucher</h1>
            <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
              Track your points, exchange them for vouchers, and keep your active rewards ready for checkout.
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Card className="mt-6 overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-pink-700">
                      <Gift className="h-3.5 w-3.5" />
                      Current Points
                    </div>

                    {loading ? (
                      <p className="mt-6 text-lg text-slate-500">Loading points...</p>
                    ) : (
                      <>
                        <p className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                          {points.toLocaleString()}
                          <span className="ml-2 text-3xl text-pink-600 sm:text-4xl">pts</span>
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-500">
                          Delivered orders automatically add points to your account.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Active coupons
                      </p>
                      <p className="mt-2 text-3xl font-black text-slate-950">{activeCoupons.length}</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Rewards to exchange
                      </p>
                      <p className="mt-2 text-3xl font-black text-slate-950">{exchangeableCoupons.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Card className="rounded-[26px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-55px_rgba(15,23,42,0.22)]">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-black text-slate-950">From Purchase</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Earn 1 point for every {POINT_EARN_RULE.toLocaleString("vi-VN")} đ in delivered-order total.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-55px_rgba(15,23,42,0.22)]">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-black text-slate-950">From Review</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Delivered orders can be reviewed, helping you join future loyalty and engagement programs.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-55px_rgba(15,23,42,0.22)]">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-black text-slate-950">From Campaign</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Bonus points may be added in future promotions, seasonal campaigns, and special events.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Rewards Exchange</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">Redeem points for vouchers</h2>
                </div>
              </div>

              {loading ? (
                <Card className="mt-4 rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
                  <CardContent className="px-6 py-10 text-slate-500">Loading rewards...</CardContent>
                </Card>
              ) : exchangeableCoupons.length === 0 ? (
                <Card className="mt-4 rounded-[28px] border border-dashed border-slate-200 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.18)]">
                  <CardContent className="px-6 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-black text-slate-950">No rewards available right now</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Keep collecting points from delivered orders and check back for more exchange options.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {exchangeableCoupons.map((coupon) => {
                    const insufficientPoints = points < (coupon.pointCost || 0);

                    return (
                      <Card
                        key={coupon._id}
                        className="rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,251,235,0.95),rgba(255,255,255,0.92))] shadow-[0_28px_72px_-55px_rgba(217,119,6,0.24)]"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Redeem reward</p>
                              <h3 className="mt-2 text-3xl font-black text-slate-950">{coupon.discount}% OFF</h3>
                              <p className="mt-2 text-lg font-semibold text-slate-900">{coupon.name}</p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
                              <TicketPercent className="h-5 w-5" />
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            <Badge className="border border-amber-200 bg-white text-amber-700 hover:bg-white">
                              {coupon.pointCost} pts
                            </Badge>
                            <Badge className="border border-slate-200 bg-white text-slate-700 hover:bg-white">
                              Valid until {formatExpiry(coupon.expiry)}
                            </Badge>
                          </div>

                          <Button
                            type="button"
                            onClick={() => handleExchange(coupon)}
                            disabled={exchangeLoading === coupon._id || insufficientPoints}
                            className="mt-6 h-11 w-full rounded-full bg-slate-950 text-white hover:bg-slate-900"
                          >
                            {exchangeLoading === coupon._id
                              ? "Exchanging..."
                              : insufficientPoints
                                ? `Need ${coupon.pointCost} pts`
                                : `Exchange for ${coupon.pointCost} pts`}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Owned Rewards</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">My Coupons</h2>

              {loading ? (
                <Card className="mt-4 rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
                  <CardContent className="px-6 py-10 text-slate-500">Loading your coupons...</CardContent>
                </Card>
              ) : coupons.length === 0 ? (
                <Card className="mt-4 rounded-[28px] border border-dashed border-slate-200 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.18)]">
                  <CardContent className="px-6 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Gift className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-black text-slate-950">No active coupons yet</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Complete orders to earn points, then exchange them here for vouchers you can use at checkout.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[...activeCoupons, ...expiredCoupons].map((coupon) => {
                    const expired = isExpired(coupon.expiry);

                    return (
                      <Card
                        key={coupon._id}
                        className="rounded-[28px] border border-white/80 bg-white/92 shadow-[0_28px_72px_-55px_rgba(15,23,42,0.24)]"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Saved coupon</p>
                              <h3 className="mt-2 text-3xl font-black text-slate-950">{coupon.discount}% OFF</h3>
                              <p className="mt-2 text-lg font-semibold text-slate-900">{coupon.name}</p>
                            </div>
                            <Badge
                              className={
                                expired
                                  ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
                                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              }
                            >
                              {expired ? "Expired" : "Active"}
                            </Badge>
                          </div>

                          <div className="mt-5 rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                              Expiry date
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{formatExpiry(coupon.expiry)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Summary</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Your loyalty snapshot</h2>

                <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Points</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">{points}</p>
                  </div>

                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Owned coupons</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">{coupons.length}</p>
                  </div>

                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Available rewards</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">{exchangeableCoupons.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Next Reward</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {nextReward ? `${nextReward.discount}% OFF voucher` : "No exchange waiting"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {nextReward
                    ? `You need ${Math.max(0, Number(nextReward.pointCost || 0) - points)} more points to unlock ${nextReward.name}.`
                    : "You already own or used the currently available vouchers."}
                </p>
                {nextReward ? (
                  <div className="mt-5 rounded-[24px] border border-amber-100 bg-amber-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600">Required</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{nextReward.pointCost} pts</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Expiry Reminder</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {nearestCouponExpiry ? "Use your next coupon soon" : "No coupon nearing expiry"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {nearestCouponExpiry
                    ? `${nearestCouponExpiry.name} expires on ${formatExpiry(nearestCouponExpiry.expiry)}.`
                    : "Once you exchange or receive a voucher, its expiry will appear here."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/cart")}
                  className="mt-5 h-11 rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
                >
                  Go to Cart
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
