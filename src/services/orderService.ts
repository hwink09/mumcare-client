const API_BASE_URL = "http://localhost:8017/v1";

const getAuthHeader = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) throw new Error("No access token found");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    };
};

export const createOrder = async (payload: { address: string; couponCode?: string }) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: getAuthHeader(),
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to create order");
    return data;
};

export const getMyOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/orders/me`, {
        method: "GET",
        headers: getAuthHeader(),
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to fetch orders");
    return data;
};

export const getOrderById = async (orderId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
        method: "GET",
        headers: getAuthHeader(),
        credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to fetch order detail");
    return data;
};
