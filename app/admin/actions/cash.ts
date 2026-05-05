
// app/admin/actions/cash.ts
"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

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
      // This is an advance (سلفة) to an employee. Employee is required.
      if (!employeeId) {
        return { error: "يجب اختيار الموظف عند تسجيل سند دفع (سلفة)." };
      }
      shouldConnectEmployee = true;
    } else if (type === 'INCOME') {
      // This is a deposit. Check the source.
      if (incomeSource === 'employee') {
        // Repayment from an employee. Employee is required.
        if (!employeeId) {
          return { error: "يجب اختيار الموظف عند تسجيل سداد منه." };
        }
        shouldConnectEmployee = true;
      } 
      // If incomeSource is 'treasury', employee is not needed. `shouldConnectEmployee` remains false.
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
    revalidatePath("/admin"); // Also revalidate admin dashboard as it may show related totals

    return { success: true };

  } catch (err) {
    console.error(err);
    return { error: "حدث خطأ غير متوقع أثناء حفظ الحركة. الرجاء المحاولة مرة أخرى." };
  }
}
