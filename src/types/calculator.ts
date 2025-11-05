export type StudentLoanPlan = 'plan1' | 'plan2' | 'plan4' | 'postgrad';

export type PensionType = 'salary-sacrifice' | 'relief-at-source' | 'net-pay';

export interface CalculatorInputs {
  grossSalary: number;
  pensionPercentage: number;
  pensionType: PensionType;
  studentLoanPlans: StudentLoanPlan[];
}

export interface StudentLoanBreakdown {
  plan: StudentLoanPlan;
  amount: number;
}

export interface CalculationResult {
  grossSalary: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  pensionContribution: number;
  pensionTaxRelief: number;
  studentLoanRepayment: number;
  studentLoanBreakdown: StudentLoanBreakdown[];
  totalDeductions: number;
  takeHomePay: number;
  monthlyTakeHome: number;
  weeklyTakeHome: number;
}

export interface TaxBands {
  personalAllowance: number;
  basicRateThreshold: number;
  higherRateThreshold: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;
}

export interface NationalInsuranceBands {
  threshold: number;
  upperThreshold: number;
  lowerRate: number;
  upperRate: number;
}

export interface StudentLoanThresholds {
  [key: string]: number;
}

export interface StudentLoanRates {
  [key: string]: number;
}
