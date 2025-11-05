# Employer Costs Breakdown

## Overview

Show users what their employer pays on top of gross salary, including employer National Insurance contributions and employer pension contributions. This provides valuable context for salary negotiations and helps users understand their total value to the company.

## User Value

**For Job Seekers:**
- Understand total cost to company
- Better negotiation context: "I cost them £45k, not just £35k"
- Compare employer pension matches between offers
- See hidden value in compensation package

**For Negotiation:**
- "They're already investing £X in me beyond my salary"
- Understand employer's perspective on cost
- Frame requests in context of total cost

## Current State

**What exists:**
- Employee-side calculations (income tax, NI, pension, student loans)
- Take-home pay calculation

**What's missing:**
- Employer National Insurance (13.8% on earnings above £9,100)
- Employer pension contributions
- Total cost to company view

## Proposed Solution

### Calculations Needed

#### 1. Employer National Insurance

**2024/25 Rates:**
- **Threshold:** £9,100 (secondary threshold)
- **Rate:** 13.8% on earnings above threshold
- **No upper limit** (unlike employee NI)

**Formula:**
```typescript
if (grossSalary <= 9100) {
  employerNI = 0
} else {
  employerNI = (grossSalary - 9100) × 0.138
}
```

**Example:**
- Gross salary: £35,000
- Employer NI: (£35,000 - £9,100) × 0.138 = £3,574.20

#### 2. Employer Pension Contribution

**Types:**

**A. Matching Contribution**
- Employer matches employee contribution (up to a limit)
- E.g., "Employee pays 5%, employer matches 5%"
- Input: Match percentage and optional cap

**B. Fixed Contribution**
- Employer contributes fixed % regardless of employee
- E.g., "Employer contributes 3% regardless"
- Input: Fixed percentage

**C. Enhanced Matching**
- Employer contributes more than employee
- E.g., "Employee pays 5%, employer pays 7%"
- Input: Employer percentage (different from employee)

**Formula:**
```typescript
// For salary sacrifice / net pay
const employeePension = grossSalary × (employeePensionPercentage / 100)
const pensionableSalary = grossSalary

// For relief at source
const pensionableSalary = grossSalary // employer calc not affected

// Employer contribution
if (matchType === 'matching') {
  employerPension = pensionableSalary × (employerMatchPercentage / 100)
  employerPension = Math.min(employerPension, matchCap || Infinity)
} else if (matchType === 'fixed') {
  employerPension = pensionableSalary × (employerPercentage / 100)
} else if (matchType === 'enhanced') {
  employerPension = pensionableSalary × (employerPercentage / 100)
}
```

#### 3. Total Cost to Company

**Formula:**
```typescript
totalCostToCompany =
  grossSalary
  + employerNI
  + employerPensionContribution
  + (optionally: apprenticeshipLevy)
```

**Example:**
- Gross salary: £35,000
- Employer NI: £3,574.20
- Employer pension (5% match): £1,750
- **Total cost to company: £40,324.20**

### TypeScript Types

**File: `src/types/calculator.ts` (additions)**

```typescript
export type EmployerPensionType = 'matching' | 'fixed' | 'none';

export interface EmployerPensionConfig {
  type: EmployerPensionType;
  percentage: number; // Employer contribution %
  matchCap?: number; // Optional cap for matching (absolute £)
}

export interface EmployerCosts {
  employerNI: number;
  employerPension: number;
  apprenticeshipLevy: number; // Usually 0 for most companies
  totalCostToCompany: number;
}

export interface CalculationResult {
  // ... existing fields
  employerCosts?: EmployerCosts; // Optional, only if enabled
}

export interface CalculatorInputs {
  // ... existing fields
  showEmployerCosts: boolean;
  employerPensionConfig?: EmployerPensionConfig;
}
```

### Calculation Functions

**File: `src/lib/calculations.ts` (additions)**

```typescript
/**
 * Calculate employer National Insurance contribution
 * @param grossSalary - Annual gross salary
 * @param config - Tax year configuration
 */
export function calculateEmployerNI(
  grossSalary: number,
  config: TaxYearConfig = currentTaxYear
): number {
  const threshold = config.nationalInsurance.class1Employer.threshold;
  const rate = config.nationalInsurance.class1Employer.rate;

  if (grossSalary <= threshold) {
    return 0;
  }

  return (grossSalary - threshold) * rate;
}

/**
 * Calculate employer pension contribution
 * @param grossSalary - Annual gross salary
 * @param employeePensionPercentage - Employee contribution %
 * @param employerConfig - Employer pension configuration
 */
export function calculateEmployerPension(
  grossSalary: number,
  employeePensionPercentage: number,
  employerConfig: EmployerPensionConfig
): number {
  if (employerConfig.type === 'none') {
    return 0;
  }

  const pensionableSalary = grossSalary;

  if (employerConfig.type === 'matching') {
    // Match employee contribution up to employer percentage
    const matchPercentage = Math.min(
      employeePensionPercentage,
      employerConfig.percentage
    );
    let contribution = (pensionableSalary * matchPercentage) / 100;

    // Apply cap if specified
    if (employerConfig.matchCap) {
      contribution = Math.min(contribution, employerConfig.matchCap);
    }

    return contribution;
  } else if (employerConfig.type === 'fixed') {
    // Fixed employer contribution regardless of employee
    return (pensionableSalary * employerConfig.percentage) / 100;
  }

  return 0;
}

/**
 * Calculate apprenticeship levy (0.5% on payroll over £3m)
 * Most companies don't pay this, so default to 0
 */
export function calculateApprenticeshipLevy(
  grossSalary: number,
  config: TaxYearConfig = currentTaxYear
): number {
  // Simplified: assume single employee doesn't trigger levy
  // Real calculation would need total company payroll
  return 0;
}

/**
 * Calculate total employer costs
 */
export function calculateEmployerCosts(
  grossSalary: number,
  employeePensionPercentage: number,
  employerConfig: EmployerPensionConfig,
  config: TaxYearConfig = currentTaxYear
): EmployerCosts {
  const employerNI = calculateEmployerNI(grossSalary, config);
  const employerPension = calculateEmployerPension(
    grossSalary,
    employeePensionPercentage,
    employerConfig
  );
  const apprenticeshipLevy = calculateApprenticeshipLevy(grossSalary, config);

  const totalCostToCompany =
    grossSalary + employerNI + employerPension + apprenticeshipLevy;

  return {
    employerNI,
    employerPension,
    apprenticeshipLevy,
    totalCostToCompany,
  };
}

// Update main calculateTakeHome function
export function calculateTakeHome(
  inputs: CalculatorInputs,
  config: TaxYearConfig = currentTaxYear
): CalculationResult {
  // ... existing calculation logic

  // Calculate employer costs if enabled
  let employerCosts: EmployerCosts | undefined;
  if (inputs.showEmployerCosts && inputs.employerPensionConfig) {
    employerCosts = calculateEmployerCosts(
      grossSalary,
      pensionPercentage,
      inputs.employerPensionConfig,
      config
    );
  }

  return {
    // ... existing fields
    employerCosts,
  };
}
```

### UI Component

**New Component: `src/components/EmployerCostsBreakdown.tsx`**

```typescript
'use client';

import type { EmployerCosts } from '@/types/calculator';

interface EmployerCostsBreakdownProps {
  grossSalary: number;
  employerCosts: EmployerCosts;
}

export function EmployerCostsBreakdown({
  grossSalary,
  employerCosts,
}: EmployerCostsBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const employerBurden = grossSalary > 0
    ? ((employerCosts.totalCostToCompany - grossSalary) / grossSalary) * 100
    : 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 sm:p-5 space-y-2.5">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          Employer Costs
        </span>
      </div>

      {/* Your Salary */}
      <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-xl">
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          Your Gross Salary
        </span>
        <span className="font-bold text-lg text-gray-900 dark:text-white">
          {formatCurrency(grossSalary)}
        </span>
      </div>

      {/* Employer NI */}
      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          Employer National Insurance
        </span>
        <span className="font-bold text-blue-600 dark:text-blue-400">
          +{formatCurrency(employerCosts.employerNI)}
        </span>
      </div>

      {/* Employer Pension */}
      {employerCosts.employerPension > 0 && (
        <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <span className="text-gray-700 dark:text-gray-200 font-medium">
            Employer Pension Contribution
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            +{formatCurrency(employerCosts.employerPension)}
          </span>
        </div>
      )}

      {/* Total Cost to Company */}
      <div className="flex justify-between items-center p-3 bg-blue-600 dark:bg-blue-700 rounded-xl mt-2 border-2 border-blue-700 dark:border-blue-600">
        <div>
          <div className="text-white font-bold">Total Cost to Company</div>
          <div className="text-blue-100 text-xs">
            {employerBurden.toFixed(1)}% above your salary
          </div>
        </div>
        <span className="font-bold text-xl text-white">
          {formatCurrency(employerCosts.totalCostToCompany)}
        </span>
      </div>

      {/* Info Note */}
      <div className="flex gap-2 items-start p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl">
        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          This is what your employer pays on top of your salary. Useful context for salary negotiations.
        </p>
      </div>
    </div>
  );
}
```

### Integration with Main Calculator

**File: `src/components/TakeHomeCalculator.tsx` (modifications)**

Add toggle for employer costs:

```typescript
const [inputs, setInputs] = useState<CalculatorInputs>({
  grossSalary: 30000,
  pensionPercentage: 5,
  pensionType: 'salary-sacrifice',
  studentLoanPlans: [],
  showEmployerCosts: false, // NEW
  employerPensionConfig: {   // NEW
    type: 'matching',
    percentage: 5, // Default: employer matches 5%
  },
});

// In the UI, add toggle and configuration
<div className="bg-white/50 dark:bg-gray-700/30 rounded-xl p-4 space-y-4">
  <label className="flex items-center space-x-3">
    <input
      type="checkbox"
      checked={inputs.showEmployerCosts}
      onChange={(e) =>
        setInputs({ ...inputs, showEmployerCosts: e.target.checked })
      }
      className="w-5 h-5 text-blue-600 rounded"
    />
    <span className="text-gray-800 dark:text-gray-200 font-medium">
      Show employer costs
    </span>
  </label>

  {inputs.showEmployerCosts && (
    <>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Employer Pension Type
        </label>
        <select
          value={inputs.employerPensionConfig?.type}
          onChange={(e) =>
            setInputs({
              ...inputs,
              employerPensionConfig: {
                ...inputs.employerPensionConfig!,
                type: e.target.value as EmployerPensionType,
              },
            })
          }
          className="w-full px-4 py-3 border-2 rounded-xl"
        >
          <option value="matching">Matching</option>
          <option value="fixed">Fixed %</option>
          <option value="none">None</option>
        </select>
      </div>

      {inputs.employerPensionConfig?.type !== 'none' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Employer Contribution (%)
          </label>
          <input
            type="number"
            value={inputs.employerPensionConfig?.percentage}
            onChange={(e) =>
              setInputs({
                ...inputs,
                employerPensionConfig: {
                  ...inputs.employerPensionConfig!,
                  percentage: Number(e.target.value),
                },
              })
            }
            className="w-full px-4 py-3 border-2 rounded-xl"
            min="0"
            max="100"
            step="0.5"
          />
        </div>
      )}
    </>
  )}
</div>

// In results section
{result.employerCosts && (
  <EmployerCostsBreakdown
    grossSalary={result.grossSalary}
    employerCosts={result.employerCosts}
  />
)}
```

## Implementation Plan

1. **Update types** (src/types/calculator.ts)
   - Add EmployerPensionConfig interface
   - Add EmployerCosts interface
   - Update CalculatorInputs and CalculationResult

2. **Add calculations** (src/lib/calculations.ts)
   - Implement calculateEmployerNI()
   - Implement calculateEmployerPension()
   - Implement calculateEmployerCosts()
   - Update calculateTakeHome() to include employer costs

3. **Create component** (src/components/EmployerCostsBreakdown.tsx)
   - Build breakdown UI
   - Format costs display
   - Add helpful context

4. **Update main calculator** (src/components/TakeHomeCalculator.tsx)
   - Add showEmployerCosts toggle
   - Add employer pension config inputs
   - Integrate EmployerCostsBreakdown component

5. **Testing**
   - Verify calculations against HMRC rates
   - Test different pension types
   - Test with comparison view

## User Experience

**Default State:**
- Employer costs hidden (checkbox unchecked)
- Simple view for most users

**Enabled State:**
- Checkbox checked
- Employer pension config appears
- Results show breakdown
- Clear, non-technical language

**Comparison View:**
- Show employer costs for all scenarios
- Highlight differences in employer pension match
- "Job A: Employer pays 5%, Job B: Employer pays 3%"

## Future Enhancements

**Phase 2:**
- Employer pension annual allowance implications
- Salary sacrifice impact on employer NI (some companies share savings)
- Employer benefits in kind (company car, healthcare)

**Phase 3:**
- Negotiation helper: "Ask for £X gross, costs company £Y total"
- Budget templates: "Company has £45k budget, max salary is £X"

## Success Criteria

- [ ] Employer NI calculated correctly (13.8% above £9,100)
- [ ] Employer pension supports matching, fixed, and none types
- [ ] Total cost to company accurate
- [ ] UI toggle works correctly
- [ ] Integrates with comparison view
- [ ] Helpful for salary negotiation context

---

**Document History:**
- 2025-11-05: Initial specification created
