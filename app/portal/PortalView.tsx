"use client";
import { useEffect, useState } from 'react';
import { getDeviceId } from '@/lib/device';
import PunchButtons from "./PunchButtons";
import CopyIdSection from "./CopyIdSection";
import { Attendance } from '@prisma/client';

interface PortalViewProps {
  employee: {
    code: string;
    name: string;
    lastSession: Attendance | null;
  };
}

export default function PortalView({ employee }: PortalViewProps) {
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    // Fetch the device ID on the client-side
    const id = getDeviceId();
    setDeviceId(id);
  }, []);

  return (
    <div className="w-full max-w-sm">
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-3xl mb-4 text-center">
        <h1 className="font-black text-2xl text-slate-800 dark:text-white">مرحباً, {employee.name}</h1>
        <p className="font-bold text-slate-500 dark:text-slate-400 mt-1">رمز الموظف: {employee.code}</p>
      </div>

      <PunchButtons 
        employeeCode={employee.code} 
        isCurrentlyIn={!!employee.lastSession && !employee.lastSession.checkOut}
      />

      <div className="my-4 border-t border-dashed border-slate-300 dark:border-slate-700"></div>
      
      <CopyIdSection deviceId={deviceId} />
    </div>
  );
}
