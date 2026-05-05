
// app/admin/CashView.tsx
"use client";

import { useState } from 'react';
import { DollarSign, PlusCircle } from 'lucide-react';
import { CashTransaction, Employee } from '@prisma/client';
import { addCashTransaction } from './actions/cash'; 

interface CashViewProps {
  transactions: (CashTransaction & { employee: Employee | null })[];
  employees: Employee[];
}

export default function CashView({ transactions, employees }: CashViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalOutcome = transactions.filter(t => t.type === 'OUTCOME').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalOutcome;

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const result = await addCashTransaction(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
    // This is a simple way to reset the form. A more robust solution might be needed.
    const form = document.querySelector('form'); // Consider more specific selectors
    form?.reset();
  };

  return (
    <div id="cash-section" className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 mb-10">
      <h2 className="font-black text-slate-800 text-2xl mb-6 flex items-center gap-3">
        <DollarSign className="text-yellow-500" />
        النقدية والعهد
      </h2>

      {/* Totals Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
        <div className="bg-green-50 p-4 rounded-2xl">
          <p className="text-sm text-green-600 font-bold">الإجمالي الداخل</p>
          <p className="text-2xl font-black text-green-800">{totalIncome.toFixed(2)} ر.س</p>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl">
          <p className="text-sm text-red-600 font-bold">الإجمالي الخارج (مصروفات + سلف)</p>
          <p className="text-2xl font-black text-red-800">{totalOutcome.toFixed(2)} ر.س</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl">
          <p className="text-sm text-blue-600 font-bold">الرصيد الحالي</p>
          <p className={`text-2xl font-black ${balance >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
            {balance.toFixed(2)} ر.س
          </p>
        </div>
      </div>

      {/* Action Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Add Loan (Advance) Form */}
        <form action={handleFormSubmit} className="bg-slate-50 p-6 rounded-2xl border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><PlusCircle size={20} /> إضافة سلفة لموظف</h3>
          <input type="hidden" name="type" value="OUTCOME" />
          <div className="space-y-4">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-bold text-slate-600 mb-1">اختر الموظف</label>
              <select id="employeeId" name="employeeId" required className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition">
                <option value="">-- اختر --</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="loan-amount" className="block text-sm font-bold text-slate-600 mb-1">المبلغ</label>
              <input type="number" id="loan-amount" name="amount" required step="0.01" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label htmlFor="loan-note" className="block text-sm font-bold text-slate-600 mb-1">ملاحظات (اختياري)</label>
              <input type="text" id="loan-note" name="note" defaultValue="سلفة" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400">
              {isLoading ? 'جاري الحفظ...' : 'حفظ السلفة'}
            </button>
          </div>
        </form>

        {/* Add Expense Form */}
        <form action={handleFormSubmit} className="bg-slate-50 p-6 rounded-2xl border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><PlusCircle size={20} /> إضافة مصروف عام</h3>
          <input type="hidden" name="type" value="OUTCOME" />
          <div className="space-y-4">
            <div>
              <label htmlFor="expense-amount" className="block text-sm font-bold text-slate-600 mb-1">المبلغ</label>
              <input type="number" id="expense-amount" name="amount" required step="0.01" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 transition" />
            </div>
            <div>
              <label htmlFor="expense-note" className="block text-sm font-bold text-slate-600 mb-1">بيان المصروف</label>
              <input type="text" id="expense-note" name="note" required className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 transition" />
            </div>
             {/* A hidden field to indicate no employee is associated */}
            <input type="hidden" name="isGeneralExpense" value="true" />
            <button type="submit" disabled={isLoading} className="w-full bg-yellow-600 text-white font-bold p-3 rounded-lg hover:bg-yellow-700 transition disabled:bg-slate-400">
              {isLoading ? 'جاري الحفظ...' : 'حفظ المصروف'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6"><b>خطأ:</b> {error}</div>}

      {/* Transactions Table */}
      <div>
        <h3 className="font-bold text-lg mb-4">آخر الحركات</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-4">التاريخ</th>
                <th className="p-4">النوع</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">الموظف</th>
                <th className="p-4">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-600">{new Date(t.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.type === 'INCOME' ? 'إيداع' : 'صرف'}
                    </span>
                  </td>
                  <td className={`p-4 font-mono font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-sm font-bold">{t.employee?.name || '---'}</td>
                  <td className="p-4 text-xs text-slate-500 italic">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && <p className="text-center text-slate-400 p-8">لا توجد حركات مسجلة بعد.</p>}
      </div>
    </div>
  );
}
