import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_BLOG_CATEGORIES, MOCK_BLOGS } from "@/constants/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogCategories, getBlogs } from "@/services/blogService";

type BlogCategory = { _id: string; name: string };
type Blog = {
    _id: string;
    title: string;
    description?: string;
    categoryId?: string;
    image?: string;
    createdAt?: string;
};

export function BlogListPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [activeCategory, setActiveCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        (async () => {
            try {
                const [catRes, blogRes] = await Promise.all([getBlogCategories(), getBlogs()]);
                if (mounted) {
                    const cats = (catRes?.data || []) as BlogCategory[];
                    const blogsData = (blogRes?.data || []) as Blog[];
                    setCategories(cats.length ? cats : (MOCK_BLOG_CATEGORIES as BlogCategory[]));
                    setBlogs(blogsData.length ? blogsData : (MOCK_BLOGS as Blog[]));
                }
            } catch {
                if (mounted) {
                    setError("Đang hiển thị dữ liệu demo vì BE chưa sẵn sàng.");
                    setCategories(MOCK_BLOG_CATEGORIES as BlogCategory[]);
                    setBlogs(MOCK_BLOGS as Blog[]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const filteredBlogs = activeCategory ? blogs.filter((b) => b.categoryId === activeCategory) : blogs;

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Health & Care Articles</h1>
                        <p className="text-muted-foreground">Expert tips for mom and baby</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/")}>Back Home</Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <Badge className="cursor-pointer" variant={activeCategory ? "secondary" : "default"} onClick={() => setActiveCategory("")}>All</Badge>
                    {categories.map((c) => (
                        <Badge key={c._id} className="cursor-pointer" variant={activeCategory === c._id ? "default" : "secondary"} onClick={() => setActiveCategory(c._id)}>
                            {c.name}
                        </Badge>
                    ))}
                </div>

                {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

                {loading ? (
                    <div className="py-16 text-center text-muted-foreground">Loading articles...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogs.map((blog) => (
                            <Card key={blog._id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/blogs/${blog._id}`)}>
                                <div className="h-44 bg-gray-100">
                                    <img src={blog.image || "https://placehold.co/600x400?text=MomCare+Blog"} alt={blog.title} className="w-full h-full object-cover" />
                                </div>
                                <CardContent className="pt-4">
                                    <h3 className="font-semibold line-clamp-2 mb-2">{blog.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3">{blog.description || "Read this helpful article for your health and care journey."}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
