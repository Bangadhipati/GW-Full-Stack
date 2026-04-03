import { BlogPost } from "@/data/blogs";
import { Link } from "react-router-dom";
import { Calendar, User as UserIcon } from "lucide-react";
import { getOptimizedImageURL } from "@/lib/imageUtils";

interface BlogCardProps {
  blog: BlogPost;
  variant?: string;
}

const BlogCard = ({ blog, variant = "standard" }: BlogCardProps) => {
  const gridClass: Record<string, string> = {
    "featured-left": "md:col-span-2 md:row-span-2",
    "featured-right": "md:col-span-2 md:row-span-2",
    "small-right": "md:col-span-1 md:row-span-1",
    "small-left": "md:col-span-1 md:row-span-1",
    "standard": "md:col-span-1 md:row-span-1",
  };

  const isFeatured = variant === "featured-left" || variant === "featured-right";




  return (
    <Link
      to={`/blog/${blog.id}`}
      className={`group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-500 hover:border-primary/40 hover:glow-red col-span-1 row-span-1 ${gridClass[variant] || gridClass.standard}`}
    >
      {/* Thumbnail */}
      <img
        src={getOptimizedImageURL(blog.thumbnail, isFeatured ? 800 : 400)}
        alt={blog.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      {/* Category badge */}
      <div className="absolute left-3 top-3 z-10">
        <span className="rounded-md bg-primary/90 px-2.5 py-1 font-heading text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
          {blog.category}
        </span>
      </div>

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <h3 className={`font-heading font-bold leading-tight text-foreground transition-colors group-hover:text-primary ${isFeatured ? "text-lg sm:text-xl md:text-2xl" : "text-sm sm:text-base"}`}>
          {blog.title}
        </h3>
        {isFeatured && (
          <p className="mt-1.5 line-clamp-2 font-body text-sm text-muted-foreground hidden sm:block">
            {blog.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground font-body">
          <span className="flex items-center gap-1">
            <UserIcon className="h-3 w-3 text-primary/70" />
            Gaudiya Warriors
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(blog.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Hover border */}
      <div className="absolute inset-0 rounded-xl border border-primary/0 transition-all duration-500 group-hover:border-primary/20" />
    </Link>
  );
};

export default BlogCard;
