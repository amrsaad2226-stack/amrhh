
import Link from "next/link"; // 👈 أضفنا هذا
import db from "@/lib/db";
import { Users, MapPin, Clock, CheckCircle, CalendarDays, Building2, FileSpreadsheet, ListOrdered } from "lucide-react"; // 👈 أضفنا 3 أيقونات في الآخر
import AddEmployeeForm from "./AddEmployeeForm";
import ActivateDeviceBtn from "./ActivateDeviceBtn";
import LeaveActionButtons from "./LeaveActionButtons";

export default async function AdminDashboard() {
  const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  today.setHours(0, 0, 0, 0);

  const employees = await db.employee.findMany({ 
    include: { branch: true, attendances: { where: { date: today } } } 
  });
  const branches = await db.branch.findMany();
  const liveSessions = await db.attendance.findMany({
    where: { date: today, checkOut: null },
    include: { employee: true }
  });

  const pendingLeaves = await db.leaveRequest.findMany({
    where: { status: "Pending" },
    include: { employee: true },
    orderBy: { createdAt: 'asc' } 
  }) as any;
  
  const todaySignUps = employees.filter(e => e.attendances.length > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-slate-800">لوحة الإدارة</h1>
          <AddEmployeeForm branches={branches} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/admin/branches" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">إدارة الفروع</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">مواقع العمل والإحداثيات</p>
            </div>
          </Link>

          <Link href="/admin/reports" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-green-50 text-green-600 p-4 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">مسيرات الرواتب</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">الرواتب وحساب الإضافي</p>
            </div>
          </Link>

          <Link href="/admin/logs" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ListOrdered size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">سجل الحركات</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">تاريخ الحضور التفصيلي</p>
            </div>
          </Link>
        </div>

        {/* الكروت */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <Users className="text-blue-600 mb-2" />
              <p className="text-xs font-bold text-slate-400">إجمالي الموظفين</p>
              <p className="text-2xl font-black">{employees.length}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <Clock className="text-green-600 mb-2" />
              <p className="text-xs font-bold text-slate-400">حضور اليوم</p>
              <p className="text-2xl font-black">{todaySignUps}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <CheckCircle className="text-indigo-600 mb-2" />
              <p className="text-xs font-bold text-slate-400">نشط الآن</p>
              <p className="text-2xl font-black">{liveSessions.length}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <MapPin className="text-rose-600 mb-2" />
              <p className="text-xs font-bold text-slate-400">الفروع</p>
              <p className="text-2xl font-black">{branches.length}</p>
           </div>
        </div>

        {pendingLeaves.length > 0 && (
          <div className="mb-10 bg-amber-50 p-6 rounded-[2.5rem] border border-amber-200 shadow-sm animate-in fade-in zoom-in">
            <h2 className="font-black text-amber-700 mb-6 flex items-center gap-2 text-xl">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              لديك ({pendingLeaves.length}) طلبات إجازة تنتظر القرار!
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pendingLeaves.map((leave: any) => (
                <div key={leave.id} className="bg-white p-5 rounded-3xl shadow-sm border border-amber-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-black text-slate-800 text-lg">{leave.employee.name}</p>
                      <p className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg w-fit mt-1">{leave.type}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs font-bold text-slate-500 space-y-1">
                    <p>📅 من: {new Date(leave.startDate).toLocaleDateString('ar-EG')}</p>
                    <p>📅 إلى: {new Date(leave.endDate).toLocaleDateString('ar-EG')}</p>
                  </div>

                  {leave.reason && (
                    <p className="mt-3 text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg italic">
                      " {leave.reason} "
                    </p>
                  )}

                  <LeaveActionButtons leaveId={leave.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-10">
           <h2 className="font-bold mb-4 flex items-center gap-2 underline decoration-green-500">🔴 مباشر الآن في العمل</h2>
           <div className="flex flex-wrap gap-2">
              {liveSessions.map(s => (
                <div key={s.id} className="bg-white px-4 py-2 rounded-xl border border-green-200 text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {s.employee.name}
                </div>
              ))}
              {liveSessions.length === 0 && <p className="text-slate-400 text-sm italic">لا يوجد أحد مسجل حضور حالياً.</p>}
           </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
           <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                 <tr>
                    <th className="p-5">الموظف</th>
                    <th className="p-5">الجهاز</th>
                    <th className="p-5">الحالة اليوم</th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                 {employees.map(emp => (
                    <tr key={emp.id}>
                       <td className="p-5 font-bold">{emp.name}</td>
                       <td className="p-5">
                          {emp.deviceId ? <span className="text-[10px] bg-slate-100 p-2 rounded-lg font-mono">{emp.deviceId}</span> : <ActivateDeviceBtn employeeId={emp.id} />}
                       </td>
                       <td className="p-5">
                          {emp.attendances.length > 0 ? "✅ حضر" : "❌ غائب"}
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
