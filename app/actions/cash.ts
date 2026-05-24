"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// تعريف النوع الصحيح للحالات الممكنة
type CashAdvanceRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED";

export async function requestCashAdvance(formData: FormData) {
  try {
    const employeeId = parseInt(formData.get("employeeId") as string);
    const amount = parseFloat(formData.get("amount") as string);
    const reason = formData.get("reason") as string;

    if (!employeeId || !amount || amount <= 0) {
      return { success: false, message: "بيانات غير صالحة." };
    }

    await db.cashAdvanceRequest.create({
      data: {
        employeeId,
        amount,
        reason,
        status: "PENDING", 
      },
    });

    revalidatePath("/portal");
    revalidatePath("/admin/requests");
    return { success: true, message: "تم إرسال طلب السلفة بنجاح." };

  } catch (error) {
    console.error("Cash Advance Request Error:", error)
    return { success: false, message: "حدث خطأ أثناء إرسال الطلب." };
  }
}

export async function addTransaction(formData: FormData) {
  const type = formData.get("type") as "INCOME" | "OUTCOME";
  const amount = parseFloat(formData.get("amount") as string);
  const note = formData.get("note") as string;
  const employeeId = formData.get("employeeId");
  const advanceRequestId = formData.get("advanceRequestId");

  if (!amount || amount <= 0) return { error: "المبلغ غير صالح" };

  try {
    const result = await db.$transaction(async (tx) => {
      const transaction = await tx.cashTransaction.create({
        data: {
          type,
          amount,
          note: advanceRequestId ? `[سلفة معتمدة] ${note}` : note,
          employeeId: employeeId && employeeId !== "" ? Number(employeeId) : null,
          advanceRequestId: advanceRequestId ? Number(advanceRequestId) : null,
        },
      });

      if (advanceRequestId) {
        await tx.cashAdvanceRequest.update({
          where: { id: Number(advanceRequestId) },
          data: { status: "DISBURSED" } 
        });
      }

      return transaction;
    });

    revalidatePath("/admin/cash");
    revalidatePath("/admin/requests");
    return { success: true, data: result };
  } catch (error) {
    return { error: "حدث خطأ أثناء تسجيل العملية" };
  }
}

// استخدام النوع الصحيح في الدالة
export async function updateRequestStatus(id: number, status: CashAdvanceRequestStatus) {
  await db.cashAdvanceRequest.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/admin/requests");
  revalidatePath("/portal");
}
