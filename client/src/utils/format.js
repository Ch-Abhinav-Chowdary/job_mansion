/**
 * Format paise into Indian Rupees (INR) with en-IN formatting.
 * Stored in paise on server, displayed as ₹19,999.
 * Per DESIGN.md: "Always rupees, en-IN. Store paise on the server; display as ₹19,999. Strike discountPrice only when it exists. Never show $."
 */
export const formatPrice = (paise) => {
  if (paise === null || paise === undefined || isNaN(paise)) return '₹0';
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString('en-IN')}`;
};

/**
 * Capitalizes string nicely
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
