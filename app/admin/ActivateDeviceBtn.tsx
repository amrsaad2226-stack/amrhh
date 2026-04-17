"use client";
import { Fingerprint } from "lucide-react";
import { activateEmployeeDevice } from "../actions/admin";

export default function ActivateDeviceBtn({ employeeId }: { employeeId: number }) {
  
  const handleActivate = async () => {
    // فتح نافذة منبثقة سريعة للأدمن ليلصق الكود
    const deviceId = window.prompt("📱 الصق 'بصمة الجهاز' المرسلة من الموظف هنا:");
    
    if (deviceId && deviceId.trim() !== "") {
      const res = await activateEmployeeDevice(employeeId, deviceId.trim());
      if (res.success) {
         alert("✅ تم ربط الموبايل بالموظف بنجاح!");
      } else {
         alert("❌ حدث خطأ أثناء التفعيل");
      }
    }
  };

  return (
    <button
      onClick={handleActivate}
      className="flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
    >
      <Fingerprint size={14} /> تفعيل الموبايل
    </button>
  );
}
