import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, Tag, MapPin, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { extractImageUrl, normalizeImageList } from "@/lib/image";
import type { Product } from "@/types/product";
import { formatVND } from "@/lib/currency";
import { createOrder, getMyOrders } from "@/services/orderService";
import { addToCartApi, clearCartApi } from "@/services/cartService";
import couponService from "@/services/couponService";

// ensure cart items always have an id (mapped from server _id earlier)
export type CartItem = Product & { quantity: number; id: string };

interface CartPageProps {
  isLoggedIn?: boolean;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  clearCart?: () => void;
}

export function CartPage({
  isLoggedIn = false,
  items,
  onUpdateQuantity,
  onRemoveItem,
  clearCart,
}: CartPageProps) {
  const navigate = useNavigate();

  // ── Checkout state ──────────────────────────────────────────────────────────
  const [address, setAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);        // % off
  const [appliedCouponName, setAppliedCouponName] = useState("");   // display name
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);

  // Load user's available coupons (filtered so locked ones are excluded)
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const [couponsRes, ordersRes] = await Promise.all([
          couponService.getMyCoupons(),
          getMyOrders(),
        ]);
        const coupons: any[] = Array.isArray(couponsRes) ? couponsRes : (couponsRes as any)?.data || [];
        const orders: any[] = Array.isArray(ordersRes) ? ordersRes : (ordersRes as any)?.data || [];

        // Permanently exclude coupons used in any non-canceled order.
        // Once a coupon is attached to a real order (even a delivered one) it's consumed.
        const usedCodes = new Set(
          orders
            .filter((o: any) => o.couponCode && o.status !== "canceled")
            .map((o: any) => o.couponCode)
        );
        setMyCoupons(coupons.filter((c: any) => !usedCodes.has(c.name)));
      } catch {
        // silently ignore – user just won't see coupons
      }
    })();
  }, [isLoggedIn]);

  // ── Price calculations ──────────────────────────────────────────────────────
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const shipping = subtotal > 500_000 ? 0 : items.length > 0 ? 30_000 : 0;
  const discountAmount = useMemo(() => Math.floor((subtotal * appliedDiscount) / 100), [subtotal, appliedDiscount]);
  const totalBeforeDiscount = subtotal + shipping;
  const total = totalBeforeDiscount - discountAmount;

  const canSubmit = address.trim().length >= 3 && items.length > 0;

  const getCartItemImage = (item: CartItem) => {
    const imageList = normalizeImageList(item.images);
    return extractImageUrl(item.image) || imageList[0] || "https://placehold.co/600x400?text=MumCare";
  };

  // ── Apply voucher ───────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: "error", text: "Please select a voucher." });
      return;
    }
    setValidatingCoupon(true);
    setCouponMessage(null);
    try {
      const data: any = await couponService.getMyCoupons();
      const list: any[] = data.data || data;
      const found = (list || []).find((c: any) => c.name === couponCode.trim());
      if (!found) {
        setCouponMessage({ type: "error", text: "Voucher not found or not applicable." });
        setAppliedDiscount(0);
        setAppliedCouponName("");
        return;
      }
      if (found.isExpired || new Date(found.expiry) < new Date()) {
        setCouponMessage({ type: "error", text: "This voucher has expired." });
        setAppliedDiscount(0);
        setAppliedCouponName("");
        return;
      }
      setAppliedDiscount(found.discount);
      setAppliedCouponName(found.name);
      const savedAmt = Math.floor((subtotal * found.discount) / 100);
      setCouponMessage({
        type: "success",
        text: `Applied! ${found.discount}% off - you save ${formatVND(savedAmt)}.`,
      });
    } catch (err: any) {
      setCouponMessage({ type: "error", text: err.message || "Failed to validate voucher." });
      setAppliedDiscount(0);
      setAppliedCouponName("");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // ── Place order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    setLoading(true);
    setOrderError(null);
    setOrderMessage(null);
    try {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const validItems = items.filter((item) => objectIdRegex.test(item.id));
      if (!validItems.length) {
        setOrderError("Cart items are invalid. Please remove and re-add products.");
        return;
      }
      await clearCartApi();
      for (const item of validItems) {
        await addToCartApi(item.id, item.quantity);
      }
      const payload: { address: string; couponCode?: string } = { address: address.trim() };
      if (couponCode.trim()) payload.couponCode = couponCode.trim();
      const res = await createOrder(payload);
      setOrderMessage((res as any)?.message || "Order placed successfully!");
      clearCart?.();
      setTimeout(() => navigate("/orders"), 900);
    } catch (e: any) {
      setOrderError(e.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter your address &amp; select a voucher, then place your order</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/products">Continue shopping</Link>
          </Button>
        </div>

        {orderMessage && (
          <div className="mb-4 p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium">
            {orderMessage}
          </div>
        )}
        {orderError && (
          <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">
            {orderError}
          </div>
        )}

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-muted-foreground mb-6">Add some products to get started.</p>
              <Button asChild><Link to="/">Go to Home</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left: cart items ── */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        <ImageWithFallback
                          src={getCartItemImage(item)}
                          alt={item.title || item.name || "Product image"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{item.name}</h3>
                              {item.tags?.includes("out-of-stock") && (
                                <Badge variant="secondary">Out of stock</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} aria-label="Remove">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline" size="icon"
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="min-w-10 text-center font-medium">{item.quantity}</div>
                            <Button
                              variant="outline" size="icon"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">{formatVND(Number(item.price))} each</div>
                            <div className="text-lg font-bold text-primary">{formatVND(Number(item.price) * item.quantity)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* ── Delivery address ── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-pink-500" />
                    Shipping Address <span className="text-red-500">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Enter full address (house number, street, ward, district, city...)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  {address.trim().length > 0 && address.trim().length < 3 && (
                    <p className="text-xs text-rose-500 mt-1">Address must be at least 3 characters.</p>
                  )}
                </CardContent>
              </Card>

              {/* ── Voucher ── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Tag className="h-4 w-4 text-amber-500" />
                    Discount Code (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isLoggedIn ? (
                    <p className="text-sm text-muted-foreground">
                      <button className="text-pink-600 underline" onClick={() => navigate("/login")}>Log in</button> to use vouchers.
                    </p>
                  ) : myCoupons.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3 border rounded-md bg-slate-50">
                      You don&apos;t have any vouchers.{" "}
                      <button className="text-indigo-600 underline" onClick={() => navigate("/loyalty")}>
                        Exchange points for vouchers
                      </button>
                    </div>
                  ) : (
                    <>
                      <select
                        className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponMessage(null);
                          setAppliedDiscount(0);
                          setAppliedCouponName("");
                        }}
                      >
                        <option value="">-- No voucher selected --</option>
                        {myCoupons.map((c: any) => (
                          <option
                            key={c._id}
                            value={c.name}
                            disabled={c.isExpired || new Date(c.expiry) < new Date()}
                          >
                            {c.name} - {c.discount}% OFF (Exp: {new Date(c.expiry).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="secondary"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode}
                        className="w-full"
                      >
                        {validatingCoupon ? "Applying..." : "Apply Voucher"}
                      </Button>
                    </>
                  )}
                  {couponMessage && (
                    <p className={`text-sm ${couponMessage.type === "success" ? "text-emerald-600 font-medium" : "text-rose-600"}`}>
                      {couponMessage.text}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Right: order summary ── */}
            <div className="space-y-4">
              <Card className="sticky top-6">
                <CardContent className="py-5">
                  <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatVND(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatVND(shipping)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount ({appliedCouponName} - {appliedDiscount}%)</span>
                        <span>- {formatVND(discountAmount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between font-bold text-base">
                      <span>{appliedDiscount > 0 ? "Total Before Voucher" : "Total"}</span>
                      <span className={appliedDiscount > 0 ? "text-slate-500 line-through" : "text-pink-600 text-lg"}>
                        {formatVND(totalBeforeDiscount)}
                      </span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between font-bold text-base text-pink-600">
                        <span>Final Total</span>
                        <span className="text-lg">{formatVND(total)}</span>
                      </div>
                    )}
                    {appliedDiscount > 0 && (
                      <p className="text-xs text-emerald-600 text-right mt-1">
                        You save {formatVND(discountAmount)} with this voucher.
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full mt-5 bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={loading || !canSubmit}
                    onClick={handlePlaceOrder}
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </Button>
                  {!address.trim() && (
                    <p className="text-xs text-muted-foreground text-center mt-2">Please enter a shipping address.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-5">
                  <h3 className="font-semibold mb-2">Member Benefits</h3>
                  <p className="text-sm text-muted-foreground">Earn points with every purchase and redeem vouchers.</p>
                  <Button variant="outline" className="w-full mt-4" onClick={() => navigate(isLoggedIn ? "/loyalty" : "/login")}>
                    View Loyalty
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
