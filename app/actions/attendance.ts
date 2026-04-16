"use server";
import db from "@/lib/db";
import { getDistance } from "@/lib/location";
import { revalidatePath } from "next/cache";

export async function checkInAction(code: string, lat: number, lng: number, deviceId: string) {
  try {
    const employee = await db.employee.findUnique({
      where: { code },
      include: { branch: true } // جلب بيانات الفرع المربوط به
    });

    if (!employee) return { error: "كود الموظف غير صحيح" };

    // 1. التحقق من بصمة الجهاز
    if (!employee.deviceId) {
      return { error: "حسابك غير مفعل بعد. أرسل بصمة جهازك للمدير." };
    }
    if (employee.deviceId !== deviceId) {
      return { error: "عذراً! لا يمكنك البصمة إلا من جهازك الشخصي المسجل" };
    }

    // 2. التحقق من الموقع والفرع
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

    // 3. التحقق من عدم تسجيل الحضور مسبقاً اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await db.attendance.findFirst({
      where: { employeeId: employee.id, date: today },
    });

    if (existingAttendance) {
      return { error: "لقد قمت بتسجيل الحضور بالفعل اليوم!" };
    }

    // 4. حساب وقت الدخول الفعلي وتحديد حالة التأخير
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const status = currentTimeStr > employee.timeIn ? "Late" : "Present";

    // 5. تحديد الساعات المطلوبة (عادي أم يوم إجازة)
    const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);
    const isOffDay = employee.offDay === todayName;
    const hoursNeeded = isOffDay ? (employee.offDayHours || 0) : (employee.dailyHours || 10);

    // 6. تسجيل البيانات
    await db.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        checkIn: now,
        latIn: lat,
        lngIn: lng,
        status: status,
        requiredHours: hoursNeeded,
        overtime: 0
      },
    });

    revalidatePath("/admin");
    return { success: `تم تسجيل حضورك بنجاح! (${status === "Late" ? "متأخر ⚠️" : "في الموعد ✅"})` };

  } catch (error: any) {
    console.error("Check-in Error:", error);
    // إرجاع رسالة الخطأ بدلاً من إيقاف السيرفر
    return { error: `خطأ تقني: ${error.message || "حدث خطأ في قاعدة البيانات"}` };
  }
}