import { forwardRef } from 'react';
import Spinner from './Spinner';

/**
 * Button
 * Props:
 *   variant: 'primary' | 'secondary' | 'ghost' | 'destructive'  (default: 'primary')
 *   size:    'sm' | 'md'                                          (default: 'md')
 *   loading: bool
 *   disabled: bool
 *   fullWidth: bool
 *   as: element type (default 'button')
 */
const variantClasses = {
  primary:
    'bg-[#0E5A52] text-white hover:bg-[#0A433D] active:translate-y-px disabled:opacity-45',
  secondary:
    'bg-[#FFFFFF] text-[#1C1B19] border border-[#8F877B] hover:bg-[#E6F1EF] active:translate-y-px disabled:opacity-45',
  ghost:
    'bg-transparent text-[#0E5A52] hover:bg-[#E6F1EF] active:translate-y-px disabled:opacity-45',
  destructive:
    'bg-[#B42318] text-white hover:bg-[#931E14] active:translate-y-px disabled:opacity-45',
};

const sizeClasses = {
  md: 'h-11 px-4 text-sm font-medium',
  sm: 'h-8 px-3 text-sm font-medium',
};

const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      as: Tag = 'button',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <Tag
        ref={ref}
        disabled={Tag === 'button' ? isDisabled : undefined}
        aria-disabled={isDisabled || undefined}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-[8px]',
          'transition-colors duration-150 ease-out',
          'focus-visible:outline-2 focus-visible:outline-[#0E5A52] focus-visible:outline-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && <Spinner size={16} className="shrink-0" />}
        {children}
      </Tag>
    );
  }
);

Button.displayName = 'Button';

export default Button;
