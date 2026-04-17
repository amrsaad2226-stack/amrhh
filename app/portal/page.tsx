// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import PunchButtons from "./PunchButtons";
import CopyIdSection from "./CopyIdSection";

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const empId = cookieStore.get("emp_session")?.value;
  
  if (!empId) redirect("/portal/login");

  const employee = await db.employee.findUnique({
    where: { id: parseInt(empId) },
    include: { 
      attendances: { orderBy: { date: 'desc' }, take: 10 },
    }
  });

  if (!employee) redirect("/portal/login");

  const isDeviceActivated = !!employee.deviceId;
  const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  today.setHours(0, 0, 0, 0);
  
  const todayAttendance = employee.attendances.find(a => a.date.getTime() === today.getTime());

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-right" dir="rtl">
      <div className="max-w-md mx-auto">
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-6 flex justify-between items-center border border-slate-100">
          <div>
            <h1 className="text-xl font-black text-slate-800">{employee.name}</h1>
            <p className="text-slate-400 text-xs font-bold">{employee.department}</p>
          </div>
          <form action={logoutEmployee}>
            <button className="bg-red-50 text-red-500 p-3 rounded-2xl"><LogOut size={20} /></button>
          </form>
        </div>

        {!isDeviceActivated ? (
          <CopyIdSection />
        ) : (
          <>
            <PunchButtons 
              employeeCode={employee.code} 
              hasCheckedIn={!!todayAttendance?.checkIn} 
              hasCheckedOut={!!todayAttendance?.checkOut} 
            />
            
            <div className="mt-8 bg-white p-6 rounded-[2rem] border border-slate-100">
               <h3 className="font-bold text-slate-700 mb-4">آخر عملياتك</h3>
               {employee.attendances.map(att => (
                 <div key={att.id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <span className="text-xs text-slate-500 font-bold">{att.date.toLocaleDateString('ar-EG')}</span>
                    <span className="text-xs font-black text-blue-600">{att.duration?.toFixed(1) || 0} ساعة</span>
                 </div>
               ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}