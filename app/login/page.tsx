
"use client";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import { loginEmployee } from "@/app/actions/auth";
import { toast } from "sonner";
import { UserCircle2, MapPin, Copy, Check, Loader2, ArrowRight } from "lucide-react";

export default function PortalLogin() {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"LOGIN" | "NEW_EMP">("LOGIN");
  
  const [empName, setEmpName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
  }, []);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    const res = await loginEmployee(formData);
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("تم تسجيل الدخول بنجاح!");
      window.location.href = "/";
    }
  }

  const handleExtractData = () => {
    if (!empName.trim()) return toast.error("يرجى كتابة اسمك أولاً");
    
    setLoading(true);
    const toastId = toast.loading("جاري قراءة الـ GPS والبصمة...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const message = `مرحباً، أنا موظف جديد في موقع جديد.
👤 الاسم: ${empName}
📱 بصمة الجهاز: ${deviceId}

📍 إحداثيات الفرع (لإضافته في السيستم):
Lat: ${latitude}
Lng: ${longitude}
الدقة: ${Math.round(accuracy)} متر
🗺️ الخريطة: https://www.google.com/maps?q=${latitude},${longitude}`;

        navigator.clipboard.writeText(message);
        toast.success("✅ تم النسخ! اذهب للواتساب وأرسل الرسالة للمدير.", { id: toastId });
        setCopied(true);
        setLoading(false);
        setTimeout(() => setCopied(false), 5000);
      },
      (error) => {
        toast.error("❌ فشل تحديد الموقع. يرجى تفعيل الـ GPS في هاتفك والمحاولة مرة أخرى.", { id: toastId });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans transition-colors duration-300" dir="rtl">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl dark:shadow-slate-800/50 border border-slate-100 dark:border-slate-800 w-full max-w-sm relative overflow-hidden">
        
        {view === "LOGIN" && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <UserCircle2 size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 text-center">بوابة الموظفين</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center">سجل دخولك لمتابعة حضورك ورواتبك</p>

            <form action={handleLogin}>
              <input name="code" placeholder="كود الموظف (مثال: ah100)" required className="w-full p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl mb-4 outline-none focus:border-blue-500 dark:focus:border-blue-500 text-center font-bold transition-all text-slate-800 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500" />
              <input name="password" type="password" placeholder="كلمة المرور" required className="w-full p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl mb-8 outline-none focus:border-blue-500 dark:focus:border-blue-500 text-center transition-all text-slate-800 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500" />

              <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 dark:shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all">
                {loading ? "جاري الدخول..." : "دخول لحسابي"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 font-bold">موظف جديد في فرع جديد؟</p>
              <button 
                onClick={() => setView("NEW_EMP")}
                className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-6 py-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors w-full flex items-center justify-center gap-2"
              >
                <MapPin size={16} /> إرسال بياناتي للإدارة
              </button>
            </div>
          </div>
        )}

        {view === "NEW_EMP" && (
          <div className="animate-in fade-in slide-in-from-left duration-300">
            <button onClick={() => setView("LOGIN")} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 flex items-center gap-1 text-sm font-bold">
              <ArrowRight size={16} /> رجوع للدخول
            </button>
            
            <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <MapPin size={32} />
            </div>
            
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">تسجيل بيانات فرع جديد</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed font-bold">
              قف داخل مقر العمل الفعلي، واكتب اسمك، ثم اضغط على الزر لنسخ الإحداثيات والبصمة وإرسالها للمدير.
            </p>

            <input 
              type="text" 
              placeholder="اكتب اسمك الثلاثي" 
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              className="w-full p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl mb-4 outline-none focus:border-amber-500 dark:focus:border-amber-500 text-center font-bold text-slate-800 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500"
            />

            <button 
              onClick={handleExtractData}
              disabled={loading}
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-200 dark:shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : copied ? <Check size={20} /> : <Copy size={20} />}
              {loading ? "جاري قراءة الـ GPS..." : copied ? "تم النسخ! اذهب للواتساب" : "استخراج ونسخ البيانات"}
            </button>

            {copied && (
              <p className="mt-4 text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-500/10 p-3 rounded-xl text-center border border-green-100 dark:border-green-800">
                ✅ تم نسخ الرسالة بنجاح! افتح محادثة الواتساب مع المدير واضغط "لصق" (Paste).
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
