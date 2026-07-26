import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes with proper precedence handling.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

