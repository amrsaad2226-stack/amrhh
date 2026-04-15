"use server";
import db from "@/lib/db";
import { getDistance } from "@/lib/location";
import { revalidatePath } from "next/cache";

export async function checkInAction(code: string, lat: number, lng: number, deviceId: string) {
  try {
    const employee = await db.employee.findUnique({
      where: { code },
      include: { branch: true },
    });
    
    if (!employee) return { error: "الموظف غير موجود" };

    // التحقق من بصمة الجهاز
    if (!employee.deviceId) {
      return { error: "جهازك غير مسجل. أرسل بصمة جهازك للأدمن أولاً" };
    }
    
    if (employee.deviceId !== deviceId) {
      return { error: "عذراً! هذا ليس الجهاز المسجل لك" };
    }

    let isNearBranch = false;

    if (employee.isAnyBranch) {
      const branches = await db.branch.findMany();
      for (const branch of branches) {
        const dist = getDistance(lat, lng, branch.latitude, branch.longitude);
        if (dist <= 50) {
          isNearBranch = true;
          break;
        }
      }
    } else if (employee.branch) {
      const dist = getDistance(lat, lng, employee.branch.latitude, employee.branch.longitude);
      if (dist <= 50) isNearBranch = true;
    }

    if (!isNearBranch) return { error: "أنت لست في أي فرع معتمد" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await db.attendance.findFirst({
        where: {
            employeeId: employee.id,
            date: today,
        },
    });

    if (existingAttendance) {
        return { error: "لقد قمت بتسجيل الحضور بالفعل اليوم!" };
    }

    const now = new Date();
    const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });

    let requiredHours = (new Date(`1970-01-01T${employee.timeOut}Z`).getTime() - new Date(`1970-01-01T${employee.timeIn}Z`).getTime()) / (1000 * 60 * 60);
    if (dayOfWeek === employee.offDay) {
        requiredHours = employee.offDayHours;
    }

    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const status = currentTimeStr > employee.timeIn ? "Late" : "Present";

    await db.attendance.create({
        data: {
            employeeId: employee.id,
            date: today,
            checkIn: now,
            latIn: lat,
            lngIn: lng,
            status: status,
            requiredHours: requiredHours,
        },
    });

    revalidatePath("/");
    return { success: "تم تسجيل الحضور" };
    
  } catch (e) {
    console.error(e);
    return { error: "خطأ فني في السيرفر" };
  }
}
