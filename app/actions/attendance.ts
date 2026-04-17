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
    if (employee.deviceId !== deviceId) return { error: "عذراً! لا يمكنك البصمة إلا من جهازك الشخصي المسجل" };

    // 1. Location check
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

    // 2. Check for an active (non-checked-out) session
    const activeSession = await db.attendance.findFirst({
      where: { 
        employeeId: employee.id, 
        checkOut: null 
      }
    });

    if (activeSession) {
      return { error: "أنت مسجل حضور بالفعل! يجب تسجيل الانصراف أولاً." };
    }

    // 3. If no active session, create a new one
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
    if (employee.deviceId !== deviceId) return { error: "عذراً، هذا ليس جهازك المسجل!" };
    
    // Location check
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

    // Find the last active session for the employee
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
