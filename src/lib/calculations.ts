import type {
  CalculatorInputs,
  CalculationResult,
  StudentLoanPlan,
  StudentLoanBreakdown,
  PensionType,
} from '@/types/calculator';
import { currentTaxYear, type TaxYearConfig } from '@/config/tax-rates';

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
 * @param taxableIncome - Annual taxable income
 * @param config - Tax year configuration (defaults to current tax year)
 */
export function calculateIncomeTax(
  taxableIncome: number,
  config: TaxYearConfig = currentTaxYear
): number {
  let tax = 0;
  const { incomeTax } = config;

  if (taxableIncome <= incomeTax.personalAllowance) {
    return 0;
  }

  const taxableAmount = taxableIncome - incomeTax.personalAllowance;
  const basicBand = incomeTax.bands[0]; // basic rate
  const higherBand = incomeTax.bands[1]; // higher rate
  const additionalBand = incomeTax.bands[2]; // additional rate

  if (taxableIncome <= basicBand.threshold!) {
    // Basic rate only
    tax = taxableAmount * basicBand.rate;
  } else if (taxableIncome <= higherBand.threshold!) {
    // Basic rate + Higher rate
    const basicRateAmount = basicBand.threshold! - incomeTax.personalAllowance;
    const higherRateAmount = taxableIncome - basicBand.threshold!;
    tax = basicRateAmount * basicBand.rate + higherRateAmount * higherBand.rate;
  } else {
    // Basic + Higher + Additional rate
    const basicRateAmount = basicBand.threshold! - incomeTax.personalAllowance;
    const higherRateAmount = higherBand.threshold! - basicBand.threshold!;
    const additionalRateAmount = taxableIncome - higherBand.threshold!;
    tax =
      basicRateAmount * basicBand.rate +
      higherRateAmount * higherBand.rate +
      additionalRateAmount * additionalBand.rate;
  }

  return tax;
}

/**
 * Calculate National Insurance contributions
 * @param grossSalary - Annual gross salary (or NI-able income for salary sacrifice)
 * @param config - Tax year configuration (defaults to current tax year)
 */
export function calculateNationalInsurance(
  grossSalary: number,
  config: TaxYearConfig = currentTaxYear
): number {
  let ni = 0;
  const { class1Employee } = config.nationalInsurance;

  if (grossSalary <= class1Employee.lowerThreshold) {
    return 0;
  }

  const niableAmount = grossSalary - class1Employee.lowerThreshold;

  if (grossSalary <= class1Employee.upperThreshold) {
    // Lower rate only
    ni = niableAmount * class1Employee.lowerRate;
  } else {
    // Lower rate + Upper rate
    const lowerNIAmount = class1Employee.upperThreshold - class1Employee.lowerThreshold;
    const upperNIAmount = grossSalary - class1Employee.upperThreshold;
    ni = lowerNIAmount * class1Employee.lowerRate + upperNIAmount * class1Employee.upperRate;
  }

  return ni;
}

/**
 * Calculate student loan repayment for a single plan
 * @param grossSalary - Annual gross salary
 * @param plan - Student loan plan type
 * @param config - Tax year configuration (defaults to current tax year)
 */
export function calculateStudentLoan(
  grossSalary: number,
  plan: StudentLoanPlan,
  config: TaxYearConfig = currentTaxYear
): number {
  const planConfig = config.studentLoans[plan];
  const threshold = planConfig.threshold;
  const rate = planConfig.rate;

  if (grossSalary <= threshold) {
    return 0;
  }

  return (grossSalary - threshold) * rate;
}

/**
 * Calculate student loan repayments for multiple plans
 * @param grossSalary - Annual gross salary
 * @param plans - Array of student loan plans
 * @param config - Tax year configuration (defaults to current tax year)
 */
export function calculateStudentLoans(
  grossSalary: number,
  plans: StudentLoanPlan[],
  config: TaxYearConfig = currentTaxYear
): { total: number; breakdown: StudentLoanBreakdown[] } {
  const breakdown: StudentLoanBreakdown[] = plans.map((plan) => ({
    plan,
    amount: calculateStudentLoan(grossSalary, plan, config),
  }));

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return { total, breakdown };
}

/**
 * Calculate complete take home pay breakdown
 * @param inputs - Calculator inputs (salary, pension, loans, etc.)
 * @param config - Tax year configuration (defaults to current tax year)
 */
export function calculateTakeHome(
  inputs: CalculatorInputs,
  config: TaxYearConfig = currentTaxYear
): CalculationResult {
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

  // Calculate all deductions using tax year config
  const incomeTax = calculateIncomeTax(taxableIncome, config);
  const nationalInsurance = calculateNationalInsurance(niableIncome, config);
  const studentLoans = calculateStudentLoans(grossSalary, studentLoanPlans, config);

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
