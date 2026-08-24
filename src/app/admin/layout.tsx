import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
