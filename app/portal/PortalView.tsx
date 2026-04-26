"use client";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import PunchButtons from "./PunchButtons";
import LeaveRequestForm from "./_components/LeaveRequestForm";
import SalaryDashboard from "./_components/SalaryDashboard";

// Updated interface for the new props
interface PortalViewProps {
  employee: any;
  isCurrentlyIn: boolean;
  totalEarnings: number;
  totalHours: number;
  monthlyTarget: number;
}

export default function PortalView({ 
  employee, 
  isCurrentlyIn, 
  totalEarnings, 
  totalHours, 
  monthlyTarget 
}: PortalViewProps) {
  
  const [deviceId, setDeviceId] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    setIsInitializing(false);
  }, []);

  // Loading spinner during initialization
  if (isInitializing) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Device activation pending view
  if (!employee.deviceId) {
    return (
      <div className="p-6 bg-amber-50 dark:bg-amber-500/10 rounded-[2rem] text-center border-2 border-dashed border-amber-200 dark:border-amber-500/20">
        <h2 className="text-xl font-bold text-amber-700 dark:text-amber-300 mb-2">في انتظار التفعيل</h2>
        <p className="text-sm text-amber-600 dark:text-amber-300/80 mb-4">أرسل الكود التالي للمدير لتفعيل جهازك:</p>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl font-mono font-bold text-lg select-all text-slate-700 dark:text-white">
          {deviceId ? deviceId : "جاري تحميل بصمة جهازك..."}
        </div>
      </div>
    );
  }

  // Device authorization check
  const isDeviceAuthorized = 
    employee.deviceId.trim().toLowerCase() === deviceId.trim().toLowerCase();

  // Unauthorized device view
  if (!isDeviceAuthorized) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-500/10 rounded-[2rem] text-center border-2 border-dashed border-red-200 dark:border-red-500/20">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">جهاز غير مصرح به</h2>
        <p className="text-sm text-red-600 dark:text-red-300/80">
          هذا الجهاز غير مسجل لحسابك. يرجى الدخول من جهازك المعتمد.
        </p>
      </div>
    );
  }

  // --- Main Authorized View ---
  return (
    <div className="space-y-6">
      {/* Pass the new, accurate data to the dashboard */}
      <SalaryDashboard 
        totalEarnings={totalEarnings} 
        totalHours={totalHours}
        monthlyTarget={monthlyTarget}
      />

      {/* Primary Actions: Punch In/Out */}
      <PunchButtons employeeCode={employee.code} isCurrentlyIn={isCurrentlyIn} />

      {/* Secondary Actions & Info */}
      <div className="mt-8">
         <LeaveRequestForm employeeId={employee.id} />
      </div>
      
    </div>
  );
}
