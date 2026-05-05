// app/admin/page.tsx
import Link from "next/link"; 
import db from "@/lib/db";
import { Users, MapPin, Clock, CheckCircle, Building2, FileSpreadsheet, ListOrdered, DollarSign, UserMinus, UserPlus } from "lucide-react"; 
import AddEmployeeForm from "./AddEmployeeForm";
import LeaveActionButtons from "./LeaveActionButtons";
import EmployeeRow from "./EmployeeRow";

export default async function AdminDashboard() {
  
  const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  today.setHours(0, 0, 0, 0);

  const employees = await db.employee.findMany({ 
    include: { branch: true, attendances: { where: { date: today } } },
    orderBy: { createdAt: 'desc'}
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

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Link href="/admin/branches" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">إدارة الفروع</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">مواقع العمل</p>
            </div>
          </Link>

          <Link href="/admin/reports" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-green-50 text-green-600 p-4 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">مسيرات الرواتب</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">الرواتب والإضافي</p>
            </div>
          </Link>

          <Link href="/admin/reports/detailed" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ListOrdered size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">سجل الحركات</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">تاريخ الحضور</p>
            </div>
          </Link>
          
          <Link href="/admin/cash" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-yellow-50 text-yellow-600 p-4 rounded-2xl group-hover:bg-yellow-600 group-hover:text-white transition-colors">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">النقدية والعهد</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">إدارة السلف والمصروفات</p>
            </div>
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><p className="text-sm text-slate-400 font-bold">إجمالي الموظفين</p><p className="text-3xl font-black text-slate-800 mt-1">{employees.length}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><p className="text-sm text-slate-400 font-bold">حضور اليوم</p><p className="text-3xl font-black text-green-600 mt-1">{todaySignUps}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><p className="text-sm text-slate-400 font-bold">جلسات حالية</p><p className="text-3xl font-black text-blue-600 mt-1">{liveSessions.length}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"><p className="text-sm text-slate-400 font-bold">إجازات معلقة</p><p className="text-3xl font-black text-yellow-600 mt-1">{pendingLeaves.length}</p></div>
        </div>

        {/* Pending Leaves */}
        {pendingLeaves.length > 0 && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 mb-10">
                <h2 className="font-black text-slate-800 text-2xl mb-6">طلبات الإجازة المعلقة</h2>
                <div className="space-y-4">
                    {pendingLeaves.map((leave:any) => (
                        <div key={leave.id} className="bg-slate-50 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <p className="font-bold text-slate-800">{leave.employee.name}</p>
                                <p className="text-sm text-slate-500">
                                    من: {new Date(leave.startDate).toLocaleDateString('ar-EG')} إلى: {new Date(leave.endDate).toLocaleDateString('ar-EG')} ({leave.type})
                                </p>
                                {leave.reason && <p className="text-xs italic text-slate-400 mt-1">السبب: {leave.reason}</p>}
                            </div>
                           <LeaveActionButtons leaveId={leave.id} />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Live Sessions */}
        {liveSessions.length > 0 && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 mb-10">
            <h2 className="font-black text-slate-800 text-2xl mb-6 flex items-center gap-3"><Clock className="text-blue-500" /> جلسات عمل مباشرة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {liveSessions.map(session => (
                <div key={session.id} className="text-center bg-blue-50 p-4 rounded-2xl">
                  <p className="font-bold text-sm text-blue-800">{session.employee.name}</p>
                  <p className="text-xs text-blue-600">بدأ: {session.checkIn ? new Date(session.checkIn).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'}) : '---'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employees Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="font-black text-slate-800 text-2xl flex items-center gap-3"><Users /> قائمة الموظفين وحضور اليوم</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-sm font-normal">
                <tr>
                  <th className="p-4 font-semibold">الموظف</th>
                  <th className="p-4 font-semibold">بصمة الدخول</th>
                  <th className="p-4 font-semibold">بصمة الخروج</th>
                  <th className="p-4 font-semibold">مدة العمل</th>
                  <th className="p-4 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(employee => (
                  <EmployeeRow key={employee.id} employee={employee} branches={branches} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
