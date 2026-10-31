"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { adminLogin } from "@/lib/services/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next") ?? "/admin";
  const next = /^\/admin(?:\/|\?|$)/.test(requestedNext)
    ? requestedNext
    : "/admin";
  const [passcode, setPasscode] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const credentials = new FormData();
      credentials.set("passcode", passcode);
      const result = await adminLogin(credentials);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Acceso concedido");
      router.push(next);
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md border-navy-800/20 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl uppercase">
          Panel Admin
        </CardTitle>
        <CardDescription>
          Ingresá la clave de acceso para gestionar Cancha Manager
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passcode">Clave de acceso</Label>
            <Input
              id="passcode"
              name="passcode"
              type="password"
              autoComplete="current-password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Verificando…" : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
