"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addEmployeeAction(data: any) {
  const { name, code, password, department, dailySalary, offDay } = data;

  try {
    await db.employee.create({
      data: {
        name,
        code,
        password,
        department,
        dailySalary: parseFloat(dailySalary),
        offDay,
      },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { error: "فشل إضافة الموظف" };
  }
}

export async function addBranch(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const latRaw = formData.get("latitude");
    const lngRaw = formData.get("longitude");

    // التحقق من أن البيانات موجودة فعلاً
    if (!name || !latRaw || !lngRaw) {
       return { error: "برجاء ملء جميع الخانات المطلوبة" };
    }

    const latitude = parseFloat(latRaw as string);
    const longitude = parseFloat(lngRaw as string);

    await db.branch.create({
      data: { name, latitude, longitude }
    });
    
    revalidatePath("/admin/branches");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma Error:", error);
    // إذا كان الخطأ بسبب تكرار الاسم (كود P2002 في بريزما)
    if (error.code === 'P2002') {
      return { error: "هذا الاسم موجود بالفعل، اختر اسماً آخر للفرع" };
    }
    // إرجاع رسالة الخطأ الحقيقية للمساعدة في التشخيص
    return { error: `خطأ تقني: ${error.message || "فشل الاتصال بقاعدة البيانات"}` };
  }
}
