"use client";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import { checkInAction } from "@/app/actions/attendance";

export default function AttendancePage() {
  const [status, setStatus] = useState("جاهز للبصمة");
  const [loading, setLoading] = useState(false);
  const [employeeCode, setEmployeeCode] = useState(""); 
  const [myId, setMyId] = useState("");

  // جلب بصمة الجهاز فور تحميل الصفحة ليكون جاهزاً
  useEffect(() => {
    setMyId(getDeviceId());
  }, []);

  const handleCheckIn = () => {
    if (!employeeCode) { alert("أدخل كود الموظف أولاً"); return; }
    setLoading(true);
    setStatus("جاري تحديد الموقع...");

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      // نرسل الـ ID الجاهز مباشرة للسيرفر
      const result = await checkInAction(employeeCode, latitude, longitude, myId);
      
      if (result.error) setStatus(`❌ ${result.error}`);
      else setStatus(`✅ ${result.success}`);
      setLoading(false);
    }, (error) => {
      setStatus("❌ تأكد من فتح الـ GPS");
      setLoading(false);
    }, { enableHighAccuracy: true, timeout: 5000 }); // تحسين سرعة الاستجابة
  };

  const handleCopyAllInfo = () => {
    setStatus("جاري استخراج بياناتك...");
    navigator.geolocation.getCurrentPosition((position) => {
      const info = `الاحداثيات: ${position.coords.latitude}, ${position.coords.longitude}\nبصمة الجهاز: ${myId}`;
      navigator.clipboard.writeText(info).then(() => {
        alert("تم نسخ البيانات بنجاح!\nأرسلها للأدمن لتفعيل حسابك.");
        setStatus("تم النسخ بنجاح ✅");
      });
    }, () => alert("افتح الـ GPS أولاً"));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-right" dir="rtl">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-black text-center text-gray-800">نظام الحضور 📍</h1>
        
        <input 
          type="text" 
          placeholder="كود الموظف (مثلاً: ah100)"
          className="w-full p-4 border-2 rounded-2xl text-center text-lg font-bold outline-none focus:border-green-500"
          onChange={(e) => setEmployeeCode(e.target.value)}
        />

        <div className="p-4 bg-gray-50 rounded-2xl text-center font-bold text-gray-600">
          {status}
        </div>

        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all"
        >
          {loading ? "انتظر ثواني..." : "بصمة حضور"}
        </button>

        <button
          onClick={handleCopyAllInfo}
          className="w-full py-3 border-2 border-dashed border-blue-400 text-blue-600 rounded-xl font-bold text-sm"
        >
          نسخ البيانات للإدارة (لأول مرة فقط)
        </button>
      </div>
    </div>
  );
}