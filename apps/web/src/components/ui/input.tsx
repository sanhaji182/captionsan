'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const FIELD_BASE =
  'w-full rounded-sm border border-border bg-surface-raised ' +
  'px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle ' +
  'transition-colors duration-150 ease-out ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ' +
  'disabled:bg-surface-sunken disabled:text-foreground-subtle ' +
  'disabled:cursor-not-allowed';

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(FIELD_BASE, 'h-10', className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(FIELD_BASE, 'resize-y leading-6', className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(FIELD_BASE, 'h-10 cursor-pointer pr-8', className)}
      {...props}
    >
      {children}
    </select>
  );
});

interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {optional && (
            <span className="ml-1 text-xs font-normal text-foreground-subtle">
              (opsional)
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-foreground-subtle">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
