import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/app/components/AuthShell";
import { LoginForm } from "@/app/components/LoginForm";
import { getCurrentUser } from "@/app/lib/auth";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell
      eyebrow="Selamat kembali"
      title="Log masuk ke akaun anda"
      description="Teruskan mengurus kewangan perniagaan anda."
      footer={<>Belum ada akaun? <Link href="/register">Daftar sekarang</Link></>}
    >
      <LoginForm />
    </AuthShell>
  );
}
