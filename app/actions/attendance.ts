"use server";
import db from "@/lib/db";
import { getDistance } from "@/lib/location";
import { revalidatePath } from "next/cache";

export async function checkInAction(code: string, lat: number, lng: number, deviceId: string) {
  try {
    const employee = await db.employee.findUnique({
      where: { code },
      include: { branch: true } // مهم جداً لجلب إحداثيات الفرع المحدد
    });
    
    if (!employee) {
      return { error: "الموظف غير موجود" };
    }

    if (!employee.deviceId) {
      // The user has not registered a device yet.
      // Let's assign this device to them.
      await db.employee.update({
        where: { id: employee.id },
        data: { deviceId },
      });
    } else if (employee.deviceId !== deviceId) {
      return { error: "عذراً! هذا ليس الجهاز المسجل لك" };
    }

    // Re-fetch employee data after potential deviceId update
    const currentEmployee = await db.employee.findUnique({
      where: { code },
      include: { branch: true }
    });

    if (!currentEmployee) {
        return { error: "خطأ في تحديث بيانات الموظف." };
    }

    let isNearAnyAllowedBranch = false;

    if (currentEmployee.isAnyBranch) {
      // الموظف "مفتوح" - نتحقق من قربه من أي فرع في الشركة
      const allBranches = await db.branch.findMany();
      for (const b of allBranches) {
        const dist = getDistance(lat, lng, b.latitude, b.longitude);
        if (dist <= 50) { // مسافة 50 متر
          isNearAnyAllowedBranch = true;
          break;
        }
      }
    } else if (currentEmployee.branch) {
      // الموظف له فرع محدد
      const dist = getDistance(lat, lng, currentEmployee.branch.latitude, currentEmployee.branch.longitude);
      if (dist <= 50) isNearAnyAllowedBranch = true;
    } else {
        // Employee is not "any branch" and has no specific branch assigned.
        return { error: "لم يتم تحديد فرع لك، ولا تملك صلاحية البصمة في أي فرع." };
    }

    if (!isNearAnyAllowedBranch) {
      return { error: "عذراً، أنت لست في النطاق الجغرافي لأي فرع مصرح لك بالبصمة فيه" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await db.attendance.findFirst({
        where: {
            employeeId: currentEmployee.id,
            date: today,
        }
    });

    if (existingAttendance?.checkIn) {
        return { error: "لقد قمت بتسجيل الحضور بالفعل اليوم!" };
    }

    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const status = currentTimeStr > currentEmployee.timeIn ? "Late" : "Present";

    await db.attendance.create({
        data: {
            employeeId: currentEmployee.id,
            date: today,
            checkIn: now,
            latIn: lat,
            lngIn: lng,
            status: status,
        },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: "تم تسجيل الحضور بنجاح" };
    
  } catch (e: any) {
    console.error(e);
    return { error: "خطأ فني في السيرفر" };
  }
}
