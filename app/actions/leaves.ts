"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function requestLeave(empId: number, data: any) {
  await db.leaveRequest.create({
    data: {
      employeeId: empId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      type: data.type,
      reason: data.reason
    }
  });
  revalidatePath("/portal");
}
