"use client";
import { useState, useEffect } from "react";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { toast } from "sonner";
import { Fingerprint, LogOut } from "lucide-react";

export default function PunchButtons({ 
  employeeCode, hasCheckedIn, hasCheckedOut 
}: { 
  employeeCode: string; hasCheckedIn: boolean; hasCheckedOut: boolean; 
}) {
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    setDeviceId(localStorage.getItem("device_id") || "");
  }, []);

  const handlePunch = async (type: "IN" | "OUT") => {
    setLoading(true);
    const toastId = toast.loading("جاري تحديد الموقع...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        const res = type === "IN" 
          ? await checkInAction(employeeCode, latitude, longitude, deviceId)
          : await checkOutAction(employeeCode, latitude, longitude, deviceId);

        if (res.error) toast.error(res.error, { id: toastId });
        else {
          toast.success(res.success, { id: toastId });
          window.location.reload();
        }
        setLoading(false);
      },
      (err) => {
        toast.error("فشل تحديد الموقع. تأكد من تفعيل الـ GPS", { id: toastId });
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // 👈 التعديل يبدأ من هنا:
  // إذا كان مسجل حضور ولم يسجل انصراف بعد (فترة عمل حالية)
  if (hasCheckedIn && !hasCheckedOut) {
    return (
      <button 
        onClick={() => handlePunch("OUT")} 
        disabled={loading} 
        className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
      >
        <LogOut size={24} /> {loading ? "جاري المعالجة..." : "تسجيل الانصراف"}
      </button>
    );
  }

  // في أي حالة أخرى (لم يبدأ اليوم، أو أنهى فترة ويريد بدء فترة جديدة)
  return (
    <button 
      onClick={() => handlePunch("IN")} 
      disabled={loading} 
      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
    >
      <Fingerprint size={24} /> {loading ? "جاري المعالgä..." : "تسجيل الحضور"}
    </button>
  );
}