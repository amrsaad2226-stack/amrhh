'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createAttendanceAction } from './actions';

export default function AddAttendanceModal({
  employees,
  onClose,
}: {
  employees: any[];
  onClose: () => void;
}) {
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!employeeId || !date || !checkIn || !checkOut) {
      return toast.error('يرجى ملء جميع الحقول');
    }

    setLoading(true);

    try {
      const result = await createAttendanceAction({
        employeeId: Number(employeeId),
        date,
        checkIn,
        checkOut,
        notes,
      });

      if (result.success) {
        toast.success('تم إضافة الحركة بنجاح');
        onClose();
      } else {
        toast.error(result.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">إضافة حركة حضور</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-2">
          <label>الموظف</label>

          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full h-12 rounded-2xl border px-4"
          >
            <option value="">اختر الموظف</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label>التاريخ</label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 rounded-2xl border px-4"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label>وقت الحضور</label>

            <input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full h-12 rounded-2xl border px-4"
            />
          </div>

          <div className="space-y-2">
            <label>وقت الانصراف</label>

            <input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full h-12 rounded-2xl border px-4"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label>ملاحظات</label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-2xl border px-4 py-3"
            rows={4}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            'إضافة الحركة'
          )}
        </button>
      </div>
    </div>
  );
}