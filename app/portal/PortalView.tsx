
"use client";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import PunchButtons from "./PunchButtons";
import SalaryDashboard from "./_components/SalaryDashboard";
import LeaveRequestForm from './_components/LeaveRequestForm';
import { History, Download, Archive, ChevronLeft, Calendar, FileClock, CheckCircle, XCircle, Clock } from "lucide-react";

const formatTime = (dateString: string | null) => {
  if (!dateString) return "--:--";
  return new Date(dateString).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

const LeaveStatusBadge = ({ status }: { status: string }) => {
  const statusMap: any = {
    Pending: {
      icon: <Clock size={14} className="ml-1" />, 
      text: 'قيد المراجعة', 
      className: 'bg-amber-100 text-amber-700'
    },
    Approved: {
      icon: <CheckCircle size={14} className="ml-1" />,
      text: 'موافق عليه',
      className: 'bg-green-100 text-green-700'
    },
    Rejected: {
      icon: <XCircle size={14} className="ml-1" />,
      text: 'مرفوض',
      className: 'bg-red-100 text-red-700'
    },
  };

  const currentStatus = statusMap[status] || statusMap.Pending;

  return (
    <div className={`px-2 py-1 rounded-full text-[10px] font-black flex items-center justify-center ${currentStatus.className}`}>
      {currentStatus.icon}
      {currentStatus.text}
    </div>
  );
};

interface PortalViewProps {
  employee: any;
  isCurrentlyIn: boolean;
  attendanceRecords: any[];
  previousBalance: number;
  totalEarnings: number;
  totalHours: number;
  targetHours: number;
  periodLabel: string;
}

export default function PortalView({ 
  employee, 
  isCurrentlyIn, 
  attendanceRecords,
  previousBalance,
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
    // PDF export logic remains the same
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

      {previousBalance !== 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border-r-4 border-amber-400 p-4 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">الرصيد السابق</p>
                <p className={`text-lg font-black ${previousBalance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {previousBalance.toFixed(2)} جنيه
                </p>
            </div>
            <Archive className="text-amber-400" size={28}/>
        </div>
      )}

      <PunchButtons employeeCode={employee.code} isCurrentlyIn={isCurrentlyIn} />

      <LeaveRequestForm employeeId={employee.id} />

      {employee.leaveRequests && employee.leaveRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-700 dark:text-white flex items-center gap-2">
            <FileClock size={20} className="text-slate-400"/>
            سجل الإجازات
          </h3>
          <div className="space-y-3">
            {employee.leaveRequests.map((leave: any) => (
              <div key={leave.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-300">{leave.type}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(leave.startDate).toLocaleDateString('ar-EG', { day:'numeric', month: 'short'})} - {new Date(leave.endDate).toLocaleDateString('ar-EG', { day:'numeric', month: 'short'})}
                  </p>
                </div>
                <LeaveStatusBadge status={leave.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <History className="text-blue-500" size={24} />
            سجل النشاط
          </h3>
          <div className="flex items-center gap-2">
            {/* PDF export button remains the same */}
          </div>
        </div>

        {attendanceRecords && attendanceRecords.length > 0 ? (
          <div className="relative space-y-6 before:absolute before:inset-0 before:mr-5 before:-ml-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-transparent before:opacity-20">
            {[...attendanceRecords].reverse().map((record: any) => (
                <div key={record.id} className="relative flex gap-4 group">
                   {/* Activity record rendering remains the same */}
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
