
// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { LogOut, Smartphone, CheckCircle2, Clock, CalendarDays, DollarSign } from "lucide-react";
import PunchButtons from "./PunchButtons";
import CopyIdSection from "./CopyIdSection";

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const empId = cookieStore.get("emp_session")?.value;
  
  if (!empId) redirect("/portal/login");

  const employee = await db.employee.findUnique({
    where: { id: parseInt(empId) },
    include: { attendances: { orderBy: { checkIn: 'desc' }, take: 20 } }
  });

  if (!employee) redirect("/portal/login");

  // تحديد الحالة: هل الموظف داخل العمل الآن؟
  const lastAttendance = employee.attendances[0];
  const isCurrentlyIn = !!lastAttendance && !lastAttendance.checkOut;

  // حساب إحصائيات سريعة
  const totalOvertime = employee.attendances.reduce((acc, curr) => acc + (curr.overtime || 0), 0);
  const presentDays = new Set(employee.attendances.map(a => a.date.toDateString())).size;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-right" dir="rtl">
      <div className="max-w-xl mx-auto">
        
        {/* Header الاحترافي */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800">{employee.name}</h1>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">قسم {employee.department} | كود {employee.code}</p>
          </div>
          <form action={logoutEmployee}>
            <button className="bg-red-50 text-red-500 p-4 rounded-2xl hover:bg-red-100 transition-all">
              <LogOut size={24} />
            </button>
          </form>
        </div>

        {!employee.deviceId ? (
          <CopyIdSection />
        ) : (
          <>
            {/* عرض بصمة الجهاز المعتمدة */}
            <div className="bg-green-600 p-4 rounded-2xl mb-6 flex items-center justify-between text-white shadow-lg shadow-green-100">
               <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><Smartphone size={20} /></div>
                  <div className="text-[10px] font-bold">بصمة الجهاز المعتمدة: <br/> <span className="font-mono text-[9px] opacity-80">{employee.deviceId}</span></div>
               </div>
               <CheckCircle2 size={24} className="opacity-50" />
            </div>

            {/* أزرار الحضور والانصراف */}
            <PunchButtons 
              employeeCode={employee.code} 
              isCurrentlyIn={isCurrentlyIn} 
            />

            {/* كروت الإحصائيات */}
            <div className="grid grid-cols-3 gap-3 my-8">
               <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center">
                  <CalendarDays size={20} className="mx-auto text-blue-500 mb-1" />
                  <p className="text-[9px] text-slate-400 font-bold">أيام الحضور</p>
                  <p className="text-lg font-black text-slate-800">{presentDays}</p>
               </div>
               <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center">
                  <Clock size={20} className="mx-auto text-amber-500 mb-1" />
                  <p className="text-[9px] text-slate-400 font-bold">الإضافي</p>
                  <p className="text-lg font-black text-slate-800">{totalOvertime.toFixed(1)} س</p>
               </div>
               <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center">
                  <DollarSign size={20} className="mx-auto text-green-500 mb-1" />
                  <p className="text-[9px] text-slate-400 font-bold">الراتب اليومي</p>
                  <p className="text-lg font-black text-slate-800">{employee.dailySalary}</p>
               </div>
            </div>

            {/* سجل العمليات التفصيلي */}
            <h3 className="font-black text-slate-700 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" /> سجل حركاتك الأخيرة
            </h3>
            <div className="space-y-3 pb-10">
              {employee.attendances.map(att => (
                <div key={att.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-xs font-black text-slate-800 mb-1">{att.date.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <div className="flex gap-4">
                       <div className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          دخول: {att.checkIn ? att.checkIn.toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' }) : "--"}
                       </div>
                       {att.checkOut && (
                         <div className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            خروج: {att.checkOut.toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' })}
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">المدة</p>
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
