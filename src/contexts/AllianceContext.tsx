import { createContext, useContext, useState, ReactNode } from "react";

import kanjikLogo from "@/assets/alliances/kanjik.png";
import bengalVolunteersLogo from "@/assets/alliances/bengal-volunteers.png";
import historiaDeGaudaLogo from "@/assets/alliances/historia-de-gauda.jpg";

export interface Alliance {
  id: string;
  name: string;
  logo: string;
  url: string;
}

const DEFAULT_ALLIANCES: Alliance[] = [
  { id: "a-1", name: "Kanjik", logo: kanjikLogo, url: "https://kanjik.net" },
  { id: "a-2", name: "Bengal Volunteers", logo: bengalVolunteersLogo, url: "#" },
  { id: "a-3", name: "Historia De Gauda", logo: historiaDeGaudaLogo, url: "#" },
];

const STORAGE_KEY = "gw-alliances";
const VERSION_KEY = "gw-alliances-version";
const CURRENT_VERSION = JSON.stringify(DEFAULT_ALLIANCES.map((a) => a.id));

function loadAlliances(): Alliance[] {
  try {
    const ver = localStorage.getItem(VERSION_KEY);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (ver === CURRENT_VERSION && stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ALLIANCES));
  return DEFAULT_ALLIANCES;
}

interface AllianceContextType {
  alliances: Alliance[];
  addAlliance: (a: Omit<Alliance, "id">) => void;
  updateAlliance: (id: string, updates: Partial<Omit<Alliance, "id">>) => void;
  removeAlliance: (id: string) => void;
}

const AllianceContext = createContext<AllianceContextType | null>(null);

export const useAlliances = () => {
  const ctx = useContext(AllianceContext);
  if (!ctx) throw new Error("useAlliances must be inside AllianceProvider");
  return ctx;
};

export const AllianceProvider = ({ children }: { children: ReactNode }) => {
  const [alliances, setAlliances] = useState<Alliance[]>(loadAlliances);

  const persist = (items: Alliance[]) => {
    setAlliances(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(VERSION_KEY, JSON.stringify(items.map((a) => a.id)));
  };

  const addAlliance = (a: Omit<Alliance, "id">) => {
    persist([...alliances, { ...a, id: `a-${Date.now()}` }]);
  };

  const updateAlliance = (id: string, updates: Partial<Omit<Alliance, "id">>) => {
    persist(alliances.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const removeAlliance = (id: string) => {
    persist(alliances.filter((a) => a.id !== id));
  };

  return (
    <AllianceContext.Provider value={{ alliances, addAlliance, updateAlliance, removeAlliance }}>
      {children}
    </AllianceContext.Provider>
  );
};