import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactNode,
  type ReactElement,
} from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectTrigger } from "@/components/ui/select";
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
          "admin-content gap-0 overflow-hidden border-l border-border bg-background p-0 shadow-2xl data-[side=right]:w-full sm:data-[side=right]:max-w-lg",
          className,
        )}
      >
        <SheetHeader className="relative shrink-0 space-y-1.5 border-b border-border bg-muted/20 px-6 py-5 pr-14 text-left">
          <SheetTitle className="font-display text-xl tracking-wide text-foreground">
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

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 py-5">
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
  const id = useId();
  const { control, labelled } = labelControls(children, id, label);
  return (
    <div
      className={cn("space-y-2", className)}
      role={!labelled ? "group" : undefined}
      aria-label={!labelled ? label : undefined}
    >
      <label
        htmlFor={labelled ? id : undefined}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {control}
    </div>
  );
}

function labelControls(
  nodes: ReactNode,
  id: string,
  label: string,
): { control: ReactNode; labelled: boolean } {
  let labelled = false;
  const output: ReactNode[] = [];
  for (const child of Children.toArray(nodes)) {
    if (!isValidElement(child)) {
      output.push(child);
      continue;
    }
    const element = child as ReactElement<{
      children?: ReactNode;
      id?: string;
      "aria-label"?: string;
    }>;
    if (
      element.type === Input ||
      element.type === Textarea ||
      element.type === SelectTrigger ||
      ["input", "select", "textarea"].includes(element.type as string)
    ) {
      labelled = true;
      output.push(cloneElement(element, { id, "aria-label": label }));
    } else if (element.props.children) {
      const nested = labelControls(element.props.children, id, label);
      labelled = labelled || nested.labelled;
      output.push(cloneElement(element, {}, nested.control));
    } else output.push(element);
  }
  return { control: output, labelled };
}
