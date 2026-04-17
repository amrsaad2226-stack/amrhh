// app/admin/reports/page.tsx
import { getPayrollData } from "@/app/actions/admin";
import { DollarSign } from "lucide-react";
import PrintButton from "./PrintButton"; // 👈 استيراد الزر الجديد

export default async function PayrollReport({ searchParams }: any) {
  // انتظر الـ searchParams في Next.js 15
  const params = await searchParams; 
  const month = parseInt(params.month || new Date().getMonth() + 1);
  const year = parseInt(params.year || new Date().getFullYear());

  const data = await getPayrollData(month, year);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-right" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 no-print">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <DollarSign className="text-green-600" size={32} /> مسيرات الرواتب
            </h1>
            <p className="text-slate-500 mt-1">تقرير مستحقات الموظفين عن شهر {month} / {year}</p>
          </div>
          
          {/* 👈 استدعاء المكون الجديد هنا */}
          <PrintButton /> 
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-sm md:text-base">
                <th className="p-4 md:p-5 font-bold">اسم الموظف</th>
                <th className="p-4 md:p-5 font-bold text-center">أيام الحضور</th>
                <th className="p-4 md:p-5 font-bold text-center">إجمالي الإضافي</th>
                <th className="p-4 md:p-5 font-bold text-left">صافي المستحق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 md:p-5 font-black text-slate-800">{row.name}</td>
                  <td className="p-4 md:p-5 text-center font-bold text-slate-600">{row.totalDays} يوم</td>
                  <td className="p-4 md:p-5 text-center font-bold text-amber-600">{row.totalOvertimeHours} ساعة</td>
                  <td className="p-4 md:p-5 text-left font-black text-green-700 text-lg">
                    {row.netSalary.toLocaleString()} <span className="text-[10px]">ج.م</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-slate-400 text-[10px] no-print leading-relaxed">
          * يتم حساب الراتب بناءً على (أيام الحضور × الراتب اليومي) + (ساعات الإضافي × سعر الساعة × معامل الإضافي).
        </p>
      </div>

      {/* تنسيقات الطباعة */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .max-w-5xl { max-width: 100% !important; margin: 0 !important; }
          .rounded-[2.5rem] { border-radius: 0 !important; border: 1px solid #eee !important; box-shadow: none !important; }
          table { width: 100% !important; }
          th { background-color: #000 !important; color: #fff !important; -webkit-print-color-adjust: exact; }
        }
      `}} />
    </div>
  );
}
