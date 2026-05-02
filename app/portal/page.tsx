// app/portal/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { getEmployeePortalAttendance } from "@/app/actions/attendance";
import { LogOut } from "lucide-react";
import ThemeToggle from "../_components/ThemeToggle";
import PortalView from "./PortalView";
import { SalaryType } from "@prisma/client";

// Helper function to get the start of the week (assuming Saturday is the first day)
const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay(); // Sunday: 0, ..., Saturday: 6
  const diff = (day + 1) % 7; // Difference to get back to Saturday
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

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

  // --- DYNAMIC PERIOD SETUP ---
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let targetHours: number;
  let periodLabel: string;

  switch (employee.salaryType) {
    case SalaryType.DAILY:
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      targetHours = employee.dailyHours || 8;
      periodLabel = "اليوم";
      break;
    case SalaryType.WEEKLY:
      startDate = getStartOfWeek(now);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      targetHours = (employee.dailyHours || 8) * (employee.offDay === 'NONE' ? 7 : 6);
      periodLabel = "الأسبوع";
      break;
    case SalaryType.MONTHLY:
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      targetHours = (employee.dailyHours || 8) * 26; // Assuming 26 working days
      periodLabel = "الشهر";
      break;
  }

  const processedAttendance = await getEmployeePortalAttendance(empId, startDate, endDate);
  
  // Calculate total hours from the source of truth
  let totalHoursWorked = 0;
  if (processedAttendance.length > 0) {
    const lastRecord = processedAttendance[processedAttendance.length - 1];
    // Find the total for its day
    const dateStr = lastRecord.date.toISOString().split('T')[0];
    let dayTotal = 0;
    processedAttendance.forEach(rec => {
      if (rec.date.toISOString().split('T')[0] === dateStr) {
         let duration = 0;
         if(rec.checkOut) {
            duration = rec.duration || 0;
         } else {
            duration = (new Date().getTime() - rec.checkIn.getTime()) / (1000 * 60 * 60);
         }
         dayTotal += duration
      }
    });
    // To get the grand total, we sum previous days and add the current day's running total
    const previousDaysTotal = processedAttendance
      .filter(p => p.date.toISOString().split('T')[0] !== dateStr)
      .reduce((acc, curr) => acc + (curr.duration || 0), 0)

    totalHoursWorked = previousDaysTotal + dayTotal;
  }

  // Check if the employee is currently punched in
  const isCurrentlyIn = processedAttendance.some(rec => !rec.checkOut);

  const hourlyRate = employee.dailySalary > 0 && employee.dailyHours > 0 ? employee.dailySalary / employee.dailyHours : 0;
  const currentTotalSalary = totalHoursWorked * hourlyRate;

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
          totalEarnings={currentTotalSalary} 
          totalHours={totalHoursWorked}
          targetHours={targetHours}
          periodLabel={periodLabel}
        />
        
      </div>
    </div>
  );
}
