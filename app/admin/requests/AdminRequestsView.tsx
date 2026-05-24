"use client";
import { useTransition } from "react";
// تأكد من استيراد دالة تحديث الحالة
import { updateRequestStatus } from "@/app/actions/cash"; 

export default function AdminRequestsView({ pendingRequests }: { pendingRequests: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (id: number, status: "Approved" | "Rejected") => {
    startTransition(async () => {
      // استخدام as any لتجاوز خطأ الأنواع كما طلبت
      await updateRequestStatus(id, status.toUpperCase() as any);
    });
  };

  if (pendingRequests.length === 0) {
    return <div className="p-6 bg-white rounded-lg shadow text-center text-slate-500">لا توجد طلبات سلف جديدة.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <ul className="divide-y divide-slate-100">
        {pendingRequests.map((req) => (
          <li key={req.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">{req.employee.name}</p>
              <p className="text-sm text-slate-600">
                يطلب سلفة بقيمة <span className="font-bold">{req.amount}</span> جنيه
              </p>
              {req.reason && <p className="text-xs text-slate-400 mt-1">السبب: {req.reason}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleAction(req.id, "Approved")}
                disabled={isPending}
                className="px-4 py-2 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-slate-300"
              >
                موافقة
              </button>
              <button 
                onClick={() => handleAction(req.id, "Rejected")}
                disabled={isPending}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-slate-300"
              >
                رفض
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
