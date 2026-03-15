import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createOrder } from "@/services/orderService";
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

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cartItems]);

    // Cho phép địa chỉ ngắn hơn (>= 3 ký tự) để dễ test hơn
    const canSubmit = useMemo(
        () => isLoggedIn && address.trim().length >= 3,
        [isLoggedIn, address]
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
            setCouponMessage({ type: 'success', text: `Voucher applied! You will save $${discount.toFixed(2)} (${found.discount}% off).` });
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
                setError("Please login before checkout.");
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
                        {!isLoggedIn && (
                            <div className="p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-sm">
                                Please login before checkout.
                            </div>
                        )}

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
                            <label className="text-sm font-medium">Voucher Code (optional)</label>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 h-10 rounded-md border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all uppercase"
                                    placeholder="Ex: SUMMER10"
                                    value={couponCode}
                                    onChange={(e) => {
                                        setCouponCode(e.target.value.toUpperCase());
                                        setCouponMessage(null); // clear message when user types
                                    }}
                                />
                                <Button 
                                    variant="secondary" 
                                    onClick={handleApplyCoupon}
                                    disabled={validatingCoupon || !couponCode.trim()}
                                >
                                    {validatingCoupon ? "Checking..." : "Apply"}
                                </Button>
                            </div>
                            {couponMessage && (
                                <p className={`text-sm mt-1 ${couponMessage.type === 'success' ? 'text-emerald-600 font-medium' : 'text-rose-600'}`}>
                                    {couponMessage.text}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <Button variant="outline" onClick={() => navigate("/cart")} className="flex-1">Back to Cart</Button>
                            <Button disabled={!canSubmit || loading} onClick={handleCheckout} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white">
                                {loading ? "Processing..." : "Place Order"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
