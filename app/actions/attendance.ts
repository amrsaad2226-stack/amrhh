
import db from "@/lib/db";

// أضفنا startDate و endDate كمتغيرات للدالة
export async function getEmployeePortalAttendance(empId: number, startDate: Date, endDate: Date) {
  
  const records = await db.attendance.findMany({
    where: {
      employeeId: empId,
      date: { 
        gte: startDate,
        lte: endDate
      }, // التعديل هنا: جلب السجلات بناءً على فترة الراتب الفعلية
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
