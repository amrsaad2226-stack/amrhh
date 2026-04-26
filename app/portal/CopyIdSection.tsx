"use client";
import { useState } from "react";
import { Copy, Check, Clock } from "lucide-react";

// The component now expects deviceId to be passed as a prop
export default function CopyIdSection({ deviceId }: { deviceId: string }) {
  const [copied, setCopied] = useState(false);

  // The useState and useEffect for deviceId have been removed.

  const handleCopy = () => {
    if (!deviceId || deviceId === 'جاري التحميل...') return; // Prevent copying placeholder text
    navigator.clipboard.writeText(`بصمة جهازي لتفعيل الحساب:\n${deviceId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30 text-center shadow-sm animate-in zoom-in duration-300 transition-colors">
      <div className="bg-amber-200/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
        <Clock size={40} />
      </div>
      
      <h3 className="text-xl font-black text-amber-800 dark:text-amber-300 mb-2">في انتظار التفعيل ⏳</h3>
      <p className="text-xs font-bold text-amber-700/70 dark:text-amber-400/60 mb-8 leading-relaxed">
        لقد قمت بتسجيل الدخول بنجاح، ولكن حسابك لم يتم ربطه بهذا الهاتف حتى الآن من قِبل الإدارة. لن تظهر أزرار الحضور والانصراف إلا بعد التفعيل.
      </p>

      <div className="text-right mb-2">
        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">كود جهازك الحالي (في حال طلبه المدير):</span>
      </div>
      
      <div className="bg-white dark:bg-slate-800/50 p-2 rounded-2xl flex items-center gap-2 border border-amber-200 dark:border-amber-800/20 shadow-sm">
        <div className="flex-1 font-mono text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center select-all truncate">
          {/* It now uses the deviceId from props */}
          {deviceId || "جاري التحميل..."}
        </div>
        <button 
          onClick={handleCopy} 
          disabled={!deviceId || deviceId === 'جاري التحميل...'}
          className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-500/20 transition-colors active:scale-95 flex items-center justify-center disabled:opacity-50"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>
    </div>
  );
}