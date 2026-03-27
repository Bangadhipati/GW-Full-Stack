import heroBanner from "@/assets/bishnupur-temples.webp";
import { useAlliances } from "@/contexts/AllianceContext";

const HeroBanner = () => {
  const { alliances } = useAlliances();
  const MarqueeItem = ({ alliance }: { alliance: typeof alliances[0] }) => (
    <a
      href={alliance.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-100 opacity-70 sm:gap-3 mx-5 sm:mx-8"
    >
      <img
        src={alliance.logo}
        alt={alliance.name}
        className="h-8 w-auto rounded-sm object-contain sm:h-10"
      />
      <span className="font-heading text-xs tracking-wider text-foreground whitespace-nowrap sm:text-sm">
        {alliance.name}
      </span>
    </a>
  );

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden sm:h-[85vh] sm:min-h-[600px]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />

      {/* Semi-transparent professional overlay */}
      <div className="absolute inset-0 bg-background/50" />

      {/* Dark Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent" />

      {/* Red accent overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center pb-20 lg:pt-12 xl:pt-16">
        <p className="animate-fade-in mb-3 font-heading text-sm tracking-[0.2em] text-foreground uppercase sm:mb-4 sm:text-lg sm:tracking-[0.3em] md:text-xl">
          Welcome To The World Of
        </p>

        <h1 className="animate-slide-up font-display text-3xl font-black tracking-wider text-primary sm:text-4xl md:text-6xl lg:text-7xl" style={{ textShadow: '0 0 20px hsl(45 100% 50% / 0.5), 0 0 40px hsl(45 100% 50% / 0.2)', WebkitTextStroke: '3px black', paintOrder: 'stroke fill' }}>
          GAUDIYA
          <br />
          WARRIORS
        </h1>

        <p className="animate-fade-in mt-4 max-w-lg font-body text-sm text-secondary-foreground/70 sm:mt-6 sm:max-w-2xl sm:text-base md:text-lg" style={{ animationDelay: "0.4s", opacity: 0 }}>
          Uniting the youths for the 21st century Bengali Revolution —
          <br className="hidden sm:block" />
          To make Bengal, India Great Again
        </p>

        {/* Decorative line */}
        <div className="mt-6 flex items-center gap-3 animate-fade-in sm:mt-8" style={{ animationDelay: "0.6s", opacity: 0 }}>
          <div className="h-px w-12 gradient-red sm:w-16" />
          <div className="h-2 w-2 rotate-45 border border-primary" />
          <div className="h-px w-12 gradient-red sm:w-16" />
        </div>
      </div>

      {/* Golden glow from bottom edge */}
      <div className="absolute -bottom-px left-0 right-0 h-px" style={{ boxShadow: '0 0 50px 20px hsla(45, 90%, 50%, 0.3), 0 0 100px 40px hsla(45, 90%, 50%, 0.15)' }} />

      {/* Alliances Marquee */}
      <div className="absolute bottom-0 left-0 right-0">
        <p className="text-center font-heading text-[10px] tracking-[0.2em] text-foreground/80 uppercase sm:text-xs">
          Our Alliances
        </p>
        <div className="relative flex overflow-hidden py-2 sm:py-3">
          <div className="flex shrink-0 animate-marquee">
            {[...alliances, ...alliances, ...alliances, ...alliances].map((a, i) => <MarqueeItem key={`a-${i}`} alliance={a} />)}
          </div>
          <div className="flex shrink-0 animate-marquee">
            {[...alliances, ...alliances, ...alliances, ...alliances].map((a, i) => <MarqueeItem key={`b-${i}`} alliance={a} />)}
          </div>
        </div>
      </div>

      {/* Social Media - Horizontal center on mobile, vertical left on desktop */}
      <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 flex flex-col items-start gap-2 md:bottom-auto md:left-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:items-center md:gap-4">
        <div className="flex items-center gap-2 md:flex-col md:gap-4">
          <span className="text-[10px] font-heading tracking-widest text-foreground uppercase md:[writing-mode:vertical-lr] md:rotate-180">
            Follow Us
          </span>
          <div className="h-px w-6 bg-foreground md:h-8 md:w-px" />
        </div>
        <div className="flex flex-row items-center gap-3 md:flex-col md:gap-4">

        <a href="https://x.com/gaudiyawarriors" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/50 transition-all hover:border-primary hover:glow-red sm:h-9 sm:w-9" title="Follow on X">
          <svg className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        <a href="https://www.youtube.com/@gaudiyawarriors87" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/50 transition-all hover:border-primary hover:glow-red sm:h-9 sm:w-9" title="Subscribe on YouTube">
          <svg className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </a>

        <a href="https://www.facebook.com/share/17Y3Sf2PRZ/" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/50 transition-all hover:border-primary hover:glow-red sm:h-9 sm:w-9" title="Follow on Facebook">
          <svg className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>

        <a href="https://www.instagram.com/gaudeshwar87/" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/50 transition-all hover:border-primary hover:glow-red sm:h-9 sm:w-9" title="Follow on Instagram">
          <svg className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </a>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;