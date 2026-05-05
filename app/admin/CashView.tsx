
// app/admin/CashView.tsx
"use client";

import { useState, useMemo } from 'react';
import { DollarSign, PlusCircle, ArrowUp, ArrowDown, Trash2, Edit, Search, X } from 'lucide-react';
import { CashTransaction, Employee } from '@prisma/client';
import { addCashTransaction, deleteCashTransaction, updateCashTransaction } from './actions/cash';

interface CashViewProps {
  transactions: (CashTransaction & { employee: Employee | null })[];
  employees: Employee[];
}

export default function CashView({ transactions, employees }: CashViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'INCOME' | 'OUTCOME'>('OUTCOME');
  const [incomeSource, setIncomeSource] = useState<'treasury' | 'employee'>('treasury');

  // Modal and editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<(CashTransaction & { employee: Employee | null }) | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const openModal = (transaction: CashTransaction & { employee: Employee | null }) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
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

  const handleUpdateSubmit = async (formData: FormData) => {
    setIsUpdating(true);
    setError(null);
    const result = await updateCashTransaction(formData);
    if (result?.error) {
        setError(result.error);
    } else {
        closeModal();
    }
    setIsUpdating(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذه الحركة؟")) {
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
          if(start) start.setHours(0,0,0,0);
          if(end) end.setHours(23,59,59,999);
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
    <>
        <div id="cash-section" className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 mb-10">
            {/* ... (rest of the component is the same) ... */}
            <h2 className="font-black text-slate-800 text-2xl mb-6 flex items-center gap-3"><DollarSign className="text-yellow-500" />إدارة النقدية والعهد</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
                <div className="bg-green-50 p-4 rounded-xl"><p className="text-sm text-green-700 font-bold">إجمالي المقبوضات</p><p className="text-2xl font-black text-green-700 font-mono">{totalIncome.toFixed(2)}</p></div>
                <div className="bg-red-50 p-4 rounded-xl"><p className="text-sm text-red-700 font-bold">إجمالي المصروفات</p><p className="text-2xl font-black text-red-700 font-mono">{totalOutcome.toFixed(2)}</p></div>
                <div className="bg-slate-100 p-4 rounded-xl"><p className="text-sm text-slate-600 font-bold">الرصيد</p><p className={`text-2xl font-black ${balance >= 0 ? 'text-slate-800' : 'text-red-700'} font-mono`}>{balance.toFixed(2)}</p></div>
            </div>
            <div className="max-w-2xl mx-auto mb-10"><form id="cash-transaction-form" action={handleFormSubmit} className="bg-slate-50/50 border rounded-2xl p-6 space-y-4"><h3 className="font-bold text-center text-lg">تسجيل حركة جديدة</h3><input type="hidden" name="type" value={transactionType} />{transactionType === 'INCOME' && <input type="hidden" name="incomeSource" value={incomeSource} />}<div className="flex gap-4"><div onClick={() => setTransactionType('OUTCOME')} className={`flex-1 text-center p-4 rounded-xl cursor-pointer border-2 transition-all ${transactionType === 'OUTCOME' ? 'bg-red-100 border-red-300' : 'bg-white hover:bg-slate-100'}`}><ArrowDown className="mx-auto mb-2 text-red-500" /><span className="font-bold text-red-600">سند صرف</span></div><div onClick={() => setTransactionType('INCOME')} className={`flex-1 text-center p-4 rounded-xl cursor-pointer border-2 transition-all ${transactionType === 'INCOME' ? 'bg-green-100 border-green-300' : 'bg-white hover:bg-slate-100'}`}><ArrowUp className="mx-auto mb-2 text-green-500" /><span className="font-bold text-green-600">سند قبض</span></div></div>{transactionType === 'INCOME' && (<div className="p-3 bg-white rounded-lg border"><label className="text-sm font-bold text-slate-600 mb-2 block">مصدر الإيداع:</label><div className="flex gap-2"><div onClick={() => setIncomeSource('treasury')} className={`flex-1 text-center p-2 text-sm rounded-md cursor-pointer border ${incomeSource === 'treasury' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>من الخزنة</div><div onClick={() => setIncomeSource('employee')} className={`flex-1 text-center p-2 text-sm rounded-md cursor-pointer border ${incomeSource === 'employee' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>سداد من موظف</div></div></div>)}<div className={`grid grid-cols-1 ${isEmployeeRequired ? 'md:grid-cols-2' : ''} gap-4`}><div><label htmlFor="amount" className="text-sm font-bold text-slate-600 mb-1 block">المبلغ</label><input id="amount" name="amount" type="number" step="0.01" required className="w-full p-3 border rounded-lg" /></div>{isEmployeeRequired && (<div><label htmlFor="employeeId" className="text-sm font-bold text-slate-600 mb-1 block">الموظف</label><select id="employeeId" name="employeeId" required className="w-full p-3 border rounded-lg bg-white"><option value="">-- اختر --</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>)}</div><div><label htmlFor="note" className="text-sm font-bold text-slate-600 mb-1 block">البيان</label><textarea id="note" name="note" rows={2} required className="w-full p-3 border rounded-lg"></textarea></div><button type="submit" disabled={isLoading} className={`w-full py-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'}`}>{isLoading ? "جاري الحفظ..." : <><PlusCircle size={20}/> حفظ الحركة</>}</button></form></div>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 max-w-2xl mx-auto"><b>خطأ:</b> {error}</div>}
            <div>
                <h3 className="font-bold text-lg mb-4 text-center md:text-right">آخر الحركات</h3>
                <div className="bg-slate-50 p-4 rounded-xl mb-4 border grid md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1"><label htmlFor="search" className="text-sm font-bold text-slate-600 mb-1 flex items-center gap-2"><Search size={16}/> بحث</label><input type="text" id="search" placeholder="..." className="w-full p-2 border rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                    <div><label htmlFor="startDate" className="text-sm font-bold text-slate-600 mb-1">من</label><input type="date" id="startDate" className="w-full p-2 border rounded-lg" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                    <div><label htmlFor="endDate" className="text-sm font-bold text-slate-600 mb-1">إلى</label><input type="date" id="endDate" className="w-full p-2 border rounded-lg" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-500 text-sm"><tr><th className="p-4">التاريخ</th><th className="p-4">النوع</th><th className="p-4">المبلغ</th><th className="p-4">الموظف/المصدر</th><th className="p-4">ملاحظات</th><th className="p-4">إجراءات</th></tr></thead>
                        <tbody className="divide-y">
                        {filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-4 text-sm text-slate-600">{new Date(t.createdAt).toLocaleString('ar-EG')}</td>
                            <td className="p-4"><span className={`px-3 py-1 text-xs font-bold rounded-full ${t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.type === 'INCOME' ? 'قبض' : 'صرف'}</span></td>
                            <td className={`p-4 font-mono font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'INCOME' ? '+' : '-'}{t.amount.toFixed(2)}</td>
                            <td className="p-4 text-sm font-bold">{t.employee?.name || 'خزنة'}</td>
                            <td className="p-4 text-xs text-slate-500 italic">{t.note}</td>
                            <td className="p-4"><div className="flex gap-2"><button onClick={() => openModal(t)} className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-100"><Edit size={16} /></button><button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-100"><Trash2 size={16} /></button></div></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {filteredTransactions.length === 0 && <p className="text-center text-slate-400 p-8">لا توجد حركات تطابق معايير البحث.</p>}
            </div>
        </div>

        {/* Edit Modal */}
        {isModalOpen && editingTransaction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                    <form action={handleUpdateSubmit} className="p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="font-bold text-lg">تعديل الحركة</h3>
                            <button type="button" onClick={closeModal} className="p-2 rounded-full hover:bg-slate-100"><X size={20}/></button>
                        </div>
                        
                        <input type="hidden" name="id" value={editingTransaction.id} />
                        
                        <div>
                            <label htmlFor="edit-amount" className="text-sm font-bold text-slate-600 mb-1 block">المبلغ</label>
                            <input id="edit-amount" name="amount" type="number" step="0.01" required className="w-full p-3 border rounded-lg bg-slate-50" defaultValue={editingTransaction.amount} />
                        </div>
                        <div>
                            <label htmlFor="edit-note" className="text-sm font-bold text-slate-600 mb-1 block">البيان (ملاحظات)</label>
                            <textarea id="edit-note" name="note" rows={3} required className="w-full p-3 border rounded-lg bg-slate-50" defaultValue={editingTransaction.note || ''}></textarea>
                        </div>
                        
                        {error && <div className="bg-red-100 text-red-700 p-2 rounded-lg text-sm"><b>خطأ:</b> {error}</div>}

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-lg border font-bold hover:bg-slate-50">إلغاء</button>
                            <button type="submit" disabled={isUpdating} className={`flex-1 py-3 rounded-lg font-bold text-white transition-all ${isUpdating ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {isUpdating ? "جاري الحفظ..." : "حفظ التعديلات"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </>
  );
}
