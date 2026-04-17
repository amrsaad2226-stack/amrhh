// app/portal/login/page.tsx
"use client";
import { useState } from "react";
import { loginEmployee } from "@/app/actions/auth";
import { toast } from "sonner"; // 👈 استخدام الإشعارات العصرية
import { UserCircle2 } from "lucide-react";

export default function PortalLogin() {
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    const res = await loginEmployee(formData);
    if (res.error) {
      toast.error(res.error); // 👈 إشعار خطأ أحمر أنيق
      setLoading(false);
    } else {
      toast.success("تم تسجيل الدخول بنجاح!"); // 👈 إشعار نجاح أخضر
      window.location.href = "/portal"; // توجيه للوحة الموظف
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      <form action={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-sm text-center">
        <div className="bg-blue-50 text-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <UserCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">بوابة الموظفين</h1>
        <p className="text-slate-500 text-sm mb-8">سجل دخولك لمتابعة حضورك ورواتبك</p>

        <input name="code" placeholder="كود الموظف (مثال: ah100)" required className="w-full p-4 border-2 rounded-2xl mb-4 outline-none focus:border-blue-500 text-center font-bold" />
        <input name="password" type="password" placeholder="كلمة المرور" required className="w-full p-4 border-2 rounded-2xl mb-8 outline-none focus:border-blue-500 text-center" />

        <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">
          {loading ? "جاري الدخول..." : "دخول لحسابي"}
        </button>
      </form>
    </div>
  );
}
