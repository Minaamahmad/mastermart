const { cloudinary } = require('../config/cloudinary');

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
    const urlParts = url.split('/upload/');
    if (urlParts.length < 2) return null;
    
    const afterUpload = urlParts[1];
    // Remove version if present (v1234567890/)
    const parts = afterUpload.replace(/^v\d+\//, '').split('.');
    // Remove file extension
    return parts.slice(0, -1).join('.');
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<void>}
 */
const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return;
  }
  try {
    const publicId = extractPublicId(imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Continue even if deletion fails
  }
};

module.exports = {
  extractPublicId,
  deleteCloudinaryImage
};

