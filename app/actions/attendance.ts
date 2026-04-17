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

    if (!employee.deviceId) {
      return { error: "حسابك غير مفعل بعد. أرسل بصمة جهازك للمدير." };
    }
    if (employee.deviceId !== deviceId) {
      return { error: "عذراً! لا يمكنك البصمة إلا من جهازك الشخصي المسجل" };
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

    // -- TIMEZONE FIX: Use Cairo time to define "today" --
    const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await db.attendance.findFirst({
      where: { employeeId: employee.id, date: today },
    });

    if (existingAttendance) {
      return { error: "لقد قمت بتسجيل الحضور بالفعل اليوم!" };
    }

    const now = new Date();

    // -- TIMEZONE FIX: Calculate status based on Cairo time --
    const cairoTimeStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    const status = cairoTimeStr > employee.timeIn ? "Late" : "Present";
    
    // -- TIMEZONE FIX: Use Cairo time to determine off-days --
    const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Africa/Cairo' }).format(now);
    const isOffDay = employee.offDay === todayName;
    const hoursNeeded = isOffDay ? (employee.offDayHours || 0) : (employee.dailyHours || 10);

    await db.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        checkIn: now, // Store original UTC timestamp
        latIn: lat,
        lngIn: lng,
        status: status,
        requiredHours: hoursNeeded,
        overtime: 0
      },
    });

    revalidatePath("/admin");
    revalidatePath("/portal");
    return { success: `تم تسجيل حضورك بنجاح! (${status === "Late" ? "متأخر ⚠️" : "في الموعد ✅"})` };

  } catch (error: any) {
    console.error("Check-in Error:", error);
    return { error: `خطأ تقني: ${error.message || "حدث خطأ في قاعدة البيانات"}` };
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

    // -- TIMEZONE FIX: Use Cairo time to find today's attendance record --
    const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
    today.setHours(0, 0, 0, 0);

    const attendance = await db.attendance.findFirst({
      where: { employeeId: employee.id, date: today }
    });

    if (!attendance) return { error: "لم تقم بتسجيل الحضور اليوم لتسجيل الانصراف!" };
    if (attendance.checkOut) return { error: "لقد قمت بتسجيل الانصراف مسبقاً اليوم!" };
    if (!attendance.checkIn) return { error: "يوجد خطأ في سجل حضورك." };

    const now = new Date();
    const checkInTime = new Date(attendance.checkIn);
    
    const diffInMs = now.getTime() - checkInTime.getTime();
    const durationHours = diffInMs / (1000 * 60 * 60);

    let overtime = 0;
    if (durationHours > attendance.requiredHours) {
      overtime = durationHours - attendance.requiredHours;
    }

    await db.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now, // Store original UTC timestamp
        latOut: lat,
        lngOut: lng,
        duration: parseFloat(durationHours.toFixed(2)),
        overtime: parseFloat(overtime.toFixed(2)),
      }
    });

    revalidatePath("/portal");
    revalidatePath("/admin");
    
    return { success: `تم الانصراف! مدة العمل: ${durationHours.toFixed(1)} ساعة` };

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { error: `خطأ تقني: ${error.message}` };
  }
}
