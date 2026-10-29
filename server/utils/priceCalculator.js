/**
 * Calculates final selling price after applying discount percentage.
 * Formula: finalPrice = price - (price * discount / 100)
 */
const calculateFinalPrice = (price, discount = 0) => {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  const finalPrice = p - (p * d) / 100;
  return Math.round(finalPrice * 100) / 100;
};

/**
 * Calculates totals for a set of cart/order items.
 */
const calculateOrderTotals = (items, shippingMethod = 'standard') => {
  let subtotal = 0;
  let totalDiscount = 0;

  for (const item of items) {
    const originalPrice = Number(item.price) || Number(item.priceSnapshot) || 0;
    const finalPrice = Number(item.finalPrice) || Number(item.finalPriceSnapshot) || calculateFinalPrice(originalPrice, item.discount || item.discountSnapshot);
    const quantity = Number(item.quantity) || 1;

    subtotal += originalPrice * quantity;
    totalDiscount += (originalPrice - finalPrice) * quantity;
  }

  const itemsTotal = subtotal - totalDiscount;
  const shippingFee = itemsTotal >= 999 || itemsTotal === 0 ? 0 : 99; // Free shipping over ₹999
  const taxAmount = Math.round(itemsTotal * 0.05 * 100) / 100; // 5% standard GST
  const totalAmount = Math.round((itemsTotal + shippingFee + taxAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(totalDiscount * 100) / 100,
    itemsTotal: Math.round(itemsTotal * 100) / 100,
    shippingFee,
    taxAmount,
    totalAmount
  };
};

module.exports = {
  calculateFinalPrice,
  calculateOrderTotals
};
