"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addEmployee(data: any) {
  try {
    // 1. استخراج رقم الفرع بشكل آمن ومضمون 100%
    let safeBranchId = null;
    if (data.branchType !== "OPEN" && data.branchId) {
      safeBranchId = parseInt(data.branchId, 10);
      if (isNaN(safeBranchId)) safeBranchId = null;
    }

    // 2. الحفظ في قاعدة البيانات
    await db.employee.create({
      data: {
        code: data.code,
        name: data.name,
        password: data.password,
        department: data.department,
        dailySalary: parseFloat(data.dailySalary) || 0,
        overtimeRate: parseFloat(data.overtimeRate || "1"),
        
        // 👈 هذا هو الجزء الذي تم إصلاحه وتأمينه
        isAnyBranch: data.branchType === "OPEN",
        branchId: safeBranchId, 
        
        // المواعيد والإجازات
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
    return { error: "فشل إضافة الموظف. تأكد أن الكود غير مكرر." };
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

// أضف هذه الدالة في نهاية ملف app/actions/admin.ts
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
