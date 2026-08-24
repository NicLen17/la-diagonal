import type { ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AdminFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/**
 * Side panel for admin create/edit forms — consistent padding, border and footer.
 */
export function AdminFormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: AdminFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden border-l border-border bg-background p-0 shadow-2xl sm:max-w-md",
          className,
        )}
      >
        <SheetHeader className="relative shrink-0 space-y-1.5 border-b border-border bg-muted/20 px-6 py-5 pr-14 text-left">
          <SheetTitle className="font-display text-xl tracking-wide text-navy-900 uppercase">
            {title}
          </SheetTitle>
          {description ? (
            <SheetDescription className="text-sm leading-relaxed">
              {description}
            </SheetDescription>
          ) : null}
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4 rounded-lg hover:bg-muted"
              aria-label="Cerrar"
            >
              <XIcon className="size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
          <div className="space-y-5">{children}</div>
        </div>

        {footer ? (
          <SheetFooter className="shrink-0 border-t border-border bg-muted/30 px-6 py-4 sm:flex-col">
            {footer}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function AdminField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
