// lib/db.ts (تحديث بسيط)
export function getDeviceId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("u_device_id");
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("u_device_id", id);
  }
  return id;
}