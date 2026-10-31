/**
 * Badge component per DESIGN.md:
 * - 12 px caption, 500 weight, 4px x 8px padding (py-1 px-2), radius-sm
 * - Pairings:
 *   - Published / paid / active: success-soft + success text
 *   - Draft / pending: warning-soft + warning text
 *   - Refunded / error: error-soft + error text
 *   - Featured: accent-soft + ink text
 *   - Category: primary-soft + primary text
 */
const VARIANTS = {
  success: 'bg-success-soft text-success',
  published: 'bg-success-soft text-success',
  paid: 'bg-success-soft text-success',
  active: 'bg-success-soft text-success',

  warning: 'bg-warning-soft text-warning',
  draft: 'bg-warning-soft text-warning',
  pending: 'bg-warning-soft text-warning',

  error: 'bg-error-soft text-error',
  refunded: 'bg-error-soft text-error',
  failed: 'bg-error-soft text-error',

  featured: 'bg-accent-soft text-ink',
  category: 'bg-primary-soft text-primary',
  default: 'bg-primary-soft text-primary',
};

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-sm leading-none ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
