import { useState, useEffect, useCallback, useRef } from "react";
import { useAds } from "@/contexts/AdContext";
import { Ad } from "@/data/ads";
import { cn } from "@/lib/utils";
import api from "@/api";

interface AdBannerProps {
  orientation?: "vertical" | "horizontal";
  className?: string;
}

const SWIPE_THRESHOLD = 40;

const AdBanner = ({ orientation = "vertical", className }: AdBannerProps) => {
  const { ads, rotationInterval } = useAds();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, []);

  const nextAd = useCallback(() => {
    if (ads.length <= 1) return;
    goTo((currentIndex + 1) % ads.length);
  }, [ads.length, currentIndex, goTo]);

  const prevAd = useCallback(() => {
    if (ads.length <= 1) return;
    goTo((currentIndex - 1 + ads.length) % ads.length);
  }, [ads.length, currentIndex, goTo]);

  useEffect(() => {
    if (ads.length === 0) return;
    const interval = setInterval(nextAd, rotationInterval * 1000);
    return () => clearInterval(interval);
  }, [nextAd, rotationInterval, ads.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [ads.length]);

  const handleSwipe = useCallback((endX: number, endY: number) => {
    if (!startPos.current) return;
    const dx = endX - startPos.current.x;
    const dy = endY - startPos.current.y;
    const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);

    if (isHorizontalSwipe && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) nextAd();
      else prevAd();
    }
    startPos.current = null;
  }, [nextAd, prevAd]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    handleSwipe(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }, [handleSwipe]);

  // Mouse drag events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleSwipe(e.clientX, e.clientY);
  }, [handleSwipe]);

  const onMouseLeave = useCallback(() => {
    isDragging.current = false;
    startPos.current = null;
  }, []);

  if (ads.length === 0) return null;

  const currentAd = ads[currentIndex % ads.length];

  const renderAd = (ad: Ad) => {
    const content = (
      <div className={cn(
        "relative overflow-hidden rounded-lg border border-border/30 bg-card/30 backdrop-blur-sm group select-none",
        orientation === "vertical" ? "aspect-[1/2]" : "aspect-[3/1]"
      )}>
        <img
          src={`${(orientation === "vertical" ? ad.verticalImageUrl : ad.horizontalImageUrl).startsWith('http') ? '' : api.API_STATIC_BASE_URL}${orientation === "vertical" ? ad.verticalImageUrl : ad.horizontalImageUrl}`}
          alt={ad.label || "Advertisement"}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 pointer-events-none",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        {ad.label && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent px-2.5 py-2">
            <p className="font-heading text-[10px] font-semibold tracking-wider text-foreground/80 uppercase truncate">
              {ad.label}
            </p>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5">
          <span className="rounded bg-background/60 px-1.5 py-0.5 font-body text-[8px] text-muted-foreground uppercase tracking-wider backdrop-blur-sm">
            Ad
          </span>
        </div>
      </div>
    );

    if (ad.link) {
      return (
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
          onClick={(e) => { if (startPos.current) e.preventDefault(); }}
          draggable={false}
        >
          {content}
        </a>
      );
    }
    return content;
  };

  return (
    <div
      className={cn("space-y-3 cursor-grab active:cursor-grabbing", className)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {renderAd(currentAd)}
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentIndex % ads.length
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-border hover:bg-muted-foreground"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdBanner;
