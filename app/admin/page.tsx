// app/admin/page.tsx
import db from "@/lib/db";
import AddEmployeeForm from "./AddEmployeeForm";
import Link from "next/link";
import { Building2, MapPin, Clock, LogIn, LogOut } from "lucide-react";
import ActivateDeviceBtn from "./ActivateDeviceBtn";

export default async function AdminDashboard() {
  // -- TIMEZONE FIX: Use Cairo time to define "today" --
  const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  today.setHours(0, 0, 0, 0);
  
  const branches = await db.branch.findMany({
    select: { id: true, name: true }
  });

  const employees = await db.employee.findMany({
    include: {
      attendances: {
        where: { date: today },
        orderBy: { checkIn: 'asc' } // Order sessions by check-in time
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 border-r-4 border-blue-600 pr-4">متابعة الموظفين 👨‍💼</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/branches" className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
              <Building2 size={20} />
              إدارة الفروع
            </Link>
            <AddEmployeeForm branches={branches} />
          </div>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
          <table className="min-w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="p-5">الموظف</th>
                <th scope="col" className="p-5">حالة اليوم</th>
                <th scope="col" className="p-5">إجمالي الساعات</th>
                <th scope="col" className="p-5">جلسات اليوم</th>
                <th scope="col" className="p-5">بصمة الجهاز</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                // New multi-session logic
                const totalDuration = emp.attendances.reduce((sum, att) => sum + (att.duration || 0), 0);
                const activeSession = emp.attendances.find(att => att.checkIn && !att.checkOut);
                const sessionsCount = emp.attendances.length;

                let statusText = "غائب";
                let statusColor = "bg-red-100 text-red-700";
                if (activeSession) {
                  statusText = "حاضر حالياً";
                  statusColor = "bg-yellow-100 text-yellow-700";
                } else if (sessionsCount > 0) {
                  statusText = "أنهى عمله";
                  statusColor = "bg-green-100 text-green-700";
                }

                return (
                  <tr key={emp.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="p-5 font-bold text-gray-900 whitespace-nowrap">
                      {emp.name}
                      <p className="font-normal text-gray-400 text-xs mt-1">{emp.code} | {emp.department}</p>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="p-5 font-mono font-bold text-blue-600 text-base">
                      {totalDuration.toFixed(1)} س
                    </td>
                    <td className="p-5">
                      {sessionsCount > 0 ? (
                        <div className="flex flex-col gap-2">
                          {emp.attendances.map(att => (
                            <div key={att.id} className="flex items-center gap-2 font-mono text-xs">
                               <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-md"><LogIn size={12}/>{att.checkIn ? new Date(att.checkIn).toLocaleTimeString('ar-EG', {timeZone: 'Africa/Cairo', hour: '2-digit', minute:'2-digit'}) : "--"}</span>
                               <span>-&gt;</span>
                               <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2 py-1 rounded-md"><LogOut size={12}/>{att.checkOut ? new Date(att.checkOut).toLocaleTimeString('ar-EG', {timeZone: 'Africa/Cairo', hour: '2-digit', minute:'2-digit'}) : "..."}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="p-5">
                      {emp.deviceId ? (
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-100 p-2 rounded-lg max-w-[150px] truncate border border-slate-200">
                          <MapPin size={12} className="text-green-500" /> {emp.deviceId}
                        </div>
                      ) : (
                        <ActivateDeviceBtn employeeId={emp.id} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
