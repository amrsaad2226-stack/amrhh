// app/admin/branches/page.tsx
import db from "@/lib/db";
import { Building2 } from "lucide-react";
import BranchForm from "./BranchForm"; 
import BranchCard from "./BranchCard"; // 👈 استيراد كارت الفرع الجديد

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

        {/* فورم إضافة فرع جديد */}
        <BranchForm />

        {/* قائمة الفروع */}
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map(branch => (
            <BranchCard key={branch.id} branch={branch} /> // 👈 استخدام المكون الجديد هنا
          ))}
        </div>
      </div>
    </div>
  );
}