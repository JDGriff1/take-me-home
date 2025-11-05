export type Region = 'england-wales-ni' | 'scotland';

export interface TaxBand {
  name: string;
  threshold: number | null; // null for top band (no upper limit)
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
