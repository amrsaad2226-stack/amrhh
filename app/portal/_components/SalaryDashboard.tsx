"use client";
import { Wallet, Clock, Target } from "lucide-react";

interface SalaryDashboardProps {
  totalEarnings: number;  // الراتب المجمع حتى الآن
  totalHours: number;     // إجمالي الساعات
  monthlyTarget: number;  // هدف الساعات الشهري
  currency?: string;
}

export default function SalaryDashboard({ 
  totalEarnings, 
  totalHours, 
  monthlyTarget,
  currency = "ج.م" 
}: SalaryDashboardProps) {
  
  // حساب نسبة التقدم بناءً على الساعات
  const progressPercentage = monthlyTarget > 0 ? Math.min((totalHours / monthlyTarget) * 100, 100) : 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-700 mb-6 text-white">
      
      {/* خلفية جمالية */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* الرأس: ملخص الساعات */}
        <div className="flex justify-between items-center mb-4 opacity-90">
          <div className="flex items-center gap-2 text-xs font-bold bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600">
            <Clock size={14} className="text-emerald-400" />
            <span>ساعات العمل: {totalHours.toFixed(1)} ساعة</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Target size={12} />
            <span>هدف الشهر: {monthlyTarget} ساعة</span>
          </div>
        </div>

        {/* الرقم الكبير (الرصيد المجمع) */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400 font-medium mb-1 tracking-widest uppercase">الراتب المستحق</p>
          <div className="flex items-center justify-center gap-2">
            <Wallet className="text-yellow-400 drop-shadow-md" size={36} />
            <h2 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl">
              {Math.floor(totalEarnings).toLocaleString()}
              <span className="text-lg text-slate-400 font-bold mr-1">.{totalEarnings.toFixed(2).split('.')[1] || '00'}</span>
            </h2>
          </div>
            <span className="text-sm font-bold text-slate-500 bg-slate-800/80 px-2 py-1 rounded-lg mt-2 inline-block">{currency}</span>
        </div>

        {/* شريط التقدم (XP Bar) */}
        <div className="mt-6">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 px-1">
            <span>0%</span>
            <span>{Math.round(progressPercentage)}% من التارجت</span>
          </div>
          <div className="h-4 w-full bg-slate-700/30 rounded-full overflow-hidden p-[3px] border border-slate-700/50">
            <div 
              className={`h-full rounded-full shadow-[0_0_15px_currentColor] transition-all duration-1000 ease-out relative
                ${progressPercentage >= 100 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-500'}
              `}
              style={{ width: `${progressPercentage}%` }}
            >
                {/* لمعة متحركة */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}