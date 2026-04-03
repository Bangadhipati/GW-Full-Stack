import { Loader2, RefreshCcw, WifiOff } from "lucide-react";
import { Button } from "./ui/button";

const ServerOfflineOverlay = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4 text-center">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="relative max-w-md animate-fade-in px-6">
        {/* Glow Background */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="relative space-y-8">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-2 rounded-full bg-primary/20 blur animate-pulse" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/30 bg-card shadow-2xl transition-transform duration-500 group-hover:scale-110">
                <WifiOff className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
              BATTLESTATIONS <span className="text-primary text-glow">IDLE</span>
            </h1>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              Our servers are currently waking up or undergoing maintenance. 
              <br className="hidden sm:block" />
              This usually takes less than a minute to reconnect to our digital frontlines.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-6 py-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="font-heading text-sm font-bold tracking-[0.2em] text-foreground uppercase">
                Synchronizing History...
              </span>
            </div>
            
            <div className="space-y-4 w-full">
              <p className="font-body text-xs text-muted-foreground/60 italic">
                "Patience is the strength of the soul; wait for the revival."
              </p>

              <div className="flex flex-col gap-8 justify-center">
                <div className="flex justify-center">
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="gradient-red w-full sm:w-auto gap-2 font-heading px-12 py-6 text-base shadow-lg hover:glow-red transition-all"
                  >
                    <RefreshCcw className="h-5 w-5" />
                    Try Again
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border/50" />
                    <span className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase whitespace-nowrap">
                      Explore Our Frontlines
                    </span>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <a href="https://x.com/gaudiyawarriors" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/30 transition-all hover:border-primary hover:text-primary hover:glow-red" title="X (Twitter)">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a href="https://www.youtube.com/@gaudiyawarriors87" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/30 transition-all hover:border-primary hover:text-primary hover:glow-red" title="YouTube">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                    <a href="https://www.facebook.com/share/17Y3Sf2PRZ/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/30 transition-all hover:border-primary hover:text-primary hover:glow-red" title="Facebook">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a href="https://www.instagram.com/gaudeshwar87/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/30 transition-all hover:border-primary hover:text-primary hover:glow-red" title="Instagram">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerOfflineOverlay;
