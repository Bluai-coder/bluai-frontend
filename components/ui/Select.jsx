import React from 'react';

export const Select = React.forwardRef(({
  label,
  error,
  options = [],
  className = '',
  required,
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-foreground mb-1.5">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none
          ${error 
            ? 'border-destructive focus-visible:ring-destructive text-destructive' 
            : 'border-input focus-visible:ring-[#1b4dff]'
          }
        `}
        required={required}
        {...props}
      >
        <option value="" disabled hidden>Select an option...</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
