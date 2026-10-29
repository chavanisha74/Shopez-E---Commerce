const crypto = require('crypto');

/**
 * Generates an uppercase, unique, human-readable order number
 * Format: SHP-YYYYMMDD-XXXX (e.g. SHP-20261028-A4F9)
 */
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();

  return `SHP-${datePart}-${randomPart}`;
};

module.exports = {
  generateOrderNumber
};
