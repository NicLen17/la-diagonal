import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-navy-950 px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-field-lines opacity-30"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md">
        <Suspense
          fallback={<Skeleton className="h-64 w-full rounded-xl" />}
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
