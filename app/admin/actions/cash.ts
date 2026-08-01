
"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addCashTransaction(formData: FormData) {
  try {
    const amountStr = formData.get("amount") as string;
    const type = formData.get("type") as "INCOME" | "OUTCOME";
    const note = formData.get("note") as string | null;
    const employeeIdStr = formData.get("employeeId") as string | null;
    const incomeSource = formData.get("incomeSource") as "treasury" | "employee" | null;
    const createdAtStr = formData.get("createdAt") as string | null;

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
    
    let createdAt;
    if (createdAtStr) {
      // When a date string like '2023-10-27' is parsed, it's treated as UTC midnight.
      // This can cause off-by-one day errors in different timezones.
      // To make it robust, we append 'T12:00:00Z' to parse it as noon UTC,
      // safely representing the intended date without time-of-day or timezone ambiguity.
      createdAt = new Date(createdAtStr + 'T12:00:00Z');
    } else {
      createdAt = new Date();
      createdAt.setHours(12, 0, 0, 0);
    }

    const employeeId = employeeIdStr ? parseInt(employeeIdStr) : null;
    let shouldConnectEmployee = false;

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

    await db.cashTransaction.create({
      data: {
        amount,
        type,
        note,
        createdAt,
        ...(shouldConnectEmployee && employeeId && { 
          employee: {
            connect: { id: employeeId }
          }
        }),
      },
    });

    revalidatePath("/admin/cash");
    revalidatePath("/admin");

    return { success: true };

  } catch (err) {
    console.error(err);
    return { error: "حدث خطأ غير متوقع أثناء حفظ الحركة. الرجاء المحاولة مرة أخرى." };
  }
}

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

export async function updateCashTransaction(formData: FormData) {
  try {
    const idStr = formData.get("id") as string;
    const amountStr = formData.get("amount") as string;
    const note = formData.get("note") as string | null;
    const createdAtStr = formData.get("createdAt") as string | null;

    const id = parseInt(idStr);
    if (isNaN(id)) {
        return { error: "معرف الحركة غير صالح." };
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { error: "المبلغ يجب أن يكون رقماً وأكبر من صفر." };
    }

    if (!note || note.trim() === "") {
        return { error: "يجب كتابة بيان للحركة (ملاحظات)." };
    }

    const dataToUpdate: { amount: number; note: string; createdAt?: Date } = {
        amount,
        note,
    };

    if (createdAtStr) {
        // When a date string like '2023-10-27' is parsed, it's treated as UTC midnight.
        // This can cause off-by-one day errors in different timezones.
        // To make it robust, we append 'T12:00:00Z' to parse it as noon UTC,
        // safely representing the intended date without time-of-day or timezone ambiguity.
        dataToUpdate.createdAt = new Date(createdAtStr + 'T12:00:00Z');
    }

    await db.cashTransaction.update({
        where: { id },
        data: dataToUpdate,
    });

    revalidatePath("/admin/cash");
    revalidatePath("/admin");

    return { success: true };

  } catch (err) {
    console.error(err);
    return { error: "حدث خطأ غير متوقع أثناء تحديث الحركة. الرجاء المحاولة مرة أخرى." };
  }
}
