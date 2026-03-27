export interface Ad {
  id: string;
  /** Horizontal image (3:1 ratio, e.g. 900×300px) — shown on mobile/tablet */
  horizontalImageUrl: string;
  /** Vertical image (1:2 ratio, e.g. 300×600px) — shown on desktop sidebars */
  verticalImageUrl: string;
  link?: string;
  label?: string;
}

export const DEFAULT_ADS: Ad[] = [
  {
    id: "1",
    horizontalImageUrl: "/sencohorizontal.png",
    verticalImageUrl: "/sencovertical.png",
    link: "https://sencogoldanddiamonds.com/",
    label: "Senco Gold",
  },
  {
    id: "2",
    horizontalImageUrl: "/batahorizontal.png",
    verticalImageUrl: "/batavertical.png",
    link: "https://www.bata.com/in/",
    label: "Bata",
  },
  {
    id: "3",
    horizontalImageUrl: "/boathorizontal.png",
    verticalImageUrl: "/boatvertical.png",
    link: "https://www.boat-lifestyle.com/",
    label: "Boat",
  },
  {
    id: "4",
    horizontalImageUrl: "/colgatehorizontal.png",
    verticalImageUrl: "/colgatevertical.png",
    link: "https://www.colgate.com/en-in",
    label: "Colgate",
  },
  
];
