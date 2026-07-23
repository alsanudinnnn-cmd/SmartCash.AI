import { AppShell } from "@/app/components/AppShell";
import { requireUser } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <AppShell
      user={{
        fullName: user.fullName,
        businessName: user.businessName,
      }}
    >
      {children}
    </AppShell>
  );
}
