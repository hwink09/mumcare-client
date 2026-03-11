import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createOrder } from "@/services/orderService";
import type { CartItem } from "@/hooks/useAuth";
import { addToCartApi, clearCartApi } from "@/services/cartService";

interface CheckoutPageProps {
    isLoggedIn: boolean;
    cartItems: CartItem[];
}

export function CheckoutPage({ isLoggedIn, cartItems }: CheckoutPageProps) {
    const navigate = useNavigate();
    const [address, setAddress] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Cho phép địa chỉ ngắn hơn (>= 3 ký tự) để dễ test hơn
    const canSubmit = useMemo(
        () => isLoggedIn && address.trim().length >= 3,
        [isLoggedIn, address]
    );

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
            } catch {
                // Nếu sync cart lỗi, vẫn cho user thấy thông báo rõ ràng
                setError("Failed to sync cart with server. Please try again.");
                return;
            }

            // Backend orderValidation hiện tại chỉ cho phép field "address",
            // nên không gửi couponCode trong body để tránh lỗi 422.
            const res = await createOrder({
                address: address.trim(),
            });

            setMessage(res?.message || "Order created successfully");
            setTimeout(() => navigate("/orders"), 800);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
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
                                className="w-full min-h-28 rounded-md border px-3 py-2 text-sm"
                                placeholder="Enter full address (street, ward, district, city...)"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Voucher Code (optional)</label>
                            <input
                                className="w-full h-10 rounded-md border px-3 text-sm"
                                placeholder="Ex: SUMMER10"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => navigate("/cart")}>Back to Cart</Button>
                            <Button disabled={!canSubmit || loading} onClick={handleCheckout}>
                                {loading ? "Creating Order..." : "Place Order"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
