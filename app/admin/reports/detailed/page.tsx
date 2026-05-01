'use client';

import { useState, useEffect } from 'react';
import { getEmployeesList, getDetailedLog } from '@/app/actions/reports';
import { Search, Filter, Calendar, Loader2, Database, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AttendanceRow from './AttendanceRow'; // 👈 استيراد المكون

// دالة مساعدة لتحويل التوقيت
const formatTime = (dateString: string | null) => {
  if (!dateString) return '--:--';
  try {
    return new Date(dateString).toLocaleTimeString('ar-EG', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return 'تاريخ خاطئ';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      timeZone: 'Africa/Cairo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    return 'تاريخ خاطئ';
  }
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
    } else {
      setRecords(res.data || []);
      setHasSearched(true);
      if (res.data) {
        toast.success(`تم استدعاء ${res.data.length} سجل بنجاح`);
      }
    }
    setIsFetching(false);
  };

  const filteredRecords = records.filter(
    (record) =>
      record.empName.toLowerCase().includes(liveSearchQuery.toLowerCase()) ||
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
            استعرض حضور وانصراف الموظفين مع حسابات العجز والإضافي
          </p>
        </div>
      </div>

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
      ) : records.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <AlertCircle size={48} className="text-slate-400 mb-4" />
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">لا توجد سجلات</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
            لا يوجد حضور وانصراف يطابق الفلتر الذي حددته.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="بحث سريع داخل النتائج بالاسم أو التاريخ..."
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
                  <th className="p-4 text-center">التاريخ</th>
                  <th className="p-4 text-center">دخول</th>
                  <th className="p-4 text-center">خروج</th>
                  <th className="p-4 text-center">الافتراضي</th>
                  <th className="p-4 text-center text-blue-600 dark:text-blue-400">الفعلي (س)</th>
                  <th className="p-4 text-center text-red-500">عجز (س)</th>
                  <th className="p-4 text-center text-green-500">إضافي (س)</th>
                  <th className="p-4 text-center text-amber-600 dark:text-amber-400">تراكمي</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
                {filteredRecords.map((record) => (
                  <AttendanceRow key={record.id} record={record} onRefresh={handleFetchData} />
                ))}
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
    </div>
  );
}
