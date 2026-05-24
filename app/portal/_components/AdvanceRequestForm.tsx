
"use client";
import { useState } from 'react';
import { DollarSign, Send, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { requestCashAdvance } from '@/app/actions/cash'; // Make sure this action exists

export default function AdvanceRequestForm({ employeeId }: { employeeId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const result = await requestCashAdvance(formData);
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
    } else {
      toast.error(result.message);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-lg font-black text-slate-700 dark:text-white"
      >
        <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-orange-500"/>
            طلب سلفة
        </div>
        <ChevronDown size={24} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <form action={handleSubmit}>
          <input type="hidden" name="employeeId" value={employeeId} />
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <label htmlFor="amount" className="text-sm font-bold text-slate-600 dark:text-slate-300 block mb-2">المبلغ المطلوب</label>
              <input 
                type="number"
                id="amount"
                name="amount"
                required
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="مثال: 500"
              />
            </div>
            <div>
                <label htmlFor="reason" className="text-sm font-bold text-slate-600 dark:text-slate-300 block mb-2">السبب (اختياري)</label>
                <textarea 
                    id="reason"
                    name="reason"
                    rows={3}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="مثال: ظرف شخصي طارئ"
                />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-orange-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <Send size={16} />}
                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
