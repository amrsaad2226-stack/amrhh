'use client';

import { useState } from 'react';
import { Branch } from '@prisma/client';
import { updateBranch, deleteBranch } from '@/app/actions/admin';
import { MapPin, Edit, Trash2, Save, X, AlertTriangle } from 'lucide-react';

export default function BranchCard({ branch }: { branch: Branch }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await updateBranch(branch.id, formData);
    if (res?.error) {
      setError(res.error);
    } else {
      setIsEditing(false);
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await deleteBranch(branch.id);
    if (res?.error) {
      setError(res.error);
      // إذا كان هناك خطأ (مثل وجود موظفين)، أغلق نافذة التأكيد
      setTimeout(() => {
          setIsDeleting(false);
          setError(null); // امسح رسالة الخطأ بعد فترة
      }, 3000);
    } 
    // لا حاجة لإخفاء `isDeleting` عند النجاح لأن المكون سيُحذف من الـ DOM
    setLoading(false);
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
      {isEditing ? (
        <form action={handleUpdate}>
          <div className="mb-4">
            <input name="name" defaultValue={branch.name} className="w-full p-2 border rounded-lg mb-2" placeholder="اسم الفرع" />
            <input name="latitude" defaultValue={branch.latitude} type="number" step="any" className="w-full p-2 border rounded-lg mb-2 font-mono" placeholder="خط العرض" />
            <input name="longitude" defaultValue={branch.longitude} type="number" step="any" className="w-full p-2 border rounded-lg font-mono" placeholder="خط الطول" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsEditing(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            <button type="submit" disabled={loading} className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-slate-300"><Save size={18} /></button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><MapPin size={24} /></div>
            <div>
              <h3 className="font-black text-xl text-slate-800">{branch.name}</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {branch.latitude.toFixed(6)}, {branch.longitude.toFixed(6)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Edit size={18} /></button>
            <button onClick={() => setIsDeleting(true)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={18} /></button>
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-red-600" size={20}/>
            <h4 className="font-bold text-red-800">تأكيد الحذف</h4>
          </div>
          <p className="text-sm text-red-700">هل أنت متأكد أنك تريد حذف هذا الفرع؟ لا يمكن التراجع عن هذا الإجراء.</p>
           {error && <p className="text-sm text-red-700 mt-2 font-bold">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsDeleting(false)} disabled={loading} className="px-4 py-2 rounded-lg text-sm">إلغاء</button>
            <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:bg-red-300">حذف</button>
          </div>
        </div>
      )}
       {error && !isDeleting && <p className="text-sm text-red-700 mt-4 font-bold">{error}</p>}
    </div>
  );
}
