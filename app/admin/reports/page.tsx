// app/admin/reports/page.tsx
import { getPayrollData } from "@/app/actions/admin";
import { DollarSign, Printer, Calendar } from "lucide-react";

export default async function PayrollReport({ searchParams }: any) {
  const month = parseInt(searchParams.month || new Date().getMonth() + 1);
  const year = parseInt(searchParams.year || new Date().getFullYear());

  const data = await getPayrollData(month, year);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-right" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        {/* Header والبحث */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 no-print">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <DollarSign className="text-green-600" size={32} /> مسيرات الرواتب
            </h1>
            <p className="text-slate-500 mt-1">تقرير مستحقات الموظفين عن شهر {month} / {year}</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()} 
              className="bg-white text-slate-700 px-5 py-3 rounded-2xl font-bold border shadow-sm flex items-center gap-2 hover:bg-slate-50"
            >
              <Printer size={18} /> طباعة التقرير
            </button>
          </div>
        </div>

        {/* جدول الرواتب */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-5 font-bold">اسم الموظف</th>
                <th className="p-5 font-bold text-center">أيام الحضور</th>
                <th className="p-5 font-bold text-center">إجمالي الإضافي</th>
                <th className="p-5 font-bold text-left">صافي المستحق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-black text-slate-800">{row.name}</td>
                  <td className="p-5 text-center font-bold text-slate-600">{row.totalDays} يوم</td>
                  <td className="p-5 text-center font-bold text-amber-600">{row.totalOvertimeHours} ساعة</td>
                  <td className="p-5 text-left font-black text-green-700 text-lg">
                    {row.netSalary.toLocaleString()} <span className="text-[10px]">ج.م</span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-400 font-bold">لا توجد بيانات لهذا الشهر</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-slate-400 text-xs no-print">
          * يتم حساب الراتب بناءً على (أيام الحضور × الراتب اليومي) + (ساعات الإضافي × سعر الساعة × معامل الإضافي).
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; padding: 0; }
          .max-w-5xl { max-width: 100%; }
          .rounded-[2.5rem] { border-radius: 0; border: none; box-shadow: none; }
        }
      `}} />
    </div>
  );
}
