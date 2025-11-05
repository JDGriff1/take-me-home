# Side-by-Side Job Offer Comparison

## Overview

Enable users to compare 2-3 job offers simultaneously with all factors: gross salary, take-home pay, commute costs, employer costs, and time investment. Clear visual indicators reveal which offer is truly better.

## User Value

**The Problem:**
- Users receive multiple job offers
- Compare only on gross salary (misleading)
- Don't account for commute, benefits, time
- Make decisions without full picture

**The Solution:**
- Side-by-side comparison of all factors
- "Effective Take Home" - what really matters
- Visual indicators showing best option
- Informed decision-making

## Key User Flows

### Flow 1: Compare Two Job Offers

1. User enters details for "Current Job"
2. Clicks "Add comparison"
3. Enters details for "Job Offer A"
4. Sees side-by-side comparison
5. Clear winner emerges based on effective take-home

### Flow 2: Compare Three Scenarios

1. User enters "Current Job"
2. Adds "Offer A" (higher salary, longer commute)
3. Adds "Offer B" (lower salary, fully remote)
4. Compares all three
5. Discovers remote job wins despite lowest gross salary

### Flow 3: Interactive Modeling

1. User has comparison open
2. Adjusts pension % in one scenario
3. Sees instant update
4. Tests "what if I negotiate 2% more?"
5. Makes informed counteroffer decision

## Design Principles

### 1. Clear Visual Hierarchy

**Hero metric:** Effective Take Home (largest, highlighted)
**Supporting metrics:** Gross, take-home, commute, time
**Winner indicator:** Green highlight + checkmark on best option

### 2. Responsive Layout

**Desktop (>1024px):** Side-by-side columns (2-3 scenarios)
**Tablet (768-1024px):** 2 columns, scroll for 3rd
**Mobile (<768px):** Stack vertically or horizontal swipe

### 3. Smart Defaults

**Scenario names:**
- First: "Scenario 1" or user can name (e.g., "Current Job")
- Second: "Scenario 2" or "Offer A"
- Third: "Scenario 3" or "Offer B"

**Copy functionality:**
- "Duplicate scenario" to test variations
- Saves time when comparing similar offers

## Technical Specification

### State Management

**Challenge:** Multiple scenarios, each with full calculator inputs
**Options:**
1. Component state (useState) - simple but limited
2. React Context - better for sharing state
3. Zustand/Redux - overkill for Phase 1

**Decision: React Context for Phase 1**

**Why:**
- Share state between comparison components
- Easy to add/remove scenarios
- Prepare for localStorage persistence (Phase 2)
- Not too complex for current needs

### Data Structures

**File: `src/types/comparison.ts` (new file)**

```typescript
import type { CalculatorInputs, CalculationResult } from './calculator';

export interface Scenario {
  id: string; // Unique identifier
  name: string; // User-provided or default
  inputs: CalculatorInputs;
  result: CalculationResult;
  createdAt: Date;
}

export interface ComparisonState {
  scenarios: Scenario[];
  activeScenarioId: string | null; // For mobile/single view
}

export type ComparisonAction =
  | { type: 'ADD_SCENARIO'; scenario: Scenario }
  | { type: 'UPDATE_SCENARIO'; id: string; inputs: CalculatorInputs }
  | { type: 'REMOVE_SCENARIO'; id: string }
  | { type: 'RENAME_SCENARIO'; id: string; name: string }
  | { type: 'DUPLICATE_SCENARIO'; id: string }
  | { type: 'SET_ACTIVE_SCENARIO'; id: string }
  | { type: 'REORDER_SCENARIOS'; ids: string[] };
```

### Context & Reducer

**File: `src/contexts/ComparisonContext.tsx` (new file)**

```typescript
'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import type {
  Scenario,
  ComparisonState,
  ComparisonAction,
} from '@/types/comparison';
import { calculateTakeHome } from '@/lib/calculations';

const ComparisonContext = createContext<{
  state: ComparisonState;
  dispatch: React.Dispatch<ComparisonAction>;
} | null>(null);

const initialState: ComparisonState = {
  scenarios: [],
  activeScenarioId: null,
};

function comparisonReducer(
  state: ComparisonState,
  action: ComparisonAction
): ComparisonState {
  switch (action.type) {
    case 'ADD_SCENARIO':
      return {
        ...state,
        scenarios: [...state.scenarios, action.scenario],
        activeScenarioId: action.scenario.id,
      };

    case 'UPDATE_SCENARIO': {
      const result = calculateTakeHome(action.inputs);
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id
            ? { ...s, inputs: action.inputs, result }
            : s
        ),
      };
    }

    case 'REMOVE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.filter((s) => s.id !== action.id),
        activeScenarioId:
          state.activeScenarioId === action.id
            ? state.scenarios[0]?.id || null
            : state.activeScenarioId,
      };

    case 'RENAME_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id ? { ...s, name: action.name } : s
        ),
      };

    case 'DUPLICATE_SCENARIO': {
      const original = state.scenarios.find((s) => s.id === action.id);
      if (!original) return state;

      const duplicate: Scenario = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (copy)`,
        createdAt: new Date(),
      };

      return {
        ...state,
        scenarios: [...state.scenarios, duplicate],
      };
    }

    case 'SET_ACTIVE_SCENARIO':
      return {
        ...state,
        activeScenarioId: action.id,
      };

    case 'REORDER_SCENARIOS': {
      const reordered = action.ids
        .map((id) => state.scenarios.find((s) => s.id === id))
        .filter(Boolean) as Scenario[];
      return {
        ...state,
        scenarios: reordered,
      };
    }

    default:
      return state;
  }
}

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(comparisonReducer, initialState);

  return (
    <ComparisonContext.Provider value={{ state, dispatch }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
}
```

### Helper Functions

**File: `src/lib/comparison-helpers.ts` (new file)**

```typescript
import type { Scenario } from '@/types/comparison';

/**
 * Find the best scenario based on effective take-home
 */
export function findBestScenario(scenarios: Scenario[]): Scenario | null {
  if (scenarios.length === 0) return null;

  return scenarios.reduce((best, current) => {
    const currentEffective =
      current.result.commuteResult?.effectiveTakeHome ||
      current.result.takeHomePay;
    const bestEffective =
      best.result.commuteResult?.effectiveTakeHome || best.result.takeHomePay;

    return currentEffective > bestEffective ? current : best;
  });
}

/**
 * Calculate difference between two scenarios
 */
export function calculateDifference(
  scenario: Scenario,
  baseline: Scenario
): {
  grossDiff: number;
  takeHomeDiff: number;
  effectiveDiff: number;
  timeDiff: number; // hours
} {
  const scenarioEffective =
    scenario.result.commuteResult?.effectiveTakeHome ||
    scenario.result.takeHomePay;
  const baselineEffective =
    baseline.result.commuteResult?.effectiveTakeHome ||
    baseline.result.takeHomePay;

  const scenarioTime =
    scenario.result.commuteResult?.breakdown?.hoursPerYear || 0;
  const baselineTime =
    baseline.result.commuteResult?.breakdown?.hoursPerYear || 0;

  return {
    grossDiff: scenario.result.grossSalary - baseline.result.grossSalary,
    takeHomeDiff: scenario.result.takeHomePay - baseline.result.takeHomePay,
    effectiveDiff: scenarioEffective - baselineEffective,
    timeDiff: scenarioTime - baselineTime,
  };
}

/**
 * Format difference with + or - sign
 */
export function formatDifference(amount: number, currency: boolean = true): string {
  const formatter = currency
    ? new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : new Intl.NumberFormat('en-GB');

  const formatted = currency
    ? formatter.format(Math.abs(amount))
    : formatter.format(Math.abs(amount));

  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}
```

### UI Components

#### ComparisonView Component

**File: `src/components/ComparisonView.tsx` (new component)**

Main comparison layout. Shows multiple scenario cards side-by-side.

**Features:**
- Add scenario button (limit 3)
- Side-by-side layout (desktop)
- Vertical stack (mobile)
- Clear "best" indicator
- Difference calculations

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Scenario 1]  [Scenario 2]  [+ Add Comparison]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Current  │  │ Offer A  │  │ Offer B  │         │
│  │ Job      │  │          │  │          │         │
│  │          │  │          │  │ ✓ BEST   │         │
│  │ £30k     │  │ £40k     │  │ £35k     │         │
│  │ Take:    │  │ Take:    │  │ Take:    │         │
│  │ £22.5k   │  │ £28.5k   │  │ £25.9k   │         │
│  │          │  │          │  │          │         │
│  │ Commute: │  │ Commute: │  │ No       │         │
│  │ -£2.4k   │  │ -£3.6k   │  │ commute  │         │
│  │          │  │          │  │          │         │
│  │ Effective:│  │Effective:│  │Effective:│         │
│  │ £20.1k   │  │ £24.9k   │  │ £25.9k ✓ │         │
│  │          │  │          │  │          │         │
│  │ Time:    │  │ Time:    │  │ Time:    │         │
│  │ 520 hrs  │  │ 312 hrs  │  │ 0 hrs    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                      │
│  Comparison summary:                                │
│  • Offer B is best: +£5.8k vs Current Job         │
│  • Saves 520 hours/year vs Current Job            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### ScenarioCard Component

**File: `src/components/ScenarioCard.tsx` (new component)**

Individual scenario card with inputs and results.

**Features:**
- Editable name
- Full calculator inputs
- Condensed results display
- Actions: duplicate, remove
- Winner badge if best

**Two modes:**
1. **Edit mode** - Full inputs visible
2. **View mode** - Just results, click to edit

#### ComparisonTable Component (Desktop Alternative)

**File: `src/components/ComparisonTable.tsx` (new component)**

Table view alternative to cards (might be clearer for data comparison).

```
┌─────────────────────────────────────────────────────────────────┐
│                  Current Job    Offer A       Offer B           │
├─────────────────────────────────────────────────────────────────┤
│ Gross Salary     £30,000        £40,000       £35,000           │
│ Take-Home Pay    £22,500        £28,500       £25,900           │
│                                                                  │
│ Commute Cost     -£2,400        -£3,600       £0                │
│ Commute Time     520 hrs        312 hrs       0 hrs             │
│                                                                  │
│ Effective Take   £20,100        £24,900       £25,900 ✓         │
│                                                                  │
│ vs Current       baseline       +£4,800       +£5,800 ✓         │
│ Time saved       baseline       +208 hrs      +520 hrs ✓        │
└─────────────────────────────────────────────────────────────────┘
```

### Page Structure

**Option A: Single page with mode toggle**
```
/
├─ [Calculate] [Compare] tabs
├─ If Calculate: Single calculator (current)
├─ If Compare: Comparison view
```

**Option B: Separate comparison page**
```
/ - Single calculator
/compare - Comparison view
```

**Option C: Inline expansion**
```
/ - Single calculator
  └─ [Add comparison] button
      └─ Expands to side-by-side view
```

**Decision: Option C for Phase 1**
- Simpler UX (no navigation)
- Natural progression (start simple, expand)
- Can add separate page later if needed

### Interactive Modeling

**Real-time updates:**
- Change any input in any scenario
- Instant recalculation
- Visual feedback (highlight changed field)
- Comparison updates automatically

**UI pattern:**
- Debounced input (300ms delay)
- Loading indicator during calculation
- Smooth animations on value changes

**Example:**
```typescript
import debounce from 'lodash/debounce';

const [inputs, setInputs] = useState(scenario.inputs);

// Debounce updates to avoid too many recalculations
const debouncedDispatch = useMemo(
  () =>
    debounce((id: string, inputs: CalculatorInputs) => {
      dispatch({ type: 'UPDATE_SCENARIO', id, inputs });
    }, 300),
  [dispatch]
);

// Cleanup debounce on unmount
useEffect(() => {
  return () => {
    debouncedDispatch.cancel();
  };
}, [debouncedDispatch]);

const handleInputChange = (field: string, value: any) => {
  const newInputs = { ...inputs, [field]: value };
  setInputs(newInputs); // Immediate UI update
  debouncedDispatch(scenario.id, newInputs); // Debounced calculation
};
```

**Note:** This is conceptual - actual implementation will need lodash dependency or custom debounce utility.

## Implementation Plan

### Phase 1: Core Comparison

1. **Create types** (src/types/comparison.ts)
   - Scenario interface
   - ComparisonState and actions
   - Helper types

2. **Create context** (src/contexts/ComparisonContext.tsx)
   - ComparisonProvider
   - Reducer logic
   - useComparison hook

3. **Create helper functions** (src/lib/comparison-helpers.ts)
   - findBestScenario
   - calculateDifference
   - formatDifference

4. **Create ScenarioCard component**
   - Inputs section
   - Results display
   - Actions (rename, duplicate, remove)
   - Winner badge

5. **Create ComparisonView component**
   - Layout container
   - Add scenario button
   - Render scenario cards
   - Summary section

6. **Integrate with main page**
   - Wrap app in ComparisonProvider
   - Add "Compare" mode toggle
   - Show comparison view when active

7. **Responsive design**
   - Desktop: side-by-side
   - Tablet: 2 columns
   - Mobile: vertical stack or swipe

### Phase 2: Enhancements (Future)

8. **Table view** (ComparisonTable component)
   - Alternative to cards
   - Better for detailed comparison
   - Toggle between card/table view

9. **Export comparison**
   - CSV export
   - PDF report
   - Shareable format

10. **Saved comparisons** (localStorage)
    - Persist scenarios between sessions
    - "Load previous comparison"
    - History of comparisons

## User Experience

### Adding First Comparison

**User flow:**
1. User fills out single calculator (existing)
2. Sees results
3. Clicks "Add comparison" button
4. New scenario card appears beside original
5. Fills out second job offer details
6. Sees instant comparison

**UI feedback:**
- Smooth animation when adding scenario
- Clear visual hierarchy (winner highlighted)
- Tooltips: "This scenario has the best effective take-home"

### Managing Scenarios

**Actions available:**
- ✏️ Rename scenario
- 📋 Duplicate scenario (for testing variations)
- 🗑️ Remove scenario
- ⬆️⬇️ Reorder scenarios (future)

**Limits:**
- Minimum: 1 scenario
- Maximum: 3 scenarios (keeps UI manageable)
- Can't delete last scenario

### Mobile UX

**Challenge:** Limited screen width
**Solutions:**

**Option A: Vertical stack**
- Scroll vertically through scenarios
- Clear separation between cards
- Easy to implement

**Option B: Horizontal swipe**
- Swipe between scenarios
- Dots indicator: "● ○ ○"
- More native mobile feel
- More complex

**Decision: Option A for Phase 1, Option B for Phase 2**

## Testing Strategy

**Unit tests:**
- Reducer logic (add, update, remove scenarios)
- Helper functions (findBest, calculateDifference)
- Context provider

**Integration tests:**
- Add scenario flow
- Update scenario triggers recalculation
- Winner calculation correct

**Visual tests:**
- Layout responsive
- Winner badge appears correctly
- Differences formatted properly

## Success Criteria

- [ ] Can compare 2-3 scenarios side-by-side
- [ ] Best scenario clearly indicated
- [ ] All calculator features work in comparison mode
- [ ] Responsive on mobile, tablet, desktop
- [ ] Interactive modeling (real-time updates)
- [ ] Smooth animations and transitions
- [ ] Clear, understandable comparison summary

## Open Questions

**1. Default scenario names:**
   - "Scenario 1, 2, 3" vs "Current Job, Offer A, B"
   - **Decision:** Start with numbered, easy to rename

**2. Comparison limit:**
   - 2 max, 3 max, or unlimited?
   - **Decision:** 3 max (UI manageable, covers most use cases)

**3. Card vs Table view:**
   - Both? One? User toggle?
   - **Decision:** Cards for Phase 1, add table option in Phase 2

**4. State persistence:**
   - Component state vs localStorage vs database
   - **Decision:** Component state (Phase 1), localStorage (Phase 2)

---

**Document History:**
- 2025-11-05: Initial specification created
