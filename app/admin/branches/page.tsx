// app/admin/branches/page.tsx
import db from "@/lib/db";
import { addBranch } from "@/app/actions/admin";
import { MapPin, Plus } from "lucide-react";

export default async function ManageBranches() {
  const branches = await db.branch.findMany();

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8">إدارة الفروع 🏢</h1>

        {/* نموذج إضافة فرع جديد */}
        <form action={addBranch} className="bg-white p-6 rounded-3xl shadow-sm mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold mb-2">اسم الفرع</label>
            <input name="name" required className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="مثلاً: فرع دمياط" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-2">خط العرض (Lat)</label>
            <input name="latitude" type="number" step="any" required className="w-full p-3 bg-slate-50 border rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-2">خط الطول (Lng)</label>
            <input name="longitude" type="number" step="any" required className="w-full p-3 bg-slate-50 border rounded-xl" />
          </div>
          <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} /> إضافة
          </button>
        </form>

        {/* قائمة الفروع الحالية */}
        <div className="grid gap-4">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{branch.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin size={12} /> {branch.latitude}, {branch.longitude}
                </p>
              </div>
              <div className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1 rounded-lg">نشط</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
