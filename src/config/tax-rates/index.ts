import type { TaxYearConfig } from './types';
import taxRates2024_25 from './2024-25.json';

// Type assertion to ensure JSON matches interface
const config2024_25 = taxRates2024_25 as TaxYearConfig;

// Default export: current tax year
export const currentTaxYear = config2024_25;

// All available tax years
export const taxYears: Record<string, TaxYearConfig> = {
  '2024-25': config2024_25,
  // Add more as created: '2025-26': config2025_26,
};

/**
 * Get tax config by year
 * @param year - Tax year string (e.g., "2024-25")
 * @returns Tax year configuration
 * @throws Error if tax year not found
 */
export function getTaxYearConfig(year: string): TaxYearConfig {
  const config = taxYears[year];
  if (!config) {
    throw new Error(`Tax year ${year} configuration not found`);
  }
  return config;
}

/**
 * Get current tax year config based on date
 * @param date - Date to check (defaults to today)
 * @returns Tax year configuration for the date
 */
export function getCurrentTaxYearConfig(date: Date = new Date()): TaxYearConfig {
  // Simple implementation: always return current
  // TODO: Calculate based on date when multiple years available
  return currentTaxYear;
}

// Re-export types
export type * from './types';
