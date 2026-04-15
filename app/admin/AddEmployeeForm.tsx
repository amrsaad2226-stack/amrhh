'use client';
import { useState } from 'react';
import { PlusCircle, X, Save } from 'lucide-react';
import { addEmployee } from '../actions/admin';

// Simplified branch type for the form
interface Branch {
  id: number;
  name: string;
}

export default function AddEmployeeForm({ branches }: { branches: Branch[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branchType, setBranchType] = useState('SPECIFIC');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const data = Object.fromEntries(formData);
    const res = await addEmployee(data);

    if (res?.success) {
      alert('✅ تم إضافة الموظف بنجاح');
      setIsOpen(false);
    } else {
      alert('❌ ' + res?.error);
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all"
      >
        <PlusCircle size={20} />
        إضافة موظف جديد
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">بيانات الموظف الجديد</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500">
                <X />
              </button>
            </div>

            <form
              action={handleSubmit}
              className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto"
            >
              {/* Basic Info */}
              <input name="name" placeholder="اسم الموظف" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="code" placeholder="كود البصمة (Unique)" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="password" type="password" placeholder="كلمة مرور الدخول" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="department" placeholder="القسم" required className="w-full p-3 bg-slate-50 border rounded-xl" />

              {/* Branch Selection */}
              <div className="md:col-span-2 bg-slate-100 p-4 rounded-xl">
                <label className="block text-sm font-bold text-slate-600 mb-2">نظام الفرع</label>
                <select
                  name="branchType"
                  value={branchType}
                  onChange={(e) => setBranchType(e.target.value)}
                  className="w-full p-3 bg-white border rounded-xl mb-2"
                >
                  <option value="SPECIFIC">فرع محدد</option>
                  <option value="OPEN">حضور من أي فرع</option>
                </select>

                {branchType === 'SPECIFIC' && (
                  <select name="branchId" className="w-full p-3 bg-white border rounded-xl">
                    <option value="">اختر الفرع</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Financials */}
              <input name="dailySalary" type="number" step="0.01" placeholder="الراتب اليومي" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="overtimeRate" type="number" step="0.1" placeholder="معامل الإضافي (e.g., 1.5)" defaultValue="1" className="w-full p-3 bg-slate-50 border rounded-xl" />

              {/* Attendance Rules */}
              <input name="timeIn" type="time" defaultValue="09:00" className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="timeOut" type="time" defaultValue="17:00" className="w-full p-3 bg-slate-50 border rounded-xl" />
              <select name="offDay" className="w-full p-3 bg-slate-50 border rounded-xl">
                <option value="NONE">لا يوجد يوم إجازة</option>
                <option value="Saturday">السبت</option>
                <option value="Sunday">الأحد</option>
                {/* Add other days as needed */}
              </select>
              <input name="offDayHours" type="number" placeholder="ساعات العمل بيوم الإجازة" defaultValue="0" className="w-full p-3 bg-slate-50 border rounded-xl" />

              <div className="md:col-span-2 pt-4">
                <button
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
                >
                  {loading ? 'جاري الحفظ...' : <><Save size={20} /> حفظ بيانات الموظف</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
