
"use client";
import { useState, useEffect } from "react";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { toast } from "sonner";
import { Fingerprint, LogOut } from "lucide-react";

export default function PunchButtons({ 
  employeeCode, isCurrentlyIn 
}: { 
  employeeCode: string; isCurrentlyIn: boolean; 
}) {
  const [loading, setLoading] = useState(false);

  // التأكد من المسمى الموحد للبصمة
  const getMyId = () => localStorage.getItem("device_id") || "";

  const handlePunch = async (type: "IN" | "OUT") => {
    setLoading(true);
    const tid = toast.loading("جاري التحقق من الموقع والبصمة...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const currentDeviceId = getMyId();

        const res = type === "IN" 
          ? await checkInAction(employeeCode, latitude, longitude, currentDeviceId)
          : await checkOutAction(employeeCode, latitude, longitude, currentDeviceId);

        if (res.error) {
          toast.error(res.error, { id: tid });
        } else {
          toast.success(res.success, { id: tid });
          window.location.reload();
        }
        setLoading(false);
      },
      (err) => {
        toast.error("فشل تحديد الموقع. تأكد من تفعيل الـ GPS", { id: tid });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {isCurrentlyIn ? (
        <button
          onClick={() => handlePunch("OUT")}
          disabled={loading}
          className="w-full bg-gradient-to-l from-red-600 to-rose-500 text-white p-6 rounded-[2rem] font-black text-xl shadow-xl shadow-red-100 flex items-center justify-center gap-4 active:scale-95 transition-all"
        >
          <LogOut size={28} />
          {loading ? "جاري الحفظ..." : "تسجيل الانصراف الآن"}
        </button>
      ) : (
        <button
          onClick={() => handlePunch("IN")}
          disabled={loading}
          className="w-full bg-gradient-to-l from-green-600 to-emerald-500 text-white p-6 rounded-[2rem] font-black text-xl shadow-xl shadow-green-100 flex items-center justify-center gap-4 active:scale-95 transition-all"
        >
          <Fingerprint size={28} />
          {loading ? "جاري الحفظ..." : "تسجيل الحضور الآن"}
        </button>
      )}
    </div>
  );
}
