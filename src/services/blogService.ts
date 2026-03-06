const API_BASE_URL = "http://localhost:8017/v1";

export const getBlogs = async () => {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to fetch blogs");
    return data;
};

export const getBlogById = async (blogId: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(blogId)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to fetch blog detail");
    return data;
};

export const getBlogCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/blog-categories`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to fetch blog categories");
    return data;
};
