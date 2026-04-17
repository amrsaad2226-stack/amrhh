// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { CalendarDays, Clock, DollarSign, LogOut } from "lucide-react";
import PunchButtons from "./PunchButtons"; // 👈 استيراد الأزرار الذكية

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const empId = cookieStore.get("emp_session")?.value;
  
  if (!empId) redirect("/portal/login");

  const employee = await db.employee.findUnique({
    where: { id: parseInt(empId) },
    include: {
      attendances: {
        orderBy: { date: 'desc' },
        take: 30
      }
    }
  });

  if (!employee) redirect("/portal/login");

  const totalOvertime = employee.attendances.reduce((acc, curr) => acc + (curr.overtime || 0), 0);
  const presentDays = employee.attendances.length;

  // 👈 التحقق من حالة الموظف "اليوم"
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAttendance = employee.attendances.find(
    a => a.date.getTime() === today.getTime()
  );

  const hasCheckedIn = !!todayAttendance?.checkIn;
  const hasCheckedOut = !!todayAttendance?.checkOut;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-xl mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black mb-2">مرحباً، {employee.name} 👋</h1>
            <p className="text-blue-200">{employee.department} | كود: {employee.code}</p>
          </div>
          <form action={logoutEmployee}>
            <button className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl backdrop-blur-sm transition-all text-white" title="تسجيل خروج">
              <LogOut size={24} />
            </button>
          </form>
        </div>

        {/* 👈 قسم أزرار البصمة الذكية */}
        <div className="mb-10">
           <PunchButtons 
             employeeCode={employee.code} 
             hasCheckedIn={hasCheckedIn} 
             hasCheckedOut={hasCheckedOut} 
           />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-green-50 p-4 rounded-2xl text-green-600"><CalendarDays size={24}/></div>
            <div><p className="text-slate-400 text-xs font-bold">أيام الحضور</p><p className="text-2xl font-black text-slate-800">{presentDays}</p></div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-amber-50 p-4 rounded-2xl text-amber-600"><Clock size={24}/></div>
            <div><p className="text-slate-400 text-xs font-bold">إجمالي الإضافي</p><p className="text-2xl font-black text-slate-800">{totalOvertime.toFixed(2)} س</p></div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 col-span-2 md:col-span-1">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><DollarSign size={24}/></div>
            <div><p className="text-slate-400 text-xs font-bold">الراتب اليومي</p><p className="text-2xl font-black text-slate-800">{employee.dailySalary.toString()} ج</p></div>
          </div>
        </div>

        {/* سجل الحضور */}
        <h2 className="text-xl font-black text-slate-800 mb-4">سجل حضور آخر 30 يوماً</h2>
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-sm font-bold text-slate-500">التاريخ</th>
                <th className="p-4 text-sm font-bold text-slate-500">الدخول</th>
                <th className="p-4 text-sm font-bold text-slate-500">الخروج</th>
                <th className="p-4 text-sm font-bold text-slate-500">إضافي</th>
              </tr>
            </thead>
            <tbody>
              {employee.attendances.map(att => (
                <tr key={att.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">{att.date.toLocaleDateString('ar-EG')}</td>
                  <td className="p-4 text-sm text-slate-500">{att.checkIn ? att.checkIn.toLocaleTimeString('ar-EG') : "--"}</td>
                  <td className="p-4 text-sm text-slate-500">{att.checkOut ? att.checkOut.toLocaleTimeString('ar-EG') : "--"}</td>
                  <td className="p-4"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">{att.overtime ? att.overtime.toFixed(2) : '0'} س</span></td>
                </tr>
              ))}
              {employee.attendances.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">لا يوجد سجل حضور حتى الآن.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
