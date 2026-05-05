
// app/admin/actions/cash.ts
"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

// (The existing addCashTransaction function remains here)

export async function addCashTransaction(formData: FormData) {
  try {
    // --- 1. Get Data ---
    const amountStr = formData.get("amount") as string;
    const type = formData.get("type") as "INCOME" | "OUTCOME";
    const note = formData.get("note") as string | null;
    const employeeIdStr = formData.get("employeeId") as string | null;
    const incomeSource = formData.get("incomeSource") as "treasury" | "employee" | null;

    // --- 2. Validation ---
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { error: "المبلغ يجب أن يكون رقماً وأكبر من صفر." };
    }

    if (!type || !['INCOME', 'OUTCOME'].includes(type)) {
      return { error: "نوع الحركة غير صحيح (دفع أو قبض)." };
    }

    if (!note || note.trim() === "") {
        return { error: "يجب كتابة بيان للحركة (ملاحظات)." };
    }

    const employeeId = employeeIdStr ? parseInt(employeeIdStr) : null;
    let shouldConnectEmployee = false;

    // --- 3. Conditional Logic ---
    if (type === 'OUTCOME') {
      if (!employeeId) {
        return { error: "يجب اختيار الموظف عند تسجيل سند دفع (سلفة)." };
      }
      shouldConnectEmployee = true;
    } else if (type === 'INCOME') {
      if (incomeSource === 'employee') {
        if (!employeeId) {
          return { error: "يجب اختيار الموظف عند تسجيل سداد منه." };
        }
        shouldConnectEmployee = true;
      } 
    }

    // --- 4. Database Operation ---
    await db.cashTransaction.create({
      data: {
        amount,
        type,
        note,
        ...(shouldConnectEmployee && employeeId && { 
          employee: {
            connect: { id: employeeId }
          }
        }),
      },
    });

    // --- 5. Revalidation ---
    revalidatePath("/admin/cash");
    revalidatePath("/admin");

    return { success: true };

  } catch (err) {
    console.error(err);
    return { error: "حدث خطأ غير متوقع أثناء حفظ الحركة. الرجاء المحاولة مرة أخرى." };
  }
}


/**
 * Deletes a cash transaction by its ID.
 */
export async function deleteCashTransaction(transactionId: number) {
  try {
    if (typeof transactionId !== 'number') {
      return { error: "معرف الحركة غير صالح." };
    }

    await db.cashTransaction.delete({
      where: { id: transactionId },
    });

    revalidatePath("/admin/cash");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "حدث خطأ أثناء حذف الحركة." };
  }
}
