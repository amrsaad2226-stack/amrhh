
"use server";
import prisma from "../../lib/db";

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
            if (!att.employee) return;
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
      if (tx.employeeId == null) return;
      if (!prevAdvances[tx.employeeId]) {
        prevAdvances[tx.employeeId] = 0;
      }
      prevAdvances[tx.employeeId] += tx.amount;
    });

    const allPrevEmployeeIds = new Set([
      ...allPrevAttendances.map(a => a.employeeId),
      ...allPrevCashTxs.map(c => c.employeeId).filter((id): id is number => id != null)
    ]);

    for (const id of allPrevEmployeeIds) {
      const earnings = prevEarnings[id] || 0;
      const advances = prevAdvances[id] || 0;
      openingBalances[id] = earnings - advances;
    }

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

    let currentEmpId: number | null = -1;
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
      return { 
        id: record.id, 
        employee: { id: record.employeeId, name: record.employee.name },
        type: 'ATTENDANCE', 
        date: record.date.toISOString(), 
        checkIn: record.checkIn ? record.checkIn.toISOString() : null, 
        checkOut: record.checkOut ? record.checkOut.toISOString() : null, 
        actualHrs: accumulatedDayHours.toFixed(2), 
        deficit, 
        overtime, 
        isLastOfDay, 
        dailyEarned, 
        amount: null, 
        notes: record.notes || null, 
        balance: "-" 
      };
    });

    const cashData = cashTransactions.filter(t => t.employee && t.employeeId !== null).map(t => ({
        id: t.id, 
        employee: { id: t.employeeId!, name: t.employee!.name },
        type: 'CASH', 
        date: t.createdAt.toISOString(), 
        checkIn: null, 
        checkOut: null, 
        actualHrs: '-', 
        deficit: '-', 
        overtime: '-', 
        isLastOfDay: false, 
        dailyEarned: 0, 
        amount: t.amount, 
        notes: t.note || null, 
        balance: '-', 
    }));
    
    const initialCombinedData: any[] = [...attendanceData, ...cashData];
    
    const combinedData = initialCombinedData.filter(item => item && item.employee && item.employee.name);

    combinedData.sort((a, b) => {
        if (a.employee.id !== b.employee.id) return (a.employee.id || 0) - (b.employee.id || 0);
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    let finalData: any[] = [];
    let cumulativeBalance = 0;
    currentEmpId = -1;

    const processedEmployees = new Set();

    for (const item of combinedData) {
        if (item.employee.id === null || item.employee.id === undefined) continue;

        if (!processedEmployees.has(item.employee.id)) {
            currentEmpId = item.employee.id;
            processedEmployees.add(currentEmpId);
            
            const openingBalance = openingBalances[currentEmpId!] || 0;
            cumulativeBalance = openingBalance;

            if (openingBalance !== 0) {
                finalData.push({
                    id: `ob-${currentEmpId}`,
                    employee: { id: currentEmpId, name: item.employee.name },
                    type: 'OPENING_BALANCE',
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
