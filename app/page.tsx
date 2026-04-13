"use client";
import { useState } from "react";
import { getDistance } from "@/lib/location";
import { checkInAction } from "@/app/actions/attendance";

export default function AttendancePage() {
  const [status, setStatus] = useState("اضغط لتسجيل الحضور");
  const [loading, setLoading] = useState(false);
  const [employeeCode, setEmployeeCode] = useState("ah100"); // كود تجريبي

  const handleCheckIn = () => {
    setLoading(true);
    setStatus("جاري تحديد موقعك...");

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      // استدعاء الـ Server Action
      const result = await checkInAction(employeeCode, latitude, longitude);

      if (result.error) {
        setStatus(`❌ ${result.error}`);
      } else {
        setStatus(`✅ ${result.success}`);
      }
      setLoading(false);
    }, (error) => {
      setStatus("❌ فشل الحصول على موقعك. تأكد من تفعيل الـ GPS");
      setLoading(false);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-100">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-800">نظام الحضور 📱</h1>
        <p className="text-gray-500 mb-8 text-sm">مرحباً بك، يرجى تسجيل حضورك اليومي</p>
        
        <input 
          type="text" 
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          placeholder="أدخل كود الموظف"
          className="w-full p-3 mb-4 border rounded-xl text-center bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
        />

        <div className={`mb-8 p-5 rounded-2xl text-sm font-medium transition-all ${
          status.includes("✅") ? "bg-green-50 text-green-700" : 
          status.includes("❌") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
        }`}>
          {status}
        </div>

        <button
          onClick={handleCheckIn}
          disabled={loading}
          className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-lg transition-all active:scale-95 ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          }`}
        >
          {loading ? "جاري المعالجة..." : "بصمة حضور (GPS)"}
        </button>
      </div>
    </div>
  );
}
