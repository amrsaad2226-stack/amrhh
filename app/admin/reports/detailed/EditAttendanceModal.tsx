"use client";
import React, { useState } from 'react';
import { updateAttendanceAction } from './actions';
import { toast } from 'sonner';

// Define the type for the record prop directly
interface Transaction {
  id: number;
  checkIn: string | Date | null;
  checkOut: string | Date | null;
  notes: string | null;
  employee: {
    name: string;
  };
  // Add other properties from the record object that you use
  type: 'ATTENDANCE' | 'CASH' | 'OPENING_BALANCE'; 
}

interface EditModalProps {
  record: Transaction;
  onClose: () => void;
}

// Timezone helper function as you suggested
const formatLocalDateTime = (date: string | Date | null) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return ''; // Return empty if date is invalid
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const EditAttendanceModal: React.FC<EditModalProps> = ({ record, onClose }) => {
  const [checkIn, setCheckIn] = useState(formatLocalDateTime(record.checkIn));
  const [checkOut, setCheckOut] = useState(formatLocalDateTime(record.checkOut));
  const [notes, setNotes] = useState(record.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('جاري تعديل سجل الحضور...');

    try {
      const result = await updateAttendanceAction({
        id: record.id,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        notes: notes,
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
          تعديل سجل الحضور لـ {record.employee.name}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">وقت الحضور</label>
              <input
                type="datetime-local"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">وقت الانصراف</label>
              <input
                type="datetime-local"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
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

export default EditAttendanceModal;