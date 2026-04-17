
// app/admin/logs/page.tsx
import db from "@/lib/db";
import { Table, ArrowDownToLine, MapPin } from "lucide-react";

export default async function AttendanceLogs() {
  const logs = await db.attendance.findMany({
    orderBy: { checkIn: 'desc' },
    include: { employee: true },
    take: 100 // آخر 100 حركة
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
             <Table className="text-blue-600" /> سجل الحركات التفصيلي
          </h1>
          <button className="bg-white border p-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-sm">
             <ArrowDownToLine size={18} /> تصدير السجل
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-black">
              <tr>
                <th className="p-5">الموظف</th>
                <th className="p-5">التاريخ</th>
                <th className="p-5">حضور</th>
                <th className="p-5">انصراف</th>
                <th className="p-5">المدة</th>
                <th className="p-5">الموقع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-5 font-bold text-slate-700">{log.employee.name}</td>
                  <td className="p-5 text-slate-500 font-medium">{log.date.toLocaleDateString('ar-EG')}</td>
                  <td className="p-5"><span className="text-green-600 font-bold">{log.checkIn?.toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span></td>
                  <td className="p-5"><span className="text-red-600 font-bold">{log.checkOut?.toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'}) || "--:--"}</span></td>
                  <td className="p-5 font-black text-blue-600">{log.duration?.toFixed(1)} س</td>
                  <td className="p-5">
                    <a href={`https://www.google.com/maps?q=${log.latIn},${log.lngIn}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                      <MapPin size={14} /> الخريطة
                    </a>
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
