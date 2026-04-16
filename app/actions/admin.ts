// app/actions/admin.ts
"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. إضافة فرع جديد
export async function addBranch(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);

    if (!name || isNaN(latitude) || isNaN(longitude)) {
      throw new Error("بيانات الفرع غير مكتملة");
    }

    await db.branch.create({
      data: { name, latitude, longitude }
    });
    
    revalidatePath("/admin/branches");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding branch:", error);
    return { error: "فشل إضافة الفرع" };
  }
}

// 2. إضافة موظف جديد (تأكد من وجود كلمة export هنا)
export async function addEmployee(data: any) {
  try {
    await db.employee.create({
      data: {
        code: data.code,
        name: data.name,
        password: data.password,
        department: data.department,
        dailySalary: parseFloat(data.dailySalary) || 0,
        overtimeRate: parseFloat(data.overtimeRate || "1"),
        // معالجة نوع الفرع (محدد أم مفتوح)
        isAnyBranch: data.branchType === "OPEN",
        branchId: data.branchType !== "OPEN" ? parseInt(data.branchId) : null,
        // المواعيد والإجازات
        offDay: data.offDay,
        offDayHours: parseInt(data.offDayHours || "0"),
        timeIn: data.timeIn,
        timeOut: data.timeOut,
      }
    });
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding employee:", error);
    return { error: "فشل إضافة الموظف. تأكد أن الكود غير مكرر." };
  }
}

// 3. تصفير بصمة الجهاز
export async function resetDeviceId(id: number) {
  await db.employee.update({
    where: { id },
    data: { deviceId: null }
  });
  revalidatePath("/admin");
}

// 4. حذف موظف
export async function deleteEmployee(id: number) {
  await db.employee.delete({ where: { id } });
  revalidatePath("/admin");
}