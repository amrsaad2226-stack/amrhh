"use server";
import prisma from "@/lib/db"; // أو المسار الصحيح لقاعدة البيانات عندك

// 1. استدعاء الموظفين للقائمة المنسدلة
export async function getEmployeesList() {
  try {
    return await prisma.employee.findMany({
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
    
    // تحويل الـ empId إلى رقم إذا تم تحديده، لأن قاعدة بياناتك تستخدم أرقاماً
    if (empId) whereClause.employeeId = Number(empId);

    // استدعاء البيانات
    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { name: true } // نكتفي بالاسم فقط لتجنب أخطاء الأعمدة غير الموجودة
        }
      },
      orderBy: [
        { employeeId: "asc" },
        { date: "asc" },
      ],
    });

    let cumulativeBalance = 0;
    let currentEmpId = -1; // 👈 التعديل هنا: جعلناه رقماً بدلاً من نص ليتطابق مع الـ ID عندك

    const processedData = records.map((record) => {
      if (currentEmpId !== record.employeeId) {
        cumulativeBalance = 0;
        currentEmpId = record.employeeId;
      }

      // قيم افتراضية للحسابات (بما أنها غير موجودة في الداتا بيز حالياً)
      const defaultHours = 8; 
      const hourlyRate = 50; // افترضنا أن الساعة بـ 50 جنيهاً

      let actualHours = 0;
      if (record.checkIn && record.checkOut) {
        // حساب الفارق بالساعات بين الدخول والخروج
        actualHours = (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
      }

      const deficit = actualHours > 0 && actualHours < defaultHours ? defaultHours - actualHours : 0;
      const overtime = actualHours > defaultHours ? actualHours - defaultHours : 0;
      
      const dailyEarned = actualHours * hourlyRate;
      cumulativeBalance += dailyEarned;

      return {
        id: record.id,
        empName: record.employee.name, // 👈 الآن سيتعرف عليها TypeScript بدون مشاكل
        defaultHrs: defaultHours,
        date: record.date.toISOString().split("T")[0],
        checkIn: record.checkIn ? record.checkIn.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "---",
        checkOut: record.checkOut ? record.checkOut.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "---",
        actualHrs: actualHours.toFixed(1),
        deficit: deficit.toFixed(1),
        overtime: overtime.toFixed(1),
        balance: Math.round(cumulativeBalance),
      };
    });

    return { success: true, data: processedData };
  } catch (error: any) {
    console.error("Fetch error:", error);
    return { error: "حدث خطأ أثناء جلب البيانات" };
  }
}