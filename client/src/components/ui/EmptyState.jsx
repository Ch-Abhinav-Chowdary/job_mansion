/**
 * EmptyState adhering strictly to DESIGN.md:
 * - Icon: 24 px Lucide, muted
 * - Title: h3 (Bricolage Grotesque 600)
 * - Message: One sentence of body + muted
 * - Action: One secondary or primary action
 * - No illustration mashups
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-md border border-border bg-surface ${className}`}
    >
      {Icon && (
        <div className="mb-3 text-muted">
          <Icon size={24} strokeWidth={1.75} />
        </div>
      )}

      {title && (
        <h3 className="text-lg md:text-xl font-display font-semibold text-ink mb-1">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-base text-muted max-w-sm mb-6">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
