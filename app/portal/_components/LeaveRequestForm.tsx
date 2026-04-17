
'use client';

import { useState } from 'react';
// الخطوة 2: تحديث الاستيراد إلى المسار النسبي الصحيح
import { requestLeave } from '../../actions/leaves';
import { Calendar, Send } from 'lucide-react';
import { toast } from 'sonner';

export function LeaveRequestForm({ employeeId }: { employeeId: number }) {

  // استخدام Server Action مباشرة مع useFormState 
  const clientAction = async (formData: FormData) => {
    const tid = toast.loading("جاري إرسال الطلب...");

    const result = await requestLeave(employeeId, formData);

    if (result?.error) {
      toast.error(result.error, { id: tid });
    } else {
      toast.success(result.success, { id: tid });
      // إعادة تعيين الفورم عند النجاح
      const form = document.getElementById('leave-form') as HTMLFormElement;
      form.reset();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border p-6 md:p-8">
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
        <Calendar size={22} className="text-blue-500" />
        طلب إجازة جديد
      </h3>

      <form id="leave-form" action={clientAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-bold text-slate-600 mb-2">تاريخ البدء</label>
            <input type="date" id="startDate" name="startDate" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-bold text-slate-600 mb-2">تاريخ الانتهاء</label>
            <input type="date" id="endDate" name="endDate" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-bold text-slate-600 mb-2">نوع الإجازة</label>
          <select id="type" name="type" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500 appearance-none">
            <option value="">اختر النوع...</option>
            <option value="Annual">سنوية</option>
            <option value="Sick">مرضية</option>
            <option value="Emergency">طارئة</option>
            <option value="Unpaid">بدون أجر</option>
          </select>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-bold text-slate-600 mb-2">السبب (اختياري)</label>
          <textarea id="reason" name="reason" rows={3} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" placeholder="اذكر سبب طلب الإجازة..."></textarea>
        </div>

        <div>
            <button
               type="submit"
               className={`w-full px-8 py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 shadow-blue-100`}
             >
               <Send size={18} />
               إرسال الطلب
             </button>
        </div>
      </form>
    </div>
  );
}
