// src/components/Navbar.tsx
import { useState, useEffect, useRef } from "react";
import { User, LogOut, X, LayoutDashboard, Loader2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
// import { useLocation } from "react-router-dom"; // REMOVE THIS IMPORT, Navbar shouldn't directly control login modal now

// Navbar will no longer directly manage the login modal.
// It will simply link to /dashboard if unauthenticated,
// and /dashboard will be responsible for showing the login modal.
const Navbar = () => {
  const { user, signIn, signOut } = useAuth();
  // const location = useLocation(); // Not needed here anymore

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // No useEffect here to manage showAuthModal based on location.
  // The login modal is now handled by the Dashboard page.

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    const err = await signIn(authEmail, authPassword);
    setIsSigningIn(false);
    if (err) {
      setAuthError(err);
    } else {
      setAuthError("");
      // No need to setShowAuthModal(false) here, as it's not managed by Navbar
      // The Dashboard page will detect successful login and navigate away or show content.
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
            {/* Dashboard link always visible if logged in */}
            {user && (
              <Link to="/dashboard" className="hidden items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 font-heading text-xs font-semibold tracking-wider text-primary transition-all hover:bg-primary/20 sm:flex">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            )}

            <div className="relative" ref={profileRef}>
              {user ? (
                // If logged in, show user's initial or avatar
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-primary/20 font-heading text-sm font-bold text-primary transition-all hover:glow-red-strong sm:h-9 sm:w-9"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
              ) : (
                // If not logged in, show a generic user icon that LINKS to /dashboard
                <Link to="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary transition-all hover:border-primary hover:glow-red sm:h-9 sm:w-9" title="Login / Dashboard">
                  <User className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}

              {showProfileMenu && user && (
                <div className="absolute right-0 top-11 w-52 rounded-lg border border-border bg-card p-2 shadow-xl sm:top-12">
                  <div className="mb-2 border-b border-border px-3 py-2">
                    <p className="font-heading text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground">{user.email}</p>
                    <p className="text-[10px] text-primary capitalize">{user.role.replace("_", " ")}</p>
                  </div>
                  {/* Keep this Dashboard link for mobile/smaller screens */}
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

      {/* The Login Modal should NO LONGER BE HERE. It will be moved to Dashboard.tsx */}
      {/*
      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowAuthModal(false)}>
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 sm:p-8 glow-red" onClick={(e) => e.stopPropagation()}>
            ... Login modal content ...
          </div>
        </div>
      )}
      */}
    </>
  );
};

export default Navbar;