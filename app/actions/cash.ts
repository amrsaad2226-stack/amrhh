"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addTransaction(formData: FormData) {
  const type = formData.get("type") as "INCOME" | "OUTCOME";
  const amount = parseFloat(formData.get("amount") as string);
  const note = formData.get("note") as string;
  const employeeId = formData.get("employeeId");
  const advanceRequestId = formData.get("advanceRequestId"); // الحقل الجديد

  if (!amount || amount <= 0) return { error: "المبلغ غير صالح" };

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. إنشاء حركة النقدية (الخزينة)
      const transaction = await tx.cashTransaction.create({
        data: {
          type,
          amount,
          note: advanceRequestId ? `[سلفة معتمدة] ${note}` : note,
          employeeId: employeeId && employeeId !== "" ? Number(employeeId) : null,
          advanceRequestId: advanceRequestId ? Number(advanceRequestId) : null,
        },
      });

      // 2. إذا كانت سلفة، نحدث حالة الطلب الأصلي ليصبح "تم الصرف"
      if (advanceRequestId) {
        await tx.cashAdvanceRequest.update({
          where: { id: Number(advanceRequestId) },
          data: { status: "Disbursed" }
        });
      }

      return transaction;
    });

    revalidatePath("/admin/cash");
    return { success: true, data: result };
  } catch (error) {
    return { error: "حدث خطأ أثناء تسجيل العملية" };
  }
}

export async function handleAdvanceRequest(empId: number, amount: number, reason: string) {
  await db.cashAdvanceRequest.create({
    data: {
      employeeId: empId,
      amount,
      reason,
      status: "Pending" 
    }
  });
  revalidatePath("/portal");
}

export async function updateRequestStatus(id: number, status: "Approved" | "Rejected") {
  await db.cashAdvanceRequest.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/admin/requests");
}
