"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Map,
  Settings,
  Clock,
  Volleyball,
  ClipboardList,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/services/admin-actions";
import { toast } from "sonner";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/mapa", label: "Mapa", icon: Map },
  { href: "/admin/canchas", label: "Canchas", icon: Volleyball },
  { href: "/admin/reservas", label: "Reservas", icon: ClipboardList },
  { href: "/admin/horarios", label: "Horarios", icon: Clock },
  { href: "/admin/precios", label: "Precios", icon: DollarSign },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
] as const;

function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <Link
          href="/admin"
          className="flex flex-col gap-0.5 rounded-lg px-1 py-0.5 transition-opacity hover:opacity-90"
        >
          <span className="font-display text-sm tracking-wider text-sidebar-primary uppercase">
            La Diagonal
          </span>
          <span className="text-xs text-sidebar-foreground/60">Panel admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="px-1 py-2">
          <SidebarGroupLabel className="mb-1 px-3 text-[11px] tracking-wider uppercase">
            Gestión
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(href)
                    }
                    tooltip={label}
                    className="h-10 rounded-lg px-3 transition-colors"
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-1 py-2">
          <SidebarGroupLabel className="mb-1 px-3 text-[11px] tracking-wider uppercase">
            Reservas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Agenda del día"
                  className="h-10 rounded-lg px-3 transition-colors"
                >
                  <Link href="/admin/reservas?tab=agenda">
                    <CalendarDays />
                    <span>Agenda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <LogoutButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="h-10 w-full justify-start gap-2 rounded-lg px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      onClick={async () => {
        await adminLogout();
        toast.success("Sesión cerrada");
        router.push("/admin/login");
        router.refresh();
      }}
    >
      <LogOut className="size-4" />
      Cerrar sesión
    </Button>
  );
}

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebarNav />
      <SidebarInset className="min-h-svh bg-muted/30">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm font-medium text-muted-foreground">
            Complejo Deportivo La Diagonal
          </span>
        </header>
        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
