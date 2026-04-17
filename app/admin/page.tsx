// app/admin/page.tsx
import db from "@/lib/db";
import AddEmployeeForm from "./AddEmployeeForm";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import ActivateDeviceBtn from "./ActivateDeviceBtn";

export default async function AdminDashboard() {
  // جلب تاريخ اليوم
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // جلب الفروع الحقيقية من الداتا بيز
  const branches = await db.branch.findMany({
    select: { id: true, name: true }
  });

  // جلب كل الموظفين مع سجلات حضورهم لليوم فقط
  const employees = await db.employee.findMany({
    include: {
      attendances: {
        where: { date: today }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 border-r-4 border-blue-600 pr-4">لوحة تحكم المدير 🖥️</h1>
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
                <th scope="col" className="p-5">وقت الحضور</th>
                <th scope="col" className="p-5">بصمة الجهاز</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const attendance = emp.attendances[0];
                return (
                  <tr key={emp.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="p-5 font-bold text-gray-900 whitespace-nowrap">
                      {emp.name}
                      <p className="font-normal text-gray-400 text-xs">{emp.code} | {emp.department}</p>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        attendance ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {attendance ? "حضر" : "غائب"}
                      </span>
                    </td>
                    <td className="p-5 font-mono font-bold text-blue-600">
                      {attendance?.checkIn ? new Date(attendance.checkIn).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                    </td>
                    {/* استبدل الجزء الخاص بعرض البصمة بهذا الكود 👇 */}
                    <td className="p-5">
                      {emp.deviceId ? (
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-100 p-2 rounded-lg max-w-[150px] truncate border border-slate-200">
                          <MapPin size={12} className="text-green-500" /> {emp.deviceId}
                        </div>
                      ) : (
                        // هنا نضع زر التفعيل إذا كان الموظف ليس لديه بصمة مسجلة
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