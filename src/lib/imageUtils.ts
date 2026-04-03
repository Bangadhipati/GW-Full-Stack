import api from "@/api";

/**
 * Optimizes a Cloudinary URL by injecting f_auto (auto format) and q_auto (auto quality).
 * Falls back to the static base URL for local assets.
 */
export const getOptimizedImageURL = (url: string, width?: number, height?: number): string => {
  if (!url) return "";

  // Check if it's a Cloudinary URL
  if (url.includes("res.cloudinary.com")) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (url.includes(cloudName)) {
      // Logic to insert f_auto,q_auto after /upload/
      const parts = url.split("/upload/");
      if (parts.length === 2) {
        let transformations = "f_auto,q_auto";
        if (width) transformations += `,w_${width}`;
        if (height) transformations += `,h_${height},c_fill`;
        
        return `${parts[0]}/upload/${transformations}/${parts[1]}`;
      }
    }
  }

  // Handle local assets or already full URLs
  if (url.startsWith("http")) return url;
  
  // If it's a relative path starting with /, use the site origin for absolute URL
  if (url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  
  return `${api.API_STATIC_BASE_URL}${url}`;
};