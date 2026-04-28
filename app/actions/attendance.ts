"use server";
import db from "@/lib/db";
import { getDistance } from "@/lib/location";
import { revalidatePath } from "next/cache";

export async function checkInAction(code: string, lat: number, lng: number, deviceId: string) {
  try {
    const employee = await db.employee.findUnique({
      where: { code },
      include: { branch: true }
    });

    if (!employee) return { error: "كود الموظف غير صحيح" };
    if (!employee.deviceId) return { error: "حسابك غير مفعل بعد. أرسل بصمة جهازك للمدير." };
    
    if (employee.deviceId?.trim() !== deviceId?.trim()) {
      return { error: `عذراً، البصمة غير متطابقة. سجل دخول مجدداً.` };
    }

    let isNearAnyAllowedBranch = false;
    let distanceMsg = "";
    if (employee.isAnyBranch) {
      const allBranches = await db.branch.findMany();
      if (allBranches.length === 0) return { error: "لا يوجد فروع مسجلة في النظام" };
      for (const b of allBranches) {
        const dist = getDistance(lat, lng, b.latitude, b.longitude);
        if (dist <= (employee.allowDist || 50)) {
          isNearAnyAllowedBranch = true;
          break;
        }
      }
    } else if (employee.branch) {
      const dist = getDistance(lat, lng, employee.branch.latitude, employee.branch.longitude);
      distanceMsg = `(المسافة: ${Math.round(dist)} متر)`;
      if (dist <= (employee.allowDist || 50)) {
        isNearAnyAllowedBranch = true;
      }
    } else {
      return { error: "لم يتم ربط هذا الموظف بأي فرع في الإعدادات" };
    }

    if (!isNearAnyAllowedBranch) {
      return { error: `أنت خارج النطاق الجغرافي للعمل ${distanceMsg}` };
    }

    const activeSession = await db.attendance.findFirst({
      where: { 
        employeeId: employee.id, 
        checkOut: null 
      }
    });

    if (activeSession) {
      return { error: "أنت مسجل حضور بالفعل! يجب تسجيل الانصراف أولاً." };
    }

    const now = new Date();
    const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
    today.setHours(0, 0, 0, 0);

    await db.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        checkIn: now,
        latIn: lat,
        lngIn: lng,
        requiredHours: employee.dailyHours || 8, 
        status: "Present",
      },
    });
    
    revalidatePath("/portal");
    revalidatePath("/admin");

    return { success: "تم تسجيل الدخول بنجاح ✅" };

  } catch (error: any) {
    console.error("Check-in Error:", error);
    return { error: `خطأ تقني: ${error.message}` };
  }
}

export async function checkOutAction(code: string, lat: number, lng: number, deviceId: string) {
  try {
    const employee = await db.employee.findUnique({
      where: { code },
      include: { branch: true }
    });

    if (!employee) return { error: "كود الموظف غير صحيح" };
    if (!employee.deviceId) return { error: "حسابك غير مفعل بعد. أرسل بصمة جهازك للمدير." };

    if (employee.deviceId?.trim() !== deviceId?.trim()) {
      return { error: `عذراً، البصمة غير متطابقة. سجل دخول مجدداً.` };
    }
    
    let isNearAnyAllowedBranch = false;
    if (employee.isAnyBranch) {
      const allBranches = await db.branch.findMany();
      for (const b of allBranches) {
        if (getDistance(lat, lng, b.latitude, b.longitude) <= (employee.allowDist || 50)) {
          isNearAnyAllowedBranch = true; break;
        }
      }
    } else if (employee.branch) {
      if (getDistance(lat, lng, employee.branch.latitude, employee.branch.longitude) <= (employee.allowDist || 50)) {
        isNearAnyAllowedBranch = true;
      }
    }
    if (!isNearAnyAllowedBranch) return { error: "أنت خارج نطاق الفرع! لا يمكنك تسجيل الانصراف من هنا." };

    const lastSession = await db.attendance.findFirst({
      where: { 
        employeeId: employee.id, 
        checkOut: null 
      },
      orderBy: { checkIn: 'desc' }
    });

    if (!lastSession) return { error: "لا يوجد سجل حضور مفتوح حالياً." };

    const now = new Date();
    const checkInTime = new Date(lastSession.checkIn!);
    const diffInMs = now.getTime() - checkInTime.getTime();
    const durationHours = diffInMs / (1000 * 60 * 60);

    // New Logic: Validate session duration
    const dailyHours = employee.dailyHours || 8; // Default to 8 hours if not set
    const maxDuration = dailyHours * 2; // Maximum duration is twice the daily hours

    if (durationHours > maxDuration) {
      return { 
        error: `مدة العمل (${durationHours.toFixed(1)} ساعة) تجاوزت الحد الأقصى (${maxDuration} ساعة). غالباً نسيت تسجيل الانصراف. يرجى مراجعة المدير لتصحيح السجل.` 
      };
    }

    await db.attendance.update({
      where: { id: lastSession.id },
      data: {
        checkOut: now,
        latOut: lat,
        lngOut: lng,
        duration: parseFloat(durationHours.toFixed(2)),
      }
    });
    
    revalidatePath("/portal");
    revalidatePath("/admin");

    return { success: `تم تسجيل الانصراف بنجاح ✅` };
  } catch (error: any) {
     console.error("Checkout Error:", error);
     return { error: `خطأ تقني: ${error.message}` };
  }
}
