'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ... (getPayrollData and activateEmployeeDevice functions remain the same)
export async function getPayrollData(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const employees = await db.employee.findMany({
    include: {
      attendances: {
        where: {
          date: { gte: startDate, lte: endDate },
        },
      },
    },
  });

  return employees.map(emp => {
    const totalDays = emp.attendances.length;
    const totalOvertimeHours = emp.attendances.reduce((sum, att) => sum + (att.overtime || 0), 0);

    const baseSalary = totalDays * emp.dailySalary;
    const hourlyRate = emp.dailySalary / (emp.dailyHours || 8);
    const overtimePay = totalOvertimeHours * hourlyRate * (emp.overtimeRate || 1);

    return {
      id: emp.id,
      name: emp.name,
      totalDays,
      totalOvertimeHours: totalOvertimeHours.toFixed(1),
      netSalary: Math.round(baseSalary + overtimePay),
    };
  });
}

export async function activateEmployeeDevice(employeeId: number, deviceId: string) {
  try {
    await db.employee.update({
      where: { id: employeeId },
      data: { deviceId: deviceId },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Failed to activate device:', error);
    return { success: false, message: 'An error occurred while activating the device.' };
  }
}

export async function addEmployee(data: any) {
  try {
    const existingEmployee = await db.employee.findFirst({
      where: { code: data.code },
    });

    if (existingEmployee) {
      return { success: false, error: 'A user with this code already exists' };
    }

    await db.employee.create({
      data: {
        name: data.name,
        code: data.code,
        password: data.password, // In a real app, hash this password!
        department: data.department,
        isAnyBranch: data.branchType === 'OPEN',
        branchId: data.branchType === 'SPECIFIC' ? parseInt(data.branchId) : null,
        timeIn: data.timeIn,
        timeOut: data.timeOut,
        dailyHours: parseInt(data.dailyHours),
        offDay: data.offDay,
        offDayHours: parseInt(data.offDayHours),
        dailySalary: parseFloat(data.dailySalary),
        overtimeRate: parseFloat(data.overtimeRate),
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to create employee.' };
  }
}
