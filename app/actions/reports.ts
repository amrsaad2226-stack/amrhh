"use server";
import { db } from "@/lib/db"; // تأكد من مسار قاعدة البيانات عندك

// 1. استدعاء الموظفين للقائمة المنسدلة (بيانات خفيفة جداً)
export async function getEmployeesList() {
  try {
    return await db.employee.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    return [];
  }
}

// 2. استدعاء السجلات بناءً على الفلتر فقط
export async function getDetailedLog(empId: string, startDate: string, endDate: string) {
  try {
    // تجهيز شروط البحث
    const whereClause: any = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };
    if (empId) whereClause.employeeId = empId;

    // استدعاء البيانات من الداتا بيز مرتبة بالموظف ثم التاريخ
    const records = await db.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { name: true, defaultHours: true, hourlyRate: true } // استدعاء البيانات المالية والافتراضية
        }
      },
      orderBy: [
        { employeeId: "asc" },
        { date: "asc" },
      ],
    });

    // معالجة البيانات وإضافة الحسابات (العجز، الإضافي، الرصيد)
    let cumulativeBalance = 0;
    let currentEmpId = "";

    const processedData = records.map((record) => {
      // تصفير الرصيد التراكمي إذا تغير الموظف (لأننا نرتب بالموظف)
      if (currentEmpId !== record.employeeId) {
        cumulativeBalance = 0;
        currentEmpId = record.employeeId;
      }

      const defaultHours = record.employee.defaultHours || 8; // افتراضي 8 ساعات لو غير مسجل
      const hourlyRate = record.employee.hourlyRate || 0; // أجر الساعة

      let actualHours = 0;
      if (record.checkIn && record.checkOut) {
        actualHours = (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
      }

      const deficit = actualHours > 0 && actualHours < defaultHours ? defaultHours - actualHours : 0;
      const overtime = actualHours > defaultHours ? actualHours - defaultHours : 0;
      
      // حساب الأجر اليومي (الفعلي * سعر الساعة) وإضافته للرصيد
      const dailyEarned = actualHours * hourlyRate;
      cumulativeBalance += dailyEarned;

      return {
        id: record.id,
        empName: record.employee.name,
        defaultHrs: defaultHours,
        date: record.date.toISOString().split("T")[0],
        checkIn: record.checkIn ? record.checkIn.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "---",
        checkOut: record.checkOut ? record.checkOut.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "---",
        actualHrs: actualHours.toFixed(1),
        deficit: deficit.toFixed(1),
        overtime: overtime.toFixed(1),
        balance: Math.round(cumulativeBalance), // الرصيد المالي التراكمي
      };
    });

    return { success: true, data: processedData };
  } catch (error: any) {
    return { error: "حدث خطأ أثناء جلب البيانات" };
  }
}