"use client";
import { useState } from "react";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

// The component now expects deviceId to be passed as a prop
export default function PunchButtons({ employeeCode, isCurrentlyIn, deviceId }: { employeeCode: string, isCurrentlyIn: boolean, deviceId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "error" | "success" | "info" } | null>(null);
  const router = useRouter();

  // The useEffect that called getDeviceId() has been removed.

  const handleAction = async (action: "checkin" | "checkout") => {
    setLoading(true);
    setMessage(null);
    
    if (!deviceId) {
        setMessage({ text: "لم يتم العثور على بصمة الجهاز. حاول تحديث الصفحة.", type: 'error' });
        setLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // It now uses the deviceId passed in from its parent
        const res = action === 'checkin' 
          ? await checkInAction(employeeCode, latitude, longitude, deviceId)
          : await checkOutAction(employeeCode, latitude, longitude, deviceId);

        if (res.error) {
          setMessage({ text: res.error, type: 'error' });
        } else {
          setMessage({ text: res.success || 'تمت العملية بنجاح', type: 'success' });
          router.refresh();
        }
        setLoading(false);
      },
      (error) => {
        let errorMessage = "لا يمكن الوصول لموقعك. يرجى تفعيل خدمات الموقع والمحاولة مجدداً.";
        if(error.code === 1) errorMessage = "تم رفض إذن الوصول للموقع. يرجى السماح بالوصول والمحاولة مجدداً.";
        setMessage({ text: errorMessage, type: 'error' });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  return (
    <>
      {message && (
        <div className={`p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 transition-all ${
          message.type === 'error' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
          message.type === 'success' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
          'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
        }`}>
          {message.type === 'error' && <AlertCircle size={20} />}
          {message.type === 'success' && <CheckCircle2 size={20} />}
          <span>{message.text}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAction("checkin")}
          disabled={loading || isCurrentlyIn}
          className="bg-green-500 text-white font-black p-6 rounded-3xl disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" />}
          تسجيل حضور
        </button>
        <button
          onClick={() => handleAction("checkout")}
          disabled={loading || !isCurrentlyIn}
          className="bg-red-500 text-white font-black p-6 rounded-3xl disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" />}
          تسجيل انصراف
        </button>
      </div>
    </>
  );
}