/**
 * Minimal class-name joiner. Filters out falsy values so callers can use
 * inline conditionals like `cn('base', isActive && 'active')` without
 * pulling in a dependency.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ');
}
