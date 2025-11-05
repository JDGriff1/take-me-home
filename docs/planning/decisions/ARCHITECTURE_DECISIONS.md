# Architecture Decision Records (ADR)

This document captures key architectural and design decisions made during development.

---

## ADR-001: Tax Configuration in JSON Files

**Date:** 2025-11-05
**Status:** Approved
**Context:** Tax rates are currently hard-coded in `src/lib/calculations.ts`

**Decision:**
Store tax rates, thresholds, and constants in external JSON configuration files organized by tax year (e.g., `src/config/tax-rates/2024-25.json`).

**Rationale:**
- Easy updates when new tax year announced (no code changes)
- Version controlled (git history shows rate changes)
- Type-safe (TypeScript validates structure)
- Foundation for future features (tax year selector, regional rates)
- Community contributions easier (just edit JSON)

**Alternatives Considered:**
1. **External API:** No stable public API exists, adds dependency
2. **Database:** Overkill for current needs, adds infrastructure
3. **Environment variables:** Poor for structured data, not type-safe
4. **Keep hard-coded:** Requires code changes, hard to maintain

**Trade-offs:**
- ✅ Simple, maintainable, version-controlled
- ✅ No external dependencies
- ⚠️ Manual updates needed (acceptable - once per year)
- ❌ Not dynamic (but can add API later as enhancement)

**See:** `docs/planning/specifications/TAX_CONFIG.md`

---

## ADR-002: Placeholder-Based Cost Estimates

**Date:** 2025-11-05
**Status:** Approved
**Context:** Commute costs vary widely; don't want to guess user's actual costs

**Decision:**
Show helpful placeholders (e.g., "£0.45/mile - HMRC rate") but only include values in calculations if user explicitly enters or edits them.

**Rationale:**
- Guidance without assumptions
- User maintains control
- Accurate calculations (no guessing)
- Clear what's included vs not included

**Example:**
```
Cost per mile: [£0.45] ← placeholder, not included
User edits to £0.50 → now included in calculation
```

**Alternatives Considered:**
1. **Always use defaults:** Risk inaccurate calculations
2. **Require all inputs:** Too much friction
3. **No guidance:** Users don't know what to enter

**Trade-offs:**
- ✅ Accurate calculations
- ✅ User control
- ⚠️ Slightly more complex UI logic
- ❌ Might miss costs if user doesn't enter

**See:** `docs/planning/specifications/COMMUTE_FEATURE.md`

---

## ADR-003: React Context for Comparison State

**Date:** 2025-11-05
**Status:** Approved
**Context:** Need to manage multiple scenario states for comparison feature

**Decision:**
Use React Context + useReducer for comparison state management in Phase 1.

**Rationale:**
- Built-in React solution (no dependencies)
- Sufficient for current needs (2-3 scenarios)
- Easy to upgrade to zustand/redux later if needed
- Good preparation for localStorage persistence

**Alternatives Considered:**
1. **Component state (useState):** Too limited for multiple scenarios
2. **Zustand:** Overkill for Phase 1, can add later
3. **Redux:** Too complex for current needs
4. **Recoil/Jotai:** Adds dependency, not needed yet

**Trade-offs:**
- ✅ No external dependencies
- ✅ Standard React patterns
- ✅ Scalable to Phase 2 needs
- ⚠️ More boilerplate than zustand
- ⚠️ May need refactor if complexity grows significantly

**Migration Path:**
If complexity grows, migrate to zustand with minimal changes (same action/reducer patterns).

**See:** `docs/planning/specifications/COMPARISON_FEATURE.md`

---

## ADR-004: Extensible Deduction Interface

**Date:** 2025-11-05
**Status:** Approved
**Context:** Starting with commute costs, but will add more deductions later (lunch, childcare, etc.)

**Decision:**
Design a generic `EffectiveDeduction` interface that can accommodate different deduction types.

**Structure:**
```typescript
interface EffectiveDeduction {
  id: string;
  category: 'commute' | 'lunch' | 'childcare' | 'other';
  name: string;
  amount: number;
  isEstimate: boolean;
  includeInCalculation: boolean;
}
```

**Rationale:**
- Future-proof architecture
- Add new deductions without refactoring
- Consistent patterns across deduction types
- Easy to extend

**Trade-offs:**
- ✅ Scalable design
- ✅ Consistent patterns
- ⚠️ Slightly more abstract than needed for Phase 1
- ✅ Worth it for future flexibility

**See:** `docs/planning/specifications/COMMUTE_FEATURE.md`

---

## ADR-005: Effective Take Home as Hero Metric

**Date:** 2025-11-05
**Status:** Approved
**Context:** Multiple "take home" numbers (gross, take-home, effective take-home)

**Decision:**
Establish "Effective Take Home" (take-home minus real costs) as the most prominent number in UI.

**Visual Hierarchy:**
1. **Effective Take Home** - Largest, highlighted, hero number
2. Take-Home Pay - Supporting number
3. Gross Salary - Context number

**Rationale:**
- Most useful for decision-making
- Reveals true financial picture
- Differentiates from basic calculators
- Aligns with product value proposition

**User Insight:**
> "I don't care what my gross salary is. I want to know how much money I'll actually have to spend."

**Trade-offs:**
- ✅ Clear value proposition
- ✅ Drives better decisions
- ⚠️ More complex calculation
- ✅ Worth the complexity for accuracy

**See:** `docs/planning/FEATURE_ROADMAP.md`

---

## ADR-006: Time Opportunity Cost Optional

**Date:** 2025-11-05
**Status:** Approved
**Context:** Commute time has value, but it's subjective

**Decision:**
Always show time in hours, but make £ value optional (user checkbox).

**UI:**
```
⏱️ 156 hours/year commuting (~ 4 work weeks)
[ ] Include time cost in effective take-home
    Your time value: £15/hour
```

**Rationale:**
- Time cost is real but subjective
- User decides if/how to value their time
- Transparency: show hours always
- Flexibility: let user assign £ value

**Alternatives Considered:**
1. **Always include £ value:** Too prescriptive
2. **Never show £ value:** Misses important insight
3. **Hidden in advanced section:** Too hard to find

**Trade-offs:**
- ✅ User control and transparency
- ✅ Flexible to different user needs
- ⚠️ Slightly more UI complexity
- ✅ Better UX overall

**See:** `docs/planning/specifications/COMMUTE_FEATURE.md`

---

## ADR-007: Comparison Limit of 3 Scenarios

**Date:** 2025-11-05
**Status:** Approved
**Context:** How many job offers can be compared simultaneously?

**Decision:**
Maximum 3 scenarios for comparison (minimum 1).

**Rationale:**
- Covers vast majority of use cases (current + 2 offers)
- Keeps UI manageable on desktop
- Works on mobile (stacked or swipe)
- Reduces cognitive load

**Data:**
- Most users compare 2 options (current vs offer)
- Some compare 3 (current vs 2 offers or 3 offers)
- Rarely need to compare 4+

**Trade-offs:**
- ✅ Clean UI
- ✅ Mobile-friendly
- ⚠️ Edge cases with 4+ offers (can remove and add)
- ✅ Covers 95%+ of use cases

**Future:**
If data shows need for 4+, can add pagination or "compare selected" mode.

**See:** `docs/planning/specifications/COMPARISON_FEATURE.md`

---

## ADR-008: Progressive Disclosure for Complexity

**Date:** 2025-11-05
**Status:** Approved
**Context:** Balance between simplicity and detailed accuracy

**Decision:**
Start with simple inputs, progressively reveal complexity.

**Levels:**
1. **Simple (default):** Gross salary, basic pension, student loans
2. **Detailed:** Commute, pension types, employer costs
3. **Comparison:** Multiple scenarios side-by-side
4. **Educational:** Tooltips and explanations (future)

**Pattern:**
```
[Required inputs] ← Always visible
▼ Commute Details (optional) ← Expandable
▼ Employer Costs (optional) ← Expandable
▼ Advanced Options ← Expandable
```

**Rationale:**
- Fast for simple use case ("quick estimate")
- Detailed for serious decisions ("comparing offers")
- Not overwhelming for new users
- Discoverable for advanced users

**Trade-offs:**
- ✅ Better UX for all user levels
- ✅ Faster time-to-first-result
- ⚠️ More complex component structure
- ✅ Worth it for better UX

**See:** `docs/planning/FEATURE_ROADMAP.md`

---

## ADR-009: Inline Comparison vs Separate Page

**Date:** 2025-11-05
**Status:** Approved (Phase 1)
**Revisit:** Phase 2

**Decision:**
Phase 1: Inline expansion (single page with "Add comparison" button)
Phase 2: Consider adding `/compare` route if needed

**Rationale:**
- Simpler UX (no navigation)
- Natural progression (start simple, expand)
- Faster to implement
- Can add route later if data shows need

**Alternatives Considered:**
1. **Tabs:** Calculate | Compare (adds navigation)
2. **Separate page:** /compare (more clicks)
3. **Inline:** Expand on same page ✓

**Trade-offs:**
- ✅ Simpler UX
- ✅ Natural flow
- ⚠️ Might feel cramped on smaller screens
- ✅ Can add separate page later if needed

**See:** `docs/planning/specifications/COMPARISON_FEATURE.md`

---

## ADR-010: Calculation Functions Accept Config Parameter

**Date:** 2025-11-05
**Status:** Approved
**Context:** Tax rates in config files, functions need to use them

**Decision:**
All calculation functions accept optional `config` parameter, default to current tax year.

**Pattern:**
```typescript
export function calculateIncomeTax(
  taxableIncome: number,
  config: TaxYearConfig = currentTaxYear
): number {
  // Use config.incomeTax.bands
}
```

**Rationale:**
- Backward compatible (default parameter)
- Flexible for future features (tax year comparison)
- Pure functions (testable with different configs)
- No global state dependency

**Trade-offs:**
- ✅ Flexible and testable
- ✅ Backward compatible
- ⚠️ Slightly more parameters
- ✅ Worth it for flexibility

**See:** `docs/planning/specifications/TAX_CONFIG.md`

---

## Future Decisions to Document

**When implementing Phase 2+:**
- State persistence strategy (localStorage vs database)
- Authentication approach (if needed for saved scenarios)
- Export format specifications
- Chart library selection (if adding visualizations)
- Mobile swipe implementation details
- Performance optimizations for large comparison sets

---

## Decision Review Process

**When to review:**
- Every major phase (Phase 1 → Phase 2)
- When assumptions change
- When user feedback suggests issues
- When technical constraints change

**How to update:**
- Add new ADR with incremental number
- Mark outdated ADR as "Superseded by ADR-XXX"
- Keep history (don't delete old decisions)

---

**Document History:**
- 2025-11-05: Initial ADRs created during planning phase
