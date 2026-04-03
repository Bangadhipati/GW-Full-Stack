import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import BlogSection from "@/components/BlogSection";
import { useBlogs } from "@/contexts/BlogContext";
import ServerOfflineOverlay from "@/components/ServerOfflineOverlay";

const Index = () => {
  const { trackSiteVisit, loading, error, blogs } = useBlogs();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Show overlay if loading for > 5s with no data (spin-up) 
    // or if an error occurred with no cached data (crash)
    if (loading && blogs.length === 0) {
      timer = setTimeout(() => setShowOverlay(true), 5000);
    } else if (error && blogs.length === 0) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }

    return () => clearTimeout(timer);
  }, [loading, error, blogs.length]);

  useEffect(() => {
    trackSiteVisit();
  }, [trackSiteVisit]);

  if (showOverlay) return <ServerOfflineOverlay />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
      <BlogSection />

      {/* Footer */}
      <footer className="border-t border-border bg-background py-6 sm:py-8">
        <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center sm:gap-4">
          <p className="font-display text-sm tracking-wider text-primary text-glow">
            GAUDIYA WARRIORS
          </p>
          <p className="font-body text-xs text-muted-foreground">
            janani janmabhoomischa swargadapi gariyasi
          </p>
          <p className="font-body text-xs text-muted-foreground">
            © 2026 Gaudiya Warriors. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
