
"use client";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import PunchButtons from "./PunchButtons";
import LeaveRequestForm from "./_components/LeaveRequestForm";
import { Send, Clock } from "lucide-react";

export default function PortalView({ employee, isCurrentlyIn }: any) {
  // 1. إضافة حالة للتأكد من اكتمال التحميل
  const [deviceId, setDeviceId] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    setIsInitializing(false); // 2. تم التحميل بنجاح
  }, []);

  // 3. منع ظهور أي شيء (أو عرض لودر بسيط) حتى تستقر البصمة
  if (isInitializing) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
    // Scenario 1: The employee is logged in, but their device is not yet activated by an admin.
  // We show a clear message with the device ID they need to send.
  if (!employee.deviceId) {
    return (
      <div className="p-6 bg-amber-50 dark:bg-amber-500/10 rounded-[2rem] text-center border-2 border-dashed border-amber-200 dark:border-amber-500/20">
        <h2 className="text-xl font-bold text-amber-700 dark:text-amber-300 mb-2">في انتظار التفعيل</h2>
        <p className="text-sm text-amber-600 dark:text-amber-300/80 mb-4">أرسل الكود التالي للمدير لتفعيل جهازك:</p>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl font-mono font-bold text-lg select-all text-slate-700 dark:text-white">
          {deviceId ? deviceId : "جاري تحميل بصمة جهازك..."}
        </div>
        <p className="mt-4 text-xs text-amber-500 dark:text-amber-400/70 italic">بمجرد التفعيل، ستظهر أزرار الحضور تلقائياً (قم بتحديث الصفحة).</p>
      </div>
    );
  }

  // 4. الآن فقط نقوم بالمقارنة
  const isDeviceAuthorized = 
    employee.deviceId && 
    employee.deviceId.trim().toLowerCase() === deviceId.trim().toLowerCase();

  if (!isDeviceAuthorized) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-500/10 rounded-[2rem] text-center border-2 border-dashed border-red-200 dark:border-red-500/20">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">جهاز غير مصرح به</h2>
        <p className="text-sm text-red-600 dark:text-red-300/80">
          هذا الجهاز غير مسجل لحسابك. يرجى الدخول من جهازك المعتمد أو التواصل مع الإدارة.
        </p>
      </div>
    );
  }

  // إذا كان كل شيء سليم، اعرض الأزرار
  return (
    <div className="space-y-6">
      {/* Leave Request Form */}
      <div className="mb-6">
         <LeaveRequestForm employeeId={employee.id} />
      </div>

      {/* Punch Buttons */}
      <PunchButtons employeeCode={employee.code} isCurrentlyIn={isCurrentlyIn} />

      {/* Leave Requests History */}
      {employee.leaveRequests && employee.leaveRequests.length > 0 && (
        <div className="mt-8">
          <h3 className="font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 text-sm">
            <Send size={16} className="text-blue-600" /> حالة طلبات الإجازة
          </h3>
          <div className="space-y-3">
            {employee.leaveRequests.map((leave: any) => (
              <div key={leave.id} className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{leave.type}</p>
                  <p className="text-[10px] text-slate-400">من {new Date(leave.startDate).toLocaleDateString('ar-EG')} إلى {new Date(leave.endDate).toLocaleDateString('ar-EG')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                  leave.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 
                  leave.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                }`}>
                  {leave.status === 'Approved' ? 'تمت الموافقة' : leave.status === 'Rejected' ? 'مرفوض' : 'قيد الانتظار'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance History */}
      <h3 className="font-black text-slate-700 dark:text-slate-300 mt-8 mb-4 flex items-center gap-2 text-sm">
        <Clock size={16} className="text-blue-600" /> سجل حركاتك الأخيرة
      </h3>
      <div className="space-y-3">
        {employee.attendances && employee.attendances.map((att: any) => (
          <div key={att.id} className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1">{new Date(att.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</p>
              <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                 <span className="text-green-600 dark:text-green-400">دخول: {new Date(att.checkIn).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit', timeZone:'Africa/Cairo'})}</span>
                 {att.checkOut && <span className="text-red-600 dark:text-red-400">خروج: {new Date(att.checkOut).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit', timeZone:'Africa/Cairo'})}</span>}
              </div>
            </div>
            <div className="text-left">
               <p className="font-black text-blue-600 dark:text-blue-400 text-sm">{att.duration?.toFixed(1) || 0} س</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
