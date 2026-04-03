import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Ad as ClientAd, DEFAULT_ADS } from "@/data/ads"; // Renamed to ClientAd
import api from '../api';
import { useAuth } from './AuthContext'; // Import useAuth to get the token

// The Ad interface from API matches the client's Ad interface now
interface Ad extends ClientAd {
  _id: string; // MongoDB _id
}

interface AdContextType {
  ads: Ad[];
  rotationInterval: number; // Still client-side managed for now
  addAd: (ad: Omit<Ad, "id" | "_id">) => Promise<string | null>;
  removeAd: (id: string) => Promise<string | null>;
  updateAd: (id: string, updates: Partial<Omit<Ad, "id" | "_id">>) => Promise<string | null>;
  setRotationInterval: (seconds: number) => void;
  loading: boolean;
  error: string | null;
  fetchAds: () => Promise<void>;
}

const INTERVAL_KEY = "gw-ad-interval"; // This remains client-side for rotation speed

const AdContext = createContext<AdContextType | null>(null);

export const useAds = () => {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error("useAds must be inside AdProvider");
  return ctx;
};

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth(); // Get token from AuthContext
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rotationInterval, setRotationIntervalState] = useState(() => {
    try {
      const stored = localStorage.getItem(INTERVAL_KEY);
      return stored ? Number(stored) : 5;
    } catch {
      return 5;
    }
  });

  // Persist rotation interval
  useEffect(() => {
    localStorage.setItem(INTERVAL_KEY, String(rotationInterval));
  }, [rotationInterval]);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAds = await api.getAds();
      // Map _id to id for existing frontend components expecting `id`
      setAds(fetchedAds.map(ad => ({ ...ad, id: ad._id })));
    } catch (err: any) {
      console.error("Failed to fetch ads:", err);
      setError(err.message || "Failed to load ads");
      setAds([]); // Do not show fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]); // Fetch ads on component mount

  const addAd = useCallback(async (ad: Omit<Ad, "id" | "_id">): Promise<string | null> => {
    if (!token) return "Authentication required to add an ad.";
    try {
      await api.createAd(ad, token);
      await fetchAds(); // Re-fetch to get the new ad from the backend
      return null;
    } catch (err: any) {
      console.error("Failed to add ad:", err);
      return err.message || "Failed to add ad";
    }
  }, [token, fetchAds]);

  const removeAd = useCallback(async (id: string): Promise<string | null> => {
    if (!token) return "Authentication required to remove an ad.";
    try {
      await api.deleteAd(id, token);
      await fetchAds(); // Re-fetch ads
      return null;
    } catch (err: any) {
      console.error("Failed to remove ad:", err);
      return err.message || "Failed to remove ad";
    }
  }, [token, fetchAds]);

  const updateAd = useCallback(async (id: string, updates: Partial<Omit<Ad, "id" | "_id">>): Promise<string | null> => {
    if (!token) return "Authentication required to update an ad.";
    try {
      await api.updateAd(id, updates, token);
      await fetchAds(); // Re-fetch ads
      return null;
    } catch (err: any) {
      console.error("Failed to update ad:", err);
      return err.message || "Failed to update ad";
    }
  }, [token, fetchAds]);

  const setRotationInterval = (seconds: number) => {
    setRotationIntervalState(Math.max(1, seconds));
  };

  return (
    <AdContext.Provider value={{ ads, rotationInterval, addAd, removeAd, updateAd, setRotationInterval, loading, error, fetchAds }}>
      {children}
    </AdContext.Provider>
  );
};