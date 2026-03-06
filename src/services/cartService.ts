const API_BASE_URL = "http://localhost:8017/v1";

const getAuthHeader = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) throw new Error("No access token found");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    };
};

export const addToCartApi = async (productId: string, count = 1) => {
    const response = await fetch(`${API_BASE_URL}/users/me/cart`, {
        method: "POST",
        headers: getAuthHeader(),
        credentials: "include",
        body: JSON.stringify({ productId, count }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to add to cart");
    return data;
};

export const updateCartItemApi = async (productId: string, count: number) => {
    const response = await fetch(`${API_BASE_URL}/users/me/cart`, {
        method: "PUT",
        headers: getAuthHeader(),
        credentials: "include",
        body: JSON.stringify({ productId, count }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to update cart item");
    return data;
};

export const removeCartItemApi = async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/me/cart/${encodeURIComponent(productId)}`, {
        method: "DELETE",
        headers: getAuthHeader(),
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to remove cart item");
    return data;
};

export const clearCartApi = async () => {
    const response = await fetch(`${API_BASE_URL}/users/me/cart/clear`, {
        method: "DELETE",
        headers: getAuthHeader(),
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to clear cart");
    return data;
};
