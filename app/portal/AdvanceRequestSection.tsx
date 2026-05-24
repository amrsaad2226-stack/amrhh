"use client";
import { useState, useTransition } from "react";
// تأكد من استيراد الأكشن الذي أنشأناه سابقاً
import { handleAdvanceRequest } from "@/app/actions/cash"; 

export default function AdvanceRequestSection({ employeeId, existingRequests }: { employeeId: number, existingRequests: any[] }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const onSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      setMessage("يرجى إدخال مبلغ صحيح");
      return;
    }
    
    startTransition(async () => {
      await handleAdvanceRequest(employeeId, Number(amount), reason);
      setMessage("تم إرسال الطلب بنجاح للإدارة.");
      setAmount("");
      setReason("");
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Pending": return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">قيد المراجعة</span>;
      case "Approved": return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">مقبول (بانتظار الصرف)</span>;
      case "Disbursed": return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">تم الصرف</span>;
      case "Rejected": return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">مرفوض</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-slate-800">طلب سلفة نقدية</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input 
          type="number" 
          placeholder="المبلغ (ج)" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded flex-1 focus:ring-2 outline-none"
        />
        <input 
          type="text" 
          placeholder="سبب السلفة (اختياري)" 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border p-2 rounded flex-2 focus:ring-2 outline-none"
        />
        <button 
          onClick={onSubmit}
          disabled={isPending}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
        </button>
      </div>
      
      {message && <p className="text-green-600 mb-4 font-semibold">{message}</p>}

      {/* جدول الطلبات السابقة */}
      {existingRequests && existingRequests.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="p-2 border-b">التاريخ</th>
                <th className="p-2 border-b">المبلغ</th>
                <th className="p-2 border-b">السبب</th>
                <th className="p-2 border-b">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {existingRequests.map((req, idx) => (
                <tr key={idx} className="border-b hover:bg-slate-50">
                  <td className="p-2">{new Date(req.createdAt).toLocaleDateString("ar-EG")}</td>
                  <td className="p-2 font-bold">{req.amount} ج</td>
                  <td className="p-2 text-slate-600">{req.reason || "-"}</td>
                  <td className="p-2">{getStatusBadge(req.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}