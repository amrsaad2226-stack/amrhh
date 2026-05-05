// app/admin/actions/cash.ts
"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addCashTransaction(formData: FormData) {
  try {
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as "INCOME" | "OUTCOME";
    const note = formData.get("note") as string | null;
    const employeeId = formData.get("employeeId") ? parseInt(formData.get("employeeId") as string) : null;
    const isGeneralExpense = formData.get("isGeneralExpense");

    if (isNaN(amount) || amount <= 0) {
      return { error: "المبلغ يجب أن يكون رقماً صحيحاً وأكبر من صفر." };
    }

    if (!type || !['INCOME', 'OUTCOME'].includes(type)) {
      return { error: "نوع الحركة غير صحيح." };
    }

    // If it's a loan (not a general expense), employeeId is required.
    if (!isGeneralExpense && !employeeId) {
      return { error: "يجب اختيار الموظف عند إضافة سلفة." };
    }

    await db.cashTransaction.create({
      data: {
        amount,
        type,
        note,
        // Only connect employee if it's not a general expense
        ...(employeeId && !isGeneralExpense && { 
          employee: {
            connect: { id: employeeId }
          }
        }),
      },
    });

    revalidatePath("/admin"); // This will refresh the data on the admin dashboard

    return { success: true };

  } catch (err) {
    console.error(err);
    return { error: "حدث خطأ غير متوقع أثناء حفظ الحركة. الرجاء المحاولة مرة أخرى." };
  }
}
