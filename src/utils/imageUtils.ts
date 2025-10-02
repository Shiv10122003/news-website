// Utility functions for handling images and fallbacks

export const PLACEHOLDER_IMAGES = {
  news: [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&h=300&fit=crop", // News/newspaper
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=500&h=300&fit=crop", // News office
    "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=500&h=300&fit=crop", // Breaking news
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=300&fit=crop", // Technology
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=300&fit=crop", // Computer/tech
    "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500&h=300&fit=crop", // Business
    "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=500&h=300&fit=crop", // Politics/government
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&h=300&fit=crop", // Sports
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=300&fit=crop", // General news
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop", // Media/entertainment
  ],
  sidebar: [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=100&h=100&fit=crop",
  ],
};

/**
 * Gets a consistent placeholder image based on article ID
 * @param articleId - The unique article ID
 * @param type - The type of placeholder images to use
 * @returns A placeholder image URL
 */
export const getPlaceholderImage = (
  articleId: string,
  type: "news" | "sidebar" = "news"
): string => {
  const images = PLACEHOLDER_IMAGES[type];
  const index =
    articleId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    images.length;
  return images[index];
};

/**
 * Handles image loading errors by returning a placeholder
 * @param originalUrl - The original image URL that failed
 * @param articleId - The article ID for consistent placeholder selection
 * @param type - The type of placeholder to use
 * @returns The placeholder image URL
 */
export const handleImageFallback = (
  originalUrl: string,
  articleId: string,
  type: "news" | "sidebar" = "news"
): string => {
  return originalUrl || getPlaceholderImage(articleId, type);
};

/**
 * Creates an image error handler function
 * @param articleId - The article ID
 * @param setError - State setter for tracking image errors
 * @returns Error handler function
 */
export const createImageErrorHandler = (
  articleId: string,
  setError: (
    fn: (prev: { [key: string]: boolean }) => { [key: string]: boolean }
  ) => void
) => {
  return () => {
    setError((prev) => ({
      ...prev,
      [articleId]: true,
    }));
  };
};
