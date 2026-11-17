"use server";

import { checkAdminPassword, setAdminSessionCookie, clearAdminSessionCookie } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export async function adminLoginAction(formData: FormData) {
  const password = formData.get("password") as string;

  if (!password || !checkAdminPassword(password)) {
    return { success: false, error: "Incorrect admin password." };
  }

  await setAdminSessionCookie("admin");
  return { success: true };
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
