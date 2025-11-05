# Feature Roadmap

## Vision

A comprehensive UK take-home pay calculator focused on **job offer comparison** and **salary negotiation preparation**. The tool reveals the real financial impact of job decisions by calculating "Effective Take Home" - what you actually keep after all real-world costs.

## Target Users

**Primary:** All UK employees comparing job offers or preparing for salary negotiations
- Recent graduates with first job offers
- Mid-career professionals considering moves
- Senior employees negotiating compensation packages

**Key User Needs:**
- Compare multiple job offers accurately
- Understand true cost of commuting and work expenses
- See employer's total investment (for negotiation context)
- Make informed decisions based on real take-home, not just gross salary

---

## Product Principles

1. **Progressive Disclosure:** Simple by default, detailed when needed
2. **Educational:** Users understand WHY, not just WHAT
3. **Accuracy First:** Better to require input than give misleading defaults
4. **Effective Take Home:** The hero metric - what really matters
5. **Speed for Iteration:** Interactive modeling to test scenarios quickly

---

## Implementation Phases

### Phase 1: Foundation & Core Comparison (Current Priority)

**Goal:** Enable accurate job offer comparison with real-world costs

**Features:**
1. **Tax Configuration System** ✅ Priority
   - Move hard-coded rates to JSON configs
   - Support multiple tax years
   - Foundation for future expansion
   - [Spec: specifications/TAX_CONFIG.md]

2. **Employer Costs Breakdown** ✅ Priority
   - Show employer NI and pension contributions
   - Display total cost to company
   - Useful for salary negotiation context
   - [Spec: specifications/EMPLOYER_COSTS.md]

3. **Commute Cost Calculator** ✅ Priority
   - Car, train, bus, bike/walk modes
   - Parking and hybrid work patterns
   - Time opportunity cost calculation
   - "Effective Take Home" metric
   - [Spec: specifications/COMMUTE_FEATURE.md]

4. **Side-by-Side Comparison** ✅ Priority
   - Compare 2-3 job offers simultaneously
   - Clear visual indicators of best option
   - Include all factors: take-home, commute, time
   - [Spec: specifications/COMPARISON_FEATURE.md]

5. **Interactive Scenario Modeling** ✅ Priority
   - Real-time updates as inputs change
   - Sliders/toggles for quick adjustments
   - Test "what-if" scenarios rapidly

**Success Metrics:**
- Users can compare multiple offers with commute costs
- "Effective Take Home" reveals true best option
- Interactive adjustments enable quick scenario testing

**Technical Debt to Avoid:**
- Extensible deduction interface (don't hard-code commute)
- Comparison architecture that scales to 3+ scenarios
- Component state management (consider Context for comparisons)

---

### Phase 2: Polish & Usability (Next Priority)

**Goal:** Make the tool more practical for real-world use

**Features:**
6. **Saved Scenarios**
   - localStorage for session persistence
   - Name your scenarios ("Current Job", "Offer A")
   - Load previous calculations
   - Duration: Survives page refresh

7. **Export Functionality**
   - CSV export for spreadsheets
   - PDF report generation (future)
   - Users "own" their data
   - Use case: Budget planning, record keeping

8. **Hybrid Work Variability**
   - Range slider: "2-4 days per week"
   - Show cost range: £X - £Y
   - Anticipate policy changes
   - "If office days increase to 4, you'll spend £800 more"

9. **Visual Polish**
   - Chart visualizations (pie chart of deductions)
   - Better mobile responsive design for comparison view
   - Animations for scenario changes
   - Loading states for calculations

**Success Metrics:**
- Users return to saved calculations
- Export feature adoption
- Mobile usage increases

---

### Phase 3: Advanced Features (Future)

**Goal:** Differentiation and premium features

**Features:**
10. **Reverse Calculator with AI** 💎 Premium
    - "I need £2,500/month take-home, what should I ask for?"
    - Conversational AI to guide negotiation strategy
    - Considers all factors (pension, commute, loans)
    - GenAI integration for personalized advice

11. **Marginal Rate Calculator**
    - "Your next £1,000 raise = £X take-home"
    - Shows effective marginal tax rate
    - Powerful for negotiation: "I need £5k gross to see £2.5k benefit"

12. **Benefits Quantifier**
    - Value non-salary benefits (holiday days, healthcare)
    - "28 days holiday vs 25 days = worth £X"
    - Pension match differences
    - Total compensation view

13. **Historical Tracking**
    - Track offers over time
    - "My 2023 offer vs 2024 offer"
    - Career progression visibility
    - Requires user accounts

14. **Break-Even Calculator**
    - "How much more salary to offset losing remote work?"
    - "What gross salary equals same take-home with different pension?"
    - Complex scenario comparison

**Success Metrics:**
- Premium feature conversion
- User engagement with AI features
- Retention and repeat usage

---

### Phase 4: Educational & Market Expansion (Future)

**Goal:** Reach new audiences and establish authority

**Features:**
15. **Educational Mode** 🎓 Student-focused
    - Explain UK tax system step-by-step
    - Interactive walkthroughs
    - "Why does salary sacrifice save money?"
    - Links to gov.uk resources
    - Tooltip explanations throughout

16. **Regional Support**
    - Scotland tax rates (different from England/Wales/NI)
    - Northern Ireland variations
    - Tax year selector for historical comparison

17. **Specialized Calculators**
    - Contractor vs PAYE comparison (IR35)
    - Bonus calculator (one-off payments)
    - Part-time/pro-rata calculator
    - Hourly/daily rate converter

18. **Age-Related Adjustments**
    - NI stops at state pension age
    - Pension annual allowance tapering for high earners
    - Marriage allowance transfer

**Success Metrics:**
- Student user acquisition
- Content marketing success (SEO)
- Contractor/freelancer adoption

---

## Deferred / Out of Scope (For Now)

**Explicitly NOT building yet:**
- Anonymous shareable links (privacy/hosting concerns)
- Real-time data APIs (train prices, fuel prices)
- Season ticket optimizer (nice-to-have, but complex)
- Childcare/lunch cost calculators (after commute proven)
- User accounts/authentication (unless needed for premium)
- Multiple regions beyond UK
- Payroll software integration

**Reason:** Keep focused on core job comparison use case. These add complexity without serving primary need.

---

## Architecture Considerations

### State Management
- **Phase 1:** Component state (useState)
- **Phase 2:** Consider React Context for comparison state
- **Phase 3:** If complexity grows, evaluate zustand/redux

### Data Persistence
- **Phase 1:** None (session only)
- **Phase 2:** localStorage for saved scenarios
- **Phase 3:** Database if user accounts needed

### Extensibility Patterns
- **Deductions:** Interface-based, not hard-coded (commute is first, more later)
- **Tax configs:** JSON files, easy to add new years
- **Calculations:** Pure functions, easily testable
- **Components:** Composable, reusable across comparison views

---

## Success Definition

**Phase 1 Success:**
- User can compare 2-3 job offers with commute costs
- "Effective Take Home" reveals which offer is truly better
- Interactive modeling lets users test scenarios quickly
- Tool is accurate, fast, and trustworthy

**Long-term Success:**
- Tool is the go-to calculator for UK job seekers
- Users trust calculations for major life decisions
- Educational content establishes authority
- Potential for premium features/monetization

---

## Next Steps

1. Review and approve this roadmap
2. Begin Phase 1 implementation:
   - Start with TAX_CONFIG (foundation)
   - Then EMPLOYER_COSTS (simpler, builds confidence)
   - Then COMMUTE_FEATURE (most complex, most valuable)
   - Finally COMPARISON_FEATURE (brings it all together)
3. Create GitHub issues/project board (optional)
4. Set milestones for Phase 1 completion

---

**Document History:**
- 2025-11-05: Initial roadmap created based on planning discussion
