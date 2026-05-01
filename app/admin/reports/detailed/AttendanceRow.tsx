// app/admin/reports/detailed/AttendanceRow.tsx
"use client";

import { useState } from "react";
import { Edit, Trash2, X, Save, Clock } from "lucide-react";
import { toast } from "sonner";
import { deleteAttendanceRecord, updateAttendanceRecord } from "@/app/actions/reports";

// دوال تنسيق العرض
const formatTime = (dateString: string | null) => {
  if (!dateString) return "--:--";
  return new Date(dateString).toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' });
}
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo', day: '2-digit', month: '2-digit', year: 'numeric' });
}

// دالة مساعدة لتحويل الوقت من ISO إلى صيغة Input HH:mm
const getInputTime = (dateString: string | null) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function AttendanceRow({ record, onRefresh }: { record: any, onRefresh: () => void }) {
  const[isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [checkInStr, setCheckInStr] = useState(getInputTime(record.checkIn));
  const[checkOutStr, setCheckOutStr] = useState(getInputTime(record.checkOut));

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف حركة الموظف ${record.empName} ليوم ${formatDate(record.date)}؟`)) return;
    
    setLoading(true);
    const res = await deleteAttendanceRecord(record.id);
    if (res.success) {
      toast.success("تم حذف السجل بنجاح");
      onRefresh(); // تحديث الجدول
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateAttendanceRecord(record.id, checkInStr || null, checkOutStr || null);
    
    if (res.success) {
      toast.success("تم التعديل بنجاح، تم إعادة حساب العجز والإضافي تلقائياً.");
      setIsEditOpen(false);
      onRefresh(); // تحديث الجدول
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  return (
    <>
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="p-4">{record.empName}</td>
        <td className="p-4 text-center font-mono text-xs">{formatDate(record.date)}</td>
        <td className="p-4 text-center font-bold text-blue-600">{formatTime(record.checkIn)}</td>
        <td className="p-4 text-center font-bold text-indigo-600">{formatTime(record.checkOut)}</td>
        <td className="p-4 text-center bg-slate-50 dark:bg-slate-950 text-slate-500">{record.defaultHrs}</td>
        <td className="p-4 text-center text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">{record.actualHrs}</td>
        <td className="p-4 text-center text-red-500 bg-red-50/50 dark:bg-red-900/10">{Number(record.deficit) > 0 ? record.deficit : "-"}</td>
        <td className="p-4 text-center text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/10">{Number(record.overtime) > 0 ? record.overtime : "-"}</td>
        <td className="p-4 text-center text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10 font-black text-base">{record.balance} ج</td>
        <td className="p-4 flex gap-2 justify-center">
          <button onClick={() => setIsEditOpen(true)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
            <Edit size={16} />
          </button>
          <button onClick={handleDelete} disabled={loading} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">
            <Trash2 size={16} />
          </button>
        </td>
      </tr>

      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 text-right" dir="rtl">
            <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b dark:border-slate-800 flex justify-between items-center">
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-red-500"><X /></button>
              <h2 className="text-lg font-black text-slate-800 dark:text-white">تعديل الحركة ({formatDate(record.date)})</h2>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="text-sm font-bold text-slate-500 mb-4 text-center">الموظف: <span className="text-blue-600">{record.empName}</span></div>
              
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-2"><Clock size={14}/> وقت الدخول</label>
                <input 
                  type="time" 
                  value={checkInStr} 
                  onChange={(e) => setCheckInStr(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border rounded-xl font-bold outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-2"><Clock size={14}/> وقت الانصراف</label>
                <input 
                  type="time" 
                  value={checkOutStr} 
                  onChange={(e) => setCheckOutStr(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border rounded-xl font-bold outline-none focus:border-blue-500" 
                />
              </div>

              <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg">
                {loading ? "جاري الحفظ..." : <><Save size={20}/> حفظ التعديلات وإعادة الحساب</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
