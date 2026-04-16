"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// إضافة فرع جديد
export async function addBranch(data: any) {
  await db.branch.create({
    data: {
      name: data.name,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    }
  });
  revalidatePath("/admin");
}

// تحديث إضافة موظف
export async function addEmployee(data: any) {
  try {
    await db.employee.create({
      data: {
        code: data.code,
        name: data.name,
        password: data.password,
        department: data.department,
        dailySalary: parseFloat(data.dailySalary),
        overtimeRate: parseFloat(data.overtimeRate || "1"),
        // معالجة الفرع
        isAnyBranch: data.branchType === "OPEN",
        branchId: data.branchType !== "OPEN" ? parseInt(data.branchId) : null,
        // الإجازات
        offDay: data.offDay,
        offDayHours: parseInt(data.offDayHours || "0"),
        timeIn: data.timeIn,
        timeOut: data.timeOut,
      }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002' && e.meta?.target?.includes('code')) {
      return { error: "هذا الكود مستخدم بالفعل لموظف آخر." };
    }
    return { error: "خطأ في البيانات المدخلة أو الكود مكرر" };
  }
}