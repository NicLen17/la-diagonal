"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  CalendarDays,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Settings,
  Clock,
  Volleyball,
  ClipboardList,
  ExternalLink,
  X,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/services/admin-actions";
import { toast } from "sonner";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservas", label: "Reservas", icon: ClipboardList },
  { href: "/admin/canchas", label: "Canchas y predio", icon: Volleyball },
  { href: "/admin/precios", label: "Precios", icon: DollarSign },
  { href: "/admin/horarios", label: "Horarios", icon: Clock },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
] as const;

function AdminSidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const closeMobile = () => setOpenMobile(false);
  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="relative h-20 justify-center border-b border-sidebar-border p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link
          href="/admin"
          onClick={closeMobile}
          aria-label="Cancha Manager · Dashboard"
          className="flex min-w-0 items-center gap-3 rounded-lg"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Volleyball className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-sm font-bold">
              Cancha Manager
            </span>
            <span className="text-xs text-sidebar-foreground/65">
              Administración
            </span>
          </span>
        </Link>
        <Button
          aria-label="Cerrar navegación"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
          onClick={closeMobile}
        >
          <X aria-hidden="true" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Operación del complejo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/admin"
                    ? pathname === href
                    : pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                      className="h-11 rounded-lg px-3 group-data-[collapsible=icon]:mx-auto data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                    >
                      <Link
                        href={href}
                        onClick={closeMobile}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Accesos rápidos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Agenda de hoy"
                  className="h-11"
                >
                  <Link href="/admin/reservas?tab=agenda" onClick={closeMobile}>
                    <CalendarDays aria-hidden="true" />
                    <span>Agenda de hoy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Ver sitio de reservas"
                  className="h-11"
                >
                  <Link href="/reservar" target="_blank">
                    <ExternalLink aria-hidden="true" />
                    <span>Sitio de reservas</span>
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
  const [pending, startTransition] = useTransition();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Cerrar sesión"
          disabled={pending}
          className="h-11"
          onClick={() =>
            startTransition(async () => {
              try {
                await adminLogout();
                toast.success("Sesión cerrada");
                router.push("/admin/login");
                router.refresh();
              } catch {
                toast.error("No se pudo cerrar la sesión. Intentá de nuevo.");
              }
            })
          }
        >
          <LogOut aria-hidden="true" />
          <span>{pending ? "Cerrando…" : "Cerrar sesión"}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
export function AdminLayoutShell({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;
  const current = NAV.find((item) =>
    item.href === "/admin"
      ? pathname === item.href
      : pathname.startsWith(item.href),
  );
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}
    >
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:p-3"
      >
        Ir al contenido
      </a>
      <AdminSidebarNav />
      <SidebarInset className="min-w-0 bg-muted/30">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 lg:px-6">
          <SidebarTrigger
            className="size-10 shrink-0"
            aria-label="Abrir o cerrar navegación"
          />
          <span className="truncate text-sm font-semibold">
            {current?.label ?? "Administración"}
          </span>
          <span className="ml-auto rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
            Demo
          </span>
        </header>
        <div
          id="admin-content"
          tabIndex={-1}
          className="admin-content mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
