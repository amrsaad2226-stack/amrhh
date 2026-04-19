"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Clock } from "lucide-react";

export default function CopyIdSection() {
  const [deviceId, setDeviceId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // جلب البصمة الحالية من المتصفح
    setDeviceId(localStorage.getItem("device_id") || "جاري التحميل...");
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`بصمة جهازي لتفعيل الحساب:\n${deviceId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 text-center shadow-sm animate-in zoom-in duration-300">
      <div className="bg-amber-200/50 text-amber-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
        <Clock size={40} />
      </div>
      
      <h3 className="text-xl font-black text-amber-800 mb-2">في انتظار التفعيل ⏳</h3>
      <p className="text-xs font-bold text-amber-700/70 mb-8 leading-relaxed">
        لقد قمت بتسجيل الدخول بنجاح، ولكن حسابك لم يتم ربطه بهذا الهاتف حتى الآن من قِبل الإدارة. لن تظهر أزرار الحضور والانصراف إلا بعد التفعيل.
      </p>

      <div className="text-right mb-2">
        <span className="text-[10px] font-black text-amber-600">كود جهازك الحالي (في حال طلبه المدير):</span>
      </div>
      
      <div className="bg-white p-2 rounded-2xl flex items-center gap-2 border border-amber-200 shadow-sm">
        <div className="flex-1 font-mono text-[10px] sm:text-xs text-slate-500 text-center select-all truncate">
          {deviceId}
        </div>
        <button 
          onClick={handleCopy} 
          className="bg-amber-100 text-amber-700 p-3 rounded-xl hover:bg-amber-200 transition-colors active:scale-95 flex items-center justify-center"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>
    </div>
  );
}