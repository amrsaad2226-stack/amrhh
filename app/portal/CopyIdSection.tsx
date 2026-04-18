
"use client";
import { useState, useEffect } from "react";
import { Copy, Check, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CopyIdSection({ empName, empCode }: { empName: string, empCode: string }) {
  const [deviceId, setDeviceId] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = "dev-" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("device_id", id);
    }
    setDeviceId(id);
  }, []);

  const handleExtractAndCopy = () => {
    setLoading(true);
    const toastId = toast.loading("جاري قراءة الموقع وبصمة الجهاز...");

    // طلب تصريح الـ GPS من الموظف
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        
        // تجهيز رسالة احترافية منظمة للمدير
        const message = `مرحباً، أرجو تفعيل حسابي وإضافة فرع العمل:
👤 الموظف: ${empName}
🔢 الكود: ${empCode}
📱 بصمة الجهاز: ${deviceId}

📍 إحداثيات الموقع الحالي:
- خط العرض (Lat): ${latitude}
- خط الطول (Lng): ${longitude}
- الدقة: ${Math.round(accuracy)} متر
🗺️ رابط الخريطة: https://www.google.com/maps?q=${latitude},${longitude}`;

        // نسخ الرسالة بالكامل
        navigator.clipboard.writeText(message);
        
        toast.success("✅ تم نسخ البيانات! يمكنك لصقها في الواتساب وإرسالها للمدير.", { id: toastId });
        setCopied(true);
        setLoading(false);
        setTimeout(() => setCopied(false), 5000);
      },
      (error) => {
        toast.error("❌ فشل تحديد الموقع. يرجى تفعيل الـ GPS (الموقع) في هاتفك والمحاولة مرة أخرى.", { id: toastId });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 text-center">
      <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
        <MapPin size={32} />
      </div>
      
      <h3 className="text-lg font-black text-white mb-2">تحديد موقع الفرع وتفعيل الحساب</h3>
      <p className="text-xs text-blue-100 mb-6 leading-relaxed">
        قف في مقر العمل الفعلي (لأخذ الإحداثيات بدقة)، ثم اضغط على الزر أدناه لنسخ بياناتك وإرسالها للمدير.
      </p>

      <button 
        onClick={handleExtractAndCopy}
        disabled={loading}
        className="w-full bg-white text-blue-600 p-4 rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-xl font-black flex justify-center items-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : copied ? <Check size={20} /> : <Copy size={20} />}
        {loading ? "جاري استخراج البيانات..." : copied ? "تم النسخ! اذهب للواتساب" : "استخراج ونسخ البيانات"}
      </button>

      {copied && (
        <p className="mt-4 text-[10px] text-green-300 font-bold bg-green-900/30 p-2 rounded-lg">
          تم نسخ الرسالة محتوية على (بصمتك + إحداثيات الـ GPS الخاصة بك). قم بعمل Paste في محادثة المدير.
        </p>
      )}
    </div>
  );
}
