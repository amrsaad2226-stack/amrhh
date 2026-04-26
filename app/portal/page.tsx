// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import ThemeToggle from "../_components/ThemeToggle";
import PortalView from "./PortalView";

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const empId = cookieStore.get("emp_session")?.value;
  
  if (!empId) redirect("/portal/login");

  const employee = await db.employee.findUnique({
    where: { id: parseInt(empId) },
    include: { 
      attendances: { orderBy: { checkIn: 'desc' }, take: 10 },
      leaveRequests: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  });

  if (!employee) redirect("/portal/login");

  const lastAttendance = employee.attendances && employee.attendances[0];
  const isCurrentlyIn = !!lastAttendance && !lastAttendance.checkOut;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 p-4 md:p-8 font-sans text-right pb-20" dir="rtl">
      <div className="max-w-xl mx-auto">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 mb-6 flex justify-between items-center transition-colors">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">{employee.name}</h1>
            <p className="text-slate-400 dark:text-slate-400 text-xs font-bold uppercase">قسم {employee.department}</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <form action={logoutEmployee}>
              <button className="bg-red-50 dark:bg-red-500/10 text-red-500 p-4 rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
                <LogOut size={24} />
              </button>
            </form>
          </div>
        </div>

        <PortalView 
          employee={employee} 
          isCurrentlyIn={isCurrentlyIn} 
          lastSession={lastAttendance}
        />

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white mr-2">سجلات الحضور</h2>
          
          {employee.attendances && employee.attendances.length > 0 ? (
            employee.attendances.map((rec) => (
              <div key={rec.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-800 dark:text-white">
                    {new Date(rec.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '---'} 
                    {" ← "}
                    {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'مستمر'}
                  </p>
                </div>
                <div className="text-left">
                  <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full text-xs font-black">
                    {rec.checkOut ? `${rec.duration.toFixed(2)} ساعة` : ''}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-blue-50 dark:bg-blue-500/5 p-8 rounded-[2.5rem] border-2 border-dashed border-blue-100 dark:border-blue-500/20 text-center">
              <p className="text-blue-600 dark:text-blue-400 font-bold">لا توجد سجلات حضور مسجلة حتى الآن.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}