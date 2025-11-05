# Commute Cost Calculator

## Overview

Calculate the real cost of commuting to work, including travel expenses, parking, and time opportunity cost. This feature reveals "Effective Take Home Pay" - the most important number for comparing job offers.

## User Value

**The Core Insight:**
> A £40,000 salary with 3-hour daily commute might actually leave you worse off than a £35,000 fully remote job.

**Key Benefits:**
- See true financial impact of commute
- Compare job offers accurately (not just gross salary)
- Quantify time cost of commuting
- Make informed decisions about hybrid work arrangements
- Anticipate financial impact of office policy changes

## User Story

**Scenario:** Jane receives two job offers:
- **Job A:** £40,000, central London office (5 days/week), 1-hour commute each way
- **Job B:** £35,000, fully remote

**Without commute calculator:**
- "Job A pays £5,000 more, that's obviously better!"

**With commute calculator:**
- Job A: £28,500 take-home - £3,600 commute = **£24,900 effective take-home**, 520 hours commuting
- Job B: £25,900 take-home - £0 commute = **£25,900 effective take-home**, 0 hours commuting
- **Job B wins!** Despite lower salary, Jane keeps £1,000 more AND saves 13 work weeks per year

## Key Concepts

### Effective Take Home Pay

The money you actually have available after ALL real costs:

```
Gross Salary: £40,000
- Tax & NI: -£6,486
- Pension: -£2,000
- Student Loan: -£1,144
= Take Home Pay: £30,370

- Commute Costs: -£3,600
- Time Opportunity Cost: -£7,800 (optional)
= Effective Take Home: £26,770 (or £18,970 with time)
```

### Time Opportunity Cost

Your commute time has value. Options:
1. **Show hours only** (informational): "520 hours/year = 13 work weeks"
2. **Assign £ value** (user choice): 520 hours × £15/hour = £7,800
3. **Calculated from salary**: £40,000 / 1,950 working hours (37.5 hrs/week) = £20.51/hour

Users can choose whether to include time cost in "Effective Take Home" or just see it for context.

## Design Principles

### 1. Placeholder-Based Estimates
**Problem:** Don't want to guess user's costs
**Solution:** Show helpful placeholders, but only include if user explicitly enters a value

**Example:**
```
Cost per mile: [£0.45] ← HMRC rate shown as placeholder
If user doesn't edit: NOT included in calculation
If user changes to £0.50: NOW included
```

**Exception:** Required fields like distance and days per week (must be entered)

### 2. Extensible Deduction Pattern
**Today:** Commute is the only "effective deduction"
**Tomorrow:** Lunch costs, childcare, etc.

**Architecture:**
```typescript
interface EffectiveDeduction {
  category: 'commute' | 'lunch' | 'childcare' | 'other';
  amount: number;
  isEstimate: boolean;
  includeInCalculation: boolean;
}
```

Easy to add new deductions without refactoring.

### 3. Progressive Disclosure
**Simple mode:** Just car/train/bus selector, distance, days per week
**Advanced mode:** Parking, congestion charges, time value, hybrid flexibility

## Technical Specification

### Transport Modes

#### Car

**Inputs:**
- Distance each way (miles) - **required**
- Days per week in office (1-5) - **required**
- Cost per mile (£) - optional, placeholder £0.45 (HMRC rate)
- Parking cost per day (£) - optional, placeholder £0.00
- Congestion charge (£15/day, London) - optional checkbox
- Time each way (minutes) - optional for time cost

**Calculation:**
```typescript
const travelCostPerDay = distanceMiles * 2 * costPerMile; // only if user entered costPerMile
const parkingCostPerDay = parkingCost; // only if user entered
const congestionPerDay = hasCongestionCharge ? 15 : 0;
const totalDailyCost = travelCostPerDay + parkingCostPerDay + congestionPerDay;
const annualCost = totalDailyCost * daysPerWeek * 52;

const hoursPerYear = (timeMinutes / 60) * 2 * daysPerWeek * 52;
const timeCost = hoursPerYear * timeValuePerHour; // if user wants it
```

**Example:**
- Distance: 15 miles each way
- Days: 3 per week
- Cost per mile: £0.50 (user entered)
- Parking: £10/day (user entered)
- Time: 30 mins each way
- Time value: £15/hour

**Results:**
- Travel: 15 × 2 × £0.50 = £15/day → £2,340/year
- Parking: £10/day → £1,560/year
- **Total: £3,900/year**
- Time: 156 hours/year → £2,340 value (if included)

#### Train

**Inputs:**
- Days per week in office - **required**
- Daily ticket cost OR season ticket cost - **required** (one of these)
- Season ticket type (weekly/monthly/annual) - if applicable
- Parking at station (£/day) - optional
- Time each way (minutes) - optional

**Calculation:**
```typescript
// If daily ticket
const annualCost = dailyTicketCost * daysPerWeek * 52;

// If season ticket
let annualCost;
if (seasonType === 'weekly') {
  annualCost = seasonTicketCost * 52;
} else if (seasonType === 'monthly') {
  annualCost = seasonTicketCost * 12;
} else if (seasonType === 'annual') {
  annualCost = seasonTicketCost;
}

// Add parking if entered
if (parkingAtStation) {
  annualCost += parkingAtStation * daysPerWeek * 52;
}
```

**Future enhancement:** Season ticket optimizer
- Calculate whether annual pass saves money vs daily tickets
- "Annual pass costs £3,600, daily tickets cost £4,160 → Save £560"

#### Bus/Tube

**Inputs:**
- Days per week in office - **required**
- Daily cap OR monthly pass - **required**
- Zone information (for London) - optional
- Time each way (minutes) - optional

**Calculation:**
```typescript
// If daily cap
const annualCost = dailyCap * daysPerWeek * 52;

// If monthly pass
const annualCost = monthlyPass * 12;
```

#### Bike/Walk

**Inputs:**
- Days per week in office - **required**
- Time each way (minutes) - optional
- Cycle to work scheme savings (£/month) - optional (future)

**Calculation:**
```typescript
const annualCost = 0; // Free!
const hoursPerYear = (timeMinutes / 60) * 2 * daysPerWeek * 52;
// Time cost only if user wants it
```

### Hybrid Work Variability

**Problem:** Modern jobs have flexible office requirements
**Solution:** Show range based on min/max days per week

**Input:**
```typescript
interface HybridRange {
  minDaysPerWeek: number; // e.g., 2
  maxDaysPerWeek: number; // e.g., 4
  typicalDaysPerWeek: number; // e.g., 3
}
```

**Output:**
```
Based on 3 days/week: £2,400/year
If 2 days: £1,600/year (-£800)
If 4 days: £3,200/year (+£800)

Range: £1,600 - £3,200/year
```

**UI:** Slider with min-max range, shows calculation for typical + range boundaries

**Phase 1:** Fixed days per week (simple input)
**Phase 2:** Add hybrid range feature

### Time Value Calculation

**Three approaches:**

**1. User-specified (default)**
```
Your time value: £15.00/hour
(Edit to reflect what your time is worth to you)
```

**2. Calculated from salary (smart default)**
```typescript
const weeklyHours = 37.5; // User configurable, UK standard full-time
const hourlyRate = grossSalary / (52 * weeklyHours);
// Show: "Based on your salary: £19/hour (37.5 hrs/week)"
// User can override both weekly hours and hourly rate
```

**3. Informational only**
```
Don't include time cost in effective take-home, just show hours
"520 hours/year (13 work weeks)"
```

**User control:**
- [ ] Include time value in Effective Take Home calculation
- If checked: Show £ amount, include in total
- If unchecked: Show hours only, informational

### TypeScript Types

**File: `src/types/commute.ts` (new file)**

```typescript
export type TransportMode = 'car' | 'train' | 'bus' | 'bike' | 'walk';

export type SeasonTicketType = 'weekly' | 'monthly' | 'annual';

export interface CarCommuteInputs {
  mode: 'car';
  distanceMiles: number;
  daysPerWeek: number;
  costPerMile?: number; // Optional, placeholder £0.45
  parkingCostPerDay?: number; // Optional
  hasCongestionCharge?: boolean; // Optional
  timeMinutesEachWay?: number; // Optional
}

export interface TrainCommuteInputs {
  mode: 'train';
  daysPerWeek: number;
  dailyTicketCost?: number; // If using daily tickets
  seasonTicketCost?: number; // If using season ticket
  seasonTicketType?: SeasonTicketType; // If using season ticket
  parkingAtStationPerDay?: number; // Optional
  timeMinutesEachWay?: number; // Optional
}

export interface BusCommuteInputs {
  mode: 'bus';
  daysPerWeek: number;
  dailyCap?: number; // If using daily tickets
  monthlyPass?: number; // If using monthly pass
  timeMinutesEachWay?: number; // Optional
}

export interface BikeCommuteInputs {
  mode: 'bike' | 'walk';
  daysPerWeek: number;
  timeMinutesEachWay?: number; // Optional
}

export type CommuteInputs =
  | CarCommuteInputs
  | TrainCommuteInputs
  | BusCommuteInputs
  | BikeCommuteInputs
  | null; // null if no commute

export interface TimeValueConfig {
  enabled: boolean; // Include in effective take-home?
  perHour: number; // £ per hour (could be user-specified or calculated)
  source: 'user' | 'calculated'; // How it was determined
}

export interface CommuteCostBreakdown {
  travelCost: number; // Annual travel cost (fuel, tickets, etc.)
  parkingCost: number; // Annual parking cost
  otherCosts: number; // Congestion charge, etc.
  totalCost: number; // Sum of above
  hoursPerYear: number; // Time spent commuting
  timeCost?: number; // £ value of time (if enabled)
}

export interface CommuteResult {
  hasCommute: boolean;
  breakdown: CommuteCostBreakdown | null;
  effectiveTakeHome: number; // Take-home minus commute costs
}
```

**File: `src/types/calculator.ts` (additions)**

```typescript
import type { CommuteInputs, TimeValueConfig, CommuteResult } from './commute';

export interface CalculatorInputs {
  // ... existing fields
  commuteInputs: CommuteInputs;
  timeValueConfig?: TimeValueConfig;
}

export interface CalculationResult {
  // ... existing fields
  commuteResult: CommuteResult;
}
```

### Calculation Functions

**File: `src/lib/commute-calculations.ts` (new file)**

```typescript
import type {
  CommuteInputs,
  TimeValueConfig,
  CommuteCostBreakdown,
  CommuteResult,
  CarCommuteInputs,
  TrainCommuteInputs,
  BusCommuteInputs,
  BikeCommuteInputs,
} from '@/types/commute';

const HMRC_MILEAGE_RATE = 0.45; // £0.45/mile
const CONGESTION_CHARGE_DAILY = 15; // £15/day (London)
const WEEKS_PER_YEAR = 52;

/**
 * Calculate car commute costs
 */
function calculateCarCommute(inputs: CarCommuteInputs): CommuteCostBreakdown {
  const { distanceMiles, daysPerWeek, costPerMile, parkingCostPerDay, hasCongestionCharge, timeMinutesEachWay } = inputs;

  // Only include travel cost if user specified cost per mile
  const travelCostPerDay = costPerMile
    ? distanceMiles * 2 * costPerMile
    : 0;

  const parkingCostDaily = parkingCostPerDay || 0;
  const congestionCostDaily = hasCongestionCharge ? CONGESTION_CHARGE_DAILY : 0;

  const travelCost = travelCostPerDay * daysPerWeek * WEEKS_PER_YEAR;
  const parkingCost = parkingCostDaily * daysPerWeek * WEEKS_PER_YEAR;
  const otherCosts = congestionCostDaily * daysPerWeek * WEEKS_PER_YEAR;

  const hoursPerYear = timeMinutesEachWay
    ? (timeMinutesEachWay / 60) * 2 * daysPerWeek * WEEKS_PER_YEAR
    : 0;

  return {
    travelCost,
    parkingCost,
    otherCosts,
    totalCost: travelCost + parkingCost + otherCosts,
    hoursPerYear,
  };
}

/**
 * Calculate train commute costs
 */
function calculateTrainCommute(inputs: TrainCommuteInputs): CommuteCostBreakdown {
  const { daysPerWeek, dailyTicketCost, seasonTicketCost, seasonTicketType, parkingAtStationPerDay, timeMinutesEachWay } = inputs;

  let travelCost = 0;

  if (dailyTicketCost) {
    travelCost = dailyTicketCost * daysPerWeek * WEEKS_PER_YEAR;
  } else if (seasonTicketCost && seasonTicketType) {
    if (seasonTicketType === 'weekly') {
      travelCost = seasonTicketCost * WEEKS_PER_YEAR;
    } else if (seasonTicketType === 'monthly') {
      travelCost = seasonTicketCost * 12;
    } else if (seasonTicketType === 'annual') {
      travelCost = seasonTicketCost;
    }
  }

  const parkingCost = parkingAtStationPerDay
    ? parkingAtStationPerDay * daysPerWeek * WEEKS_PER_YEAR
    : 0;

  const hoursPerYear = timeMinutesEachWay
    ? (timeMinutesEachWay / 60) * 2 * daysPerWeek * WEEKS_PER_YEAR
    : 0;

  return {
    travelCost,
    parkingCost,
    otherCosts: 0,
    totalCost: travelCost + parkingCost,
    hoursPerYear,
  };
}

/**
 * Calculate bus commute costs
 */
function calculateBusCommute(inputs: BusCommuteInputs): CommuteCostBreakdown {
  const { daysPerWeek, dailyCap, monthlyPass, timeMinutesEachWay } = inputs;

  let travelCost = 0;

  if (dailyCap) {
    travelCost = dailyCap * daysPerWeek * WEEKS_PER_YEAR;
  } else if (monthlyPass) {
    travelCost = monthlyPass * 12;
  }

  const hoursPerYear = timeMinutesEachWay
    ? (timeMinutesEachWay / 60) * 2 * daysPerWeek * WEEKS_PER_YEAR
    : 0;

  return {
    travelCost,
    parkingCost: 0,
    otherCosts: 0,
    totalCost: travelCost,
    hoursPerYear,
  };
}

/**
 * Calculate bike/walk commute costs
 */
function calculateBikeCommute(inputs: BikeCommuteInputs): CommuteCostBreakdown {
  const { daysPerWeek, timeMinutesEachWay } = inputs;

  const hoursPerYear = timeMinutesEachWay
    ? (timeMinutesEachWay / 60) * 2 * daysPerWeek * WEEKS_PER_YEAR
    : 0;

  return {
    travelCost: 0,
    parkingCost: 0,
    otherCosts: 0,
    totalCost: 0,
    hoursPerYear,
  };
}

/**
 * Calculate commute costs based on transport mode
 */
export function calculateCommuteCosts(
  inputs: CommuteInputs,
  timeValueConfig?: TimeValueConfig
): CommuteResult {
  if (!inputs) {
    return {
      hasCommute: false,
      breakdown: null,
      effectiveTakeHome: 0, // Will be set by main calculator
    };
  }

  let breakdown: CommuteCostBreakdown;

  switch (inputs.mode) {
    case 'car':
      breakdown = calculateCarCommute(inputs);
      break;
    case 'train':
      breakdown = calculateTrainCommute(inputs);
      break;
    case 'bus':
      breakdown = calculateBusCommute(inputs);
      break;
    case 'bike':
    case 'walk':
      breakdown = calculateBikeCommute(inputs);
      break;
    default:
      throw new Error(`Unknown transport mode`);
  }

  // Add time cost if enabled
  if (timeValueConfig?.enabled && breakdown.hoursPerYear > 0) {
    breakdown.timeCost = breakdown.hoursPerYear * timeValueConfig.perHour;
  }

  return {
    hasCommute: true,
    breakdown,
    effectiveTakeHome: 0, // Will be calculated by main function
  };
}

/**
 * Calculate time value per hour from salary
 * @param grossSalary - Annual gross salary
 * @param weeklyHours - Hours worked per week (default 37.5, UK standard full-time)
 * @returns Hourly rate, or 0 if invalid inputs
 */
export function calculateTimeValueFromSalary(
  grossSalary: number,
  weeklyHours: number = 37.5
): number {
  // Validate inputs
  if (grossSalary <= 0 || weeklyHours <= 0) {
    return 0;
  }

  const annualWorkingHours = 52 * weeklyHours;
  return grossSalary / annualWorkingHours;
}
```

**File: `src/lib/calculations.ts` (modifications)**

```typescript
import { calculateCommuteCosts } from './commute-calculations';

export function calculateTakeHome(
  inputs: CalculatorInputs,
  config: TaxYearConfig = currentTaxYear
): CalculationResult {
  // ... existing calculation logic

  // Calculate commute
  const commuteResult = calculateCommuteCosts(
    inputs.commuteInputs,
    inputs.timeValueConfig
  );

  // Calculate effective take home
  const commuteCostTotal = commuteResult.breakdown
    ? commuteResult.breakdown.totalCost +
      (commuteResult.breakdown.timeCost || 0)
    : 0;

  commuteResult.effectiveTakeHome = takeHomePay - commuteCostTotal;

  return {
    // ... existing fields
    commuteResult,
  };
}
```

### UI Components

**File: `src/components/CommuteInput.tsx` (new component)**

Collapsible section in calculator for commute inputs. Mode selector (car/train/bus/bike), then mode-specific inputs.

**File: `src/components/CommuteBreakdown.tsx` (new component)**

Shows commute cost breakdown in results section:
- Travel costs
- Parking costs
- Time spent (hours/year)
- Time value (if enabled)
- Total effective take-home

## UI Flow

### Input Section (Collapsible)

```
▼ Commute Details (optional)

  Transport mode:
  ○ Car  ○ Train  ○ Bus/Tube  ○ Bike/Walk  ○ No commute

  [If Car selected:]
  Distance each way: [__] miles *
  Days in office: [3] days/week *

  ⚙️ Cost details (optional - improves accuracy)
  Cost per mile: [£0.45] ℹ️ HMRC standard rate
  Parking: [£__] per day
  [ ] Congestion charge (£15/day)

  ⚙️ Time cost (optional)
  Time each way: [30] minutes
  Your time value: [£15.00]/hour (or auto-calculate from salary)
  [ ] Include time cost in effective take-home

  * Required fields
```

### Results Section

**Without commute:**
```
Annual Take-Home: £27,314
```

**With commute (costs only):**
```
Annual Take-Home: £27,314
- Commute costs: -£2,400
= Effective Take-Home: £24,914

⏱️ 156 hours/year commuting (~ 4 work weeks)
💡 Add £2,340 for time opportunity cost
```

**With commute (costs + time):**
```
Annual Take-Home: £27,314
- Commute costs: -£2,400
- Time opportunity cost: -£2,340
= Effective Take-Home: £22,574

⏱️ 156 hours/year commuting (~ 4 work weeks)
```

## Implementation Plan

### Phase 1: Core Commute (Priority)

1. **Create types** (src/types/commute.ts)
   - Transport mode types
   - Input interfaces for each mode
   - Breakdown and result interfaces

2. **Create calculations** (src/lib/commute-calculations.ts)
   - Car commute calculation
   - Train commute calculation
   - Bus commute calculation
   - Bike/walk calculation
   - Time value helper

3. **Create CommuteInput component**
   - Mode selector
   - Mode-specific input forms
   - Collapsible/expandable UI
   - Helpful placeholders

4. **Create CommuteBreakdown component**
   - Cost breakdown display
   - Time display
   - Effective take-home

5. **Integrate with main calculator**
   - Add commute inputs to state
   - Update calculateTakeHome
   - Show breakdown in results

6. **Testing**
   - Test each transport mode
   - Verify placeholder behavior
   - Test time value calculation

### Phase 2: Enhancements (Future)

7. **Hybrid work range**
   - Min/max days slider
   - Range calculation
   - "What if" scenarios

8. **Season ticket optimizer**
   - Compare daily vs season ticket
   - Savings calculation
   - Recommendation

9. **Additional costs**
   - Lunch costs (office vs home)
   - Work clothing
   - Professional subscriptions

## Success Criteria

- [ ] All transport modes supported (car, train, bus, bike/walk)
- [ ] Placeholder-based estimates work correctly
- [ ] Time opportunity cost optional and clear
- [ ] Effective Take Home prominently displayed
- [ ] Integrates with comparison view
- [ ] Users can make informed job decisions

## Open Questions

**1. Time cost default behavior:**
   - Option A: Always show time in hours, checkbox to include £ value
   - Option B: Always calculate £ value, checkbox to include in effective take-home
   - Option C: Don't show time cost by default, advanced option only
   - **Decision:** Option A - show hours always, £ value optional

**2. Required vs optional fields:**
   - Distance and days: required (can't calculate without)
   - Cost details: optional (placeholders as guidance)
   - Time: optional (informational)
   - **Decision:** Clear marking of required fields with *

**3. Mobile UX for mode selector:**
   - Radio buttons vs dropdown vs tabs
   - **Decision:** Radio buttons (clearer what options exist)

---

**Document History:**
- 2025-11-05: Initial specification created
