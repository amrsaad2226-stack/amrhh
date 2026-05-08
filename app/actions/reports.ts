
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
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    eDate.setHours(23, 59, 59, 999); 

    // --- 1. PREVIOUS BALANCE CALCULATION ---
    const openingBalances: Record<string, number> = {};
    const prevWhereClause: any = { date: { lt: sDate } };
    const prevCashWhere: any = { createdAt: { lt: sDate }, type: 'OUTCOME' };

    if (empId) {
      prevWhereClause.employeeId = Number(empId);
      prevCashWhere.employeeId = Number(empId);
    }

    const allPrevAttendances = await prisma.attendance.findMany({
      where: prevWhereClause,
      include: { employee: true },
    });

    const allPrevCashTxs = await prisma.cashTransaction.findMany({
      where: prevCashWhere,
    });

    const prevEarnings: Record<string, number> = {}; 
    if (allPrevAttendances.length > 0) {
        const employeeRates: Record<string, number> = {};
        allPrevAttendances.forEach(att => {
            if (!employeeRates[att.employeeId]) {
                const dailyHours = att.employee.dailyHours || 8;
                const dailySalary = att.employee.dailySalary || 0;
                employeeRates[att.employeeId] = dailyHours > 0 ? dailySalary / dailyHours : 0;
            }
            let sessionHours = 0;
            if (att.checkIn && att.checkOut) {
                sessionHours = (att.checkOut.getTime() - att.checkIn.getTime()) / (1000 * 60 * 60);
                if(sessionHours < 0) sessionHours += 24;
            }
            if (!prevEarnings[att.employeeId]) prevEarnings[att.employeeId] = 0;
            prevEarnings[att.employeeId] += sessionHours * employeeRates[att.employeeId];
        });
    }

    const prevAdvances: Record<string, number> = {};
    allPrevCashTxs.forEach(tx => {
      if (!tx.employeeId) return;
      if (!prevAdvances[tx.employeeId]) prevAdvances[tx.employeeId] = 0;
      prevAdvances[tx.employeeId] += tx.amount;
    });

    const allPrevEmployeeIds = new Set([
      ...allPrevAttendances.map(a => a.employeeId),
      ...(allPrevCashTxs.map(c => c.employeeId).filter(id => id !== null) as number[])
    ]);

    for (const id of allPrevEmployeeIds) {
      const earnings = prevEarnings[id] || 0;
      const advances = prevAdvances[id] || 0;
      openingBalances[id] = earnings - advances;
    }

    // --- 2. CURRENT PERIOD DATA ---
    const whereClause: any = { date: { gte: sDate, lte: eDate } };
    if (empId) whereClause.employeeId = Number(empId);

    const records = await prisma.attendance.findMany({
      where: whereClause, include: { employee: true },
      orderBy:[ { employeeId: "asc" }, { date: "asc" }, { checkIn: "asc" } ],
    });

    const cashWhereClause: any = { createdAt: { gte: sDate, lte: eDate }, type: 'OUTCOME' };
    if (empId) cashWhereClause.employeeId = Number(empId);
    
    const cashTransactions = await prisma.cashTransaction.findMany({
        where: cashWhereClause, include: { employee: true },
        orderBy: [{ employeeId: "asc" }, { createdAt: 'asc' }],
    });

    // --- 3. COMBINE AND PROCESS --- 
    const dailyTotals: Record<string, number> = {};
    records.forEach(r => {
      const dateStr = r.date.toISOString().split('T')[0];
      const key = `${r.employeeId}_${dateStr}`;
      if (!dailyTotals[key]) dailyTotals[key] = 0;
      let hrs = 0;
      if (r.checkIn && r.checkOut) {
        hrs = (r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60);
        if (hrs < 0) hrs += 24;
      }
      dailyTotals[key] += hrs;
    });

    let currentEmpId = -1;
    let currentDayStr = "";
    let accumulatedDayHours = 0;

    const attendanceData = records.filter(r => r.employee).map((record, index) => {
      const dateStr = record.date.toISOString().split('T')[0];
      if (currentEmpId !== record.employeeId) {
        currentEmpId = record.employeeId; currentDayStr = dateStr; accumulatedDayHours = 0;
      } else if (currentDayStr !== dateStr) {
        currentDayStr = dateStr; accumulatedDayHours = 0;
      }

      const empDailyHours = record.employee.dailyHours || 8;
      const hourlyRate = empDailyHours > 0 ? ((record.employee.dailySalary || 0) / empDailyHours) : 0;

      let sessionHours = 0;
      if (record.checkIn && record.checkOut) {
        sessionHours = (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
        if (sessionHours < 0) sessionHours += 24;
      }
      accumulatedDayHours += sessionHours;

      const isLastOfDay = index === records.length - 1 || records[index + 1].employeeId !== record.employeeId || records[index + 1].date.toISOString().split('T')[0] !== dateStr;

      let deficit = "-", overtime = "-", dailyEarned = 0;

      if (isLastOfDay) {
        const totalDayHrs = dailyTotals[`${record.employeeId}_${dateStr}`];
        const def = totalDayHrs > 0 && totalDayHrs < empDailyHours ? empDailyHours - totalDayHrs : 0;
        const ovt = totalDayHrs > empDailyHours ? totalDayHrs - empDailyHours : 0;
        deficit = def > 0 ? def.toFixed(2) : "-";
        overtime = ovt > 0 ? ovt.toFixed(2) : "-";
        dailyEarned = totalDayHrs * hourlyRate;
      }
      return { id: record.id, employeeId: record.employeeId, type: 'ATTENDANCE', empName: record.employee.name, date: record.date.toISOString(), checkIn: record.checkIn ? record.checkIn.toISOString() : null, checkOut: record.checkOut ? record.checkOut.toISOString() : null, actualHrs: accumulatedDayHours.toFixed(2), deficit, overtime, isLastOfDay, dailyEarned, amount: null, notes: null, balance: "-" };
    });

    const cashData = cashTransactions.filter(t => t.employee).map(t => ({
        id: t.id, employeeId: t.employeeId, type: 'CASH', empName: t.employee!.name, date: t.createdAt.toISOString(), checkIn: null, checkOut: null, actualHrs: '-', deficit: '-', overtime: '-', isLastOfDay: false, dailyEarned: 0, amount: t.amount, notes: (t as any).notes || null, balance: '-', 
    }));
    
    const combinedData: any[] = [...attendanceData, ...cashData];
    combinedData.sort((a, b) => {
        if (a.employeeId !== b.employeeId) return (a.employeeId || 0) - (b.employeeId || 0);
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // --- 4. FINAL PASS with Opening Balance ---
    let finalData: any[] = [];
    let cumulativeBalance = 0;
    currentEmpId = -1;

    const processedEmployees = new Set();

    for (const item of combinedData) {
        if (!processedEmployees.has(item.employeeId)) {
            currentEmpId = item.employeeId;
            processedEmployees.add(currentEmpId);
            
            const openingBalance = openingBalances[currentEmpId] || 0;
            cumulativeBalance = openingBalance;

            // Add opening balance row only if it's not zero
            if (openingBalance !== 0) {
                finalData.push({
                    id: `ob-${currentEmpId}`,
                    employeeId: currentEmpId,
                    type: 'OPENING_BALANCE',
                    empName: item.empName,
                    date: sDate.toISOString(),
                    balance: Math.round(openingBalance),
                    notes: 'رصيد سابق من فترة قبل ' + sDate.toLocaleDateString('ar-EG'),
                });
            }
        }

        if (item.type === 'ATTENDANCE' && item.isLastOfDay) {
            cumulativeBalance += item.dailyEarned;
        } else if (item.type === 'CASH') {
            cumulativeBalance -= item.amount;
        }
        item.balance = Math.round(cumulativeBalance);
        finalData.push(item);
    }

    return { success: true, data: finalData };

  } catch (error: any) {
    console.error("Fetch error:", error);
    return { error: "حدث خطأ أثناء جلب البيانات: " + error.message };
  }
}

// ... (rest of the file is unchanged)


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

    const applyTime = (baseDate: Date, timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const newDate = new Date(baseDate);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    };

    if (checkInTime) newCheckIn = applyTime(existing.date, checkInTime);
    if (checkOutTime) newCheckOut = applyTime(existing.date, checkOutTime);

    let duration = 0;
    let overtime = 0;
    if (newCheckIn && newCheckOut) {
      duration = (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60);
      if (duration < 0) duration += 24; 
      
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
