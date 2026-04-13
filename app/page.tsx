"use client";
import { useState } from "react";
import { checkInAction } from "@/app/actions/attendance";
import { getOrCreateDeviceId } from "@/lib/device";

export default function AttendancePage() {
  const [status, setStatus] = useState("اضغط لتسجيل الحضور");
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [employeeCode, setEmployeeCode] = useState("ah100");

  const handleCheckIn = () => {
    setLoading(true);
    setStatus("جاري التحقق من بصمة الجهاز والموقع...");

    const deviceId = getOrCreateDeviceId(); // جلب بصمة الجهاز

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      // إرسال الـ deviceId للـ Action
      const result = await checkInAction(employeeCode, latitude, longitude, deviceId!);

      if (result.error) setStatus(`❌ ${result.error}`);
      else setStatus(`✅ ${result.success}`);
      setLoading(false);
    }, (error) => {
      setStatus("❌ فشل الحصول على موقعك. تأكد من تفعيل الـ GPS");
      setLoading(false);
    });
  };

  const handleCopyLocation = () => {
    const deviceId = getOrCreateDeviceId();
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const info = `Coordinates: ${latitude}, ${longitude}\nDevice ID: ${deviceId}`;
      navigator.clipboard.writeText(info).then(() => {
        alert("تم نسخ إحداثياتك وبصمة جهازك. أرسلها للادمن.");
      });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans text-right" dir="rtl">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-slate-100">
        <h1 className="text-3xl font-black mb-2 text-slate-800">بصمة الموبايل 📍</h1>
        <p className="text-slate-500 mb-8 text-sm">نظام الحضور والانصراف الذكي</p>
        
        <input 
          type="text" 
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          placeholder="أدخل كود الموظف"
          className="w-full p-4 mb-4 border-2 border-slate-100 rounded-2xl text-center bg-slate-50 focus:border-green-500 focus:bg-white outline-none transition-all font-bold"
        />

        <div className={`mb-8 p-5 rounded-2xl text-sm font-bold transition-all ${
          status.includes("✅") ? "bg-green-100 text-green-800" : 
          status.includes("❌") ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
        }`}>
          {status}
        </div>

        <button
          onClick={handleCheckIn}
          disabled={loading}
          className={`w-full py-5 rounded-2xl text-white font-black text-xl shadow-lg transition-all active:scale-95 mb-6 ${
            loading ? "bg-slate-300" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-200"
          }`}
        >
          {loading ? "جاري المعالجة..." : "تسجيل حضور"}
        </button>

        <div className="border-t border-slate-100 pt-6 mt-2">
          <p className="text-xs text-slate-400 mb-3">خاص للموظفين الجدد:</p>
          
          <button
            onClick={handleCopyLocation}
            disabled={copying}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-blue-100 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors active:bg-blue-100"
          >
            <span>{copying ? "جاري استخراج الموقع..." : "نسخ إحداثيات موقعي الحالية"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs text-center">
        تأكد من تفعيل الـ GPS والسماح للمتصفح بالوصول للموقع ليعمل التطبيق بدقة.
      </p>
    </div>
  );
}
