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
    return { success: true };
  } catch (error: any) {
    console.error("Error adding branch:", error);
    return { error: "فشل إضافة الفرع. قد يكون الاسم مكرراً." };
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

// 5. جلب بيانات الرواتب (للتقارير)
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
    const totalOvertime = emp.attendances.reduce((sum, att) => sum + (att.overtime || 0), 0);
    const baseSalary = totalDays * emp.dailySalary;
    const hourlyRate = emp.dailySalary / (emp.dailyHours || 8);
    const overtimePay = totalOvertime * hourlyRate * (emp.overtimeRate || 1);
    
    return {
      id: emp.id,
      name: emp.name,
      totalDays,
      totalOvertimeHours: totalOvertime.toFixed(1), // ✅ الاسم الجديد المتوافق
      netSalary: Math.round(baseSalary + overtimePay)
    };
  });
}
