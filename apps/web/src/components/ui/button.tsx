'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-brand-foreground hover:bg-brand-hover shadow-xs ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-surface-raised text-foreground border border-border ' +
    'hover:bg-surface-sunken hover:border-border-strong shadow-xs ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-foreground-muted hover:bg-surface-sunken ' +
    'hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-danger text-white hover:opacity-90 shadow-xs ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
  success:
    'bg-success text-white hover:opacity-90 shadow-xs ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-sm',
  md: 'h-10 px-4 text-sm rounded-sm',
  lg: 'h-11 px-5 text-sm rounded-md',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium ' +
            'transition-[background-color,border-color,color,box-shadow,opacity,transform] ' +
            'duration-150 ease-out active:scale-[0.99] ' +
            'focus-visible:outline-none focus-visible:ring-2 ' +
            'focus-visible:ring-brand focus-visible:ring-offset-2 ' +
            'focus-visible:ring-offset-surface',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  },
);

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}
