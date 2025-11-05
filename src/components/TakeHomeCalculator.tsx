'use client';

import { useState } from 'react';
import type { CalculatorInputs, StudentLoanPlan, PensionType } from '@/types/calculator';
import { calculateTakeHome } from '@/lib/calculations';

export default function TakeHomeCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    grossSalary: 30000,
    pensionPercentage: 5,
    pensionType: 'salary-sacrifice',
    studentLoanPlans: [],
  });

  const result = calculateTakeHome(inputs);

  const toggleStudentLoan = (plan: StudentLoanPlan) => {
    setInputs((prev) => {
      const plans = prev.studentLoanPlans.includes(plan)
        ? prev.studentLoanPlans.filter((p) => p !== plan)
        : [...prev.studentLoanPlans, plan];
      return { ...prev, studentLoanPlans: plans };
    });
  };

  const getLoanPlanLabel = (plan: StudentLoanPlan): string => {
    const labels: Record<StudentLoanPlan, string> = {
      plan1: 'Plan 1',
      plan2: 'Plan 2',
      plan4: 'Plan 4',
      postgrad: 'Postgraduate',
    };
    return labels[plan];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="grid lg:grid-cols-5 gap-0">
        {/* Input Section */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-5 sm:p-7 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Details
            </h2>
          </div>
          <div className="space-y-4">{/* inputs will go here */}

          {/* Gross Salary Input */}
          <div className="group">
            <label
              htmlFor="grossSalary"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gross Annual Salary
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-600 dark:text-gray-300">
                £
              </span>
              <input
                type="number"
                id="grossSalary"
                value={inputs.grossSalary}
                onChange={(e) =>
                  setInputs({ ...inputs, grossSalary: Number(e.target.value) })
                }
                className="w-full pl-10 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all group-hover:border-blue-400 dark:group-hover:border-blue-500"
                min="0"
                step="1000"
              />
            </div>
          </div>

          {/* Pension Inputs */}
          <div className="bg-white/50 dark:bg-gray-700/30 rounded-xl p-4 space-y-4">
            <div className="group">
              <label
                htmlFor="pension"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Pension Contribution (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="pension"
                  value={inputs.pensionPercentage}
                  onChange={(e) =>
                    setInputs({ ...inputs, pensionPercentage: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all group-hover:border-blue-400 dark:group-hover:border-blue-500"
                  min="0"
                  max="100"
                  step="0.5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-600 dark:text-gray-300">
                  %
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="pensionType"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
              >
                Pension Type
              </label>
              <select
                id="pensionType"
                value={inputs.pensionType}
                onChange={(e) =>
                  setInputs({ ...inputs, pensionType: e.target.value as PensionType })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer"
              >
                <option value="salary-sacrifice">Salary Sacrifice</option>
                <option value="relief-at-source">Relief at Source</option>
                <option value="net-pay">Net Pay</option>
              </select>
            </div>
          </div>

          {/* Student Loan Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Student Loan Plans
            </label>
            <div className="space-y-2">
              {(['plan1', 'plan2', 'plan4', 'postgrad'] as StudentLoanPlan[]).map(
                (plan) => (
                  <label
                    key={plan}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      inputs.studentLoanPlans.includes(plan)
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400'
                        : 'bg-white/50 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={inputs.studentLoanPlans.includes(plan)}
                      onChange={() => toggleStudentLoan(plan)}
                      className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:bg-gray-700 cursor-pointer"
                    />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {getLoanPlanLabel(plan)}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-3 p-5 sm:p-7 lg:p-8 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-600 dark:bg-green-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Take Home
            </h2>
          </div>

          {/* Take Home Pay - Hero Section */}
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-2xl p-5 sm:p-6 shadow-lg overflow-hidden mb-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white/90 font-semibold text-xs uppercase tracking-wide">
                  Annual
                </span>
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4">
                {formatCurrency(result.takeHomePay)}
              </div>

              {/* Monthly and Weekly Take Home */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white/80 text-xs font-medium uppercase">Monthly</span>
                  </div>
                  <p className="font-bold text-lg sm:text-xl text-white">
                    {formatCurrency(result.monthlyTakeHome)}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/80 text-xs font-medium uppercase">Weekly</span>
                  </div>
                  <p className="font-bold text-lg sm:text-xl text-white">
                    {formatCurrency(result.weeklyTakeHome)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deductions List */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-200">Deductions</span>
            </div>

            {/* Gross Salary */}
            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-xl">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Gross Salary</span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {formatCurrency(result.grossSalary)}
              </span>
            </div>

            {/* Income Tax */}
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <span className="text-gray-700 dark:text-gray-200 font-medium">Income Tax</span>
              <span className="font-bold text-red-600 dark:text-red-400">-{formatCurrency(result.incomeTax)}</span>
            </div>

            {/* National Insurance */}
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <span className="text-gray-700 dark:text-gray-200 font-medium">National Insurance</span>
              <span className="font-bold text-red-600 dark:text-red-400">-{formatCurrency(result.nationalInsurance)}</span>
            </div>

            {/* Pension */}
            <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <span className="text-gray-700 dark:text-gray-200 font-medium">Pension ({inputs.pensionPercentage}%)</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">-{formatCurrency(result.pensionContribution)}</span>
            </div>

            {/* Student Loans (if applicable) */}
            {result.studentLoanRepayment > 0 && (
              <>
                {result.studentLoanBreakdown.map((loan) => (
                  <div
                    key={loan.plan}
                    className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                  >
                    <span className="text-gray-700 dark:text-gray-200 font-medium">Student Loan ({getLoanPlanLabel(loan.plan)})</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">-{formatCurrency(loan.amount)}</span>
                  </div>
                ))}
              </>
            )}

            {/* Total Deductions */}
            <div className="flex justify-between items-center p-3 bg-gray-200 dark:bg-gray-600 rounded-xl mt-2 border-2 border-gray-300 dark:border-gray-500">
              <span className="text-gray-900 dark:text-white font-bold">
                Total Deductions
              </span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                -{formatCurrency(result.totalDeductions)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex gap-3 items-start">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-800 dark:text-gray-200">Important:</strong> Calculations based on 2024/25 UK tax rates for England, Wales and Northern Ireland. This is an estimate and may not reflect your exact circumstances. Always consult with a financial advisor for accurate calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
