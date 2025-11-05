import type {
  CalculatorInputs,
  CalculationResult,
  StudentLoanPlan,
  StudentLoanBreakdown,
  PensionType,
} from '@/types/calculator';

// 2024/25 Tax Year Constants (England, Wales, Northern Ireland)
const TAX_BANDS = {
  personalAllowance: 12570,
  basicRateThreshold: 50270,
  higherRateThreshold: 125140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
};

const NI_BANDS = {
  threshold: 12570,
  upperThreshold: 50270,
  lowerRate: 0.12,
  upperRate: 0.02,
};

const STUDENT_LOAN_THRESHOLDS: Record<StudentLoanPlan, number> = {
  plan1: 22015,
  plan2: 27295,
  plan4: 27660,
  postgrad: 21000,
};

const STUDENT_LOAN_RATES: Record<StudentLoanPlan, number> = {
  plan1: 0.09,
  plan2: 0.09,
  plan4: 0.09,
  postgrad: 0.06,
};

/**
 * Calculate pension contribution
 */
export function calculatePension(
  grossSalary: number,
  pensionPercentage: number
): number {
  return (grossSalary * pensionPercentage) / 100;
}

/**
 * Calculate income tax based on taxable income
 */
export function calculateIncomeTax(taxableIncome: number): number {
  let tax = 0;

  if (taxableIncome <= TAX_BANDS.personalAllowance) {
    return 0;
  }

  const taxableAmount = taxableIncome - TAX_BANDS.personalAllowance;

  if (taxableIncome <= TAX_BANDS.basicRateThreshold) {
    // Basic rate only
    tax = taxableAmount * TAX_BANDS.basicRate;
  } else if (taxableIncome <= TAX_BANDS.higherRateThreshold) {
    // Basic rate + Higher rate
    const basicRateAmount = TAX_BANDS.basicRateThreshold - TAX_BANDS.personalAllowance;
    const higherRateAmount = taxableIncome - TAX_BANDS.basicRateThreshold;
    tax = basicRateAmount * TAX_BANDS.basicRate + higherRateAmount * TAX_BANDS.higherRate;
  } else {
    // Basic + Higher + Additional rate
    const basicRateAmount = TAX_BANDS.basicRateThreshold - TAX_BANDS.personalAllowance;
    const higherRateAmount =
      TAX_BANDS.higherRateThreshold - TAX_BANDS.basicRateThreshold;
    const additionalRateAmount = taxableIncome - TAX_BANDS.higherRateThreshold;
    tax =
      basicRateAmount * TAX_BANDS.basicRate +
      higherRateAmount * TAX_BANDS.higherRate +
      additionalRateAmount * TAX_BANDS.additionalRate;
  }

  return tax;
}

/**
 * Calculate National Insurance contributions
 */
export function calculateNationalInsurance(grossSalary: number): number {
  let ni = 0;

  if (grossSalary <= NI_BANDS.threshold) {
    return 0;
  }

  const niableAmount = grossSalary - NI_BANDS.threshold;

  if (grossSalary <= NI_BANDS.upperThreshold) {
    // Lower rate only
    ni = niableAmount * NI_BANDS.lowerRate;
  } else {
    // Lower rate + Upper rate
    const lowerNIAmount = NI_BANDS.upperThreshold - NI_BANDS.threshold;
    const upperNIAmount = grossSalary - NI_BANDS.upperThreshold;
    ni = lowerNIAmount * NI_BANDS.lowerRate + upperNIAmount * NI_BANDS.upperRate;
  }

  return ni;
}

/**
 * Calculate student loan repayment for a single plan
 */
export function calculateStudentLoan(
  grossSalary: number,
  plan: StudentLoanPlan
): number {
  const threshold = STUDENT_LOAN_THRESHOLDS[plan];
  const rate = STUDENT_LOAN_RATES[plan];

  if (grossSalary <= threshold) {
    return 0;
  }

  return (grossSalary - threshold) * rate;
}

/**
 * Calculate student loan repayments for multiple plans
 */
export function calculateStudentLoans(
  grossSalary: number,
  plans: StudentLoanPlan[]
): { total: number; breakdown: StudentLoanBreakdown[] } {
  const breakdown: StudentLoanBreakdown[] = plans.map((plan) => ({
    plan,
    amount: calculateStudentLoan(grossSalary, plan),
  }));

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return { total, breakdown };
}

/**
 * Calculate complete take home pay breakdown
 */
export function calculateTakeHome(inputs: CalculatorInputs): CalculationResult {
  const { grossSalary, pensionPercentage, pensionType, studentLoanPlans } = inputs;

  // Calculate pension contribution
  const pensionContribution = calculatePension(grossSalary, pensionPercentage);

  let taxableIncome: number;
  let pensionTaxRelief = 0;
  let niableIncome: number;

  // Pension calculations depend on type
  if (pensionType === 'salary-sacrifice') {
    // Salary sacrifice: pension deducted before tax and NI
    // Also known as "net pay arrangement"
    taxableIncome = grossSalary - pensionContribution;
    niableIncome = grossSalary - pensionContribution;
    pensionTaxRelief = 0; // Relief already given via reduced taxable income
  } else if (pensionType === 'relief-at-source') {
    // Relief at source: you pay 80%, government adds 20%
    // Employee contribution is 80% of stated percentage
    const employeePays = pensionContribution * 0.8;
    const taxRelief = pensionContribution * 0.2; // Basic rate relief automatically added

    taxableIncome = grossSalary; // No reduction to taxable income
    niableIncome = grossSalary; // No reduction to NI
    pensionTaxRelief = taxRelief;

    // Note: Higher/additional rate taxpayers can claim extra relief via tax return
    // For simplicity, we only show automatic basic rate relief here
  } else {
    // Net pay arrangement (same as salary sacrifice for most cases)
    taxableIncome = grossSalary - pensionContribution;
    niableIncome = grossSalary - pensionContribution;
    pensionTaxRelief = 0;
  }

  // Calculate all deductions
  const incomeTax = calculateIncomeTax(taxableIncome);
  const nationalInsurance = calculateNationalInsurance(niableIncome);
  const studentLoans = calculateStudentLoans(grossSalary, studentLoanPlans);

  // Calculate totals
  let totalDeductions: number;
  let takeHomePay: number;

  if (pensionType === 'relief-at-source') {
    // For relief at source, employee only pays 80% of pension
    const employeePensionCost = pensionContribution * 0.8;
    totalDeductions =
      incomeTax + nationalInsurance + employeePensionCost + studentLoans.total;
    takeHomePay = grossSalary - totalDeductions;
  } else {
    // For salary sacrifice and net pay
    totalDeductions =
      incomeTax + nationalInsurance + pensionContribution + studentLoans.total;
    takeHomePay = grossSalary - totalDeductions;
  }

  const monthlyTakeHome = takeHomePay / 12;
  const weeklyTakeHome = takeHomePay / 52;

  return {
    grossSalary,
    taxableIncome,
    incomeTax,
    nationalInsurance,
    pensionContribution,
    pensionTaxRelief,
    studentLoanRepayment: studentLoans.total,
    studentLoanBreakdown: studentLoans.breakdown,
    totalDeductions,
    takeHomePay,
    monthlyTakeHome,
    weeklyTakeHome,
  };
}
