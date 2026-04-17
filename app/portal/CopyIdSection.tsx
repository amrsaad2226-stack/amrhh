"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function CopyIdSection() {
  const [deviceId, setDeviceId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // كود بسيط لتوليد المعرف محلياً بدون مكتبات
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = "dev-" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("device_id", id);
    }
    setDeviceId(id);
  }, []);

  const handleCopy = () => {
    if (!deviceId) return;
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    toast.success("تم نسخ الرمز بنجاح");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20">
      <p className="text-[10px] font-bold mb-3 text-blue-100 uppercase text-center">
        رمز تعريف الجهاز الخاص بك
      </p>
      <div className="flex items-center gap-2">
        <div className="bg-black/20 flex-1 p-3 rounded-2xl font-mono text-[10px] truncate text-center text-white border border-white/10">
          {deviceId || "جاري التحميل..."}
        </div>
        <button 
          onClick={handleCopy}
          className="bg-white text-blue-600 p-3 rounded-xl hover:bg-blue-50 transition-all active:scale-90 shadow-lg"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
}