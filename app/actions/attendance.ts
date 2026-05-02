"use server";
import db from "@/lib/db";
import { getDistance } from "@/lib/location";
import { revalidatePath } from "next/cache";

const getCurrentCairoTime = () => {
  const now = new Date();
  return now;
};

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

    const now = getCurrentCairoTime();
    const today = new Date(now);
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

    const now = getCurrentCairoTime();
    const checkInTime = new Date(lastSession.checkIn!);
    const diffInMs = now.getTime() - checkInTime.getTime();
    const durationHours = diffInMs / (1000 * 60 * 60);

    const dailyHours = employee.dailyHours || 8; 
    const maxDuration = dailyHours * 2; 

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

// جعلنا التواريخ اختيارية (?) لتجنب أي أخطاء في ملفات أخرى
export async function getEmployeePortalAttendance(empId: number, startDate?: Date, endDate?: Date) {
  
  // في حال لم يتم تمرير تواريخ (من ملفات أخرى)، نجلب آخر 7 أيام كوضع افتراضي
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 7);
  
  const start = startDate || defaultStart;

  const records = await db.attendance.findMany({
    where: {
      employeeId: empId,
      date: { 
        gte: start,
        ...(endDate ? { lte: endDate } : {})
      },
    },
    include: { employee: true },
    orderBy: [{ date: "asc" }, { checkIn: "asc" }],
  });

  const dailyTotals: Record<string, number> = {};
  records.forEach((r) => {
    const dateStr = r.date.toISOString().split("T")[0];
    const key = `${r.employeeId}_${dateStr}`;
    if (!dailyTotals[key]) dailyTotals[key] = 0;

    let hrs = 0;
    if (r.checkIn && r.checkOut) {
      hrs = (r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60);
      if (hrs < 0) hrs += 24;
    }
    dailyTotals[key] += hrs;
  });

  let cumulativeBalance = 0;
  let currentDayStr = "";
  let accumulatedDayHours = 0;

  return records.map((record, index) => {
    const dateStr = record.date.toISOString().split("T")[0];

    if (currentDayStr !== dateStr) {
      currentDayStr = dateStr;
      accumulatedDayHours = 0;
    }

    const empDailyHours = record.employee.dailyHours || 8;
    const empDailySalary = record.employee.dailySalary || 0;
    const hourlyRate = empDailyHours > 0 ? empDailySalary / empDailyHours : 0;

    let sessionHours = 0;
    if (record.checkIn && record.checkOut) {
      sessionHours = (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
      if (sessionHours < 0) sessionHours += 24;
    }

    accumulatedDayHours += sessionHours;

    const isLastOfDay =
      index === records.length - 1 ||
      records[index + 1].date.toISOString().split("T")[0] !== dateStr;

    let deficit = "-";
    let overtime = "-";
    let displayBalance = "-";

    if (isLastOfDay && record.checkOut) {
      const totalDayHrs = dailyTotals[`${record.employeeId}_${dateStr}`];
      const def = totalDayHrs > 0 && totalDayHrs < empDailyHours ? empDailyHours - totalDayHrs : 0;
      const ovt = totalDayHrs > empDailyHours ? totalDayHrs - empDailyHours : 0;

      deficit = def > 0 ? def.toFixed(2) : "-";
      overtime = ovt > 0 ? ovt.toFixed(2) : "-";

      const dailyEarned = totalDayHrs * hourlyRate;
      cumulativeBalance += dailyEarned;
      displayBalance = Math.round(cumulativeBalance).toString();
    } else if (!record.checkOut) {
      deficit = "مفتوح";
    }

    return {
      ...record,
      actualHrs: accumulatedDayHours > 0 ? accumulatedDayHours.toFixed(2) : (record.checkOut ? "0.00" : "-"),
      deficit,
      overtime,
      balance: displayBalance,
      isLastOfDay: isLastOfDay
    };
  });
}