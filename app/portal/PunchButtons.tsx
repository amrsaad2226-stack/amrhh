// app/portal/PunchButtons.tsx
"use client";

import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { toast } from "sonner";
import { Fingerprint, LogOut } from "lucide-react";

export default function PunchButtons({ 
  employeeCode, 
  hasCheckedIn, 
  hasCheckedOut 
}: { 
  employeeCode: string; 
  hasCheckedIn: boolean; 
  hasCheckedOut: boolean; 
}) {
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    setDeviceId(getDeviceId());
  },[]);

  const handlePunch = async (type: "IN" | "OUT") => {
    setLoading(true);
    toast.loading("جاري البحث عن أدق إشارة GPS...", { id: "gps-toast" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        if (accuracy > 60) {
          toast.error(`الإشارة ضعيفة (${Math.round(accuracy)}م). قف في مكان مكشوف وأعد المحاولة.`, { id: "gps-toast" });
          setLoading(false);
          return;
        }

        toast.loading(`دقة جيدة (${Math.round(accuracy)}م). جاري تسجيل ${type === "IN" ? "الحضورو" : "الانصراف"}...`, { id: "gps-toast" });
        
        const res = type === "IN" 
          ? await checkInAction(employeeCode, latitude, longitude, deviceId)
          : await checkOutAction(employeeCode, latitude, longitude, deviceId);

        if (res.error) {
          toast.error(res.error, { id: "gps-toast" });
        } else {
          toast.success(res.success, { id: "gps-toast" });
          // تحديث الصفحة برمجياً لإخفاء زر الحضور وإظهار الانصراف
          window.location.reload(); 
        }
        setLoading(false);
      },
      (error) => {
        toast.error("فشل تحديد الموقع. تأكد من تفعيل الـ GPS", { id: "gps-toast" });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // إذا سجل حضور وانصراف، يومه انتهى
  if (hasCheckedIn && hasCheckedOut) {
    return (
      <div className="bg-slate-100 border-2 border-dashed border-slate-200 text-slate-500 p-6 rounded-3xl text-center font-bold">
        🎉 لقد أتممت عملك لهذا اليوم بنجاح. شكراً لك!
      </div>
    );
  }

  // إذا سجل حضور، نظهر له زر الانصراف
  if (hasCheckedIn && !hasCheckedOut) {
    return (
      <button
        onClick={() => handlePunch("OUT")}
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white p-6 rounded-3xl shadow-lg shadow-red-200 font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95"
      >
        <LogOut size={28} />
        {loading ? "جاري المعالجة..." : "تسجيل الانصراف"}
      </button>
    );
  }

  // الوضع الافتراضي: زر الحضور
  return (
    <button
      onClick={() => handlePunch("IN")}
      disabled={loading}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-6 rounded-3xl shadow-lg shadow-green-200 font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95"
    >
      <Fingerprint size={28} />
      {loading ? "جاري المعالجة..." : "تسجيل الحضور"}
    </button>
  );
}