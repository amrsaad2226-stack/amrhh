"use client";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import PunchButtons from "./PunchButtons";
import SalaryDashboard from "./_components/SalaryDashboard";
import { Clock, Calendar, ChevronLeft, History, Download } from "lucide-react";

interface PortalViewProps {
  employee: any;
  isCurrentlyIn: boolean;
  totalEarnings: number;
  totalHours: number;
  targetHours: number;
  periodLabel: string;
}

export default function PortalView({ 
  employee, 
  isCurrentlyIn, 
  totalEarnings, 
  totalHours, 
  targetHours, 
  periodLabel
}: PortalViewProps) {
  
  const [deviceId, setDeviceId] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setDeviceId(getDeviceId());
    setIsInitializing(false);
  }, []);

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });

      // تحميل الخط العربي (Tajawal)
      const tajawalFont = await fetch('/fonts/Tajawal-Regular.ttf').then(res => res.arrayBuffer());
      doc.addFileToVFS('Tajawal-Regular.ttf', btoa(String.fromCharCode(...new Uint8Array(tajawalFont))));
      doc.addFont('Tajawal-Regular.ttf', 'Tajawal', 'normal');
      doc.setFont('Tajawal');

      const tableColumn = ["تاريخ", "حضور", "انصراف", "س. فعلية", "اضافي/عجز", "صافي"];
      const tableRows: any[][] = [];

      employee.attendances?.forEach((record: any) => {
        const requiredHours = employee.dailyHours || 8;
        const difference = record.checkOut ? record.duration - requiredHours : 0;
        const hourlyRate = (employee.dailySalary > 0 && employee.dailyHours > 0)
          ? employee.dailySalary / employee.dailyHours
          : 0;
        const netDailyEarning = record.duration * hourlyRate;
        const rowData = [
          new Date(record.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', timeZone: 'Africa/Cairo' }),
          new Date(record.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo' }),
          record.checkOut
            ? new Date(record.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo' })
            : '--:--',
          record.duration.toFixed(2),
          difference.toFixed(2),
          netDailyEarning.toFixed(2) + ' ج'
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 10,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          font: 'Tajawal', // استخدام الخط العربي
          halign: 'right' // المحاذاة لليمين
        },
        headStyles: {
          fillColor: [59, 130, 246],
          font: 'Tajawal',
          halign: 'right',
          fontStyle: 'normal'
        }
      });
      
      doc.save(`attendance_${employee.code}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("حدث خطأ أثناء تصدير الملف.");
    }
  };

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
        targetHours={targetHours}
        periodLabel={periodLabel}
      />

      <PunchButtons employeeCode={employee.code} isCurrentlyIn={isCurrentlyIn} />

      <div className="pt-4">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <History className="text-blue-500" size={24} />
            سجل النشاط
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportToPDF} 
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="تصدير PDF"
            >
              <Download size={20} className="text-slate-500" />
            </button>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              آخر 7 أيام
            </span>
          </div>
        </div>

        {employee.attendances && employee.attendances.length > 0 ? (
          <div className="relative space-y-6 before:absolute before:inset-0 before:mr-5 before:-ml-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-transparent before:opacity-20">
            {employee.attendances.map((record: any) => {
              const requiredHours = employee.dailyHours || 8;
              const difference = record.checkOut ? record.duration - requiredHours : 0;
              const hourlyRate = (employee.dailySalary > 0 && employee.dailyHours > 0) 
                ? employee.dailySalary / employee.dailyHours 
                : 0;
              const netDailyEarning = record.duration * hourlyRate;

              return (
                <div key={record.id} className="relative flex gap-4 group">
                  <div className="absolute right-0 translate-x-1/2 mt-1.5 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10 dark:border-slate-900"></div>

                  <div className="mr-8 flex-1 bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(record.date).toLocaleDateString('ar-EG', { weekday: 'long', timeZone: 'Africa/Cairo' })}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {new Date(record.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', timeZone: 'Africa/Cairo' })}
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
                         {new Date(record.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo' })}
                      </div>
                      <ChevronLeft size={14} className="text-slate-300" />
                      <div className="flex items-center gap-1.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${record.checkOut ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                         {record.checkOut 
                           ? new Date(record.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo' }) 
                           : '--:--'}
                      </div>
                    </div>
                    
                    {record.duration > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-x-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div className="text-center">
                          <span className="text-xs font-bold text-slate-400 block">س. فعلية</span>
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1 block">
                            {record.duration.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="text-center">
                          <span className={`text-xs font-bold block ${
                            !record.checkOut || difference === 0 ? 'text-slate-400' : 
                            difference > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {record.checkOut && difference !== 0 ? (difference > 0 ? 'إضافي' : 'عجز') : '---'}
                          </span>
                          <span className={`text-sm font-black mt-1 block ${
                            !record.checkOut || difference === 0 ? 'text-slate-400' : 
                            difference > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {record.checkOut && difference !== 0 ? Math.abs(difference).toFixed(2) : '-'}
                          </span>
                        </div>

                        <div className="text-center">
                          <span className="text-xs font-bold text-slate-400 block">الصافي</span>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200 mt-1 block">
                            {netDailyEarning.toFixed(2)} ج
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
