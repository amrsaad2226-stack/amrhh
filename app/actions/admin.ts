'use server'
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addEmployee(formData: any) {
  try {
    await db.employee.create({
      data: {
        code: formData.code,
        name: formData.name,
        password: formData.password,
        department: formData.department,
        dailySalary: parseFloat(formData.dailySalary) || 0,
        officeLat: parseFloat(formData.officeLat),
        officeLng: parseFloat(formData.officeLng),
        locName: formData.locName || "موقع العمل",
        timeIn: formData.timeIn,
        timeOut: formData.timeOut,
        allowDist: parseInt(formData.allowDist) || 50,
      }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    // Check if the error is due to a unique constraint violation
    if (e.code === 'P2002' && e.meta?.target?.includes('code')) {
      return { error: "هذا الكود مستخدم بالفعل لموظف آخر." };
    }
    return { error: "خطأ في البيانات المدخلة أو الكود مكرر" };
  }
}
