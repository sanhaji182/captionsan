import { cn } from '@/lib/cn';

interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 pb-6 md:flex-row md:items-center md:justify-between md:gap-6',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
            {eyebrow}
          </p>
        )}
        <h1 className="display text-2xl font-semibold text-foreground md:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
          {actions}
        </div>
      )}
    </header>
  );
}
