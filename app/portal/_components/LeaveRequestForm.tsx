
"use client";
import { useState } from "react";
import { requestLeave } from "../../actions/leaves";
import { toast } from "sonner";
import { CalendarRange, Send, X } from "lucide-react";

export default function LeaveRequestForm({ employeeId }: { employeeId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await requestLeave(employeeId, formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success);
      setIsOpen(false);
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-50 text-blue-600 border border-blue-100 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"
      >
        <CalendarRange size={20} /> طلب إجازة جديد
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-slate-50 p-5 border-b flex justify-between items-center">
              <h2 className="font-black text-slate-800">تفاصيل الإجازة</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500"><X /></button>
            </div>

            <form action={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">نوع الإجازة</label>
                <select name="type" className="w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none focus:border-blue-500">
                  <option value="سنوية">سنوية (رصيد)</option>
                  <option value="عارضة">عارضة (طوارئ)</option>
                  <option value="مرضية">مرضية</option>
                  <option value="بدون مرتب">بدون مرتب</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">من تاريخ</label>
                  <input type="date" name="startDate" required className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">إلى تاريخ</label>
                  <input type="date" name="endDate" required className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">السبب (اختياري)</label>
                <textarea name="reason" rows={2} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none resize-none" placeholder="اكتب سبب الإجازة هنا..."></textarea>
              </div>

              <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black mt-2 flex justify-center gap-2 items-center hover:bg-blue-700">
                <Send size={18} /> {loading ? "جاري الإرسال..." : "إرسال الطلب للمدير"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
