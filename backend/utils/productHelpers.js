/**
 * Calculate discount from original price and selling price
 * @param {number} originalPrice - Original price
 * @param {number} sellingPrice - Selling price
 * @returns {number} - Discount percentage
 */
const calculateDiscount = (originalPrice, sellingPrice) => {
  if (!originalPrice || originalPrice <= sellingPrice) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
};

/**
 * Calculate original price from discount and selling price
 * @param {number} discount - Discount percentage
 * @param {number} sellingPrice - Selling price
 * @returns {number} - Original price
 */
const calculateOriginalPrice = (discount, sellingPrice) => {
  if (!discount || discount <= 0 || discount > 100) return null;
  return Math.round((sellingPrice / (1 - discount / 100)) * 100) / 100;
};

/**
 * Process price and discount fields
 * @param {number} price - Selling price
 * @param {number|null} originalPrice - Original price (optional)
 * @param {number} discount - Discount percentage (optional)
 * @returns {Object} - Processed price, originalPrice, and discount
 */
const processPriceAndDiscount = (price, originalPrice = null, discount = 0) => {
  let finalOriginalPrice = originalPrice;
  let finalDiscount = discount;

  // If originalPrice is provided and greater than price, calculate discount
  if (originalPrice && originalPrice > price) {
    finalDiscount = calculateDiscount(originalPrice, price);
  } 
  // If discount is provided, calculate originalPrice
  else if (discount > 0 && discount <= 100) {
    finalOriginalPrice = calculateOriginalPrice(discount, price);
  }
  // If neither is provided or discount is 0, clear originalPrice
  else if (!originalPrice && discount === 0) {
    finalOriginalPrice = null;
    finalDiscount = 0;
  }

  return {
    price,
    originalPrice: finalOriginalPrice,
    discount: finalDiscount
  };
};

module.exports = {
  calculateDiscount,
  calculateOriginalPrice,
  processPriceAndDiscount
};

