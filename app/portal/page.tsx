
// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { LogOut, Clock, Send } from "lucide-react";
import PunchButtons from "./PunchButtons";
import CopyIdSection from "./CopyIdSection";
import LeaveRequestForm from "./_components/LeaveRequestForm";

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-right pb-20" dir="rtl">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800">{employee.name}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase">قسم {employee.department}</p>
          </div>
          <form action={logoutEmployee}>
            <button className="bg-red-50 text-red-500 p-4 rounded-2xl hover:bg-red-100 transition-all">
              <LogOut size={24} />
            </button>
          </form>
        </div>

        {!employee.deviceId ? (
          // 👈 التعديل هنا: نمرر الاسم والكود للمكون
          <CopyIdSection empName={employee.name} empCode={employee.code} />
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
                <h3 className="font-black text-slate-700 mb-4 flex items-center gap-2 text-sm">
                  <Send size={16} className="text-blue-600" /> حالة طلبات الإجازة
                </h3>
                <div className="space-y-3">
                  {employee.leaveRequests.map((leave: any) => (
                    <div key={leave.id} className="bg-white p-4 rounded-2xl border border-slate-50 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{leave.type}</p>
                        <p className="text-[10px] text-slate-400">من {new Date(leave.startDate).toLocaleDateString('ar-EG')} إلى {new Date(leave.endDate).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                        leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {leave.status === 'Approved' ? 'تمت الموافقة' : leave.status === 'Rejected' ? 'مرفوض' : 'قيد الانتظار'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* سجل العمليات */}
            <h3 className="font-black text-slate-700 mt-8 mb-4 flex items-center gap-2 text-sm">
              <Clock size={16} className="text-blue-600" /> سجل حركاتك الأخيرة
            </h3>
            <div className="space-y-3">
              {employee.attendances && employee.attendances.map((att: any) => (
                <div key={att.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-xs font-black text-slate-800 mb-1">{att.date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</p>
                    <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                       <span className="text-green-600">دخول: {att.checkIn?.toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit', timeZone:'Africa/Cairo'})}</span>
                       {att.checkOut && <span className="text-red-600">خروج: {att.checkOut.toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit', timeZone:'Africa/Cairo'})}</span>}
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
