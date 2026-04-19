
// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { LogOut, Clock, Send } from "lucide-react";
import PunchButtons from "./PunchButtons";
import CopyIdSection from "./CopyIdSection";
import LeaveRequestForm from "./_components/LeaveRequestForm";
import ThemeToggle from "../_components/ThemeToggle";

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const empId = cookieStore.get("emp_session")?.value;
  
  if (!empId) redirect("/portal/login");

  const employee = await db.employee.findUnique({
    where: { id: parseInt(empId) },
    include: { 
      attendances: { orderBy: { checkIn: 'desc' }, take: 10 },
      // @ts-ignore: Ignore cached Prisma types
      leaveRequests: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  }) as any;

  if (!employee) redirect("/portal/login");

  const lastAttendance = employee.attendances && employee.attendances[0];
  const isCurrentlyIn = !!lastAttendance && !lastAttendance.checkOut;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 p-4 md:p-8 font-sans text-right pb-20" dir="rtl">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 mb-6 flex justify-between items-center transition-colors">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">{employee.name}</h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">قسم {employee.department}</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle /> {/* 👈 زر الدارك مود هنا */}
            <form action={logoutEmployee}>
              <button className="bg-red-50 dark:bg-red-500/10 text-red-500 p-3 rounded-2xl hover:bg-red-100 transition-all">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>

        {!employee.deviceId ? (
          <CopyIdSection />
        ) : (
          <>
            {/* زر طلب إجازة */}
            <div className="mb-6">
               <LeaveRequestForm employeeId={employee.id} />
            </div>

            {/* أزرار الحضور والانصراف */}
            <PunchButtons employeeCode={employee.code} isCurrentlyIn={isCurrentlyIn} />

            {/* متابعة طلبات الإجازة */}
            {employee.leaveRequests && employee.leaveRequests.length > 0 && (
              <div className="mt-8">
                <h3 className="font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 text-sm">
                  <Send size={16} className="text-blue-600" /> حالة طلبات الإجازة
                </h3>
                <div className="space-y-3">
                  {employee.leaveRequests.map((leave: any) => (
                    <div key={leave.id} className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{leave.type}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">من {new Date(leave.startDate).toLocaleDateString('ar-EG')} إلى {new Date(leave.endDate).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        leave.status === 'Approved' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 
                        leave.status === 'Rejected' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {leave.status === 'Approved' ? 'تمت الموافقة' : leave.status === 'Rejected' ? 'مرفوض' : 'قيد الانتظار'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* سجل العمليات */}
            <h3 className="font-black text-slate-700 dark:text-slate-300 mt-8 mb-4 flex items-center gap-2 text-sm">
              <Clock size={16} className="text-blue-600" /> سجل حركاتك الأخيرة
            </h3>
            <div className="space-y-3">
              {employee.attendances && employee.attendances.map((att: any) => (
                <div key={att.id} className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1">{att.date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</p>
                    <div className="flex gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                       <span className="text-green-600 dark:text-green-500">دخول: {att.checkIn?.toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit', timeZone:'Africa/Cairo'})}</span>
                       {att.checkOut && <span className="text-red-600 dark:text-red-500">خروج: {att.checkOut.toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit', timeZone:'Africa/Cairo'})}</span>}
                    </div>
                  </div>
                  <div className="text-left">
                     <p className="font-black text-blue-600 text-sm">{att.duration?.toFixed(1) || 0} س</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
