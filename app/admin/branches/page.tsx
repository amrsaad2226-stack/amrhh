// app/admin/branches/page.tsx
import db from "@/lib/db";
import { MapPin, Building2 } from "lucide-react";
import BranchForm from "./BranchForm"; // استيراد الفورم الجديد

export default async function ManageBranches() {
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

        {/* استدعاء مكون الفورم الجديد هنا ✅ */}
        <BranchForm />

        {/* قائمة الفروع */}
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
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
              <div className="text-green-600 text-xs font-bold bg-green-50 px-4 py-2 rounded-xl">نشط</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}