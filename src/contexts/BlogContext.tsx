import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { blogPosts as defaultBlogs, BlogPost } from "@/data/blogs";

interface BlogContextType {
  blogs: BlogPost[];
  addBlog: (blog: BlogPost) => void;
  updateBlog: (id: string, blog: BlogPost) => void;
  removeBlog: (id: string) => void;
  totalViews: number;
}

const STORAGE_KEY = "gw-blogs";
const VERSION_KEY = "gw-blogs-version";
const VIEWS_KEY = "gw-total-views";
const BLOGS_VERSION = defaultBlogs.length;

function loadBlogs(): BlogPost[] {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (String(BLOGS_VERSION) !== storedVersion) {
      localStorage.setItem(VERSION_KEY, String(BLOGS_VERSION));
      localStorage.removeItem(STORAGE_KEY);
      return defaultBlogs;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return defaultBlogs;
}

const BlogContext = createContext<BlogContextType | null>(null);

export const useBlogs = () => {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlogs must be inside BlogProvider");
  return ctx;
};

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>(loadBlogs);
  const [totalViews, setTotalViews] = useState(() => {
    try {
      const v = localStorage.getItem(VIEWS_KEY);
      return v ? Number(v) : 2400;
    } catch {
      return 2400;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs)); } catch { /* quota exceeded – skip persist */ }
  }, [blogs]);

  // Simulate view increment
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalViews((v) => {
        const next = v + Math.floor(Math.random() * 3);
        localStorage.setItem(VIEWS_KEY, String(next));
        return next;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const addBlog = (blog: BlogPost) => setBlogs((prev) => [blog, ...prev]);
  const updateBlog = (id: string, blog: BlogPost) =>
    setBlogs((prev) => prev.map((b) => (b.id === id ? blog : b)));
  const removeBlog = (id: string) => setBlogs((prev) => prev.filter((b) => b.id !== id));

  return (
    <BlogContext.Provider value={{ blogs, addBlog, updateBlog, removeBlog, totalViews }}>
      {children}
    </BlogContext.Provider>
  );
};