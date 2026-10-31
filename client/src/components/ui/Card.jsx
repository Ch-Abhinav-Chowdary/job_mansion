/**
 * Card
 * Props:
 *   clickable — adds hover shadow-md + primary border
 *   padding   — 'sm' | 'md' (default 'md')
 *   as        — element type (default 'div')
 */
const Card = ({
  children,
  clickable = false,
  padding = 'md',
  as: Tag = 'div',
  className = '',
  ...props
}) => (
  <Tag
    className={[
      'bg-[#FFFFFF] border border-[#E4DED4] rounded-[12px]',
      'shadow-[0_1px_2px_rgba(28,27,25,0.06)]',
      padding === 'md' ? 'p-5 md:p-6' : 'p-4',
      clickable
        ? 'transition-all duration-150 ease-out cursor-pointer hover:shadow-[0_8px_24px_rgba(28,27,25,0.10)] hover:border-[#0E5A52]'
        : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {children}
  </Tag>
);

export default Card;
