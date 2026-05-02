// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { getEmployeePortalAttendance } from "@/app/actions/attendance";
import { LogOut } from "lucide-react";
import ThemeToggle from "../_components/ThemeToggle";
import PortalView from "./PortalView";

export default async function EmployeePortal() {
  const cookieStore = await cookies();
  const empIdStr = cookieStore.get("emp_session")?.value;
  
  if (!empIdStr) redirect("/login");

  const empId = parseInt(empIdStr);

  const employee = await db.employee.findUnique({
    where: { id: empId },
    include: { 
      leaveRequests: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  });

  if (!employee) redirect("/login");

  const processedAttendance = await getEmployeePortalAttendance(empId);

  const lastAttendance = processedAttendance.length > 0 ? processedAttendance[processedAttendance.length - 1] : null;
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
          attendanceRecords={processedAttendance}
        />
        
      </div>
    </div>
  );
}
