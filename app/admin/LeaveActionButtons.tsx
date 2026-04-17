"use client";
import { useState } from "react";
import { updateLeaveStatus } from "@/app/actions/leaves";
import { toast } from "sonner";

export default function LeaveActionButtons({ leaveId }: { leaveId: number }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: "Approved" | "Rejected") => {
    setLoading(true);
    const res = await updateLeaveStatus(leaveId, status);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(status === "Approved" ? "✅ تمت الموافقة على الإجازة" : "❌ تم رفض الإجازة");
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2 mt-4 border-t border-amber-100 pt-4">
      <button 
        onClick={() => handleUpdate("Approved")} 
        disabled={loading}
        className="flex-1 bg-green-600 text-white py-2 rounded-xl text-xs font-black hover:bg-green-700 transition-all shadow-md shadow-green-100 active:scale-95"
      >
        موافقة
      </button>
      <button 
        onClick={() => handleUpdate("Rejected")} 
        disabled={loading}
        className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-black hover:bg-red-700 transition-all shadow-md shadow-red-100 active:scale-95"
      >
        رفض
      </button>
    </div>
  );
}