"use client";
import { useTransition } from "react";
// تأكد من استيراد دالة تحديث الحالة
import { updateRequestStatus } from "@/app/actions/cash"; 

export default function AdminRequestsView({ pendingRequests }: { pendingRequests: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (id: number, status: "Approved" | "Rejected") => {
    startTransition(async () => {
      await updateRequestStatus(id, status);
    });
  };

  if (pendingRequests.length === 0) {
    return <div className="p-6 bg-white rounded-lg shadow text-center text-slate-500">لا توجد طلبات سلف جديدة.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-slate-800">طلبات السلف المعلقة</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="p-3 border-b">الموظف</th>
              <th className="p-3 border-b">المبلغ</th>
              <th className="p-3 border-b">السبب</th>
              <th className="p-3 border-b">التاريخ</th>
              <th className="p-3 border-b text-center">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((req) => (
              <tr key={req.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-semibold">{req.employee.name}</td>
                <td className="p-3 text-red-600 font-bold">{req.amount} ج</td>
                <td className="p-3 text-slate-600">{req.reason || "-"}</td>
                <td className="p-3">{new Date(req.createdAt).toLocaleDateString("ar-EG")}</td>
                <td className="p-3 flex justify-center gap-2">
                  <button 
                    onClick={() => handleAction(req.id, "Approved")}
                    disabled={isPending}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    موافقة
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, "Rejected")}
                    disabled={isPending}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                  >
                    رفض
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}