"use client";

import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import { checkOutAction } from "@/app/actions/attendance";

export default function CheckoutForm() {
  const [status, setStatus] = useState("جاهز لتسجيل الانصراف");
  const [loading, setLoading] = useState(false);
  const [employeeCode, setEmployeeCode] = useState("");
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    setDeviceId(getDeviceId());
  },[]);

  const handleCheckOut = () => {
    if (!employeeCode) return alert("أدخل كود الموظف");
    setLoading(true);
    setStatus("جاري البحث عن أدق إشارة GPS...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        if (accuracy > 60) {
          setStatus(`الإشارة ضعيفة (${Math.round(accuracy)}م). قف في مكان مكشوف وأعد المحاولة.`);
          setLoading(false);
          return;
        }

        setStatus(`دقة جيدة (${Math.round(accuracy)}م). جاري تسجيل الانصراف...`);
        const res = await checkOutAction(employeeCode, latitude, longitude, deviceId);
        setStatus(res.error ? `❌ ${res.error}` : `✅ ${res.success}`);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation Error:", error.message);
        setStatus("❌ فشل تحديد الموقع. تأكد من تفعيل الـ GPS");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-sm mx-auto w-full text-center" dir="rtl">
      <h2 className="text-2xl font-black mb-6 text-slate-800">بصمة الانصراف 🏃‍♂️</h2>
      
      <input
        type="text"
        placeholder="كود الموظف"
        className="w-full p-4 border-2 border-slate-100 rounded-2xl text-center text-lg font-bold outline-none focus:border-red-500 transition-colors mb-4"
        onChange={(e) => setEmployeeCode(e.target.value)}
      />

      <div className={`p-4 rounded-2xl text-sm font-bold mb-6 transition-all ${
        status.includes("✅") ? "bg-green-50 text-green-700" :
        status.includes("❌") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
      }`}>
        {status}
      </div>

      <button
        onClick={handleCheckOut}
        disabled={loading}
        className={`w-full py-5 text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all ${
          loading ? "bg-slate-300" : "bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-200"
        }`}
      >
        {loading ? "إنتظر..." : "تسجيل الانصراف الآن"}
      </button>
    </div>
  );
}