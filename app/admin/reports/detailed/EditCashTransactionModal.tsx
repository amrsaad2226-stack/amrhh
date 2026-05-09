"use client";
import React, { useState } from 'react';
import { updateCashTransactionAction } from './actions';
import { toast } from 'sonner';

// Define the type for the record prop directly
interface Transaction {
    id: number;
    amount: number;
    note: string | null;
    date: string | Date;
    employee: {
        name: string;
    };
    type: 'CASH';
}

interface EditModalProps {
  record: Transaction;
  onClose: () => void;
}

// Timezone helper function
const formatLocalDateTime = (date: string | Date | null) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const EditCashTransactionModal: React.FC<EditModalProps> = ({ record, onClose }) => {
  const [amount, setAmount] = useState(record.amount || 0);
  const [notes, setNotes] = useState(record.note || '');
  const [date, setDate] = useState(formatLocalDateTime(record.date));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('جاري تعديل السلفة النقدية...');

    try {
      const result = await updateCashTransactionAction({
        id: record.id,
        amount: amount,
        notes: notes,
        date: new Date(date)
      });

      if (result.success) {
        toast.success(result.success, { id: toastId });
        setLoading(false);
        onClose();
      } else {
        toast.error(result.error || 'حدث خطأ غير متوقع', { id: toastId });
        setLoading(false);
      }
    } catch (error) {
      toast.error('فشل في تعديل السجل', { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
          تعديل سلفة لـ {record.employee.name}
        </h3>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">المبلغ</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">التاريخ</label>
                     <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    />
                </div>
            </div>
           
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">ملاحظات</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                ></textarea>
            </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold hover:bg-slate-200 dark:hover:bg-slate-600">إلغاء</button>
            <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed">
               {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCashTransactionModal;
