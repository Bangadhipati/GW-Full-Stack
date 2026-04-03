import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User as UserIcon, ChevronRight, Share2 } from "lucide-react";
import { useBlogs, BlogPost } from "@/contexts/BlogContext"; // Import BlogPost from context
import Navbar from "@/components/Navbar"; // Make sure Navbar is imported, it seems you have a copy of it in ui
import AdBanner from "@/components/AdBanner";
import ServerOfflineOverlay from "@/components/ServerOfflineOverlay";
import { getOptimizedImageURL } from "@/lib/imageUtils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AUTHOR_BIOS: Record<string, string> = {
  "Debarghya Bhowmick": "Computer Science Engineer · Core & Founding Member of GW",
  "Soumyadip Banerjee": "MBA · Core & Founding Member of GW",
  "Team GW": "The Gaudiya Warriors Collective",
};

const parseAuthors = (blog: { author: string; authors?: { name: string; bio: string }[] }) => {
  // Use structured authors if available
  if (blog.authors && blog.authors.length > 0) {
    return blog.authors.map((a) => ({
      name: a.name,
      bio: a.bio || AUTHOR_BIOS[a.name] || "Gaudiya Warriors",
    }));
  }
  // Fallback: parse from author string
  const parts = blog.author.split(/,\s*|\s+and\s+/);
  return parts.map((name) => {
    const trimmed = name.trim();
    return { name: trimmed, bio: AUTHOR_BIOS[trimmed] || "Gaudiya Warriors" };
  });
};

const ShareButton = ({ className = "" }: { className?: string }) => {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };
  return (
    <button onClick={handleShare} className={`inline-flex items-center justify-center rounded-lg border border-border bg-card/80 p-2 text-muted-foreground transition-all hover:border-primary/30 hover:text-primary hover:bg-primary/5 ${className}`} aria-label="Share this article">
      <Share2 className="h-4 w-4" />
    </button>
  );
};

const BlogPostPage = () => { // Renamed to BlogPostPage
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { blogs, getBlogById, fetchBlogs, fetchTotalViews } = useBlogs();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic meta tags for URL previews
  useEffect(() => {
    if (blog) {
      document.title = `${blog.title} | Gaudiya Warriors`;
      
      const thumbUrl = getOptimizedImageURL(blog.thumbnail, 1200);

      // Meta Description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute("content", blog.description || "");

      // OpenGraph (Facebook, WhatsApp, LinkedIn)
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", blog.title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", blog.description || "");

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute("content", thumbUrl);

      // Twitter
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute("content", blog.title);

      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) twitterImage.setAttribute("content", thumbUrl);
    }
  }, [blog]);

  const loadBlog = useCallback(async () => {
    if (!id) {
      navigate("/404");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedBlog = await getBlogById(id);
      if (fetchedBlog) {
        setBlog(fetchedBlog);
        fetchTotalViews(); // Update total views after fetching a blog (which increments its view count)
      } else {
        navigate("/404");
      }
    } catch (err: any) {
      console.error("Error fetching blog post:", err);
      setError(err.message || "Failed to load blog post");
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, getBlogById, fetchTotalViews]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadBlog();
  }, [loadBlog]);


  const relatedPosts = blog
    ? blogs.filter((b) => b.category === blog.category && b._id !== blog._id).slice(0, 3)
    : [];

  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading && !blog) {
      timer = setTimeout(() => setShowOverlay(true), 6000);
    } else if (error && !blog) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
    return () => clearTimeout(timer);
  }, [loading, error, blog]);

  if (showOverlay) return <ServerOfflineOverlay />;

  if (loading && !blog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Navbar />
        <div className="text-center pt-20">
          <p className="font-display text-2xl text-primary">Loading Article...</p>
        </div>
      </div>
    );
  }

  if ((error || !blog) && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Navbar />
        <div className="text-center pt-20">
          <h1 className="font-display text-3xl text-primary">Error Loading Article</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Link to="/" className="mt-4 inline-block font-body text-muted-foreground underline hover:text-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="h-14 sm:h-16" />
      <div className="container mx-auto max-w-4xl px-4 py-3 sm:py-4">
        <nav className="flex items-center gap-1.5 text-xs font-body text-muted-foreground sm:text-sm">
          <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} className="transition-colors hover:text-primary">Home</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/60 truncate max-w-[200px] sm:max-w-none">{blog.title}</span>
        </nav>
      </div>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex gap-6">
          <aside className="hidden xl:block w-[200px] flex-shrink-0 sticky top-20 self-start">
            <AdBanner orientation="vertical" />
          </aside>
          <div className="flex-1 min-w-0 max-w-4xl mx-auto">
            <header className="pb-6 sm:pb-8">
              <div className="mb-4 sm:mb-5">
                <span className="inline-block rounded bg-primary/15 px-2.5 py-1 font-heading text-[10px] font-bold tracking-wider text-primary uppercase sm:text-xs">{blog.category}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display text-2xl font-bold tracking-wide text-foreground leading-tight sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">{blog.title}</h1>
                <ShareButton className="mt-1 flex-shrink-0" />
              </div>
              <p className="mt-3 font-body text-sm text-muted-foreground leading-relaxed sm:mt-4 sm:text-base md:text-lg max-w-3xl">{blog.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-body sm:mt-5 sm:gap-5 sm:text-sm">
                <span className="flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20"><UserIcon className="h-3 w-3 text-primary" /></div>
                  {blog.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary/70" />
                  {new Date(blog.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </header>
            <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl aspect-[16/8] sm:aspect-[16/7]">
              {blog.thumbnail ? (
                <img 
                  src={getOptimizedImageURL(blog.thumbnail, 1200)} 
                  alt={blog.title} 
                  className="absolute inset-0 h-full w-full object-cover" 
                  fetchpriority="high"
                  decoding="sync"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary to-background" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
            </div>
            <div className="xl:hidden mt-6"><AdBanner orientation="horizontal" /></div>
            <article className="py-8 sm:py-12 md:py-14 max-w-3xl mx-auto">
              <div className="font-body text-[15px] leading-[1.8] text-secondary-foreground/80 sm:text-base sm:leading-[1.85] md:text-[17px] md:leading-[1.9]">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-invert max-w-none 
                    prose-headings:font-display prose-headings:font-bold prose-headings:tracking-wide prose-headings:text-foreground
                    prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-4 prose-h2:mt-10 prose-h2:mb-4
                    prose-p:text-secondary-foreground/75 prose-p:leading-relaxed
                    prose-strong:text-primary prose-strong:font-bold
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                    prose-img:rounded-xl prose-img:border prose-img:border-border
                    prose-ul:list-disc prose-ol:list-decimal"
                  components={{
                    img: ({ node, ...props }) => (
                      <img 
                        {...props} 
                        src={getOptimizedImageURL(props.src || "", 1000)} 
                        alt={props.alt || ''}
                        className="rounded-xl border border-border w-full object-cover my-8"
                        loading="lazy"
                        decoding="async"
                      />
                    ),
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>
            </article>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <div className="h-1.5 w-1.5 rotate-45 bg-primary/50" />
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
            {relatedPosts.length > 0 && (
              <section className="py-10 sm:py-14">
                <h3 className="mb-6 font-display text-lg font-bold text-foreground sm:mb-8 sm:text-xl">Related Articles</h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5">
                  {relatedPosts.map((post) => (
                    <Link key={post._id} to={`/blog/${post.slug || post._id}`} className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/30 hover:glow-red">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img 
                          src={getOptimizedImageURL(post.thumbnail, 400)} 
                          alt={post.title} 
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <span className="mb-1.5 inline-block text-[10px] font-heading font-bold tracking-wider text-primary uppercase">{post.category}</span>
                        <h4 className="font-heading text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors sm:text-[15px]">{post.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            <div className="xl:hidden mb-6"><AdBanner orientation="horizontal" /></div>
            <section className="py-8 sm:py-10 max-w-3xl mx-auto">
              <div className="rounded-xl border border-border bg-card/50 p-5 sm:p-6">
                <p className="mb-4 font-heading text-[10px] font-bold tracking-widest text-primary uppercase sm:text-xs">Written by</p>
                <div className="space-y-4">
                  {parseAuthors(blog).map((author, i) => (
                    <div key={i} className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 sm:h-11 sm:w-11">
                        <UserIcon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="font-heading text-sm font-semibold text-foreground sm:text-base">{author.name}</p>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed sm:text-sm">{author.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <div className="pb-8 flex items-center justify-between gap-4">
              <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
                className="group inline-flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 font-heading text-xs font-semibold tracking-wider text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground sm:text-sm">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to all articles
              </button>
              <ShareButton />
            </div>
          </div>
          <aside className="hidden xl:block w-[200px] flex-shrink-0 sticky top-20 self-start">
            <AdBanner orientation="vertical" />
          </aside>
        </div>
      </div>
      <footer className="border-t border-border py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-body text-xs text-muted-foreground sm:text-sm">© 2026 <span className="text-primary">Gaudiya Warriors</span>. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPostPage;