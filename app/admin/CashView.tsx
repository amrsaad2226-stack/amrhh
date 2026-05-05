
// app/admin/CashView.tsx
"use client";

import { useState } from 'react';
import { DollarSign, PlusCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { CashTransaction, Employee } from '@prisma/client';
import { addCashTransaction } from './actions/cash';

interface CashViewProps {
  transactions: (CashTransaction & { employee: Employee | null })[];
  employees: Employee[];
}

export default function CashView({ transactions, employees }: CashViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'INCOME' | 'OUTCOME'>('OUTCOME');
  const [incomeSource, setIncomeSource] = useState<'treasury' | 'employee'>('treasury');

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalOutcome = transactions.filter(t => t.type === 'OUTCOME').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalOutcome;

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    
    // Reset employeeId if it's a treasury income
    if (formData.get('type') === 'INCOME' && formData.get('incomeSource') === 'treasury') {
      formData.delete('employeeId');
    }

    const result = await addCashTransaction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      // Reset form on success
      const form = document.getElementById('cash-transaction-form') as HTMLFormElement;
      form?.reset();
      // Reset states to default
      setTransactionType('OUTCOME');
      setIncomeSource('treasury');
    }
    setIsLoading(false);
  };
  
  const isEmployeeRequired = transactionType === 'OUTCOME' || (transactionType === 'INCOME' && incomeSource === 'employee');

  return (
    <div id="cash-section" className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 mb-10">
      <h2 className="font-black text-slate-800 text-2xl mb-6 flex items-center gap-3">
        <DollarSign className="text-yellow-500" />
        إدارة النقدية والعهد
      </h2>

      {/* Totals Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
        <div className="bg-green-50 p-4 rounded-2xl">
          <p className="text-sm text-green-600 font-bold">الإجمالي الداخل</p>
          <p className="text-2xl font-black text-green-800">{totalIncome.toFixed(2)} ر.س</p>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl">
          <p className="text-sm text-red-600 font-bold">الإجمالي الخارج (سلف)</p>
          <p className="text-2xl font-black text-red-800">{totalOutcome.toFixed(2)} ر.س</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl">
          <p className="text-sm text-blue-600 font-bold">الرصيد الحالي</p>
          <p className={`text-2xl font-black ${balance >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
            {balance.toFixed(2)} ر.س
          </p>
        </div>
      </div>

      {/* Action Form */}
      <div className="max-w-2xl mx-auto mb-8">
        <form id="cash-transaction-form" action={handleFormSubmit} className="bg-slate-50 p-6 rounded-2xl border" key={`${transactionType}-${incomeSource}`}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><PlusCircle size={20} /> إضافة حركة نقدية</h3>
          
          {/* Transaction Type Selection */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <label className={`flex items-center justify-center gap-2 p-4 rounded-lg cursor-pointer transition-all ${transactionType === 'OUTCOME' ? 'bg-red-500 text-white shadow-lg' : 'bg-white border'}`}>
                <ArrowDown size={20} />
                <span className="font-bold">سند دفع (مصروف)</span>
                <input type="radio" name="type" value="OUTCOME" checked={transactionType === 'OUTCOME'} onChange={() => setTransactionType('OUTCOME')} className="sr-only" />
            </label>
            <label className={`flex items-center justify-center gap-2 p-4 rounded-lg cursor-pointer transition-all ${transactionType === 'INCOME' ? 'bg-green-500 text-white shadow-lg' : 'bg-white border'}`}>
                <ArrowUp size={20} />
                <span className="font-bold">سند قبض (إيراد)</span>
                <input type="radio" name="type" value="INCOME" checked={transactionType === 'INCOME'} onChange={() => setTransactionType('INCOME')} className="sr-only" />
            </label>
          </div>

          {/* Income Source Selection */}
          {transactionType === 'INCOME' && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
              <p className="text-sm font-bold mb-2 text-green-800">مصدر الإيراد:</p>
              <div className="grid grid-cols-2 gap-2">
                 <label className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all text-sm ${incomeSource === 'treasury' ? 'bg-green-600 text-white shadow' : 'bg-white border'}`}>
                    <span className="font-bold">من الخزنة</span>
                    <input type="radio" name="incomeSource" value="treasury" checked={incomeSource === 'treasury'} onChange={() => setIncomeSource('treasury')} className="sr-only" />
                </label>
                 <label className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all text-sm ${incomeSource === 'employee' ? 'bg-green-600 text-white shadow' : 'bg-white border'}`}>
                    <span className="font-bold">سداد من موظف</span>
                    <input type="radio" name="incomeSource" value="employee" checked={incomeSource === 'employee'} onChange={() => setIncomeSource('employee')} className="sr-only" />
                </label>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Employee Selection */}
            {isEmployeeRequired && (
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-bold text-slate-600 mb-1">اختر الموظف</label>
                  <select id="employeeId" name="employeeId" required className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition">
                    <option value="">-- اختر --</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
            )}
            
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-bold text-slate-600 mb-1">المبلغ</label>
              <input type="number" id="amount" name="amount" required step="0.01" className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            
            {/* Note */}
            <div>
              <label htmlFor="note" className="block text-sm font-bold text-slate-600 mb-1">ملاحظات (البيان)</label>
              <input type="text" id="note" name="note" required className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            
            <button type="submit" disabled={isLoading} className={`w-full font-bold p-3 rounded-lg text-white transition disabled:bg-slate-400 ${transactionType === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {isLoading ? 'جاري الحفظ...' : (transactionType === 'INCOME' ? 'حفظ الإيراد' : 'حفظ المصروف')}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 max-w-2xl mx-auto"><b>خطأ:</b> {error}</div>}

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
                <th className="p-4">الموظف / المصدر</th>
                <th className="p-4">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-600">{new Date(t.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.type === 'INCOME' ? 'قبض' : 'صرف'}
                    </span>
                  </td>
                  <td className={`p-4 font-mono font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{t.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-sm font-bold">{t.employee?.name || 'خزنة'}</td>
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
