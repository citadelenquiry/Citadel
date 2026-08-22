import React, { useState, useMemo } from 'react';
import { Page } from '../types';

interface CalculatorPageProps {
  setCurrentPage: (page: Page) => void;
  onOpenEnquiry: (projectId?: string) => void;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  setCurrentPage,
  onOpenEnquiry,
}) => {
  const [propertyPrice, setPropertyPrice] = useState<number>(15000000); // 1.5 Cr
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.4);
  const [tenureYears, setTenureYears] = useState<number>(20);

  // Derived loan amount
  const downPaymentAmount = useMemo(
    () => Math.round((propertyPrice * downPaymentPercent) / 100),
    [propertyPrice, downPaymentPercent]
  );

  const loanAmount = useMemo(
    () => Math.max(0, propertyPrice - downPaymentAmount),
    [propertyPrice, downPaymentAmount]
  );

  // Standard Monthly EMI calculation
  const { emi, totalInterest, totalPayment } = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    if (principal <= 0 || monthlyRate <= 0 || totalMonths <= 0) {
      return { emi: 0, totalInterest: 0, totalPayment: principal };
    }

    const emiCalc =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const roundedEmi = isNaN(emiCalc) || !isFinite(emiCalc) ? 0 : Math.round(emiCalc);
    const totalPaid = roundedEmi * totalMonths;
    const totalInt = Math.max(0, totalPaid - principal);

    return {
      emi: roundedEmi,
      totalInterest: totalInt,
      totalPayment: totalPaid,
    };
  }, [loanAmount, interestRate, tenureYears]);

  // Format currency helpers (INR Lakhs / Crores)
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatShortINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} L`;
    }
    return formatINR(val);
  };

  return (
    <div id="calculator-page-container" className="pt-14 sm:pt-16 bg-[#F8F6F3]">
      {/* 1. HERO HEADER */}
      <section className="py-12 sm:py-16 bg-[#1E1D1B] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8C2AF] block mb-2">
            FINANCIAL PLANNING TOOL
          </span>
          <h1 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight text-white mb-4">
            Home Loan EMI Calculator
          </h1>
          <p className="text-sm sm:text-base text-[#D4CFC9] max-w-xl mx-auto font-light leading-relaxed">
            Estimate your monthly installments, total interest outgo, and overall repayment budget for Citadel luxury homes.
          </p>
        </div>
      </section>

      {/* 2. INTERACTIVE CALCULATOR ENGINE */}
      <section className="py-14 sm:py-16 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls Column */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 border border-[#E6E1DC] shadow-xs space-y-7">
              <div className="flex items-center justify-between border-b border-[#F0EBE6] pb-4">
                <div>
                  <h3 className="font-editorial text-2xl font-bold text-[#1E1D1B]">
                    Loan Parameters
                  </h3>
                  <p className="text-xs text-[#7A7570]">Adjust sliders or configure your budget</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#8A563D] block">Eligible Loan</span>
                  <span className="text-base font-bold text-[#1E1D1B]">{formatShortINR(loanAmount)}</span>
                </div>
              </div>

              {/* Property Value Slider (Up to 10 Cr) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3C3A36]">
                    Property Purchase Value
                  </label>
                  <div className="text-base font-bold text-[#1E1D1B] bg-[#F8F6F3] px-3 py-1 rounded-lg border border-[#DDD6CE]">
                    {formatShortINR(propertyPrice)}
                  </div>
                </div>
                <input
                  type="range"
                  min={2000000}
                  max={100000000}
                  step={500000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full h-2 bg-[#E6E1DC] rounded-lg appearance-none cursor-pointer accent-[#8A563D]"
                />
                <div className="flex justify-between text-[10px] text-[#8C8781]">
                  <span>₹20 Lakhs</span>
                  <span>₹5.0 Crores</span>
                  <span>₹10.0 Crores</span>
                </div>
              </div>

              {/* Down Payment % Slider (Up to 100%) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3C3A36]">
                    Down Payment ({downPaymentPercent}%)
                  </label>
                  <div className="text-sm font-bold text-[#1E1D1B] bg-[#F8F6F3] px-3 py-1 rounded-lg border border-[#DDD6CE]">
                    {formatShortINR(downPaymentAmount)}
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full h-2 bg-[#E6E1DC] rounded-lg appearance-none cursor-pointer accent-[#8A563D]"
                />
                <div className="flex justify-between text-[10px] text-[#8C8781]">
                  <span>0% (Full Loan)</span>
                  <span>20% (Recommended)</span>
                  <span>100% (No Loan)</span>
                </div>
              </div>

              {/* Interest Rate Slider (Up to 50%) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3C3A36]">
                    Interest Rate (% per annum)
                  </label>
                  <div className="text-base font-bold text-[#1E1D1B] bg-[#F8F6F3] px-3 py-1 rounded-lg border border-[#DDD6CE]">
                    {interestRate.toFixed(1)} %
                  </div>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={50.0}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-[#E6E1DC] rounded-lg appearance-none cursor-pointer accent-[#8A563D]"
                />
                <div className="flex justify-between text-[10px] text-[#8C8781]">
                  <span>1.0%</span>
                  <span>8.4% (Standard)</span>
                  <span>50.0%</span>
                </div>
              </div>

              {/* Loan Tenure Slider (Up to 50 Years) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3C3A36]">
                    Loan Tenure (Years)
                  </label>
                  <div className="text-base font-bold text-[#1E1D1B] bg-[#F8F6F3] px-3 py-1 rounded-lg border border-[#DDD6CE]">
                    {tenureYears} Years ({tenureYears * 12} Months)
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full h-2 bg-[#E6E1DC] rounded-lg appearance-none cursor-pointer accent-[#8A563D]"
                />
                <div className="flex justify-between text-[10px] text-[#8C8781]">
                  <span>1 Year</span>
                  <span>25 Years</span>
                  <span>50 Years</span>
                </div>
              </div>
            </div>

            {/* Right Output & Summary Card */}
            <div className="lg:col-span-5 space-y-6">
              {/* Main EMI Highlight Box */}
              <div className="bg-[#1E1D1B] text-white rounded-3xl p-7 sm:p-8 shadow-xl border border-[#3E3C38] relative overflow-hidden">
                <div className="relative z-10 space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8C2AF] block mb-1">
                      ESTIMATED MONTHLY INSTALLMENT
                    </span>
                    <div className="font-editorial text-4xl sm:text-5xl font-bold text-white tracking-tight">
                      {formatINR(emi)}
                      <span className="text-sm font-normal text-[#C4BEB8]"> / month</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/15">
                    <div>
                      <span className="text-[10px] uppercase text-[#AFA9A2] block">Principal Amount</span>
                      <span className="text-base font-bold text-white">{formatShortINR(loanAmount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#AFA9A2] block">Total Interest</span>
                      <span className="text-base font-bold text-[#E8C2AF]">{formatShortINR(totalInterest)}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-white/10">
                      <span className="text-[10px] uppercase text-[#AFA9A2] block">Total Repayment Amount</span>
                      <span className="text-xl font-bold text-white">{formatShortINR(totalPayment)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

