import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import api from '../api';
import { useAuth } from './AuthContext';

// The Alliance interface from API matches the client's Alliance interface now
export interface Alliance {
  _id: string; // MongoDB _id
  id?: string; // Optional: Keep original frontend `id` if still used locally for some reason.
  name: string;
  logo: string;
  url: string;
}

// Fallback to client-side defaults if API fails
import kanjikLogo from "@/assets/alliances/kanjik.png";
import bengalVolunteersLogo from "@/assets/alliances/bengal-volunteers.png";
import historiaDeGaudaLogo from "@/assets/alliances/historia-de-gauda.jpg";

export const DEFAULT_ALLIANCES: Alliance[] = [
  { _id: "a-1", name: "Kanjik", logo: kanjikLogo, url: "https://kanjik.net" },
  { _id: "a-2", name: "Bengal Volunteers", logo: bengalVolunteersLogo, url: "#" },
  { _id: "a-3", name: "Historia De Gauda", logo: historiaDeGaudaLogo, url: "#" },
];


interface AllianceContextType {
  alliances: Alliance[];
  addAlliance: (a: Omit<Alliance, "id" | "_id">) => Promise<string | null>;
  updateAlliance: (id: string, updates: Partial<Omit<Alliance, "id" | "_id">>) => Promise<string | null>;
  removeAlliance: (id: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
  fetchAlliances: () => Promise<void>;
}

const AllianceContext = createContext<AllianceContextType | null>(null);

export const useAlliances = () => {
  const ctx = useContext(AllianceContext);
  if (!ctx) throw new Error("useAlliances must be inside AllianceProvider");
  return ctx;
};

export const AllianceProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth(); // Get token from AuthContext
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlliances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAlliances = await api.getAlliances();
      // Map _id to id for existing frontend components expecting `id`
      setAlliances(fetchedAlliances.map(alliance => ({ ...alliance, id: alliance._id })));
    } catch (err: any) {
      console.error("Failed to fetch alliances:", err);
      setError(err.message || "Failed to load alliances");
      setAlliances([]); // Do not show fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlliances();
  }, [fetchAlliances]); // Fetch alliances on component mount

  const addAlliance = useCallback(async (a: Omit<Alliance, "id" | "_id">): Promise<string | null> => {
    if (!token) return "Authentication required to add an alliance.";
    try {
      await api.createAlliance(a, token);
      await fetchAlliances();
      return null;
    } catch (err: any) {
      console.error("Failed to add alliance:", err);
      return err.message || "Failed to add alliance";
    }
  }, [token, fetchAlliances]);

  const updateAlliance = useCallback(async (id: string, updates: Partial<Omit<Alliance, "id" | "_id">>): Promise<string | null> => {
    if (!token) return "Authentication required to update an alliance.";
    try {
      await api.updateAlliance(id, updates, token);
      await fetchAlliances();
      return null;
    } catch (err: any) {
      console.error("Failed to update alliance:", err);
      return err.message || "Failed to update alliance";
    }
  }, [token, fetchAlliances]);

  const removeAlliance = useCallback(async (id: string): Promise<string | null> => {
    if (!token) return "Authentication required to remove an alliance.";
    try {
      await api.deleteAlliance(id, token);
      await fetchAlliances();
      return null;
    } catch (err: any) {
      console.error("Failed to remove alliance:", err);
      return err.message || "Failed to remove alliance";
    }
  }, [token, fetchAlliances]);

  return (
    <AllianceContext.Provider value={{ alliances, addAlliance, updateAlliance, removeAlliance, loading, error, fetchAlliances }}>
      {children}
    </AllianceContext.Provider>
  );
};