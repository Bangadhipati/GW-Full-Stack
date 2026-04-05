import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { blogPosts as defaultClientBlogs, BlogPost as ClientBlogPost } from "@/data/blogs";
import api from '../api';
import { useAuth } from './AuthContext'; // Import useAuth to get the token

// The BlogPost interface from API
export interface BlogAuthor {
  name: string;
  bio?: string;
}

export interface BlogPost extends ClientBlogPost {
  _id: string; // MongoDB _id
  id?: string; // Optional: Keep original frontend `id` if still used locally for some reason.
  slug: string;
  description?: string; // Made optional
  views: number;
}


interface BlogContextType {
  blogs: BlogPost[];
  addBlog: (blog: Omit<BlogPost, "id" | "_id" | "views">) => Promise<string | null>;
  updateBlog: (id: string, blog: Partial<Omit<BlogPost, "id" | "_id" | "views">>) => Promise<string | null>;
  removeBlog: (id: string) => Promise<string | null>;
  totalViews: number;
  trackSiteVisit: () => Promise<void>;
  loading: boolean;
  error: string | null;
  fetchBlogs: () => Promise<void>;
  fetchTotalViews: () => Promise<void>;
  getBlogById: (id: string) => Promise<BlogPost | undefined>;
}

const BlogContext = createContext<BlogContextType | null>(null);

export const useBlogs = () => {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlogs must be inside BlogProvider");
  return ctx;
};

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth(); // Get token from AuthContext
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedBlogs = await api.getBlogs();
      // Map _id to id for existing frontend components expecting `id`
      setBlogs(fetchedBlogs.map(blog => ({
        ...blog,
        id: blog._id,
        // Ensure authors is an array of objects even if backend only sent author string for old data
        authors: blog.authors && blog.authors.length > 0
          ? blog.authors : (blog.author ? blog.author.split(/,\s*|\s+and\s+/).filter(Boolean).map(name => ({ name: name.trim() })) : [])
      })));
    } catch (err: any) {
      console.error("Failed to fetch blogs:", err);
      setError(err.message || "Failed to load blogs");
      setBlogs([]); // Do not show fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTotalViews = useCallback(async () => {
    try {
      const data = await api.getTotalBlogViews();
      setTotalViews(data.totalViews);
      // Clear connectivity error if we successfully reached the server
      if (error === "Connection lost to server") {
        setError(null);
      }
    } catch (err: any) {
      console.error("Connectivity check failed:", err);
      // If it looks like a network level failure (e.g. TypeError: Failed to fetch), 
      // set the special error message that triggers the overlay.
      if (!err.status && (!err.message || err.message.toLowerCase().includes("fetch") || err.message.toLowerCase().includes("network"))) {
        setError("Connection lost to server");
      }
    }
  }, [error]);

  const trackSiteVisit = useCallback(async () => {
    try {
      const sessionTracked = sessionStorage.getItem('gw-tracked');
      if (!sessionTracked) {
        await api.trackVisit();
        sessionStorage.setItem('gw-tracked', 'true');
        fetchTotalViews();
      }
    } catch (err) {
      console.error("Tracking visit failed:", err);
    }
  }, [fetchTotalViews]);

  const getBlogById = useCallback(async (id: string): Promise<BlogPost | undefined> => {
    try {
      const blog = await api.getBlogPost(id);
      // Clear connectivity error if we successfully reached the server
      if (error === "Connection lost to server") {
        setError(null);
      }
      return { ...blog, id: blog._id };
    } catch (err: any) {
      console.error(`Failed to fetch blog post with ID ${id}:`, err);
      
      // Detect network-level failures (like Render spin-up timeouts or mobile signal loss)
      const errorMsg = err.message || "";
      const isNetworkError = !err.status && (
        errorMsg.toLowerCase().includes("fetch") || 
        errorMsg.toLowerCase().includes("network") || 
        errorMsg.toLowerCase().includes("failed to execute") ||
        errorMsg.toLowerCase().includes("load")
      );
      
      if (isNetworkError) {
        setError("Connection lost to server");
      } else {
        setError(errorMsg || "Failed to load blog post");
      }
      
      return undefined;
    }
  }, [error]);


  useEffect(() => {
    fetchBlogs();
    fetchTotalViews();
  }, [fetchBlogs, fetchTotalViews]);

  // Background health check and stats updates - ensures offline status is detected while browsing
  useEffect(() => {
    const interval = setInterval(fetchTotalViews, 15000);
    return () => clearInterval(interval);
  }, [fetchTotalViews]);


  const addBlog = useCallback(async (blog: Omit<BlogPost, "id" | "_id" | "views">): Promise<string | null> => {
    if (!token) return "Authentication required to add a blog post.";
    try {
      await api.createBlog(blog, token);
      await fetchBlogs(); // Re-fetch to get the new blog from the backend
      return null;
    } catch (err: any) {
      console.error("Failed to add blog:", err);
      return err.message || "Failed to add blog";
    }
  }, [token, fetchBlogs]);

  const updateBlog = useCallback(async (id: string, updates: Partial<Omit<BlogPost, "id" | "_id" | "views">>): Promise<string | null> => {
    if (!token) return "Authentication required to update a blog post.";
    try {
      await api.updateBlog(id, updates, token);
      await fetchBlogs(); // Re-fetch blogs
      return null;
    } catch (err: any) {
      console.error("Failed to update blog:", err);
      return err.message || "Failed to update blog";
    }
  }, [token, fetchBlogs]);

  const removeBlog = useCallback(async (id: string): Promise<string | null> => {
    if (!token) return "Authentication required to remove a blog post.";
    try {
      await api.deleteBlog(id, token);
      await fetchBlogs(); // Re-fetch blogs
      return null;
    } catch (err: any) {
      console.error("Failed to remove blog:", err);
      return err.message || "Failed to remove blog";
    }
  }, [token, fetchBlogs]);


  return (
    <BlogContext.Provider value={{ blogs, addBlog, updateBlog, removeBlog, totalViews, trackSiteVisit, loading, error, fetchBlogs, fetchTotalViews, getBlogById }}>
      {children}
    </BlogContext.Provider>
  );
};