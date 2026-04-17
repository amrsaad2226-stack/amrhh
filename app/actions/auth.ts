// app/actions/auth.ts
"use server";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginEmployee(formData: FormData) {
  const code = formData.get("code") as string;
  const password = formData.get("password") as string;

  const employee = await db.employee.findUnique({ where: { code } });

  if (!employee || employee.password !== password) {
    return { error: "كود الموظف أو كلمة المرور غير صحيحة" };
  }

  // 👈 التعديل هنا: استخدمنا await
  const cookieStore = await cookies();
  cookieStore.set("emp_session", employee.id.toString(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 يوماً
    path: "/",
  });

  return { success: true };
}

export async function logoutEmployee() {
  // 👈 التعديل هنا أيضاً
  const cookieStore = await cookies();
  cookieStore.delete("emp_session");
  redirect("/portal/login");
}
