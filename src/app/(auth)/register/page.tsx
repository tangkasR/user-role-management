// src/app/(auth)/register/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import RegisterForm from "@/modules/auth/components/RegisterForm";

export default async function RegisterPage() {
  if (await getSession()) redirect("/dashboard");
  return <RegisterForm />;
}
