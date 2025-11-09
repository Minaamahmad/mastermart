/**
 * Get the full image URL from a product image path
 * Supports both Cloudinary URLs (full URLs) and local paths
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }
  
  // If it's already a full URL (Cloudinary or other), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a local path, prepend the API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_URL}${cleanPath}`;
};

