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

  if (hasCheckedIn && hasCheckedOut) return <div className="p-6 bg-slate-100 rounded-3xl text-center font-bold text-slate-500">تم اكتمال عمل اليوم 🎉</div>;

  return (
    <div className="flex flex-col gap-4">
      {hasCheckedIn ? (
        <button onClick={() => handlePunch("OUT")} disabled={loading} className="w-full bg-red-600 text-white p-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3">
          <LogOut size={24} /> {loading ? "جاري المعالجة..." : "تسجيل الانصراف"}
        </button>
      ) : (
        <button onClick={() => handlePunch("IN")} disabled={loading} className="w-full bg-green-600 text-white p-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3">
          <Fingerprint size={24} /> {loading ? "جاري المعالجة..." : "تسجيل الحضور"}
        </button>
      )}
    </div>
  );
}