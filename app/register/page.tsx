import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/app/components/AuthShell";
import { RegisterForm } from "@/app/components/RegisterForm";
import { getCurrentUser } from "@/app/lib/auth";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell
      eyebrow="Mulakan dengan SmartCash AI"
      title="Cipta akaun perniagaan"
      description="Sediakan ruang kerja kewangan anda dalam beberapa langkah."
      footer={<>Sudah ada akaun? <Link href="/login">Log masuk</Link></>}
    >
      <RegisterForm />
    </AuthShell>
  );
}
