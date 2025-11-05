# Tax Configuration System

## Overview

Move hard-coded tax rates, thresholds, and constants from `src/lib/calculations.ts` to external JSON configuration files. This enables easy updates for new tax years and lays the foundation for historical comparisons and regional variations.

## Current State

**Problem:**
- Tax rates hard-coded in src/lib/calculations.ts:10-38
- Changing rates requires code changes
- Cannot compare different tax years
- Cannot support regional variations (Scotland)

**Current Constants:**
```typescript
const TAX_BANDS = {
  personalAllowance: 12570,
  basicRateThreshold: 50270,
  higherRateThreshold: 125140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
};

const NI_BANDS = { ... };
const STUDENT_LOAN_THRESHOLDS = { ... };
const STUDENT_LOAN_RATES = { ... };
```

## Goals

1. **Easy updates:** New tax year = new JSON file (no code changes)
2. **Version controlled:** Tax rate changes visible in git history
3. **Type safe:** TypeScript validates configuration structure
4. **Testable:** Easy to test with different tax year configs
5. **Future-ready:** Foundation for tax year selector, regional rates

## Proposed Solution

### Directory Structure

```
src/
├── config/
│   └── tax-rates/
│       ├── index.ts              # Loader and exports
│       ├── types.ts              # TypeScript types
│       ├── 2024-25.json          # Current tax year
│       ├── 2025-26.json          # Future (when announced)
│       └── 2023-24.json          # Historical (optional)
```

### JSON Configuration Format

**File: `src/config/tax-rates/2024-25.json`**

```json
{
  "taxYear": "2024-25",
  "region": "england-wales-ni",
  "effectiveFrom": "2024-04-06",
  "effectiveTo": "2025-04-05",
  "incomeTax": {
    "personalAllowance": 12570,
    "personalAllowanceTaperThreshold": 100000,
    "personalAllowanceTaperRate": 0.5,
    "bands": [
      {
        "name": "basic",
        "threshold": 50270,
        "rate": 0.20
      },
      {
        "name": "higher",
        "threshold": 125140,
        "rate": 0.40
      },
      {
        "name": "additional",
        "threshold": null,
        "rate": 0.45
      }
    ]
  },
  "nationalInsurance": {
    "class1Employee": {
      "lowerThreshold": 12570,
      "upperThreshold": 50270,
      "lowerRate": 0.12,
      "upperRate": 0.02
    },
    "class1Employer": {
      "threshold": 9100,
      "rate": 0.138
    }
  },
  "studentLoans": {
    "plan1": {
      "threshold": 22015,
      "rate": 0.09
    },
    "plan2": {
      "threshold": 27295,
      "rate": 0.09
    },
    "plan4": {
      "threshold": 27660,
      "rate": 0.09
    },
    "postgrad": {
      "threshold": 21000,
      "rate": 0.06
    }
  },
  "other": {
    "apprenticeshipLevyThreshold": 3000000,
    "apprenticeshipLevyRate": 0.005
  }
}
```

### TypeScript Types

**File: `src/config/tax-rates/types.ts`**

```typescript
export type Region = 'england-wales-ni' | 'scotland';

export interface TaxBand {
  name: string;
  threshold: number | null; // null for top band
  rate: number;
}

export interface IncomeTaxConfig {
  personalAllowance: number;
  personalAllowanceTaperThreshold: number;
  personalAllowanceTaperRate: number;
  bands: TaxBand[];
}

export interface NIClass1Employee {
  lowerThreshold: number;
  upperThreshold: number;
  lowerRate: number;
  upperRate: number;
}

export interface NIClass1Employer {
  threshold: number;
  rate: number;
}

export interface NationalInsuranceConfig {
  class1Employee: NIClass1Employee;
  class1Employer: NIClass1Employer;
}

export interface StudentLoanPlanConfig {
  threshold: number;
  rate: number;
}

export interface StudentLoansConfig {
  plan1: StudentLoanPlanConfig;
  plan2: StudentLoanPlanConfig;
  plan4: StudentLoanPlanConfig;
  postgrad: StudentLoanPlanConfig;
}

export interface OtherConfig {
  apprenticeshipLevyThreshold: number;
  apprenticeshipLevyRate: number;
}

export interface TaxYearConfig {
  taxYear: string;
  region: Region;
  effectiveFrom: string; // ISO date
  effectiveTo: string; // ISO date
  incomeTax: IncomeTaxConfig;
  nationalInsurance: NationalInsuranceConfig;
  studentLoans: StudentLoansConfig;
  other: OtherConfig;
}
```

### Loader/Index

**File: `src/config/tax-rates/index.ts`**

```typescript
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

// Helper to get tax config by year
export function getTaxYearConfig(year: string): TaxYearConfig {
  const config = taxYears[year];
  if (!config) {
    throw new Error(`Tax year ${year} configuration not found`);
  }
  return config;
}

// Helper to get current config based on date
export function getCurrentTaxYearConfig(date: Date = new Date()): TaxYearConfig {
  // Simple implementation: always return current
  // TODO: Calculate based on date when multiple years available
  return currentTaxYear;
}

// Re-export types
export type * from './types';
```

### Refactoring Calculations

**File: `src/lib/calculations.ts`**

Before:
```typescript
const TAX_BANDS = {
  personalAllowance: 12570,
  basicRateThreshold: 50270,
  // ...
};

export function calculateIncomeTax(taxableIncome: number): number {
  // Uses TAX_BANDS
}
```

After:
```typescript
import { currentTaxYear } from '@/config/tax-rates';
import type { TaxYearConfig } from '@/config/tax-rates';

export function calculateIncomeTax(
  taxableIncome: number,
  config: TaxYearConfig = currentTaxYear
): number {
  const { incomeTax } = config;
  let tax = 0;

  if (taxableIncome <= incomeTax.personalAllowance) {
    return 0;
  }

  const taxableAmount = taxableIncome - incomeTax.personalAllowance;

  // Use config.incomeTax.bands to calculate
  // ...

  return tax;
}

// Similar refactoring for other functions
export function calculateNationalInsurance(
  grossSalary: number,
  config: TaxYearConfig = currentTaxYear
): number {
  const { nationalInsurance } = config;
  // Use config values
}
```

**Key changes:**
- All calculation functions accept optional `config` parameter
- Default to `currentTaxYear` for backward compatibility
- Easy to pass different config for comparisons

## Implementation Plan

### Step 1: Create Type Definitions
- Create `src/config/tax-rates/types.ts`
- Define all interfaces
- Export types

### Step 2: Create JSON Configuration
- Create `src/config/tax-rates/2024-25.json`
- Populate with current hard-coded values
- Validate structure

### Step 3: Create Loader
- Create `src/config/tax-rates/index.ts`
- Import JSON, type assert
- Export helpers

### Step 4: Refactor Calculations
- Update `src/lib/calculations.ts`
- Add `config` parameter to all functions
- Default to `currentTaxYear`
- Remove hard-coded constants

### Step 5: Update Component
- Update `src/components/TakeHomeCalculator.tsx`
- No changes needed if using defaults
- (Future: pass different config for tax year selector)

### Step 6: Testing
- Verify calculations still work
- Test with different config values
- Ensure type safety

## Future Enhancements

### Tax Year Selector (Phase 2)
```typescript
// In component
const [selectedTaxYear, setSelectedTaxYear] = useState('2024-25');
const config = getTaxYearConfig(selectedTaxYear);
const result = calculateTakeHome(inputs, config);
```

### Regional Support (Phase 3)
```json
// 2024-25-scotland.json
{
  "taxYear": "2024-25",
  "region": "scotland",
  "incomeTax": {
    "bands": [
      { "name": "starter", "threshold": 14876, "rate": 0.19 },
      { "name": "basic", "threshold": 26561, "rate": 0.20 },
      { "name": "intermediate", "threshold": 43662, "rate": 0.21 },
      { "name": "higher", "threshold": 75000, "rate": 0.42 },
      { "name": "top", "threshold": 125140, "rate": 0.47 }
    ]
  }
}
```

### Validation
```typescript
// Add JSON schema validation
import Ajv from 'ajv';
import taxYearSchema from './schema.json';

export function validateTaxYearConfig(config: unknown): TaxYearConfig {
  const ajv = new Ajv();
  const validate = ajv.compile(taxYearSchema);

  if (!validate(config)) {
    throw new Error('Invalid tax year configuration');
  }

  return config as TaxYearConfig;
}
```

## Benefits

**Immediate:**
- Tax rates easier to update
- Version controlled tax history
- Type-safe configuration
- Foundation for future features

**Future:**
- Tax year comparison ("How much better is 2025-26?")
- Historical analysis
- Regional support (Scotland)
- Community contributions via PRs
- Automated alerts when HMRC announces changes

## Migration Notes

**Breaking Changes:** None
- Default parameter ensures backward compatibility
- Existing component code works without changes

**Rollback Plan:**
- Keep hard-coded constants commented out for one release
- Easy to revert if issues found

## Testing Strategy

**Unit Tests:**
- Test calculation functions with different configs
- Verify type safety
- Test edge cases (high earners, personal allowance taper)

**Integration Tests:**
- Full calculation with 2024-25 config
- Compare results to hard-coded version
- Should be identical

**Validation:**
- Test invalid JSON structure
- Test missing required fields
- Test with multiple tax years

## Open Questions

1. **Date-based selection:** Should we auto-detect tax year based on current date?
   - **Decision:** Later enhancement, manual selection first

2. **Scotland rates:** Include from day one or wait?
   - **Decision:** Start with England/Wales/NI only, add Scotland in Phase 3

3. **Historical years:** How many to include?
   - **Decision:** 2024-25 only initially, add 2025-26 when announced

4. **Validation:** JSON schema validation or TypeScript only?
   - **Decision:** TypeScript only for now, JSON schema if community contributions needed

## Success Criteria

- [ ] All hard-coded tax constants removed from calculations.ts
- [ ] Calculations use JSON config
- [ ] Type safety maintained
- [ ] All existing tests pass
- [ ] Easy to add new tax year (< 5 minutes)
- [ ] Documentation updated

---

**Document History:**
- 2025-11-05: Initial specification created
