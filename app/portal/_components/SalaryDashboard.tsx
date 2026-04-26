"use client";
import { Wallet, TrendingUp, CalendarDays } from "lucide-react";

interface SalaryDashboardProps {
  dailySalary: number;
  attendedDays: number;
  currency?: string;
}

export default function SalaryDashboard({ 
  dailySalary, 
  attendedDays, 
  currency = "ج.م" 
}: SalaryDashboardProps) {
  
  // حساب الراتب الحالي (النقاط المجمعة)
  const currentTotal = dailySalary * attendedDays;
  
  // لنفترض أن الشهر 26 يوم عمل لحساب نسبة التقدم
  const progressPercentage = Math.min((attendedDays / 26) * 100, 100);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-700 mb-6 text-white">
      
      {/* تأثير الخلفية اللامعة */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none"></div>

      <div className="relative z-10">
        {/* الرأس: الأجر اليومي */}
        <div className="flex justify-between items-start mb-4 opacity-80">
          <div className="flex items-center gap-2 text-xs font-bold bg-slate-700/50 px-3 py-1 rounded-full">
            <TrendingUp size={14} className="text-green-400" />
            <span>الأجر اليومي: {dailySalary} {currency}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold bg-slate-700/50 px-3 py-1 rounded-full">
            <CalendarDays size={14} className="text-blue-400" />
            <span>{attendedDays} يوم حضور</span>
          </div>
        </div>

        {/* الرقم الكبير (الرصيد الحالي) */}
        <div className="text-center py-2">
          <p className="text-sm text-slate-400 font-medium mb-1">رصيدك الحالي</p>
          <div className="flex items-center justify-center gap-2">
            <Wallet className="text-yellow-400" size={32} />
            <h2 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-300">
              {currentTotal.toLocaleString()}
            </h2>
            <span className="text-xl font-bold text-slate-500 mt-4">{currency}</span>
          </div>
        </div>

        {/* شريط التقدم (XP Bar) */}
        <div className="mt-6">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 px-1">
            <span>بداية الشهر</span>
            <span>الهدف الشهري</span>
          </div>
          <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden p-[2px]">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
                {/* لمعة متحركة داخل الشريط */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-500 mt-2 font-bold">
            أكملت {Math.round(progressPercentage)}% من أيام العمل هذا الشهر
          </p>
        </div>
      </div>
    </div>
  );
}