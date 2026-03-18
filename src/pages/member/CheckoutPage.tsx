import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVND } from "@/lib/currency";
import { createOrder, getMyOrders } from "@/services/orderService";
import type { CartItem } from "@/hooks/useAuth";
import { addToCartApi, clearCartApi } from "@/services/cartService";
import couponService from "@/services/couponService";

interface CheckoutPageProps {
    isLoggedIn: boolean;
    cartItems: CartItem[];
    clearCart: () => void;
}

export function CheckoutPage({ isLoggedIn, cartItems, clearCart }: CheckoutPageProps) {
    const navigate = useNavigate();
    const [address, setAddress] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [myCoupons, setMyCoupons] = useState<any[]>([]);
    
    // Fetch user coupons on mount — also filter out ones already in active orders
    useEffect(() => {
        if (!isLoggedIn) return;
        (async () => {
            try {
                const [couponsRes, ordersRes] = await Promise.all([
                    couponService.getMyCoupons(),
                    getMyOrders()
                ]);
                const coupons: any[] = Array.isArray(couponsRes) ? couponsRes : couponsRes?.data || [];
                const orders: any[] = Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || [];
                
                // Filter out coupons already applied to active (pending/confirmed/shipped) orders
                const activeOrderCouponCodes = new Set(
                    orders
                        .filter((o: any) => o.couponCode && !['delivered', 'canceled'].includes(o.status))
                        .map((o: any) => o.couponCode)
                );
                const available = coupons.filter((c: any) => !activeOrderCouponCodes.has(c.name));
                setMyCoupons(available);
            } catch (err) {
                console.error("Failed to load checkout data:", err);
            }
        })();
    }, [isLoggedIn]);

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cartItems]);

    // Cho phép địa chỉ ngắn hơn (>= 3 ký tự) để dễ test hơn
    const canSubmit = useMemo(
        () => address.trim().length >= 3,
        [address]
    );

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponMessage({ type: 'error', text: "Please enter a voucher code" });
            return;
        }

        setValidatingCoupon(true);
        setCouponMessage(null);

        try {
            const data: any = await couponService.getMyCoupons();
            const coupons = data.data || data;
            const found = (coupons || []).find((c: any) => c.name === couponCode.trim());

            if (!found) {
                setCouponMessage({ type: 'error', text: "Voucher not found or not applicable." });
                return;
            }

            if (found.isExpired) {
                setCouponMessage({ type: 'error', text: "This voucher has expired." });
                return;
            }

            const discount = Math.floor((subtotal * found.discount) / 100);
            setCouponMessage({ type: 'success', text: `Voucher applied! You will save ${formatVND(discount)} (${found.discount}% off).` });
        } catch (err: any) {
            setCouponMessage({ type: 'error', text: err.message || "Failed to validate voucher." });
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleCheckout = async () => {
        try {
            setLoading(true);
            setError(null);
            setMessage(null);

            if (!isLoggedIn) {
                navigate("/login");
                return;
            }

            if (!cartItems.length) {
                setError("Your cart is empty. Please add products before checkout.");
                return;
            }

            // Đồng bộ giỏ hàng local lên server trước khi tạo order
            try {
                // Chỉ gửi những item có productId hợp lệ (Mongo ObjectId 24 hex)
                const objectIdRegex = /^[0-9a-fA-F]{24}$/;
                const validItems = cartItems.filter((item) => objectIdRegex.test(item.id));

                if (!validItems.length) {
                    setError("Your cart items are invalid. Please remove items and add products again.");
                    return;
                }

                await clearCartApi();
                for (const item of validItems) {
                    await addToCartApi(item.id, item.quantity);
                }
            } catch (err: any) {
                // Hiển thị thông báo thật từ DB (ví dụ: hết hàng) thay vì giấu đi
                setError(err.message || "Failed to sync cart with server. Please try again.");
                return;
            }

            const payload: { address: string; couponCode?: string } = {
                address: address.trim(),
            };
            if (couponCode.trim()) {
                payload.couponCode = couponCode.trim();
            }

            const res = await createOrder(payload);

            setMessage(res?.message || "Order created successfully");
            clearCart();
            setTimeout(() => navigate("/orders"), 800);
        } catch (e: any) {
            setError(e.message || "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-10 max-w-2xl">
                <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                <p className="text-muted-foreground mb-6">Create order from your current cart.</p>

                <Card>
                    <CardHeader>
                        <CardTitle>Delivery & Voucher</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && <div className="p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
                        {message && <div className="p-3 rounded-md border border-green-200 bg-green-50 text-green-700 text-sm">{message}</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Shipping Address</label>
                            <textarea
                                className="w-full min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter full address (street, ward, district, city...)"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Voucher (Optional)</label>
                            {myCoupons.length === 0 ? (
                                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-slate-50">
                                    You don&apos;t have any vouchers. Exchange points for vouchers in the Loyalty page.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 relative">
                                    <select
                                      className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                      value={couponCode}
                                      onChange={(e) => {
                                          setCouponCode(e.target.value);
                                          setCouponMessage(null);
                                      }}
                                    >
                                        <option value="">-- No voucher selected --</option>
                                        {myCoupons.map((c: any) => (
                                            <option key={c._id} value={c.name} disabled={c.isExpired || new Date(c.expiry) < new Date()}>
                                                {c.name} - {c.discount}% OFF (Exp: {new Date(c.expiry).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleApplyCoupon}
                                        disabled={validatingCoupon || !couponCode}
                                        className="w-full mt-2"
                                    >
                                        {validatingCoupon ? "Applying..." : "Apply Selected Voucher"}
                                    </Button>
                                    {couponMessage && (
                                        <p className={`text-sm mt-1 ${couponMessage.type === 'success' ? 'text-emerald-600 font-medium' : 'text-rose-600'}`}>
                                            {couponMessage.text}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <Button variant="outline" onClick={() => navigate("/cart")} className="flex-1">Back to Cart</Button>
                            <Button disabled={loading || !canSubmit} onClick={handleCheckout} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white">
                                {loading ? "Processing..." : "Place Order"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
