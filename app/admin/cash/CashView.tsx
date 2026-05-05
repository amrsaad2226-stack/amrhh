"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTransaction } from "@/app/actions/cash";
import type { Employee, CashTransaction as PrismaCashTransaction } from "@prisma/client";

// Here, we create a more specific type for the transaction object that our page receives.
// It includes the related employee and accounts for the `createdAt` date being a string (for serialization).
type TransactionWithEmployee = Omit<PrismaCashTransaction, 'createdAt'> & {
  createdAt: string;
  employee: Employee | null;
};

// We define a clear props type for our component, eliminating the need for `any`.
type CashViewProps = {
  initialTransactions: TransactionWithEmployee[];
  employees: Employee[];
};

export default function CashView({ initialTransactions, employees }: CashViewProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    // Basic validation to prevent submission with an empty amount
    if (!formData.get("amount")) {
      return; 
    }

    setLoading(true);
    const res = await addTransaction(formData);

    if (res?.error) {
      alert(res.error);
    } else {
      router.refresh(); // Refresh server data without a full page reload
      
      // UX Improvement: Reset the form after a successful submission
      const form = document.querySelector('form');
      form?.reset();
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">

      {/* The Form */}
      <form action={handleSubmit} className="bg-white p-6 rounded-2xl shadow flex flex-col md:flex-row items-center gap-4">
        <select name="type" className="p-3 border rounded-xl">
          <option value="INCOME">إيراد</option>
          <option value="OUTCOME">مصروف</option>
        </select>
        <input name="amount" type="number" step="any" placeholder="المبلغ" required className="p-3 border rounded-xl" />
        <select name="employeeId" className="p-3 border rounded-xl">
          <option value="">بدون موظف</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <input name="note" placeholder="ملاحظة" className="p-3 border rounded-xl flex-1" />
        <button disabled={loading} className={`bg-blue-600 text-white px-6 py-3 rounded-xl transition-all font-bold ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}>
          {loading ? "جاري الحفظ..." : "إضافة"}
        </button>
      </form>

      {/* The Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 font-bold text-slate-600">النوع</th>
              <th className="p-3 font-bold text-slate-600">المبلغ</th>
              <th className="p-3 font-bold text-slate-600">الموظف</th>
              <th className="p-3 font-bold text-slate-600">ملاحظة</th>
              <th className="p-3 font-bold text-slate-600">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {initialTransactions.map((t) => ( // Thanks to our types, `t` is now fully typed!
              <tr key={t.id} className="border-t hover:bg-slate-50">
                <td className="p-3 text-2xl">{t.type === "INCOME" ? "💰" : "💸"}</td>
                <td className="p-3 font-mono font-bold text-slate-700">{t.amount.toLocaleString()}</td>
                <td className="p-3">{t.employee?.name || "-"}</td>
                <td className="p-3 text-sm text-slate-500">{t.note}</td>
                <td className="p-3 font-mono text-sm text-slate-500">{new Date(t.createdAt).toLocaleString("ar-EG")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}