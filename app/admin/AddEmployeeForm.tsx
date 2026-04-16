"use client";
import { useState } from "react";
import { PlusCircle, X, Save, MapPin, Clock, DollarSign, Globe } from "lucide-react";
import { addEmployee } from "../actions/admin";

export default function AddEmployeeForm({ branches }: { branches: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branchType, setBranchType] = useState("SPECIFIC"); // SPECIFIC or OPEN

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    // إضافة نوع الفرع يدوياً للبيانات المرسلة
    formData.append("branchType", branchType);
    const data = Object.fromEntries(formData);
    const res = await addEmployee(data);
    
    if (res?.success) {
      alert("✅ تم إضافة الموظف بنجاح");
      setIsOpen(false);
      window.location.reload(); // لتحديث الجدول بالبيانات الجديدة
    } else {
      alert("❌ " + res?.error);
    }
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all">
        <PlusCircle size={20} /> إضافة موظف جديد
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">إضافة موظف جديد</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500"><X /></button>
            </div>

            <form action={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto" dir="rtl">
              <input name="name" placeholder="اسم الموظف" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" />
              <input name="code" placeholder="كود البصمة (ah100)" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" />
              <input name="password" type="password" placeholder="كلمة المرور" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" />
              <input name="department" placeholder="القسم" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" />

              {/* نظام الفروع الاحترافي */}
              <div className="md:col-span-2 bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <label className="block text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                   <Globe size={18} /> تحديد صلاحيات المكان
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setBranchType("SPECIFIC")}
                    className={`p-3 rounded-xl border-2 font-bold transition-all ${branchType === "SPECIFIC" ? "border-blue-600 bg-blue-600 text-white" : "border-white bg-white text-slate-400"}`}
                  >
                    فرع محدد
                  </button>
                  <button 
                    type="button"
                    onClick={() => setBranchType("OPEN")}
                    className={`p-3 rounded-xl border-2 font-bold transition-all ${branchType === "OPEN" ? "border-blue-600 bg-blue-600 text-white" : "border-white bg-white text-slate-400"}`}
                  >
                    مفتوح (أي فرع)
                  </button>
                </div>

                {branchType === "SPECIFIC" && (
                  <select name="branchId" required className="w-full mt-4 p-3 bg-white border rounded-xl outline-none font-bold">
                    <option value="">-- اختر الفرع المعتمد --</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                )}
                {branchType === "OPEN" && (
                   <p className="text-[10px] text-blue-500 mt-3 italic text-center">سيتمكن الموظف من البصمة في أي موقع من المواقع المضافة في قائمة الفروع.</p>
                )}
              </div>

              {/* المالية والإضافي */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الراتب اليومي</label>
                <input name="dailySalary" type="number" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">معامل الإضافي (ساعة بـ..)</label>
                <input name="overtimeRate" type="number" step="0.1" defaultValue="1" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>

              {/* المواعيد والإجازات */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">يوم الإجازة</label>
                <select name="offDay" className="w-full p-3 bg-slate-50 border rounded-xl font-bold">
                  <option value="NONE">بدون إجازة</option>
                  <option value="Saturday">السبت</option>
                  <option value="Sunday">الأحد</option>
                  <option value="Monday">الاثنين</option>
                  <option value="Tuesday">الثلاثاء</option>
                  <option value="Wednesday">الأربعاء</option>
                  <option value="Thursday">الخميس</option>
                  <option value="Friday">الجمعة</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ساعات عمل يوم الإجازة</label>
                <input name="offDayHours" type="number" defaultValue="0" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>

              <div className="md:col-span-2 pt-4">
                <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
                  {loading ? "جاري الحفظ..." : <><Save size={20}/> حفظ الموظف</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}