"use client";
import { useState, useEffect } from "react";
import { PlusCircle, X, Save, Clock, DollarSign, Globe, Calculator } from "lucide-react";
import { addEmployee } from "../actions/admin";

export default function AddEmployeeForm({ branches }: { branches: any[] }) {
  const[isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branchType, setBranchType] = useState("SPECIFIC");
  
  const [timeIn, setTimeIn] = useState("09:00");
  const [timeOut, setTimeOut] = useState("17:00");
  const [dailyHours, setDailyHours] = useState(8);

  useEffect(() => {
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    
    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMinutes < 0) totalMinutes += 24 * 60; 
    
    setDailyHours(Math.round(totalMinutes / 60));
  }, [timeIn, timeOut]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.append("branchType", branchType);
    formData.append("dailyHours", dailyHours.toString());

    const data = Object.fromEntries(formData);
    const res = await addEmployee(data);
    
    if (res?.success) {
      alert("✅ تم إضافة الموظف بنجاح");
      setIsOpen(false);
      window.location.reload();
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
              <input name="name" placeholder="اسم الموظف" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="code" placeholder="كود الدخول (مثال: ah100)" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="password" type="password" placeholder="كلمة المرور" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="department" placeholder="القسم" required className="w-full p-3 bg-slate-50 border rounded-xl" />

              <div className="md:col-span-2 bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <label className="block text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><Globe size={18} /> نطاق البصمة الجغرافي</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setBranchType("SPECIFIC")} className={`p-3 rounded-xl border-2 font-bold transition-all ${branchType === "SPECIFIC" ? "border-blue-600 bg-blue-600 text-white" : "border-white bg-white text-slate-400"}`}>فرع محدد</button>
                  <button type="button" onClick={() => setBranchType("OPEN")} className={`p-3 rounded-xl border-2 font-bold transition-all ${branchType === "OPEN" ? "border-blue-600 bg-blue-600 text-white" : "border-white bg-white text-slate-400"}`}>مفتوح (أي فرع)</button>
                </div>
                {branchType === "SPECIFIC" && (
                  <select name="branchId" required className="w-full mt-4 p-3 bg-white border rounded-xl font-bold">
                    <option value="">-- اختر الفرع --</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                )}
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-2"><Clock size={14}/> الحضور الإلزامي</label>
                  <input name="timeIn" type="time" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} required className="w-full p-3 bg-white border rounded-xl font-bold" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-2"><Clock size={14}/> الانصراف الإلزامي</label>
                  <input name="timeOut" type="time" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} required className="w-full p-3 bg-white border rounded-xl font-bold" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-blue-600 mb-2"><Calculator size={14}/> ساعات العمل يومياً</label>
                  <div className="w-full p-3 bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-black text-center">
                    {dailyHours} ساعات
                  </div>
                </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">يوم الإجازة الأسبوعي</label>
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
                <label className="block text-xs font-bold text-slate-500 mb-1">ساعات عمل يوم الإجازة (إن وجدت)</label>
                <input name="offDayHours" type="number" defaultValue="0" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>

              {/* New Salary Type Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">نوع القبض</label>
                <select name="salaryType" defaultValue="MONTHLY" className="w-full p-3 bg-slate-50 border rounded-xl font-bold">
                  <option value="DAILY">يومي</option>
                  <option value="WEEKLY">اسبوعي</option>
                  <option value="MONTHLY">شهري</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-1"><DollarSign size={14}/> الراتب اليومي</label>
                <input name="dailySalary" type="number" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">معامل الإضافي (الافتراضي 1)</label>
                <input name="overtimeRate" type="number" step="0.1" defaultValue="1" className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>

              <div className="md:col-span-2 pt-4">
                <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg">
                  {loading ? "جاري الحفظ..." : <><Save size={20}/> حفظ الموظف وتفعيل الإعدادات</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}