import React from 'react';
import { cn } from './Modal';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-textMain">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-textMain placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accentBlue focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
