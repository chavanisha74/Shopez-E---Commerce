/**
 * Formats a monetary amount into Indian Rupee (INR) format with the ₹ symbol.
 * Example: 2499 -> "₹2,499", 14999.5 -> "₹14,999.50"
 */
export const formatINR = (amount) => {
  const num = Number(amount) || 0;
  return (
    '₹' +
    num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: num % 1 !== 0 ? 2 : 0
    })
  );
};

export default formatINR;
