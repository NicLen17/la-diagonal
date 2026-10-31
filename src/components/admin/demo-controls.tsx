"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetDemoAction } from "@/lib/services/demo-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function DemoControls() {
  const [open, setOpen] = useState(false),
    [confirmation, setConfirmation] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <div className="rounded-2xl border bg-muted/40 p-5">
      <h2 className="text-xl">Preparar la próxima visita</h2>
      <p className="my-3 max-w-xl text-sm text-muted-foreground">
        Restablecé las 8 canchas, horarios, precios y reservas ficticias. Se
        eliminan las reservas y comprobantes de las demostraciones anteriores.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Restablecer demo</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer datos de demostración</DialogTitle>
            <DialogDescription>
              Se eliminarán las reservas, comprobantes y cambios de esta demo.
              Esta acción no se puede deshacer. Usala entre visitas, cuando
              hayas terminado de mostrar el recorrido.
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="reset-confirmation">Escribí REINICIAR DEMO</Label>
          <Input
            id="reset-confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              disabled={pending || confirmation !== "REINICIAR DEMO"}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await resetDemoAction(confirmation);
                    setOpen(false);
                    setConfirmation("");
                    toast.success("Demo restablecida");
                    router.refresh();
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "No se pudo restablecer la demo",
                    );
                  }
                })
              }
            >
              {pending ? "Restableciendo…" : "Restablecer demo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
