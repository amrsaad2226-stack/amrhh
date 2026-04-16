"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getDeviceId } from "@/lib/device";
import { checkInAction } from "@/app/actions/attendance";

export default function AttendancePage() {
  const [status, setStatus] = useState("جاهز");
  const [loading, setLoading] = useState(false);
  const [employeeCode, setEmployeeCode] = useState(""); 
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  // 1. وظيفة تسجيل الحضور اليومي (دقة عالية)
  const handleCheckIn = () => {
    if (!employeeCode) return alert("أدخل كود الموظف");
    setLoading(true);
    setStatus("جاري البحث عن أدق إشارة GPS...");

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      
      if (accuracy > 60) {
        setStatus(`الإشارة ضعيفة (${Math.round(accuracy)}م). قف في مكان مكشوف وأعد المحاولة.`);
        setLoading(false);
        return;
      }

      setStatus(`دقة جيدة (${Math.round(accuracy)}م). جاري تسجيل البصمة...`);
      const res = await checkInAction(employeeCode, latitude, longitude, deviceId);
      setStatus(res.error ? `❌ ${res.error}` : `✅ ${res.success}`);
      setLoading(false);
    }, () => {
      setStatus("❌ فشل تحديد الموقع. تأكد من تفعيل الـ GPS");
      setLoading(false);
    }, { enableHighAccuracy: true, timeout: 15000 });
  };

  // 2. وظيفة نسخ "بيانات التسجيل لأول مرة" (إحداثيات دقيقة + بصمة جهاز)
  const handleCopyFullInfo = () => {
    setLoading(true);
    setStatus("جاري استخراج أدق إحداثيات لموقعك حالياً...");

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      
      // الرسالة التي ستصل للأدمن
      const fullInfo = `بيانات تسجيل موظف جديد:\n----------------------\n📍 الإحداثيات: ${latitude}, ${longitude}\n📱 بصمة الجهاز: ${deviceId}\n🎯 مستوى الدقة: ${Math.round(accuracy)} متر`;
      
      const textArea = document.createElement("textarea");
      textArea.value = fullInfo;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      alert(`✅ تم النسخ بنجاح (الدقة: ${Math.round(accuracy)} متر)\n\nأرسل البيانات المنسوخة الآن للمدير لتفعيل حسابك.`);
      setStatus("تم نسخ بيانات الموقع والجهاز ✅");
      setLoading(false);
    }, () => {
      alert("❌ فشل الحصول على الموقع. تأكد من الـ GPS");
      setLoading(false);
    }, { enableHighAccuracy: true, timeout: 20000 });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-right font-sans" dir="rtl">
      <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h1 className="text-2xl font-black text-center mb-2 text-slate-800">بصمة الحضور 📍</h1>
        <p className="text-center text-slate-400 text-xs mb-8">نظام الحضور والانصراف الذكي</p>
        
        <input 
          type="text" 
          placeholder="كود الموظف"
          className="w-full p-4 border-2 border-slate-100 rounded-2xl text-center text-lg font-bold outline-none focus:border-green-500 focus:bg-slate-50 transition-all mb-4"
          onChange={(e) => setEmployeeCode(e.target.value)}
        />

        <div className={`p-4 rounded-2xl text-center font-bold mb-6 text-sm transition-all ${
          status.includes("✅") ? "bg-green-50 text-green-700" : 
          status.includes("❌") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
        }`}>
          {status}
        </div>

        <button
          onClick={handleCheckIn}
          disabled={loading}
          className={`w-full py-5 text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all mb-4 ${
            loading ? "bg-slate-300" : "bg-gradient-to-r from-green-500 to-emerald-600"
          }`}
        >
          {loading ? "إنتظر..." : "تسجيل بصمة الآن"}
        </button>

        <Link href="/checkout" className="block text-center w-full py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 active:bg-red-100 transition-colors">
          تسجيل الانصراف
        </Link>

        <div className="pt-6 mt-6 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 mb-3 text-center italic">للموظفين الجدد (تفعيل الحساب):</p>
          <button
            onClick={handleCopyFullInfo}
            disabled={loading}
            className="w-full py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center gap-2"
          >
            <span>نسخ (الموقع + بصمة الجهاز) للإدارة</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
