"use client";
import { useState } from "react";
import { PlusCircle, X, Save, MapPin, Clock, DollarSign } from "lucide-react";
import { addEmployee } from "../actions/admin";

export default function AddEmployeeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const data = Object.fromEntries(formData);
    const res = await addEmployee(data);
    
    if (res?.success) {
      alert("✅ تم إضافة الموظف بنجاح");
      setIsOpen(false);
    } else {
      alert("❌ " + res?.error);
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
            {/* Header */}
            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">بيانات الموظف الجديد</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500"><X /></button>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">اسم الموظف</label>
                <input name="name" required className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">كود البصمة (Unique)</label>
                <input name="code" required className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="مثلاً: ah100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">كلمة مرور الدخول</label>
                <input name="password" type="password" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">القسم</label>
                <input name="department" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-2xl">
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-blue-600 mb-2"><MapPin size={14}/> خط العرض (Lat)</label>
                  <input name="officeLat" type="number" step="any" required className="w-full p-3 bg-white border rounded-xl" placeholder="31.039..." />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-blue-600 mb-2"><MapPin size={14}/> خط الطول (Lng)</label>
                  <input name="officeLng" type="number" step="any" required className="w-full p-3 bg-white border rounded-xl" placeholder="31.399..." />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-2"><Clock size={14}/> وقت الحضور</label>
                <input name="timeIn" type="time" defaultValue="09:00" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-2"><Clock size={14}/> وقت الانصراف</label>
                <input name="timeOut" type="time" defaultValue="17:00" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-2"><DollarSign size={14}/> الراتب اليومي</label>
                <input name="dailySalary" type="number" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">نطاق البصمة (متر)</label>
                <input name="allowDist" type="number" defaultValue="50" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
                >
                  {loading ? "جاري الحفظ..." : <><Save size={20} /> حفظ بيانات الموظف</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}