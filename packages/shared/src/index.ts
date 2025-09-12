/**
 * Shared package entry point.
 * Add common types and utilities here.
 */
export type BrandedId<T extends string> = string & { readonly __brand: T };
