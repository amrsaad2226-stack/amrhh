
// app/admin/CashView.tsx
"use client";

import { useState, useMemo } from 'react';
import { DollarSign, PlusCircle, ArrowUp, ArrowDown, Trash2, Edit, Search } from 'lucide-react';
import { CashTransaction, Employee } from '@prisma/client';
import { addCashTransaction, deleteCashTransaction } from './actions/cash';

interface CashViewProps {
  transactions: (CashTransaction & { employee: Employee | null })[];
  employees: Employee[];
}

export default function CashView({ transactions, employees }: CashViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'INCOME' | 'OUTCOME'>('OUTCOME');
  const [incomeSource, setIncomeSource] = useState<'treasury' | 'employee'>('treasury');
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    
    if (formData.get('type') === 'INCOME' && formData.get('incomeSource') === 'treasury') {
      formData.delete('employeeId');
    }

    const result = await addCashTransaction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      const form = document.getElementById('cash-transaction-form') as HTMLFormElement;
      form?.reset();
      setTransactionType('OUTCOME');
      setIncomeSource('treasury');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذه الحركة؟ لا يمكن التراجع عن هذا الإجراء.")) {
        setError(null);
        const result = await deleteCashTransaction(id);
        if (result?.error) {
            setError(result.error);
        }
    }
  }

  const filteredTransactions = useMemo(() => {
      return transactions.filter(t => {
          const transactionDate = new Date(t.createdAt);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if(start) start.setHours(0,0,0,0); // Start of the day
          if(end) end.setHours(23,59,59,999); // End of the day

          const dateMatch = (!start || transactionDate >= start) && (!end || transactionDate <= end);
          const searchTermMatch = 
              !searchTerm ||
              t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.employee?.name.toLowerCase().includes(searchTerm.toLowerCase());

          return dateMatch && searchTermMatch;
      });
  }, [transactions, searchTerm, startDate, endDate]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalOutcome = filteredTransactions.filter(t => t.type === 'OUTCOME').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalOutcome;
  
  const isEmployeeRequired = transactionType === 'OUTCOME' || (transactionType === 'INCOME' && incomeSource === 'employee');

  return (
    <div id="cash-section" className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 mb-10">
      <h2 className="font-black text-slate-800 text-2xl mb-6 flex items-center gap-3">
        <DollarSign className="text-yellow-500" />
        إدارة النقدية والعهد
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
        {/* Totals Display */}
      </div>

      <div className="max-w-2xl mx-auto mb-8">
          {/* Action Form */}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 max-w-2xl mx-auto"><b>خطأ:</b> {error}</div>}

      {/* Transactions Table */}
      <div>
        <h3 className="font-bold text-lg mb-4">آخر الحركات</h3>
        
        {/* Filter and Search Controls */}
        <div className="bg-slate-50 p-4 rounded-xl mb-4 border grid md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
                <label htmlFor="search" className="text-sm font-bold text-slate-600 mb-1 flex items-center gap-2"><Search size={16}/> بحث</label>
                <input 
                    type="text" 
                    id="search" 
                    placeholder="ابحث في الملاحظات أو اسم الموظف..."
                    className="w-full p-2 border rounded-lg"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="startDate" className="text-sm font-bold text-slate-600 mb-1">من تاريخ</label>
                <input 
                    type="date" 
                    id="startDate"
                    className="w-full p-2 border rounded-lg"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="endDate" className="text-sm font-bold text-slate-600 mb-1">إلى تاريخ</label>
                <input 
                    type="date" 
                    id="endDate"
                    className="w-full p-2 border rounded-lg"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-4">التاريخ</th>
                <th className="p-4">النوع</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">الموظف / المصدر</th>
                <th className="p-4">ملاحظات</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.map(t => (
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
                  <td className="p-4">
                    <div className="flex gap-2">
                        <button onClick={() => alert('سيتم تنفيذ التعديل قريباً!')} className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-100"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-100"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && <p className="text-center text-slate-400 p-8">لا توجد حركات تطابق معايير البحث.</p>}
      </div>
    </div>
  );
}
