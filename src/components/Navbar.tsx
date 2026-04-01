import { useState, useEffect, useRef } from "react";
import { User, LogOut, X, LayoutDashboard, Loader2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { user, signIn, signOut } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    const err = await signIn(authEmail, authPassword);
    setIsSigningIn(false);
    if (err) {
      setAuthError(err);
    } else {
      setAuthError("");
      setShowAuthModal(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    setShowProfileMenu(false);
  };

  useEffect(() => {
    if (!showProfileMenu) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfileMenu]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Gaudiya Warriors Logo" className="h-8 w-8 rounded-full border-2 border-primary glow-red sm:h-10 sm:w-10" fetchpriority="high" />
            <div className="flex flex-col">
              <span className="font-display text-sm font-bold tracking-wider text-primary text-glow sm:text-lg">GAUDIYA WARRIORS</span>
              <span className="text-[8px] font-body tracking-wide text-muted-foreground sm:text-[10px]">janani janmabhoomischa swargadapi gariyasi</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {user && (
              <Link to="/dashboard" className="hidden items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 font-heading text-xs font-semibold tracking-wider text-primary transition-all hover:bg-primary/20 sm:flex">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            )}

            <div className="relative" ref={profileRef}>
              {user ? (
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-primary/20 font-heading text-sm font-bold text-primary transition-all hover:glow-red-strong sm:h-9 sm:w-9"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
              ) : (
                <button
                  onClick={() => { setShowAuthModal(true); setShowPassword(false); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary transition-all hover:border-primary hover:glow-red sm:h-9 sm:w-9"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                </button>
              )}

              {showProfileMenu && user && (
                <div className="absolute right-0 top-11 w-52 rounded-lg border border-border bg-card p-2 shadow-xl sm:top-12">
                  <div className="mb-2 border-b border-border px-3 py-2">
                    <p className="font-heading text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground">{user.email}</p>
                    <p className="text-[10px] text-primary capitalize">{user.role.replace("_", " ")}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setShowProfileMenu(false)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-body text-foreground transition-colors hover:bg-secondary sm:hidden">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-body text-foreground transition-colors hover:bg-secondary">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowAuthModal(false)}>
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 sm:p-8 glow-red" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAuthModal(false)} className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <h2 className="mb-2 text-center font-display text-lg font-bold text-primary text-glow sm:text-xl">MEMBER LOGIN</h2>
            <p className="mb-5 text-center text-sm text-muted-foreground font-body">Authorized access for team members and administrators</p>
            {authError && (
              <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-center text-xs text-destructive font-body">{authError}</p>
            )}
            <div className="mb-3">
              <label className="mb-1.5 block font-heading text-xs text-muted-foreground tracking-wider uppercase">Email Address</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" placeholder="your@email.com" />
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block font-heading text-xs text-muted-foreground tracking-wider uppercase">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                  className="w-full rounded-lg border border-border bg-secondary/50 pl-4 pr-11 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              onClick={handleSignIn} 
              disabled={isSigningIn}
              className="w-full gradient-red font-heading text-sm tracking-wide sm:text-base"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;