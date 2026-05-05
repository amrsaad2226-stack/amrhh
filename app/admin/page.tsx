// app/admin/page.tsx
import Link from "next/link"; 
import db from "@/lib/db";
import { Users, MapPin, Clock, CheckCircle, Building2, FileSpreadsheet, ListOrdered, DollarSign } from "lucide-react"; 
import AddEmployeeForm from "./AddEmployeeForm";
import LeaveActionButtons from "./LeaveActionButtons";
import EmployeeRow from "./EmployeeRow";
import CashView from "./CashView"; // 👈 تم إرجاع المسار إلى حالته الصحيحة

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
  
  const cashTransactions = await db.cashTransaction.findMany({
    include: { employee: true },
    orderBy: { createdAt: 'desc' }
  });

  const todaySignUps = employees.filter(e => e.attendances.length > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-slate-800">لوحة الإدارة</h1>
          <AddEmployeeForm branches={branches} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Link href="/admin/branches" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">إدارة الفروع</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">مواقع العمل</p>
            </div>
          </Link>

          <Link href="/admin/reports" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-green-50 text-green-600 p-4 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">مسيرات الرواتب</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">الرواتب والإضافي</p>
            </div>
          </Link>

          <Link href="/admin/reports/detailed" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ListOrdered size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">سجل الحركات</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">تاريخ الحضور</p>
            </div>
          </Link>
          
          <Link href="#cash-section" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all group flex items-center gap-4 active:scale-95">
            <div className="bg-yellow-50 text-yellow-600 p-4 rounded-2xl group-hover:bg-yellow-600 group-hover:text-white transition-colors">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">النقدية والعهد</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">إدارة السلف والمصروفات</p>
            </div>
          </Link>
        </div>

        {/* ... Rest of the component ... */}

        <div id="cash-section">
          <CashView transactions={cashTransactions} employees={employees} />
        </div>

        {/* ... Rest of the component ... */}

      </div>
    </div>
  );
}
