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
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/admin" className="flex flex-col gap-0.5">
          <span className="font-display text-sm tracking-wider text-sidebar-primary uppercase">
            La Diagonal
          </span>
          <span className="text-xs text-sidebar-foreground/70">Panel admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
        <SidebarGroup>
          <SidebarGroupLabel>Reservas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Agenda del día">
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
      <SidebarFooter className="border-t border-sidebar-border p-2">
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
      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm font-medium text-muted-foreground">
            Complejo Deportivo La Diagonal
          </span>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
