
// app/actions/admin.ts
"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. إضافة فرع جديد (الدالة اللي كانت ناقصة)
export async function addBranch(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);

    if (!name || isNaN(latitude) || isNaN(longitude)) {
      return { error: "بيانات الفرع غير مكتملة" };
    }

    await db.branch.create({
      data: { name, latitude, longitude }
    });
    
    revalidatePath("/admin/branches"); 
    revalidatePath("/admin");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error adding branch:", error);
    return { error: "فشل إضافة الفرع. قد يكون الاسم مكرراً." };
  }
}

export async function updateBranch(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);

    await db.branch.update({
      where: { id },
      data: { name, latitude, longitude },
    });

    revalidatePath("/admin/branches");
    return { success: true };
  } catch (error) {
    return { error: "حدث خطأ أثناء تعديل الفرع" };
  }
}

export async function deleteBranch(id: number) {
  try {
    // التحقق من عدم وجود موظفين في هذا الفرع قبل الحذف
    const branch = await db.branch.findUnique({
      where: { id },
      include: { employees: true },
    });

    if (branch && branch.employees.length > 0) {
      return { error: "لا يمكن حذف هذا الفرع لوجود موظفين مرتبطين به." };
    }

    await db.branch.delete({
      where: { id },
    });

    revalidatePath("/admin/branches");
    return { success: true };
  } catch (error) {
    return { error: "حدث خطأ أثناء حذف الفرع" };
  }
}


// 2. إضافة موظف جديد
export async function addEmployee(data: any) {
  try {
    let safeBranchId = null;
    if (data.branchType !== "OPEN" && data.branchId) {
      safeBranchId = parseInt(data.branchId, 10);
    }

    await db.employee.create({
      data: {
        code: data.code,
        name: data.name,
        password: data.password,
        department: data.department,
        dailySalary: parseFloat(data.dailySalary) || 0,
        overtimeRate: parseFloat(data.overtimeRate || "1"),
        isAnyBranch: data.branchType === "OPEN",
        branchId: safeBranchId,
        dailyHours: parseInt(data.dailyHours || "8"),
        offDay: data.offDay,
        offDayHours: parseInt(data.offDayHours || "0"),
        timeIn: data.timeIn,
        timeOut: data.timeOut,
        allowDist: parseInt(data.allowDist || "50"),
        salaryType: data.salaryType, // Add salaryType to the create payload
      }
    });
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding employee:", error);
    return { error: "فشل إضافة الموظف. تأكد من الكود." };
  }
}

// 3. تفعيل بصمة جهاز الموظف
export async function activateEmployeeDevice(employeeId: number, deviceId: string) {
  try {
    await db.employee.update({
      where: { id: employeeId },
      data: { deviceId }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "فشل تفعيل الجهاز" };
  }
}

// 4. حذف موظف
export async function deleteEmployee(id: number) {
  await db.employee.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function getPayrollData(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); 

  const employees = await db.employee.findMany({
    include: {
      attendances: {
        where: {
          date: { gte: startDate, lte: endDate },
          checkOut: { not: null } 
        }
      }
    }
  });

  return employees.map(emp => {
    const dailyLogs: Record<string, number> = {};

    emp.attendances.forEach(att => {
      const dateKey = att.date.toISOString().split('T')[0]; 
      if (!dailyLogs[dateKey]) dailyLogs[dateKey] = 0;
      dailyLogs[dateKey] += (att.duration || 0); 
    });

    const uniqueDaysPresent = Object.keys(dailyLogs).length; 
    const requiredDailyHours = emp.dailyHours || 8;
    const hourlyRate = emp.dailySalary / requiredDailyHours; 

    let totalOvertimeHours = 0;
    let totalShortfallHours = 0; 

    Object.values(dailyLogs).forEach(totalHoursWorked => {
      if (totalHoursWorked > requiredDailyHours) {
        totalOvertimeHours += (totalHoursWorked - requiredDailyHours);
      } else if (totalHoursWorked < requiredDailyHours) {
        totalShortfallHours += (requiredDailyHours - totalHoursWorked);
      }
    });

    const baseSalary = uniqueDaysPresent * emp.dailySalary; 
    const overtimePay = totalOvertimeHours * hourlyRate * (emp.overtimeRate || 1); 
    const deductionAmount = totalShortfallHours * hourlyRate; 

    const netSalary = Math.round(baseSalary + overtimePay - deductionAmount);

    return {
      id: emp.id,
      name: emp.name,
      totalDays: uniqueDaysPresent,
      totalOvertimeHours: totalOvertimeHours.toFixed(1),
      totalShortfallHours: totalShortfallHours.toFixed(1),
      deductionAmount: Math.round(deductionAmount),
      netSalary: netSalary > 0 ? netSalary : 0 
    };
  });
}
