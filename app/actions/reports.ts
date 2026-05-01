"use server";
import prisma from "@/lib/db"; 

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

export async function getDetailedLog(empId: string, startDate: string, endDate: string) {
  try {
    const whereClause: any = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };
    
    if (empId) whereClause.employeeId = Number(empId);

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: true 
      },
      orderBy:[
        { employeeId: "asc" },
        { date: "asc" },
        { checkIn: "asc" } // 👈 إضافة هامة لترتيب بصمات نفس اليوم زمنياً
      ],
    });

    // 1️⃣ حصر إجمالي الساعات لكل موظف في اليوم الواحد أولاً
    const dailyTotals: Record<string, number> = {};
    records.forEach(r => {
      const dateStr = r.date.toISOString().split('T')[0];
      const key = `${r.employeeId}_${dateStr}`;
      if (!dailyTotals[key]) dailyTotals[key] = 0;
      
      let hrs = 0;
      if (r.checkIn && r.checkOut) {
        hrs = (r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60);
        if (hrs < 0) hrs += 24; // معالجة الورديات المسائية عبر منتصف الليل
      }
      dailyTotals[key] += hrs;
    });

    // 2️⃣ بناء البيانات وعرض التراكمي
    let cumulativeBalance = 0;
    let currentEmpId = -1;
    let currentDayStr = "";
    let accumulatedDayHours = 0;

    const processedData = records.map((record, index) => {
      const dateStr = record.date.toISOString().split('T')[0];

      // تصفير الرصيد إذا كان موظف جديد
      if (currentEmpId !== record.employeeId) {
        cumulativeBalance = 0;
        currentEmpId = record.employeeId;
        currentDayStr = dateStr;
        accumulatedDayHours = 0;
      } 
      // تصفير ساعات اليوم التراكمية إذا كان يوم جديد لنفس الموظف
      else if (currentDayStr !== dateStr) {
        currentDayStr = dateStr;
        accumulatedDayHours = 0;
      }

      const empDailyHours = record.employee.dailyHours || 8;
      const empDailySalary = record.employee.dailySalary || 0;
      const hourlyRate = empDailyHours > 0 ? (empDailySalary / empDailyHours) : 0;

      // حساب ساعات هذه الحركة (الجلسة) فقط
      let sessionHours = 0;
      if (record.checkIn && record.checkOut) {
        sessionHours = (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
        if (sessionHours < 0) sessionHours += 24;
      }
      
      // الساعات التراكمية خلال هذا اليوم
      accumulatedDayHours += sessionHours;

      // 👈 التحقق مما إذا كانت هذه هي "آخر حركة" للموظف في هذا اليوم
      const isLastOfDay = 
        index === records.length - 1 || 
        records[index + 1].employeeId !== record.employeeId || 
        records[index + 1].date.toISOString().split('T')[0] !== dateStr;

      let deficit = "-";
      let overtime = "-";
      let displayBalance = "-";

      // تطبيق العجز والإضافي والفلوس على "آخر حركة في اليوم" فقط
      if (isLastOfDay) {
        const totalDayHrs = dailyTotals[`${record.employeeId}_${dateStr}`];
        
        const def = totalDayHrs > 0 && totalDayHrs < empDailyHours ? empDailyHours - totalDayHrs : 0;
        const ovt = totalDayHrs > empDailyHours ? totalDayHrs - empDailyHours : 0;
        
        deficit = def > 0 ? def.toFixed(2) : "-";
        overtime = ovt > 0 ? ovt.toFixed(2) : "-";
        
        // إضافة مستحقات هذا اليوم للرصيد التراكمي
        const dailyEarned = totalDayHrs * hourlyRate;
        cumulativeBalance += dailyEarned;
        displayBalance = Math.round(cumulativeBalance).toString();
      }

      return {
        id: record.id,
        empName: record.employee.name,
        defaultHrs: empDailyHours, 
        date: record.date.toISOString(), 
        checkIn: record.checkIn ? record.checkIn.toISOString() : null, 
        checkOut: record.checkOut ? record.checkOut.toISOString() : null, 
        actualHrs: accumulatedDayHours.toFixed(2), // 👈 الساعات الفعلية تظهر بشكل تراكمي
        deficit: deficit,
        overtime: overtime,
        balance: displayBalance, 
      };
    });

    return { success: true, data: processedData };
  } catch (error: any) {
    console.error("Fetch error:", error);
    return { error: "حدث خطأ أثناء جلب البيانات" };
  }
}

// دالة حذف سجل الحضور
export async function deleteAttendanceRecord(id: number) {
  try {
    await prisma.attendance.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { error: "حدث خطأ أثناء حذف السجل" };
  }
}

// دالة تعديل وقت الحضور والانصراف
export async function updateAttendanceRecord(id: number, checkInTime: string | null, checkOutTime: string | null) {
  try {
    const existing = await prisma.attendance.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!existing) return { error: "السجل غير موجود" };

    let newCheckIn = existing.checkIn;
    let newCheckOut = existing.checkOut;

    // دالة مساعدة لدمج الوقت الجديد (HH:mm) مع تاريخ السجل الأصلي
    const applyTime = (baseDate: Date, timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const newDate = new Date(baseDate);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    };

    if (checkInTime) newCheckIn = applyTime(existing.date, checkInTime);
    if (checkOutTime) newCheckOut = applyTime(existing.date, checkOutTime);

    // تحديث ساعات العمل (Duration) والإضافي (Overtime) في قاعدة البيانات
    let duration = 0;
    let overtime = 0;
    if (newCheckIn && newCheckOut) {
      duration = (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60);
      if (duration < 0) duration += 24; // للورديات المسائية عبر منتصف الليل
      
      const requiredHours = existing.requiredHours || existing.employee.dailyHours || 10;
      if (duration > requiredHours) {
        overtime = duration - requiredHours;
      }
    }

    await prisma.attendance.update({
      where: { id },
      data: {
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        duration: duration,
        overtime: overtime
      }
    });

    return { success: true };
  } catch (error) {
    return { error: "حدث خطأ أثناء تعديل السجل" };
  }
}
