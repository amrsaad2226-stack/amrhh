// app/admin/page.tsx
import db from "@/lib/db";
import { Users, MapPin, Clock, CheckCircle, DollarSign } from "lucide-react";
import AddEmployeeForm from "./AddEmployeeForm";
import ActivateDeviceBtn from "./ActivateDeviceBtn";
import Link from "next/link";

export default async function AdminDashboard() {
  const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  today.setHours(0, 0, 0, 0);

  // جلب البيانات
  const employees = await db.employee.findMany({ include: { branch: true, attendances: { where: { date: today } } } });
  const branches = await db.branch.findMany();
  
  // حسابات سريعة
  const totalEmployees = employees.length;
  const presentToday = employees.filter(e => e.attendances.length > 0).length;
  const lateToday = employees.filter(e => e.attendances.some(a => a.status === "Late")).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800">لوحة التحكم الإدارية</h1>
            <p className="text-slate-500 mt-1">متابعة الحضور والرواتب - {new Date().toLocaleDateString('ar-EG')}</p>
          </div>
          <div className="flex gap-2">
             <Link href="/admin/reports" className="bg-white text-slate-700 border border-slate-200 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                <DollarSign size={18} />
                عرض تقرير الرواتب
             </Link>
             <AddEmployeeForm branches={branches} />
          </div>
        </div>

        {/* كروت الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="إجمالي الموظفين" value={totalEmployees} icon={<Users />} color="blue" />
          <StatCard title="حضور اليوم" value={presentToday} icon={<CheckCircle color="green" />} color="green" />
          <StatCard title="تأخيرات اليوم" value={lateToday} icon={<Clock color="red" />} color="red" />
          <StatCard title="الفروع النشطة" value={branches.length} icon={<MapPin />} color="amber" />
        </div>

        {/* جدول الموظفين وحالة أجهزتهم */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-700 text-lg">قائمة الموظفين وتفعيل الأجهزة</h2>
          </div>
          <table className="w-full text-right">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-50">
                <th className="p-5 font-bold">الموظف</th>
                <th className="p-5 font-bold">الفرع</th>
                <th className="p-5 font-bold">حالة الجهاز</th>
                <th className="p-5 font-bold">حالة اليوم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="font-black text-slate-800">{emp.name}</div>
                    <div className="text-xs text-slate-400">كود: {emp.code}</div>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {emp.isAnyBranch ? "كل الفروع" : emp.branch?.name}
                    </span>
                  </td>
                  <td className="p-5">
                    {emp.deviceId ? (
                      <div className="text-[10px] bg-green-50 text-green-600 p-2 rounded-xl border border-green-100 w-fit font-mono">
                        مفعل: {emp.deviceId.substring(0, 8)}...
                      </div>
                    ) : (
                      <ActivateDeviceBtn employeeId={emp.id} />
                    )}
                  </td>
                  <td className="p-5">
                    {emp.attendances.length > 0 ? (
                      <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1.5 rounded-full">حضر ✅</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 text-xs font-bold px-3 py-1.5 rounded-full">لم يحضر</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// مكون فرعي للكروت
function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
      <div className={`${colors[color]} p-4 rounded-2xl`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-xs font-bold">{title}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}