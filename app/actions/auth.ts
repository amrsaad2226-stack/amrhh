// app/actions/auth.ts
"use server";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Handles admin login.
 * It checks a password from FormData against a secret password.
 * IMPORTANT: The password should be moved to an environment variable for security.
 */
export async function login(formData: FormData) {
  const password = formData.get("password") as string;

  // FIXME: This password should be stored in an environment variable (.env)
  // and not hardcoded in the source code for security reasons.
  const ADMIN_PASSWORD = "saad101";

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies(); // CORRECTED: Added await
    cookieStore.set("auth_token", "secret_admin_token", { // The value can be a JWT or any other secure token
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return { success: true };
  } else {
    return { error: "Incorrect password ❌" };
  }
}

export async function loginEmployee(formData: FormData) {
  const code = formData.get("code") as string;
  const password = formData.get("password") as string;

  const employee = await db.employee.findUnique({ where: { code } });

  if (!employee || employee.password !== password) {
    return { error: "كود الموظف أو كلمة المرور غير صحيحة" };
  }

  const cookieStore = await cookies(); // CORRECTED: Added await
  cookieStore.set("emp_session", employee.id.toString(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 يوماً
    path: "/",
  });

  return { success: true };
}

export async function logoutEmployee() {
  const cookieStore = await cookies(); // CORRECTED: Added await
  cookieStore.delete("emp_session");
  redirect("/login");
}
