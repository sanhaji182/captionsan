'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useEscapeKey } from '@/lib/use-escape-key';
import {
  ActivityIcon,
  CheckCircleIcon,
  FolderIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  XIcon,
  BookIcon,
} from '@/components/ui/icons';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  match?: (pathname: string) => boolean;
}

const PRIMARY_NAV: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    match: (p) => p === '/dashboard' || p.startsWith('/projects'),
  },
  {
    href: '/dashboard/operations',
    label: 'Operasional',
    icon: ActivityIcon,
  },
  {
    href: '/dashboard/reviews',
    label: 'Review',
    icon: CheckCircleIcon,
  },
];

const SECONDARY_NAV: NavItem[] = [
  {
    href: '/settings',
    label: 'Pengaturan',
    icon: SettingsIcon,
  },
  {
    href: '/docs',
    label: 'Dokumentasi',
    icon: BookIcon,
  },
];

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Authenticated app shell. Provides:
 * - Persistent sidebar navigation on desktop with grouped sections.
 * - A slide-over drawer on mobile triggered by the top bar.
 * - A consistent top bar with the active section title and primary action.
 * - Built-in auth gate so individual pages don't need to repeat the dance.
 */
export function AppShell({ children }: AppShellProps) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close drawer when route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (mobileNavOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileNavOpen]);

  useEscapeKey(() => setMobileNavOpen(false), mobileNavOpen);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-foreground-muted">Memuat...</p>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  const userName =
    session.user.name || session.user.email || 'Pengguna CaptionSan';
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'C';

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-surface-raised"
        aria-label="Navigasi utama"
      >
        <SidebarContent
          pathname={pathname}
          userName={userName}
          userInitial={userInitial}
          userEmail={session.user.email ?? ''}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm animate-in-fade"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface-raised shadow-md animate-in-slide-left"
            aria-label="Navigasi utama"
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <BrandMark />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-sm p-1.5 text-foreground-muted hover:bg-surface-sunken hover:text-foreground"
                aria-label="Tutup menu"
              >
                <XIcon size={18} />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              userName={userName}
              userInitial={userInitial}
              userEmail={session.user.email ?? ''}
              hideBrand
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-sm p-1.5 text-foreground-muted hover:bg-surface-sunken hover:text-foreground"
              aria-label="Buka menu"
            >
              <MenuIcon size={20} />
            </button>
            <BrandMark compact />
          </div>
          <div className="hidden flex-1 md:block" />
          <Link href="/projects/new" className="shrink-0">
            <Button size="sm">
              <PlusIcon size={14} />
              Proyek Baru
            </Button>
          </Link>
        </div>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-6xl animate-in-fade">{children}</div>
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  pathname: string;
  userName: string;
  userEmail: string;
  userInitial: string;
  hideBrand?: boolean;
}

function SidebarContent({
  pathname,
  userName,
  userEmail,
  userInitial,
  hideBrand = false,
}: SidebarContentProps) {
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {!hideBrand && (
        <div className="px-5 pt-5">
          <BrandMark />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-6 px-3 py-5">
        <NavSection items={PRIMARY_NAV} pathname={pathname} />
        <NavSection items={SECONDARY_NAV} pathname={pathname} label="Pengelolaan" />
      </div>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3 rounded-sm px-2 py-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-soft-foreground"
            aria-hidden
          >
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {userName}
            </p>
            {userEmail && userEmail !== userName && (
              <p className="truncate text-xs text-foreground-subtle">
                {userEmail}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-sm p-1.5 text-foreground-subtle hover:bg-surface-sunken hover:text-foreground"
            title="Keluar"
            aria-label="Keluar"
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function NavSection({
  items,
  pathname,
  label,
}: {
  items: NavItem[];
  pathname: string;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-foreground-subtle">
          {label}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.match
            ? item.match(pathname)
            : pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-brand-soft text-brand-soft-foreground'
                    : 'text-foreground-muted hover:bg-surface-sunken hover:text-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  size={16}
                  className={active ? 'text-brand' : 'text-foreground-subtle'}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 text-foreground"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand text-brand-foreground"
        aria-hidden
      >
        <SparklesIcon size={16} />
      </span>
      {!compact && (
        <span className="display text-base font-semibold tracking-tight">
          CaptionSan
        </span>
      )}
    </Link>
  );
}
