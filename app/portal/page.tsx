// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { LogOut, Smartphone, CheckCircle2 } from "lucide-react";
import PunchButtons from "./PunchButtons";
import CopyIdSection from "./CopyIdSection";

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const empId = cookieStore.get("emp_session")?.value;
  
  if (!empId) redirect("/portal/login");

  const employee = await db.employee.findUnique({
    where: { id: parseInt(empId) },
    include: { attendances: { orderBy: { date: 'desc' } } }
  });

  if (!employee) redirect("/portal/login");

  const isDeviceActivated = !!employee.deviceId;

  // Check for an active session (check-in without check-out)
  const activeSession = employee.attendances.find(a => a.checkIn && !a.checkOut);

  // Group attendances by date to display them neatly
  const groupedAttendances = employee.attendances.reduce((acc: Record<string, { date: string; totalHours: number; sessions: any[] }>, curr) => {
    const dateStr = curr.date.toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, totalHours: 0, sessions: [] };
    }
    acc[dateStr].totalHours += curr.duration || 0;
    acc[dateStr].sessions.push(curr);
    return acc;
  }, {});

  const displayRows = Object.values(groupedAttendances);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-right" dir="rtl">
      <div className="max-w-md mx-auto">
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-800">{employee.name}</h1>
            <p className="text-slate-400 text-xs font-bold">قسم: {employee.department}</p>
          </div>
          <form action={logoutEmployee}>
            <button className="bg-red-50 text-red-500 p-3 rounded-2xl hover:bg-red-100 transition-all">
              <LogOut size={20} />
            </button>
          </form>
        </div>

        {!isDeviceActivated ? (
          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 text-center animate-in fade-in zoom-in duration-500">
             <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone size={32} />
             </div>
             <h2 className="text-xl font-black mb-2">خطوة واحدة متبقية!</h2>
             <p className="text-blue-100 text-sm mb-8 leading-relaxed">
               حسابك غير مرتبط بجهاز حالياً. يرجى نسخ الرمز أدناه وإرساله للمدير لتفعيل بصمتك.
             </p>
             <CopyIdSection /> 
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom duration-700">
             <div className="bg-white p-6 rounded-[2rem] border-2 border-green-50 mb-6 flex items-center gap-3">
                <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle2 size={16}/></div>
                <p className="text-green-700 text-[10px] font-bold font-sans">الجهاز مسجل: {employee.deviceId?.substring(0, 10)}...</p>
             </div>

             <PunchButtons 
               employeeCode={employee.code} 
               hasCheckedIn={!!activeSession} // Now based on active session, not today's first punch
               hasCheckedOut={!activeSession} // If there's an active session, you can't check in again
             />
             
             <div className="mt-8">
               <h3 className="text-slate-700 font-bold mb-4 px-2 italic text-sm text-right">سجل آخر عملياتك:</h3>
               <div className="space-y-4">
                 {displayRows.slice(0, 5).map(day => (
                   <div key={day.date} className="bg-white p-4 rounded-2xl border border-slate-100">
                     <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                        <span className="text-slate-800 font-black text-sm">{day.date}</span>
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 text-xs rounded-md">إجمالي: {day.totalHours.toFixed(1)} ساعة</span>
                     </div>
                     <div className="space-y-2">
                      {day.sessions.map(att => (
                        <div key={att.id} className="flex justify-between items-center text-xs">
                           <div className="flex gap-2 font-mono">
                              <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                {att.checkIn ? att.checkIn.toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' }) : "--:--"}
                              </span>
                              <span>-&gt;</span>
                              <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">
                                {att.checkOut ? att.checkOut.toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' }) : "جارية..."}
                              </span>
                           </div>
                           <span className="text-slate-400 font-bold">({att.duration ? `${att.duration.toFixed(1)} س` : "-"})</span>
                        </div>
                      ))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
