export function getDeviceId() {
  if (typeof window === "undefined") return "";
  
  let id = localStorage.getItem("u_device_id");
  
  if (!id || id === "undefined" || id === "null") {
    // توليد معرف ثابت واحترافي
    id = 'dev_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem("u_device_id", id);
  }
  
  return id.trim();
}