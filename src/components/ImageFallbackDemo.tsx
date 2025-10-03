// Example usage of image fallback functionality

import { getPlaceholderImage } from "../utils/imageUtils";

// Example of how the image fallback works:

// 1. When an image URL is invalid or fails to load
const ImageFallbackDemo = () => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Image Fallback Demo</h3>

      {/* This will show a placeholder image when the URL fails */}
      <img
        src="https://invalid-url.com/broken-image.jpg"
        alt="Demo"
        className="w-full h-48 object-contain bg-gray-100 rounded"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = getPlaceholderImage("demo-article-1", "news");
        }}
      />

      <p className="mt-2 text-sm text-gray-600">
        This image will automatically show a random placeholder from Unsplash
        when the original URL fails to load.
      </p>
    </div>
  );
};

export default ImageFallbackDemo;
