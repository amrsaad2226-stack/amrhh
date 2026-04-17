'use client';

import { useState } from 'react';
import { requestLeave } from '@/app/actions/leaves';
import { Calendar, Send } from 'lucide-react';

export function LeaveRequestForm({ employeeId }: { employeeId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const data = {
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      type: formData.get('type') as string,
      reason: formData.get('reason') as string,
    };

    if (!data.startDate || !data.endDate || !data.type) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      setLoading(false);
      return;
    }

    try {
      await requestLeave(employeeId, data);
      setSuccess(true);
      (event.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError('حدث خطأ أثناء إرسال الطلب.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border p-6 md:p-8">
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
        <Calendar size={22} className="text-blue-500" />
        طلب إجازة جديد
      </h3>

      {success && (
        <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-2xl mb-4 text-center font-bold">
          تم إرسال طلبك بنجاح!
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-2xl mb-4 text-center font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
            <option value="Vacation">سنوية</option>
            <option value="Sick">مرضية</option>
            <option value="Emergency">طارئة</option>
          </select>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-bold text-slate-600 mb-2">السبب (اختياري)</label>
          <textarea id="reason" name="reason" rows={3} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500" placeholder="اذكر سبب طلب الإجازة..."></textarea>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-8 py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-white ${
              loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
            }`}
          >
            <Send size={18} />
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
      </form>
    </div>
  );
}
