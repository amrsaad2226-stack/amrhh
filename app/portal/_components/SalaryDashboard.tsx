"use client";
import { DollarSign, Goal } from 'lucide-react';

interface SalaryDashboardProps {
  totalEarnings: number;
  totalHours: number;
  targetHours: number; // Changed from monthlyTarget
  periodLabel: string; // Added for dynamic period
}

export default function SalaryDashboard({ 
  totalEarnings, 
  totalHours, 
  targetHours, // Changed
  periodLabel // Added
}: SalaryDashboardProps) {

  const progressPercentage = targetHours > 0 ? (totalHours / targetHours) * 100 : 0;

  return (
    <div className="bg-gradient-to-l from-blue-600 to-blue-500 text-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-500/20 w-full">
      
      {/* Earnings Display */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-blue-200 font-medium mb-1">مستحقاتك الحالية</p>
          <p className="text-4xl font-black flex items-center">
            {totalEarnings.toFixed(0)}
            <span className="text-lg font-bold ml-1 mr-2">جنيه</span>
          </p>
        </div>
        <div className="p-3 bg-white/20 rounded-2xl">
          <DollarSign size={24} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2 text-xs font-bold">
          <span className="text-blue-100">ساعات العمل المنجزة</span>
          <span className="text-white">
            {totalHours.toFixed(1)} / {targetHours} ساعة
          </span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-green-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Period Goal */}
      <div className="mt-4 flex items-center justify-start gap-2 text-blue-200 text-xs font-medium opacity-80">
        <Goal size={14} />
        <span>الهدف خلال هذا الـ{periodLabel}</span>
      </div>

    </div>
  );
}