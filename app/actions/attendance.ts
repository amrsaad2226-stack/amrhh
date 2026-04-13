"use server";
import db from "@/lib/db";
import { getDistance } from "@/lib/location";
import { revalidatePath } from "next/cache";

export async function checkInAction(code: string, lat: number, lng: number, deviceId: string) {
  try {
    const emp = await db.employee.findUnique({ where: { code } });
    
    if (!emp) return { error: "الموظف غير موجود" };

    // التحقق من بصمة الجهاز
    if (!emp.deviceId) {
      return { error: "جهازك غير مسجل. أرسل بصمة جهازك للأدمن أولاً" };
    }
    
    if (emp.deviceId !== deviceId) {
      return { error: "عذراً! هذا ليس الجهاز المسجل لك" };
    }

    // التحقق من المسافة (سريع جداً)
    const dist = getDistance(lat, lng, emp.officeLat, emp.officeLng);
    if (dist > emp.allowDist) return { error: `بعيد جداً (${Math.round(dist)} متر)` };

    // --- تكملة تسجيل الحضور ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await db.attendance.findFirst({
        where: {
            employeeId: emp.id,
            date: today,
        },
    });

    if (existingAttendance) {
        return { error: "لقد قمت بتسجيل الحضور بالفعل اليوم!" };
    }

    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const status = currentTimeStr > emp.timeIn ? "Late" : "Present";

    await db.attendance.create({
        data: {
            employeeId: emp.id,
            date: today,
            checkIn: now,
            latIn: lat,
            lngIn: lng,
            status: status,
        },
    });

    revalidatePath("/");
    return { success: "تم تسجيل الحضور" };
    
  } catch (e) {
    console.error(e);
    return { error: "خطأ فني في السيرفر" };
  }
}
