"use client";
import { useState, useEffect } from "react";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { getDeviceId } from "@/lib/device";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PunchButtons({ employeeCode, isCurrentlyIn: initialIsCurrentlyIn }: { employeeCode: string, isCurrentlyIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "error" | "success" | "info" } | null>(null);
  const [isClientCurrentlyIn, setIsClientCurrentlyIn] = useState(initialIsCurrentlyIn);
  const router = useRouter();

  useEffect(() => {
    setIsClientCurrentlyIn(initialIsCurrentlyIn);
  }, [initialIsCurrentlyIn]);

  const handleAction = async (action: "checkin" | "checkout") => {
    setLoading(true);
    setMessage(null);

    const currentDeviceId = getDeviceId();

    if (!currentDeviceId) {
        setMessage({ text: "لم يتم تحديد بصمة الجهاز. حاول تحديث الصفحة.", type: "error" });
        setLoading(false);
        return;
    }

    if (!navigator.geolocation) {
      setMessage({ text: "متصفحك لا يدعم تحديد الموقع", type: "error" });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        const res = action === 'checkin' 
          ? await checkInAction(employeeCode, latitude, longitude, currentDeviceId)
          : await checkOutAction(employeeCode, latitude, longitude, currentDeviceId);

        if (res.error) {
          setMessage({ text: res.error, type: 'error' });
          // The specific logic to handle the late checkout error
          if (res.error.includes("تجاوزت عدد الساعات المسموح بها لتسجيل الانصراف")) {
            setIsClientCurrentlyIn(false); // Consider the user as checked out for the UI
          }
        } else {
          setMessage({ text: res.success || 'تمت العملية بنجاح', type: 'success' });
          // On successful action, refresh the page to get the canonical state from the server
          router.refresh();
        }
        setLoading(false);
      },
      (error) => {
        let errorMessage = "فشل تحديد الموقع. تأكد من تفعيل الـ GPS.";
        if(error.code === 1) errorMessage = "يرجى إعطاء إذن الوصول للموقع للمتصفح.";
        setMessage({ text: errorMessage, type: 'error' });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button 
            disabled={loading || isClientCurrentlyIn}
            onClick={() => handleAction("checkin")}
            className="bg-green-600 text-white font-black py-6 rounded-3xl disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition-all duration-300">
              حضور
          </button>
          <button 
            disabled={loading || !isClientCurrentlyIn}
            onClick={() => handleAction("checkout")}
            className="bg-red-500 text-white font-black py-6 rounded-3xl disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition-all duration-300">
              انصراف
          </button>
        </div>

        {loading && (
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                <Loader2 className="animate-spin" size={20}/>
                <span className="text-sm font-bold">جاري تحديد موقعك وتسجيل الحركة...</span>
            </div>
        )}

        {message && (
            <div className={`flex items-center justify-center gap-2 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 dark:bg-red-500/10 text-red-700' : 'bg-green-100 dark:bg-green-500/10 text-green-700'}`}>
                {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                <span className="text-sm font-bold">{message.text}</span>
            </div>
        )}
    </div>
  );
}
