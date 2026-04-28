"use client";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import PunchButtons from "./PunchButtons";
import SalaryDashboard from "./_components/SalaryDashboard";
import { Clock, Calendar, ChevronLeft, History } from "lucide-react";

interface PortalViewProps {
  employee: any;
  isCurrentlyIn: boolean;
  totalEarnings: number;
  totalHours: number;
  targetHours: number; // Changed from monthlyTarget
  periodLabel: string; // Added for dynamic period
}

export default function PortalView({ 
  employee, 
  isCurrentlyIn, 
  totalEarnings, 
  totalHours, 
  targetHours, // Changed
  periodLabel // Added
}: PortalViewProps) {
  
  const [deviceId, setDeviceId] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setDeviceId(getDeviceId());
    setIsInitializing(false);
  }, []);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="text-slate-400 text-sm animate-pulse">جاري تحميل البيانات...</p>
      </div>
    );
  }

  const isDeviceAuthorized = 
    employee.deviceId && 
    deviceId && 
    employee.deviceId.trim().toLowerCase() === deviceId.trim().toLowerCase();

  if (!isDeviceAuthorized) {
    return (
      <div className="p-8 bg-red-50 border-2 border-dashed border-red-200 rounded-[2.5rem] text-center mt-10">
         <h2 className="text-red-600 font-black text-xl mb-2">جهاز غير معروف</h2>
         <p className="text-red-500 text-sm mb-4">بصمة هذا الجهاز غير مسجلة لدينا.</p>
         <div className="bg-white p-4 rounded-2xl font-mono font-bold text-lg border border-red-100 select-all text-slate-600">
           {deviceId}
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      <SalaryDashboard 
        totalEarnings={totalEarnings} 
        totalHours={totalHours}
        targetHours={targetHours} // Changed
        periodLabel={periodLabel} // Added
      />

      <PunchButtons employeeCode={employee.code} isCurrentlyIn={isCurrentlyIn} />

      <div className="pt-4">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <History className="text-blue-500" size={24} />
            سجل النشاط
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            آخر 7 أيام
          </span>
        </div>

        {employee.attendances && employee.attendances.length > 0 ? (
          <div className="relative space-y-6 before:absolute before:inset-0 before:mr-5 before:-ml-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-transparent before:opacity-20">
            {employee.attendances.map((record: any, index: number) => (
              <div key={record.id} className="relative flex gap-4 group">
                <div className="absolute right-0 translate-x-1/2 mt-1.5 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10 dark:border-slate-900"></div>

                <div className="mr-8 flex-1 bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(record.date).toLocaleDateString('ar-EG', { weekday: 'long' })}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {new Date(record.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      record.checkOut 
                      ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 animate-pulse'
                    }`}>
                      {record.checkOut ? 'مكتمل' : 'جاري العمل'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                       {new Date(record.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <ChevronLeft size={14} className="text-slate-300" />
                    <div className="flex items-center gap-1.5">
                       <div className={`w-1.5 h-1.5 rounded-full ${record.checkOut ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                       {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </div>
                  </div>
                  
                  {record.duration > 0 && (
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                       <span className="text-xs font-bold text-slate-400">ساعات العمل الفعلية</span>
                       <span className="text-sm font-black text-blue-600 dark:text-blue-400 flex items-center gap-1">
                         <Clock size={14} />
                         {record.duration.toFixed(2)} ساعة
                       </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
             <p className="text-slate-400 font-bold">لا توجد سجلات لهذا الأسبوع</p>
             <p className="text-xs text-slate-300 mt-1">ابدأ بتسجيل حضورك الآن!</p>
          </div>
        )}
      </div>
    </div>
  );
}