"use client";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import { checkInAction } from "@/app/actions/attendance";

export default function AttendancePage() {
  const [status, setStatus] = useState("جاهز");
  const [loading, setLoading] = useState(false);
  const [employeeCode, setEmployeeCode] = useState(""); 
  const [deviceId, setDeviceId] = useState("");

  // توليد الكود فوراً عند فتح الصفحة
  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  const handleCheckIn = () => {
    if (!employeeCode) return alert("أدخل الكود");
    setLoading(true);
    setStatus("جاري تحديد موقعك...");

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await checkInAction(employeeCode, pos.coords.latitude, pos.coords.longitude, deviceId);
      setStatus(res.error ? `❌ ${res.error}` : `✅ ${res.success}`);
      setLoading(false);
    }, () => {
      setStatus("❌ افتح الـ GPS");
      setLoading(false);
    }, { timeout: 5000 });
  };

  // وظيفة النسخ السريع والبسيط
  const quickCopy = () => {
    // تنسيق بسيط جداً للإدارة
    const textToCopy = `الكود: ${deviceId}`;
    
    // الطريقة الأسرع للنسخ
    const textArea = document.createElement("textarea");
    textArea.value = deviceId; // ننسخ الكود فقط بدون كلمة "الكود"
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert("تم النسخ! أرسله للمدير");
    } catch (err) {
      alert("برجاء نسخ الكود يدوياً: " + deviceId);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-right font-sans" dir="rtl">
      <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
        <h1 className="text-xl font-black text-center mb-6">بصمة الحضور 📍</h1>
        
        <input 
          type="text" 
          placeholder="كود الموظف"
          className="w-full p-4 border-2 rounded-2xl text-center text-lg font-bold outline-none focus:border-green-500 mb-4"
          onChange={(e) => setEmployeeCode(e.target.value)}
        />

        <div className="p-4 bg-gray-50 rounded-2xl text-center font-bold text-gray-600 mb-4 text-sm">
          {status}
        </div>

        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg shadow-md active:scale-95 mb-6"
        >
          {loading ? "إنتظر..." : "تسجيل حضور"}
        </button>

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 mb-2">بصمة جهازك الفريدة:</p>
          <div 
            onClick={quickCopy}
            className="bg-blue-50 text-blue-700 p-2 rounded-lg text-xs font-mono cursor-pointer border border-blue-100 active:bg-blue-100 transition-colors"
          >
            {deviceId || "جاري التوليد..."}
            <div className="text-[9px] mt-1 text-blue-400">(اضغط هنا للنسخ السريع)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
