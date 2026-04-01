// This file provides seed data for the backend.
// It should not include 'id' as MongoDB automatically generates '_id'.

export interface ISeedAd {
  horizontalImageUrl: string;
  verticalImageUrl: string;
  link?: string;
  label?: string;
}

export const DEFAULT_ADS: ISeedAd[] = [
  {
    horizontalImageUrl: "/sencohorizontal.png",
    verticalImageUrl: "/sencovertical.png",
    link: "https://sencogoldanddiamonds.com/",
    label: "Senco Gold",
  },
  {
    horizontalImageUrl: "/batahorizontal.png",
    verticalImageUrl: "/batavertical.png",
    link: "https://www.bata.com/in/",
    label: "Bata",
  },
  {
    horizontalImageUrl: "/boathorizontal.png",
    verticalImageUrl: "/boatvertical.png",
    link: "https://www.boat-lifestyle.com/",
    label: "Boat",
  },
  {
    horizontalImageUrl: "/colgatehorizontal.png",
    verticalImageUrl: "/colgatevertical.png",
    link: "https://www.colgate.com/en-in",
    label: "Colgate",
  },
];