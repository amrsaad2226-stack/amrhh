// app/admin/reports/page.tsx
import { getPayrollData } from "@/app/actions/admin";
import { Download } from "lucide-react";

export default async function PayrollReportPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const payrollData = await getPayrollData(currentMonth, currentYear);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-right" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800">تقرير الرواتب الشهري</h1>
            <p className="text-slate-500 mt-1">
              عرض الرواتب المحسوبة للشهر الحالي ({currentMonth}/{currentYear})
            </p>
          </div>
          <button className="bg-blue-600 text-white flex items-center gap-2 px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all">
            <Download size={18} />
            تصدير كـ Excel
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-50 bg-slate-50/50">
                <th className="p-5 font-bold">الموظف</th>
                <th className="p-5 font-bold">أيام الحضور</th>
                <th className="p-5 font-bold">ساعات الإضافي</th>
                <th className="p-5 font-bold text-green-600">صافي الراتب المستحق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payrollData.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 font-black text-slate-800">{emp.name}</td>
                  <td className="p-5 font-bold text-slate-600">{emp.totalDays} يوم</td>
                  <td className="p-5 font-bold text-amber-600">{emp.totalOvertimeHours} ساعة</td>
                  <td className="p-5 font-black text-lg text-green-600">{emp.netSalary.toLocaleString()} جنيه</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}