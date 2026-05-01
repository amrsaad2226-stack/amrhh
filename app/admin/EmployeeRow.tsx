// app/admin/EmployeeRow.tsx
"use client";

import { useState, useEffect } from "react";
// 👈 أضفنا أيقونة RefreshCcw
import { Edit, Trash2, X, Save, Clock, DollarSign, Globe, Calculator, RefreshCcw } from "lucide-react"; 
import ActivateDeviceBtn from "./ActivateDeviceBtn";
// 👈 أضفنا دالة resetEmployeeDevice
import { deleteEmployee, updateEmployee, resetEmployeeDevice } from "@/app/actions/admin"; 

export default function EmployeeRow({ employee, branches }: { employee: any, branches: any[] }) {
  const[isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [branchType, setBranchType] = useState(employee.isAnyBranch ? "OPEN" : "SPECIFIC");
  const [timeIn, setTimeIn] = useState(employee.timeIn);
  const [timeOut, setTimeOut] = useState(employee.timeOut);
  const [dailyHours, setDailyHours] = useState(employee.dailyHours);

  useEffect(() => {
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMinutes < 0) totalMinutes += 24 * 60; 
    setDailyHours(Math.round(totalMinutes / 60));
  },[timeIn, timeOut]);

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف الموظف ${employee.name}؟`)) return;
    setLoading(true);
    const res = await deleteEmployee(employee.id);
    if (res?.success) alert("✅ تم الحذف بنجاح");
    else alert("❌ " + res?.error);
    setLoading(false);
  };

  const handleUpdate = async (formData: FormData) => {
    setLoading(true);
    formData.append("branchType", branchType);
    formData.append("dailyHours", dailyHours.toString());
    const data = Object.fromEntries(formData);
    const res = await updateEmployee(employee.id, data);
    
    if (res?.success) {
      alert("✅ تم التعديل بنجاح");
      setIsEditOpen(false);
    } else alert("❌ " + res?.error);
    setLoading(false);
  };

  // 👈 دالة فك ارتباط الجهاز الجديدة
  const handleResetDevice = async () => {
    if (!confirm(`هل أنت متأكد من فك ارتباط جهاز الموظف ${employee.name}؟\n(سيتمكن من تسجيل الدخول من جهاز جديد)`)) return;
    setLoading(true);
    const res = await resetEmployeeDevice(employee.id);
    if (res?.success) alert("✅ تم فك ارتباط الجهاز بنجاح. الموظف الآن حر في الدخول من جهاز جديد.");
    else alert("❌ " + res?.error);
    setLoading(false);
  };

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="p-5 font-bold">{employee.name} <br/><span className="text-xs text-slate-400 font-mono">{employee.code}</span></td>
        
        {/* 🔻 تعديل خلية الجهاز 🔻 */}
        <td className="p-5">
          {employee.deviceId ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-100 px-3 py-2 rounded-lg font-bold text-slate-600">
                📱 جهاز مسجل
              </span>
              <button 
                onClick={handleResetDevice} 
                disabled={loading}
                title="فك ارتباط الجهاز (السماح بجهاز جديد)"
                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all flex items-center justify-center"
              >
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          ) : (
             <ActivateDeviceBtn employeeId={employee.id} />
          )}
        </td>
        {/* 🔺 نهاية تعديل خلية الجهاز 🔺 */}

        <td className="p-5">
          {employee.attendances?.length > 0 ? "✅ حضر" : "❌ غائب"}
        </td>
        <td className="p-5 flex gap-2">
          <button onClick={() => setIsEditOpen(true)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
            <Edit size={18} />
          </button>
          <button onClick={handleDelete} disabled={loading} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">
            <Trash2 size={18} />
          </button>
        </td>
      </tr>

      {/* ... (باقي كود Modal التعديل الخاص بالموظف بدون أي تغيير) ... */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 text-right" dir="rtl">
            {/* نفس الكود الخاص بالفورم اللي كتبناه في الإجابة السابقة */}
            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-red-500"><X /></button>
              <h2 className="text-xl font-black text-slate-800">تعديل بيانات: {employee.name}</h2>
            </div>
            <form action={handleUpdate} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
              <input name="name" defaultValue={employee.name} placeholder="اسم الموظف" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="code" defaultValue={employee.code} placeholder="كود الدخول (مثال: ah100)" required className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="password" type="password" placeholder="كلمة المرور (اتركها فارغة لعدم التغيير)" className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input name="department" defaultValue={employee.department} placeholder="القسم" required className="w-full p-3 bg-slate-50 border rounded-xl" />

              <div className="md:col-span-2 bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <label className="block text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><Globe size={18} /> نطاق البصمة الجغرافي</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setBranchType("SPECIFIC")} className={`p-3 rounded-xl border-2 font-bold transition-all ${branchType === "SPECIFIC" ? "border-blue-600 bg-blue-600 text-white" : "border-white bg-white text-slate-400"}`}>فرع محدد</button>
                  <button type="button" onClick={() => setBranchType("OPEN")} className={`p-3 rounded-xl border-2 font-bold transition-all ${branchType === "OPEN" ? "border-blue-600 bg-blue-600 text-white" : "border-white bg-white text-slate-400"}`}>مفتوح (أي فرع)</button>
                </div>
                {branchType === "SPECIFIC" && (
                  <select name="branchId" defaultValue={employee.branchId || ""} required className="w-full mt-4 p-3 bg-white border rounded-xl font-bold">
                    <option value="">-- اختر الفرع --</option>
                    {branches.map((b:any) => <option key={b.id} value={b.id}>{b.name}</option>)}
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
                 <select name="offDay" defaultValue={employee.offDay} className="w-full p-3 bg-slate-50 border rounded-xl font-bold">
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
                <input name="offDayHours" type="number" defaultValue={employee.offDayHours} className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">نوع القبض</label>
                <select name="salaryType" defaultValue={employee.salaryType} className="w-full p-3 bg-slate-50 border rounded-xl font-bold">
                  <option value="DAILY">يومي</option>
                  <option value="WEEKLY">اسبوعي</option>
                  <option value="MONTHLY">شهري</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-1"><DollarSign size={14}/> الراتب</label>
                <input name="dailySalary" type="number" defaultValue={employee.dailySalary} required className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">معامل الإضافي</label>
                <input name="overtimeRate" type="number" step="0.1" defaultValue={employee.overtimeRate} className="w-full p-3 bg-slate-50 border rounded-xl" />
              </div>

              <div className="md:col-span-2 pt-4">
                <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg">
                  {loading ? "جاري الحفظ..." : <><Save size={20}/> حفظ التعديلات</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
