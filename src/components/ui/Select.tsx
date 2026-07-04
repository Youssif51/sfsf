import React from 'react';
import { cn } from './Modal';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full relative">
        {label && <label className="text-sm font-medium text-textMain">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "flex h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger focus:ring-danger",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface text-textMain">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-textMuted pointer-events-none" />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
