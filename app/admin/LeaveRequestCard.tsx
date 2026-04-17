
"use client";
import { updateLeaveStatus } from "@/app/actions/leaves";
import { toast } from "sonner";
import type { LeaveRequest, Employee } from "@prisma/client";

// نُعرف نوع البيانات المستلمة لضمان التوافق
type LeaveWithEmployee = LeaveRequest & { employee: Employee };

export default function LeaveRequestCard({ leave }: { leave: LeaveWithEmployee }) {

  const handleUpdate = async (status: "Approved" | "Rejected") => {
    const actionText = status === "Approved" ? "الموافقة" : "الرفض";
    const tid = toast.loading(`جاري ${actionText} على الطلب...`);
    
    const result = await updateLeaveStatus(leave.id, status);

    if (result.error) {
      toast.error(result.error, { id: tid });
    } else {
      toast.success(`تم ${actionText} بنجاح`, { id: tid });
      // لا حاجة لعمل ريلود، revalidatePath ستقوم باللازم
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex justify-between items-center transition-all hover:shadow-lg hover:border-amber-200">
      <div>
        <p className="font-black text-slate-800">{leave.employee.name}</p>
        <p className="text-xs text-amber-800 font-bold">
          طلب <span className="text-black">{leave.type}</span> من {leave.startDate.toLocaleDateString('ar-EG-u-nu-latn')} إلى {leave.endDate.toLocaleDateString('ar-EG-u-nu-latn')}
        </p>
        {leave.reason && <p className="text-xs text-slate-500 mt-1">السبب: {leave.reason}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleUpdate("Approved")} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-colors">موافقة</button>
        <button onClick={() => handleUpdate("Rejected")} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-colors">رفض</button>
      </div>
    </div>
  );
}
