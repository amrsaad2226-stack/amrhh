// app/page.tsx
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutEmployee } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import ThemeToggle from "./_components/ThemeToggle";
import PortalView from "./portal/PortalView"; // Import the centralized client component

// This is the main page for logged-in users.
// It has been refactored to use a single client component, PortalView,
// to manage all client-side state and logic, including the deviceId.

export default async function HomePage() {
  const cookieStore = await cookies();
  const empId = cookieStore.get("emp_session")?.value;

  // If no session, redirect to the new login page within the portal route
  if (!empId) redirect("/portal/login");

  // Fetch all necessary data for the user on the server side.
  const employee = await db.employee.findUnique({
    where: { id: parseInt(empId) },
    include: {
      attendances: { orderBy: { checkIn: 'desc' }, take: 10 },
      // The ts-ignore is kept as it was in the original file.
      // @ts-ignore
      leaveRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  // If for any reason the employee is not found, clear session and redirect.
  if (!employee) redirect("/portal/login"); 

  // Determine if the employee is currently checked in.
  const lastAttendance = employee.attendances?.[0];
  const isCurrentlyIn = !!lastAttendance && !lastAttendance.checkOut;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 p-4 md:p-8 font-sans text-right pb-20" dir="rtl">
      <div className="max-w-xl mx-auto">

        {/* User Header (Server Component) */}
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

        {/* 
          This is the core of the fix. 
          Instead of complex conditional rendering and passing individual props,
          we delegate the entire client-side view to the PortalView component.
          PortalView is now the single source of truth for the deviceId.
          It fetches the deviceId once and passes it down to its children (PunchButtons, CopyIdSection, etc.).
          This eliminates the error where CopyIdSection was rendered without the required deviceId prop.
        */}
        <PortalView employee={employee} isCurrentlyIn={isCurrentlyIn} />

      </div>
    </div>
  );
}
