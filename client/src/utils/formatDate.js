/**
 * Format a date string to a readable format.
 * Example: "2024-01-15T10:30:00Z" → "15 Jan 2024"
 */
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
