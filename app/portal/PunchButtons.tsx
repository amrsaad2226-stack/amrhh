"use client";
import { useState } from "react";
import { checkInAction, checkOutAction } from "@/app/actions/attendance";
import { getDeviceId } from "@/lib/device"; // Import getDeviceId
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Remove deviceId from props
export default function PunchButtons({ employeeCode, isCurrentlyIn }: { employeeCode: string, isCurrentlyIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "error" | "success" | "info" } | null>(null);
  const router = useRouter();

  const handleAction = async (action: "checkin" | "checkout") => {
    setLoading(true);
    setMessage(null);

    // Fetch the device ID directly from localStorage at the moment of the click.
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
        
        // Send the freshly fetched deviceId to the server action.
        const res = action === 'checkin' 
          ? await checkInAction(employeeCode, latitude, longitude, currentDeviceId)
          : await checkOutAction(employeeCode, latitude, longitude, currentDeviceId);

        if (res.error) {
          setMessage({ text: res.error, type: 'error' });
        } else {
          setMessage({ text: res.success || 'تمت العملية بنجاح', type: 'success' });
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
            disabled={loading || isCurrentlyIn}
            onClick={() => handleAction("checkin")}
            className="bg-green-600 text-white font-black py-6 rounded-3xl disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 transition-all duration-300">
              حضور
          </button>
          <button 
            disabled={loading || !isCurrentlyIn}
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