'use client';
import { useState } from 'react';
import { updateLeaveStatus } from '@/app/actions/leaves';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

export default function LeaveActionButtons({ leaveId }: { leaveId: number }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: 'Approved' | 'Rejected') => {
    setLoading(true);
    const res = await updateLeaveStatus(leaveId, status);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(
        status === 'Approved'
          ? '✅ تمت الموافقة على الإجازة'
          : '❌ تم رفض الإجازة'
      );
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => handleUpdate('Approved')}
        disabled={loading}
        className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition-all active:scale-95 disabled:opacity-50"
        title="موافقة"
      >
        <Check size={18} />
      </button>
      <button
        onClick={() => handleUpdate('Rejected')}
        disabled={loading}
        className="bg-red-100 text-red-700 p-2 rounded-full hover:bg-red-200 transition-all active:scale-95 disabled:opacity-50"
        title="رفض"
      >
        <X size={18} />
      </button>
    </div>
  );
}
