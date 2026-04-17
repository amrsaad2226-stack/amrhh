// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { LogOut, Smartphone, CheckCircle2 } from "lucide-react";
import PunchButtons from "./PunchButtons";
import CopyIdSection from "./CopyIdSection"; // 1. تأكد من وجود هذا الملف في نفس المجلد

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const empId = cookieStore.get("emp_session")?.value;
  
  if (!empId) redirect("/portal/login");

  const employee = await db.employee.findUnique({
    where: { id: parseInt(empId) },
    include: { attendances: { orderBy: { date: 'desc' }, take: 15 } }
  });

  if (!employee) redirect("/portal/login");

  const isDeviceActivated = !!employee.deviceId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAttendance = employee.attendances.find(a => a.date.getTime() === today.getTime());
  const hasCheckedIn = !!todayAttendance?.checkIn;
  const hasCheckedOut = !!todayAttendance?.checkOut;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-right" dir="rtl">
      <div className="max-w-md mx-auto">
        
        {/* Header الشخصي */}
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
                {/* 2. تم إضافة علامة ? هنا لحل خطأ الـ null 👇 */}
                <p className="text-green-700 text-[10px] font-bold font-sans">الجهاز مسجل: {employee.deviceId?.substring(0, 10)}...</p>
             </div>

             <PunchButtons 
               employeeCode={employee.code} 
               hasCheckedIn={hasCheckedIn} 
               hasCheckedOut={hasCheckedOut} 
             />
             
             <div className="mt-8">
               <h3 className="text-slate-700 font-bold mb-4 px-2 italic text-sm text-right">سجل آخر عملياتك:</h3>
               <div className="space-y-3">
                 {employee.attendances.slice(0, 3).map(att => (
                   <div key={att.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                     <span className="text-slate-500 font-bold text-xs">{att.date.toLocaleDateString('ar-EG')}</span>
                     <div className="flex gap-2">
                        {att.checkIn && <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-lg">حضور {att.checkIn.toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>}
                        {att.checkOut && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-lg">انصراف {att.checkOut.toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>}
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
