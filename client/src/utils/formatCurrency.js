/**
 * Format paise to a readable INR string.
 * Example: 199900 → "₹1,999.00"
 */
export const formatCurrency = (paise) => {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(rupees);
};
