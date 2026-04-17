// app/actions/leaves.ts
"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// تأكد من هذا الاسم بالظبط 👇
export async function requestLeave(empId: number, formData: FormData) {
  try {
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const type = formData.get("type") as string;
    const reason = formData.get("reason") as string;

    await db.leaveRequest.create({
      data: {
        employeeId: empId,
        startDate,
        endDate,
        type,
        reason,
      }
    });

    revalidatePath("/portal");
    return { success: "تم إرسال طلب الإجازة بنجاح" };
  } catch (error) {
    console.error("Leave Request Error:", error);
    return { error: "فشل إرسال الطلب، حاول مرة أخرى" };
  }
}

export async function updateLeaveStatus(leaveId: number, status: "Approved" | "Rejected") {
  try {
    await db.leaveRequest.update({
      where: { id: leaveId },
      data: { status }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "فشل تحديث الحالة" };
  }
}