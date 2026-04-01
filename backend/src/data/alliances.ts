// This file provides seed data for the backend.
// It uses '_id' as the backend model expects it.

export interface ISeedAlliance {
  name: string;
  logo: string; // URL to logo image
  url: string;
}

export const DEFAULT_ALLIANCES: ISeedAlliance[] = [
  { name: "Kanjik", logo: "/kanjik.png", url: "https://kanjik.net" },
  { name: "Bengal Volunteers", logo: "/bengal-volunteers.png", url: "#" },
  { name: "Historia De Gauda", logo: "/historia-de-gauda.jpg", url: "#" },
];