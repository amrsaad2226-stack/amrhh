'use client';

import { useState, useEffect } from 'react';
import { getEmployeesList, getDetailedLog } from '@/app/actions/reports';
import { Search, Filter, Calendar, Loader2, Database, AlertCircle, DollarSign, Clock, ArrowUp, ArrowDown, Scale, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import EditAttendanceModal from './EditAttendanceModal';
import EditCashTransactionModal from './EditCashTransactionModal';
import { deleteAttendanceAction, deleteCashTransactionAction } from './actions';

const formatTime = (dateString: string | null) => {
  if (!dateString) return '--:--';
  return new Date(dateString).toLocaleTimeString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo', day: '2-digit', month: '2-digit', year: 'numeric' });
};


export default function DetailedLogPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isFetching, setIsFetching] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [liveSearchQuery, setLiveSearchQuery] = useState('');
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  useEffect(() => {
    async function loadEmps() {
      const data = await getEmployeesList();
      setEmployees(data);
      setLoadingInitial(false);

      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
    loadEmps();
  }, []);

  const handleFetchData = async () => {
    if (!startDate || !endDate) {
      return toast.error('يرجى تحديد تاريخ البداية والنهاية');
    }

    setIsFetching(true);
    const res = await getDetailedLog(selectedEmpId, startDate, endDate);

    if (res.error) {
      toast.error(res.error);
      setRecords([]);
    } else {
      setRecords(res.data || []);
      if (res.data) {
        toast.success(`تم استدعاء ${res.data.length} حركة بنجاح`);
      }
    }
    setHasSearched(true);
    setIsFetching(false);
  };

  const handleDelete = async (record: any) => {
    const confirmed = confirm('هل أنت متأكد من الحذف؟ هذا الإجراء لا يمكن التراجع عنه.');
  
    if (!confirmed) return;
  
    const toastId = toast.loading('جارٍ الحذف...');
  
    try {
      const result =
        record.type === 'CASH'
          ? await deleteCashTransactionAction(record.id)
          : await deleteAttendanceAction(record.id);
  
      if (result.success) {
        toast.success(result.success, { id: toastId });
  
        // Refresh data after deletion
        handleFetchData();

      } else {
        toast.error(result.error || 'حدث خطأ غير متوقع', { id: toastId });
      }
    } catch (error) {
      toast.error('فشل في تنفيذ عملية الحذف', { id: toastId });
    }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.empName.toLowerCase().includes(liveSearchQuery.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(liveSearchQuery.toLowerCase())) ||
      formatDate(record.date).includes(liveSearchQuery)
  );

  return (
    <div className="p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Database className="text-blue-600" /> سجل الحركات التفصيلي
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-bold">
            استعرض حضور وانصراف الموظفين مع السلف والمستحقات والرصيد السابق
          </p>
        </div>
      </div>

      {/* ... Filter Controls ... */}
       <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">الموظف</label>
          {loadingInitial ? (
            <div className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl w-full"></div>
          ) : (
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="">الكل (جميع الموظفين)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.code})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">من تاريخ</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-bold text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">إلى تاريخ</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-bold text-slate-700 dark:text-slate-200"
          />
        </div>

        <button
          onClick={handleFetchData}
          disabled={isFetching}
          className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          {isFetching ? <Loader2 size={20} className="animate-spin" /> : <Filter size={20} />}
          استدعاء السجلات
        </button>
      </div>


      {!hasSearched ? (
        <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">جاهز لاستدعاء البيانات</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold max-w-sm">
            حدد الموظف أو التاريخ من الفلاتر بالأعلى واضغط على \'استدعاء السجلات\' لعرض التقرير التفصيلي.
          </p>
        </div>
      ) : isFetching ? (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
            <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">جارٍ حساب الأرصدة...</h3>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <AlertCircle size={48} className="text-slate-400 mb-4" />
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">لا توجد سجلات</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
            لا يوجد حضور وانصراف أو سلف تطابق الفلتر الذي حددته.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
             <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="بحث سريع داخل النتائج بالاسم أو الملاحظات أو التاريخ..."
                value={liveSearchQuery}
                onChange={(e) => setLiveSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 pr-12 pl-4 outline-none focus:border-blue-500 font-bold text-sm text-slate-700 dark:text-slate-200 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-black border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">الاسم</th>
                  <th className="p-4 text-center">التاريخ والوقت</th>
                  <th className="p-4 text-center">البيان</th>
                  <th className="p-4 text-center">له</th>
                  <th className="p-4 text-center">عليه</th>
                  <th className="p-4 text-center text-amber-600 dark:text-amber-400">الرصيد</th>
                  <th className="p-4">ملاحظات</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
                {filteredRecords.map((record) => {
                  if (record.type === 'OPENING_BALANCE') {
                     return (
                      <tr key={record.id} className="bg-gray-100 dark:bg-gray-800/50 font-black text-gray-600 dark:text-gray-300">
                        <td className="p-4">{record.empName}</td>
                        <td className="p-4 text-center">-</td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                           <Scale size={16} /> رصيد سابق
                        </td>
                        <td className="p-4 text-center">-</td>
                        <td className="p-4 text-center">-</td>
                        <td className="p-4 text-center font-mono font-black text-amber-600 dark:text-amber-400">{record.balance}</td>
                        <td className="p-4 text-xs italic max-w-[250px] truncate">{record.notes}</td>
                         <td className="p-4 text-center">-</td>
                      </tr>
                    );
                  }
                  
                  if (record.type === 'CASH') {
                    return (
                      <tr key={`cash-${record.id}`} className="bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50/80">
                        <td className="p-4">{record.empName}</td>
                        <td className="p-4 text-center">{formatTime(record.date)} <span className="text-slate-400 font-normal text-xs">({formatDate(record.date)})</span></td>
                        <td className="p-4 text-center font-bold flex items-center justify-center gap-2">
                           <ArrowUp className="text-red-500" size={16} /> سلفة نقدية
                        </td>
                        <td className="p-4 text-center text-slate-500">-</td>
                        <td className="p-4 text-center text-red-500 font-black">{record.amount?.toFixed(2) || '0.00'}</td>
                        <td className="p-4 text-center font-mono font-black text-amber-600 dark:text-amber-400">{record.balance}</td>
                        <td className="p-4 text-xs italic text-slate-400 max-w-[200px] truncate">{record.notes || "-"}</td>
                        <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setEditingRecord(record)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(record)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                            </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={`att-${record.id}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                       <td className="p-4">{record.empName}</td>
                       <td className="p-4 text-center">
                        {formatTime(record.checkIn)}
                        {record.checkOut && <span className="mx-1 text-slate-400">-</span>} 
                        {formatTime(record.checkOut)} 
                        <span className="text-slate-400 font-normal text-xs"> ({formatDate(record.date)})</span>
                       </td>
                       <td className="p-4 text-center flex items-center justify-center gap-2">
                          <Clock size={16} className="text-blue-500" />
                          حركة حضور
                       </td>
                       <td className="p-4 text-center text-green-500 font-black">
                         {record.isLastOfDay ? record.dailyEarned.toFixed(2) : '-'}
                       </td>
                       <td className="p-4 text-center text-slate-500">-</td>
                       <td className="p-4 text-center font-mono font-black text-amber-600 dark:text-amber-400">
                         {record.isLastOfDay ? record.balance : '-'}
                        </td>
                       <td className="p-4 text-xs italic text-slate-400 max-w-[200px] truncate">
                        {record.notes && <p className="font-bold text-slate-600 dark:text-slate-300">{record.notes}</p>}
                        {record.deficit !== '-' && <span className="text-red-500">عجز: {record.deficit} س</span>}
                        {record.overtime !== '-' && <span className="text-green-500 ml-2">إضافي: {record.overtime} س</span>}
                         {record.actualHrs && record.isLastOfDay && <span> (إجمالي العمل: {parseFloat(record.actualHrs).toFixed(2)} س)</span>}
                       </td>
                        <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setEditingRecord(record)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(record)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                            </div>
                        </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredRecords.length === 0 && records.length > 0 && (
              <div className="p-8 text-center text-slate-500 font-bold">
                لا توجد نتائج تطابق كلمة البحث \"{liveSearchQuery}\"
              </div>
            )}
          </div>
        </div>
      )}

        {/* Modals for Editing */}
        {editingRecord && editingRecord.type === 'CASH' && (
        <EditCashTransactionModal
            record={editingRecord}
            onClose={() => {
            setEditingRecord(null);
            handleFetchData(); // Refetch data after edit
            }}
        />
        )}

        {editingRecord && editingRecord.type !== 'CASH' && editingRecord.type !== 'OPENING_BALANCE' && (
        <EditAttendanceModal
            record={editingRecord}
            onClose={() => {
            setEditingRecord(null);
            handleFetchData(); // Refetch data after edit
            }}
        />
        )}

    </div>
  );
}
