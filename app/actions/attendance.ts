"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function punchIn(employeeCode: string) {
  try {
    const employee = await db.employee.findUnique({
      where: { code: employeeCode },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await db.attendance.findFirst({
      where: {
        employeeId: employee.id,
        checkOut: null,
      },
    });

    if (existingAttendance) {
      throw new Error("Employee already checked in");
    }

    await db.attendance.create({
      data: {
        employeeId: employee.id,
        checkIn: new Date(),
        date: today,
      },
    });

    revalidatePath("/portal");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "تم تسجيل الحضور بنجاح" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function punchOut(employeeCode: string) {
  try {
    const employee = await db.employee.findUnique({
      where: { code: employeeCode },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const attendance = await db.attendance.findFirst({
      where: {
        employeeId: employee.id,
        checkOut: null,
      },
    });

    if (!attendance || !attendance.checkIn) { // FIXED: Added check for checkIn
      throw new Error("لا يوجد سجل حضور مفتوح للإنصراف.");
    }

    const checkOutTime = new Date();
    const duration =
      (checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);

    await db.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        checkOut: checkOutTime,
        duration: parseFloat(duration.toFixed(2)),
      },
    });

    revalidatePath("/portal");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "تم تسجيل الانصراف بنجاح" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getEmployeePortalAttendance(employeeId: number, startDate: Date, endDate: Date) {
  const employee = await db.employee.findUnique({ where: { id: employeeId }});
  if (!employee) throw new Error("Employee not found");

  const attendance = await db.attendance.findMany({
    where: {
      employeeId: employeeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: [ { date: 'asc' }, { checkIn: 'asc' }],
  });

  const hourlyRate = employee.dailySalary > 0 && employee.dailyHours > 0
    ? employee.dailySalary / employee.dailyHours
    : 0;

  const finalProcessedRecords: any[] = [];
  const newDailyTotals: { [key: string]: { duration: number, balance: number, overtime: string, deficit: string } } = {};

  // First, calculate all daily totals
  attendance.forEach(current => {
    const dateStr = current.date.toISOString().split('T')[0];
    if (!newDailyTotals[dateStr]) {
      newDailyTotals[dateStr] = { duration: 0, balance: 0, overtime: '-', deficit: '-' };
    }
    let duration = 0;
    if (current.checkOut) {
      duration = current.duration || 0;
    } else if (current.checkIn) { // FIXED: Added check for checkIn
      duration = (new Date().getTime() - current.checkIn.getTime()) / (1000 * 60 * 60);
    }
    newDailyTotals[dateStr].duration += duration;
  });

  // Calculate balance, overtime, deficit for each day
  for (const dateStr in newDailyTotals) {
    const dayTotalHours = newDailyTotals[dateStr].duration;
    const targetHours = employee.dailyHours;
    const diff = dayTotalHours - targetHours;
    newDailyTotals[dateStr].balance = diff * hourlyRate;
    if (diff > 0) {
      newDailyTotals[dateStr].overtime = diff.toFixed(2) + 'h';
    } else if (diff < 0) {
      newDailyTotals[dateStr].deficit = Math.abs(diff).toFixed(2) + 'h';
    }
  }

  // Now, construct the records with cumulative daily hours and final daily totals
  const cumulativeDailyHours: { [key: string]: number } = {};
  for (let i = 0; i < attendance.length; i++) {
    const current = attendance[i];
    const dateStr = current.date.toISOString().split('T')[0];

    if (!cumulativeDailyHours[dateStr]) {
      cumulativeDailyHours[dateStr] = 0;
    }

    let duration = 0;
    if (current.checkOut) {
      duration = current.duration || 0;
    } else if (current.checkIn) { // FIXED: Added check for checkIn
      duration = (new Date().getTime() - current.checkIn.getTime()) / (1000 * 60 * 60);
    }
    cumulativeDailyHours[dateStr] += duration;

    const next = attendance[i + 1];
    const isLastOfDay = !next || next.date.toISOString().split('T')[0] !== dateStr;

    finalProcessedRecords.push({
      ...current,
      actualHrs: cumulativeDailyHours[dateStr].toFixed(2) + 'h',
      balance: isLastOfDay ? newDailyTotals[dateStr].balance.toFixed(2) : '-',
      overtime: isLastOfDay ? newDailyTotals[dateStr].overtime : '-',
      deficit: isLastOfDay ? newDailyTotals[dateStr].deficit : '-',
      isLastOfDay: isLastOfDay,
    });
  }

  return finalProcessedRecords;
}
