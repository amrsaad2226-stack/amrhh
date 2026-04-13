// lib/device.ts
export function getOrCreateDeviceId() {
  if (typeof window === "undefined") return null;

  let deviceId = localStorage.getItem("attendance_device_id");
  
  if (!deviceId) {
    // توليد كود عشوائي فريد (UUID)
    deviceId = crypto.randomUUID();
    localStorage.setItem("attendance_device_id", deviceId);
  }
  
  return deviceId;
}
