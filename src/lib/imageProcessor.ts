// src/lib/imageProcessor.ts
// New file for client-side image processing

/**
 * Compresses and resizes an image file client-side using Canvas.
 * Aims to reduce file size while maintaining visual quality by:
 * 1. Resizing to fit within specified maximum dimensions (maintains aspect ratio).
 * 2. Compressing to a specified JPEG quality.
 * @param imageFile The original image file (e.g., from an input event).
 * @param maxWidth Maximum width for the output image.
 * @param maxHeight Maximum height for the output image.
 * @param quality JPEG compression quality (0.0 to 1.0).
 * @returns A Promise that resolves with the processed image as a new File object.
 */
export const compressImage = (
  imageFile: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Failed to get canvas context."));
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to Blob (JPEG format for better size control)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Canvas toBlob failed."));
            }
            // Create a new File object from the compressed Blob
            const compressedFile = new File([blob], imageFile.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = (error) => {
        reject(new Error("Failed to load image for compression."));
      };
    };

    reader.onerror = (error) => {
      reject(new Error("Failed to read file for compression."));
    };
  });
};