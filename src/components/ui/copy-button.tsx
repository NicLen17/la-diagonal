"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "icon" | "icon-sm";
  variant?: "ghost" | "outline" | "secondary";
};

export function CopyButton({
  value,
  label = "Copiar",
  className,
  size = "icon-sm",
  variant = "ghost",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copiado");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleCopy}
      aria-label={label}
      title={label}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </Button>
  );
}

type CopyFieldProps = {
  label: string;
  value: string;
  className?: string;
};

export function CopyField({ label, value, className }: CopyFieldProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border bg-background/80 px-3 py-2",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium tabular-nums">{value}</p>
      </div>
      <CopyButton value={value} label={`Copiar ${label.toLowerCase()}`} />
    </div>
  );
}
