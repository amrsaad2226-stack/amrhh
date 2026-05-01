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

      const empDailyHours = record.employee.dailyHours || 8;
      const empDailySalary = record.employee.dailySalary || 0;

      const hourlyRate = empDailyHours > 0 ? (empDailySalary / empDailyHours) : 0;

      let actualHours = 0;
      if (record.checkIn && record.checkOut) {
        actualHours = (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
      }

      const deficit = actualHours > 0 && actualHours < empDailyHours ? empDailyHours - actualHours : 0;
      const overtime = actualHours > empDailyHours ? actualHours - empDailyHours : 0;
      
      const dailyEarned = actualHours * hourlyRate;
      cumulativeBalance += dailyEarned;

      return {
        id: record.id,
        empName: record.employee.name,
        defaultHrs: empDailyHours, 
        date: record.date.toISOString(), // Keep as full ISO string
        checkIn: record.checkIn ? record.checkIn.toISOString() : null, // Keep as full ISO string
        checkOut: record.checkOut ? record.checkOut.toISOString() : null, // Keep as full ISO string
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
