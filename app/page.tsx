// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const cookieStore = await cookies();
  const empId = cookieStore.get("emp_session")?.value;

  if (!empId) {
    // إذا لم يسجل دخول، يذهب للوجن مباشرة
    redirect("/login");
  } else {
    // إذا كان مسجل دخول، يذهب للبورتال
    redirect("/portal");
  }
}
