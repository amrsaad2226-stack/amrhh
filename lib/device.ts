
export function getDeviceId() {
  if (typeof window === "undefined") return "";
  
  let id = localStorage.getItem("u_device_id");
  
  if (!id || id === "undefined" || id === "null") {
    // توليد معرف فريد يعتمد على الوقت وعشوائية أعلى
    id = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem("u_device_id", id);
  }
  
  return id.trim(); 
}
