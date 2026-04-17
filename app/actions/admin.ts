"use server";
import db from "@/lib/db";
// أضف هذه الدالة في app/actions/admin.ts
export async function getPayrollData(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const employees = await db.employee.findMany({
    include: {
      attendances: {
        where: {
          date: { gte: startDate, lte: endDate }
        }
      }
    }
  });

  return employees.map(emp => {
    const totalDays = emp.attendances.length;
    const totalOvertimeHours = emp.attendances.reduce((sum, att) => sum + (att.overtime || 0), 0);
    
    // حساب الراتب: (أيام الحضور * الراتب اليومي) + (ساعات الإضافي * سعر ساعة الإضافي)
    const baseSalary = totalDays * emp.dailySalary;
    const hourlyRate = emp.dailySalary / (emp.dailyHours || 8);
    const overtimePay = totalOvertimeHours * hourlyRate * (emp.overtimeRate || 1);
    
    return {
      id: emp.id,
      name: emp.name,
      totalDays,
      totalOvertimeHours: totalOvertimeHours.toFixed(1),
      netSalary: Math.round(baseSalary + overtimePay)
    };
  });
}