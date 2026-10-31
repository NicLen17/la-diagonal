import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { cookies } from "next/headers";
import "@/components/admin/admin.css";
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";
  return (
    <AdminLayoutShell defaultOpen={defaultOpen}>{children}</AdminLayoutShell>
  );
}

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
