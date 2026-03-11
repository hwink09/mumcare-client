import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import type { Product } from "@/types/product";

// ensure cart items always have an id (mapped from server _id earlier)
export type CartItem = Product & { quantity: number; id: string };

interface CartPageProps {
    items: CartItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
}

export function CartPage({ items, onUpdateQuantity, onRemoveItem }: CartPageProps) {
    const navigate = useNavigate();

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [items]);

    const shipping = subtotal > 50 ? 0 : items.length > 0 ? 4.99 : 0;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Your Cart</h1>
                        <p className="text-muted-foreground">Review items before checkout</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link to="/">Continue shopping</Link>
                    </Button>
                </div>

                {items.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center">
                            <p className="text-lg font-medium mb-2">Your cart is empty</p>
                            <p className="text-muted-foreground mb-6">Add some products to begin checkout.</p>
                            <Button asChild>
                                <Link to="/">Go to Home</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <Card key={item.id} className="overflow-hidden">
                                    <CardContent className="py-4">
                                        <div className="flex gap-4">
                                            <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                <ImageWithFallback
                                                    src={
                                                        typeof item.image === "string" && item.image
                                                            ? item.image
                                                            : Array.isArray(item.images) && item.images.length
                                                                ? item.images[0]
                                                                : typeof item.images === "string" && item.images
                                                                    ? item.images
                                                                    : "https://placehold.co/600x400?text=MomCare"
                                                    }
                                                    alt={item.title || item.name || "Product image"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold">{item.name}</h3>
                                                            {item.tags?.includes("out-of-stock") ? (
                                                                <Badge variant="secondary">Out of stock</Badge>
                                                            ) : null}
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
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <div className="min-w-10 text-center font-medium">{item.quantity}</div>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</div>
                                                        <div className="text-lg font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardContent className="py-5">
                                    <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-5" onClick={() => navigate("/checkout")}>Proceed to Checkout</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="py-5">
                                    <h3 className="font-semibold mb-2">Member Benefits</h3>
                                    <div className="text-sm text-muted-foreground">
                                        Earn points with every purchase and redeem vouchers in checkout.
                                    </div>
                                    <Button variant="outline" className="w-full mt-4" asChild>
                                        <Link to="/loyalty">View Loyalty</Link>
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
