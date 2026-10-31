import { forwardRef } from 'react';

const Select = forwardRef(
  ({ label, helper, error, id, disabled = false, className = '', children, ...props }, ref) => {
    const hasError = !!error;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#1C1B19]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : helper ? `${id}-helper` : undefined}
          className={[
            'h-11 w-full rounded-[8px] px-3 py-2',
            'bg-[#FFFFFF] text-[#1C1B19] text-base',
            'transition-colors duration-150 ease-out',
            hasError
              ? 'border-2 border-[#B42318]'
              : 'border border-[#8F877B] hover:border-[#1C1B19] focus:border-2 focus:border-[#0E5A52]',
            disabled ? 'bg-[#FBF8F3] text-[#8A847C] cursor-not-allowed border-[#E4DED4]' : '',
            'outline-none appearance-none',
            // custom chevron via background SVG
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235F5A54' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_12px_center]",
            'pr-8',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {children}
        </select>
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

Select.displayName = 'Select';

export default Select;
