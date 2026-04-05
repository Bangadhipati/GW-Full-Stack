import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, RefreshCcw, WifiOff, Swords, Shield, Target, Trophy } from "lucide-react";
import { Button } from "./ui/button";

const TRAINING_MESSAGES = [
  "Steady your breath...",
  "The blade is an extension of the soul.",
  "Focus on the target.",
  "Your spirit is awakening.",
  "Strength comes through perseverance.",
  "Victory favors the disciplined.",
  "The heritage lives within you.",
  "A warrior never yields.",
  "Gauda's glory shall return.",
  "Unlocking the warrior within..."
];

const ServerOfflineOverlay = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameActive, setIsGameActive] = useState(false);
  const [trainingMsg, setTrainingMsg] = useState(TRAINING_MESSAGES[0]);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setLevel(prev => Math.floor(score / 10) + 1);
      setTrainingMsg(TRAINING_MESSAGES[Math.floor(Math.random() * TRAINING_MESSAGES.length)]);
    }
  }, [score]);

  const handleTargetClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setScore(prev => prev + 1);
    
    // Move target randomly within safe bounds
    setTargetPos({
      x: Math.max(15, Math.min(85, Math.random() * 100)),
      y: Math.max(25, Math.min(75, Math.random() * 100))
    });
  };

  const handleHardRefresh = useCallback(() => {
    setIsRetrying(true);
    // Clear storage to ensure fresh state and bypass potential stale data/auth loops
    sessionStorage.clear();
    localStorage.clear();
    
    // Perform a hard reload with a cache-busting timestamp
    const url = new URL(window.location.href);
    url.searchParams.set("retry_at", Date.now().toString());
    window.location.href = url.toString();
  }, []);

  useEffect(() => {
    // Don't auto-refresh while the user is actively training
    if (isGameActive) return;

    const checkServerStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
        // Verify connectivity via a real data endpoint to ensure server and DB are fully responsive
        // This prevents false refreshes when only the load-balancer is up but not the app
        const response = await fetch(`${apiUrl}/blogs/stats/total-views`);
        
        // If the API returns a success status, the backend is truly operational
        if (response.ok) {
          handleHardRefresh();
        }
      } catch (err) {
        // Still unreachable or booting
      }
    };

    // Auto-check connection every 20 seconds to catch Render spin-up
    const interval = setInterval(checkServerStatus, 20000);
    return () => clearInterval(interval);
  }, [handleHardRefresh, isGameActive]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {!isGameActive ? (
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

              <div className="flex flex-col gap-6 justify-center">
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleHardRefresh}
                    disabled={isRetrying}
                    className="gradient-red w-full gap-2 font-heading py-6 text-base shadow-lg hover:glow-red transition-all"
                  >
                    {isRetrying ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-5 w-5" />
                    )}
                    {isRetrying ? "Synchronizing..." : "Try Connection"}
                  </Button>
                  
                  <button 
                    onClick={() => setIsGameActive(true)}
                    className="group flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/30 py-3 font-heading text-xs font-bold tracking-widest text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
                  >
                    <Swords className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
                    COMMENCE WARRIOR TRAINING
                  </button>
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
                    <a href="https://x.com/Gaudeshwar" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/30 transition-all hover:border-primary hover:text-primary hover:glow-red" title="X (Twitter)">
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
      ) : (
        <div ref={containerRef} className="relative h-full w-full max-w-4xl animate-fade-in flex flex-col items-center justify-between py-12">
          {/* Game UI Header */}
          <div className="z-10 space-y-2">
            <div className="flex items-center justify-center gap-4">
              <div className="rounded-lg border border-border bg-card/50 px-4 py-2 backdrop-blur-md">
                <p className="font-heading text-[10px] tracking-widest text-muted-foreground uppercase">Warrior Rank</p>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="font-display text-xl font-bold text-foreground">LVL {level}</p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card/50 px-4 py-2 backdrop-blur-md">
                <p className="font-heading text-[10px] tracking-widest text-muted-foreground uppercase">Spirit Strength</p>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <p className="font-display text-xl font-bold text-foreground">{score}</p>
                </div>
              </div>
            </div>
            <p className="font-body text-sm text-primary text-glow italic animate-pulse min-h-[1.5em]">{trainingMsg}</p>
          </div>

          {/* Game Area */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute h-20 w-20 sm:h-24 sm:w-24 -translate-x-1/2 -translate-y-1/2 cursor-crosshair transition-all duration-300 ease-out md:duration-200"
              style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
              onClick={handleTargetClick}
              onTouchStart={handleTargetClick}
            >
              <div className="relative h-full w-full">
                <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-primary/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target className="h-10 w-10 sm:h-12 sm:w-12 text-primary drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Game Footer */}
          <div className="z-10 w-full max-w-xs space-y-4">
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="font-heading text-[10px] font-bold tracking-[0.2em] text-foreground uppercase">
                Server Re-link in progress...
              </span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsGameActive(false)}
              className="w-full border-border hover:bg-secondary text-muted-foreground font-heading text-xs tracking-widest"
            >
              ABANDON TRAINING
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerOfflineOverlay;
