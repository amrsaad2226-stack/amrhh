// app/admin/branches/page.tsx
import db from "@/lib/db";
import { addBranch } from "@/app/actions/admin"; // تأكد أن هذا الأكشن موجود
import { MapPin, Plus, Building2, Navigation } from "lucide-react";

export default async function ManageBranches() {
  // جلب الفروع المسجلة حالياً
  const branches = await db.branch.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-4 md:p-10 bg-slate-50 min-h-screen font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
           <div>
              <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                <Building2 className="text-blue-600" size={32} /> إدارة الفروع
              </h1>
              <p className="text-slate-500 mt-2">أضف فروع شركتك وإحداثياتها الجغرافية بدقة</p>
           </div>
        </div>

        {/* نموذج إضافة فرع جديد */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700">
            <Plus className="text-blue-600" size={20} /> إضافة فرع جديد
          </h2>
          <form 
            action={async (formData) => {
              await addBranch(formData);
            }} 
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
               <button className="w-full md:w-fit bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">
                 <Navigation size={18} /> حفظ بيانات الفرع
               </button>
            </div>
          </form>
        </div>

        {/* قائمة الفروع الحالية */}
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                   <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-800">{branch.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {branch.latitude.toFixed(6)}, {branch.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="text-green-600 text-xs font-bold bg-green-50 px-4 py-2 rounded-xl">
                نشط الآن
              </div>
            </div>
          ))}
          {branches.length === 0 && (
            <p className="text-center text-slate-400 col-span-2 py-10 bg-white rounded-3xl border-2 border-dashed">لم يتم إضافة أي فروع بعد.</p>
          )}
        </div>
      </div>
    </div>
  );
}