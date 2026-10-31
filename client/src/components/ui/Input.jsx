import { forwardRef } from 'react';

/**
 * Input
 * Props: label, helper, error, id (required for a11y)
 * Forwards ref to the <input> element.
 */
const Input = forwardRef(
  (
    {
      label,
      helper,
      error,
      id,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[#1C1B19]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError ? `${id}-error` : helper ? `${id}-helper` : undefined
          }
          className={[
            'h-11 w-full rounded-[8px] px-3 py-2',
            'bg-[#FFFFFF] text-[#1C1B19] text-base',
            'placeholder:text-[#5F5A54]',
            'transition-colors duration-150 ease-out',
            // border
            hasError
              ? 'border-2 border-[#B42318]'
              : 'border border-[#8F877B] hover:border-[#1C1B19] focus:border-2 focus:border-[#0E5A52]',
            // disabled
            disabled
              ? 'bg-[#FBF8F3] text-[#8A847C] cursor-not-allowed border-[#E4DED4]'
              : '',
            // focus ring handled globally via :focus-visible
            'outline-none',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {hasError && (
          <p id={`${id}-error`} role="alert" className="text-sm text-[#B42318]">
            {error}
          </p>
        )}
        {!hasError && helper && (
          <p id={`${id}-helper`} className="text-sm text-[#5F5A54]">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
