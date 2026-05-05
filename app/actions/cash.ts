"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addTransaction(formData: FormData) {
  const type = formData.get("type") as "INCOME" | "OUTCOME";
  const amount = parseFloat(formData.get("amount") as string);
  const note = formData.get("note") as string;
  const employeeId = formData.get("employeeId");

  if (!amount || amount <= 0) {
    return { error: "المبلغ غير صالح" };
  }

  const newTransaction = await db.cashTransaction.create({
    data: {
      type,
      amount,
      note,
      employeeId: employeeId && employeeId !== "" ? Number(employeeId) : null,
    },
  });

  revalidatePath("/admin/cash");

  return { success: true, data: newTransaction };
}