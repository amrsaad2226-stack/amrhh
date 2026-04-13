"use server";

import db from "@/lib/db";
import { getDistance } from "@/lib/location";
import { revalidatePath } from "next/cache";

export async function checkInAction(employeeCode: string, lat: number, lng: number) {
  try {
    // 1. البحث عن الموظف في قاعدة البيانات
    const employee = await db.employee.findUnique({
      where: { code: employeeCode },
    });

    if (!employee) return { error: "كود الموظف غير صحيح" };

    // 2. التحقق الأمني من المسافة (مرة أخرى على السيرفر لضمان عدم التلاعب)
    const distance = getDistance(lat, lng, employee.officeLat, employee.officeLng);
    if (distance > employee.allowDist) {
      return { error: "فشل التحقق: أنت خارج النطاق المسموح للمكتب" };
    }

    // 3. التحقق من تاريخ اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 4. هل الموظف سجل دخول مسبقاً اليوم؟
    const existingAttendance = await db.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (existingAttendance) return { error: "لقد قمت بتسجيل الحضور بالفعل اليوم!" };

    // 5. حساب حالة التأخير (بسيط)
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // مقارنة وقت الحضور المخطط (مثلاً 11:00) بالوقت الحالي
    const status = currentTimeStr > employee.timeIn ? "Late" : "Present";

    // 6. تسجيل البيانات في Supabase
    await db.attendance.create({
      data: {
        employeeId: employee.id,
        date: today,
        checkIn: now,
        latIn: lat,
        lngIn: lng,
        status: status,
      },
    });

    revalidatePath("/"); // تحديث الصفحة لرؤية النتائج
    return { success: `تم تسجيل حضورك بنجاح! الحالة: ${status === "Late" ? "متأخر" : "في الموعد"}` };

  } catch (error) {
    console.error(error);
    return { error: "حدث خطأ أثناء الاتصال بقاعدة البيانات" };
  }
}
