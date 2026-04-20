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
          select: { 
            name: true,
            dailyHours: true,   // 👈 متطابق مع الداتا بيز عندك
            dailySalary: true   // 👈 متطابق مع الداتا بيز عندك (كانت salary)
          } 
        }
      },
      orderBy: [
        { employeeId: "asc" },
        { date: "asc" },
      ],
    });

    let cumulativeBalance = 0;
    let currentEmpId = -1;

    const processedData = records.map((record) => {
      if (currentEmpId !== record.employeeId) {
        cumulativeBalance = 0;
        currentEmpId = record.employeeId;
      }

      // 👈👈 جلب البيانات الحقيقية من قاعدة بياناتك
      const empDailyHours = record.employee.dailyHours || 8; // 8 كقيمة احتياطية لو الحقل فارغ
      const empDailySalary = record.employee.dailySalary || 0;

      // 👈 حساب أجر الساعة الحقيقي: (الراتب اليومي ÷ عدد الساعات الافتراضية)
      const hourlyRate = empDailyHours > 0 ? (empDailySalary / empDailyHours) : 0;

      let actualHours = 0;
      if (record.checkIn && record.checkOut) {
        // حساب الفارق الفعلي بالساعات
        actualHours = (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
      }

      // حساب العجز والإضافي بناءً على ساعات الموظف الافتراضية (empDailyHours)
      const deficit = actualHours > 0 && actualHours < empDailyHours ? empDailyHours - actualHours : 0;
      const overtime = actualHours > empDailyHours ? actualHours - empDailyHours : 0;
      
      // حساب ما استحقه فعلياً في هذا اليوم
      const dailyEarned = actualHours * hourlyRate;
      cumulativeBalance += dailyEarned;

      return {
        id: record.id,
        empName: record.employee.name,
        defaultHrs: empDailyHours, // 👈 ستظهر ساعاته الحقيقية من الداتا بيز (8 أو 10)
        date: record.date.toISOString().split("T")[0],
        checkIn: record.checkIn ? record.checkIn.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "---",
        checkOut: record.checkOut ? record.checkOut.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "---",
        actualHrs: actualHours.toFixed(1),
        deficit: deficit.toFixed(1),
        overtime: overtime.toFixed(1),
        balance: Math.round(cumulativeBalance), // الرصيد التراكمي
      };
    });

    return { success: true, data: processedData };
  } catch (error: any) {
    console.error("Fetch error:", error);
    return { error: "حدث خطأ أثناء جلب البيانات" };
  }
}