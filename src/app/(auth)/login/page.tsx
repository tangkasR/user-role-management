// src/app/(auth)/login/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "@/modules/auth/components/LoginForm";

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard"); // sudah login → tidak perlu form
  return <LoginForm />;
}
