"use client";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CopyIdSection() {
  const [deviceId, setDeviceId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    toast.success("تم نسخ الرمز! أرسله الآن للمدير.");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
      <p className="text-[10px] font-mono mb-2 text-blue-200 uppercase tracking-widest">Your Device ID</p>
      <div className="flex items-center gap-2">
        <div className="bg-black/20 flex-1 p-3 rounded-xl font-mono text-xs truncate">
          {deviceId || "جاري الاستخراج..."}
        </div>
        <button 
          onClick={handleCopy}
          className="bg-white text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-all active:scale-90"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>
    </div>
  );
}
