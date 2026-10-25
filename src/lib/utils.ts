/**
 * Combines CSS class names, filtering out falsy values (boolean, null, undefined).
 * Lightweight, zero-dependency utility for plain CSS class composition.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
