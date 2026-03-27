import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Ad, DEFAULT_ADS } from "@/data/ads";

interface AdContextType {
  ads: Ad[];
  rotationInterval: number;
  addAd: (ad: Omit<Ad, "id">) => void;
  removeAd: (id: string) => void;
  updateAd: (id: string, updates: Partial<Ad>) => void;
  setRotationInterval: (seconds: number) => void;
}

const STORAGE_KEY = "gw-ads";
const INTERVAL_KEY = "gw-ad-interval";
const VERSION_KEY = "gw-ads-version";
// Auto-detects any change to DEFAULT_ADS content
const ADS_VERSION = JSON.stringify(DEFAULT_ADS);

const AdContext = createContext<AdContextType | null>(null);

export const useAds = () => {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error("useAds must be inside AdProvider");
  return ctx;
};

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const [ads, setAds] = useState<Ad[]>(() => {
    try {
      const storedVersion = localStorage.getItem(VERSION_KEY);
      // If code-level defaults changed, discard cached ads
      if (String(ADS_VERSION) !== storedVersion) {
        localStorage.setItem(VERSION_KEY, String(ADS_VERSION));
        localStorage.removeItem(STORAGE_KEY);
        return DEFAULT_ADS;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_ADS;
    } catch {
      return DEFAULT_ADS;
    }
  });

  const [rotationInterval, setRotationIntervalState] = useState(() => {
    try {
      const stored = localStorage.getItem(INTERVAL_KEY);
      return stored ? Number(stored) : 5;
    } catch {
      return 5;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ads)); } catch { /* quota exceeded – skip persist */ }
  }, [ads]);

  useEffect(() => {
    localStorage.setItem(INTERVAL_KEY, String(rotationInterval));
  }, [rotationInterval]);

  const addAd = (ad: Omit<Ad, "id">) => {
    setAds((prev) => [...prev, { ...ad, id: `ad-${Date.now()}` }]);
  };

  const removeAd = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAd = (id: string, updates: Partial<Ad>) => {
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const setRotationInterval = (seconds: number) => {
    setRotationIntervalState(Math.max(1, seconds));
  };

  return (
    <AdContext.Provider value={{ ads, rotationInterval, addAd, removeAd, updateAd, setRotationInterval }}>
      {children}
    </AdContext.Provider>
  );
};