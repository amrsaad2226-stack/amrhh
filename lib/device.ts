// lib/device.ts
export function getDeviceId() {
  if (typeof window === "undefined") return "";
  
  // مفتاح موحد لكل التطبيق
  const STORAGE_KEY = "u_device_id";
  let id = localStorage.getItem(STORAGE_KEY);
  
  if (!id || id === "undefined" || id === "null") {
    // توليد المعرف لمرة واحدة فقط في عمر المتصفح
    id = 'dev_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, id);
  }
  
  return id.trim();
}