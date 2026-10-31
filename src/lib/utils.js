/**
 * Combines CSS class names, filtering out falsy values (boolean, null, undefined).
 * Lightweight, zero-dependency utility for plain CSS class composition.
 *
 * @param {...(string | undefined | null | false)} classes - Class names or conditional expressions
 * @returns {string} Merged class names separated by spaces
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
