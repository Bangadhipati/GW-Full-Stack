import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useBlogs } from "@/contexts/BlogContext";
import BlogCard from "@/components/BlogCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const BlogSection = () => {
  const { blogs } = useBlogs();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)));
    cats.sort();
    return ["All", ...cats];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    let results = blogs;
    if (activeCategory !== "All") {
      results = results.filter((b) => b.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }
    return results;
  }, [searchQuery, activeCategory, blogs]);

  const getVariant = (index: number): string => {
    const pattern = ["featured-left", "small-right", "small-right", "small-left", "featured-right", "small-left"];
    return pattern[index % pattern.length];
  };

  return (
    <section className="relative bg-background py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="font-display text-2xl font-bold tracking-wider text-foreground sm:text-3xl md:text-4xl">
            LATEST <span className="text-primary text-glow">CHRONICLES</span>
          </h2>
          <p className="mt-2 font-body text-sm text-muted-foreground sm:text-base">
            Exploring Bengal's heritage, history, and the path forward
          </p>
        </div>

        <div className="sticky top-[56px] z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-md sm:top-[64px]">
          <div className="mx-auto flex max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 py-3 pl-11 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:glow-red"
              />
            </div>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <button
                  className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-lg border transition-all ${
                    filterOpen || activeCategory !== "All"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary hover:text-primary"
                  } hover:glow-red`}
                  title="Filter"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-3 bg-card border-border">
                <div className="flex flex-col gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setFilterOpen(false); }}
                      className={`rounded-md px-3 py-2 text-left font-heading text-[11px] font-semibold tracking-wider uppercase transition-all ${
                        activeCategory === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  {activeCategory !== "All" && (
                    <button onClick={() => { setActiveCategory("All"); setFilterOpen(false); }}
                      className="mt-1 flex items-center justify-center gap-1 rounded-md border border-border py-1.5 text-[11px] text-primary font-body hover:bg-secondary/50">
                      <X className="h-3 w-3" /> Clear Filter
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {filteredBlogs.length > 0 ? (
          <div className="grid auto-rows-[180px] sm:auto-rows-[200px] grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
            {filteredBlogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} variant={getVariant(index)} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-heading text-lg text-muted-foreground">No articles found</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;