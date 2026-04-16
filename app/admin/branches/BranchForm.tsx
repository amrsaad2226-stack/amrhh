// app/admin/branches/BranchForm.tsx
"use client";

import { useState } from "react";
import { Plus, Navigation } from "lucide-react";
import { addBranch } from "@/app/actions/admin";

export default function BranchForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await addBranch(formData);
    if (res?.error) {
      alert("❌ " + res.error);
    } else {
      alert("✅ تم إضافة الفرع بنجاح");
      // مسح الفورم بعد النجاح
      (document.getElementById("branch-form") as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700">
        <Plus className="text-blue-600" size={20} /> إضافة فرع جديد
      </h2>
      <form 
        id="branch-form"
        action={handleSubmit} 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
      >
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">اسم الفرع</label>
          <input name="name" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500 font-bold" placeholder="مثلاً: فرع دمياط" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">خط العرض (Latitude)</label>
          <input name="latitude" type="number" step="any" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500 font-mono" placeholder="31.039..." />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">خط الطول (Longitude)</label>
          <input name="longitude" type="number" step="any" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-500 font-mono" placeholder="31.399..." />
        </div>
        <div className="md:col-span-3">
           <button 
             disabled={loading}
             className={`w-full md:w-fit px-10 py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-white ${
               loading ? "bg-slate-300" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
             }`}
           >
             <Navigation size={18} /> 
             {loading ? "جاري الحفظ..." : "حفظ بيانات الفرع"}
           </button>
        </div>
      </form>
    </div>
  );
}