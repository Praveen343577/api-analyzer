import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * API Analyzer - Class Name Utility
 * * Purpose: Safely merges Tailwind CSS classes and resolves conflicts dynamically.
 * * Mechanism:
 * 1. `clsx` conditionally joins multiple class arguments into a single string.
 * 2. `twMerge` parses the resulting string and removes redundant or conflicting 
 * Tailwind classes, ensuring the last defined class takes precedence (e.g., passing 
 * 'bg-red-500' to a component that defaults to 'bg-blue-500' will yield 'bg-red-500').
 * * Usage: Critical for reusable UI primitives (SharpButton, SharpInput) that accept 
 * custom `className` props to override or extend base Newsprint system styles.
 * * @param inputs - An arbitrary number of class strings, arrays, or conditional objects.
 * @returns A strictly merged, conflict-free Tailwind class string.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}