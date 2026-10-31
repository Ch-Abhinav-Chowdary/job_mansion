/**
 * Spinner — 16 px default, animates with a border trick.
 * Uses currentColor so it inherits from the parent text color.
 */
const Spinner = ({ size = 20, className = '' }) => (
  <span
    role="status"
    aria-label="Loading"
    style={{ width: size, height: size }}
    className={[
      'inline-block rounded-full',
      'border-2 border-current border-t-transparent',
      'animate-spin',
      className,
    ].join(' ')}
  />
);

export default Spinner;
