import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function DiagonalSection({
  children,
  className,
  tone = "light",
  clip = "none",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "navy" | "lime" | "muted";
  clip?: "none" | "bottom" | "top";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative",
        tone === "light" && "bg-white text-navy-950",
        tone === "navy" && "bg-navy-900 text-white",
        tone === "lime" && "bg-lime-400 text-navy-950",
        tone === "muted" && "bg-muted text-navy-950",
        clip === "bottom" && "clip-diagonal-bottom",
        clip === "top" && "clip-diagonal-top",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow ? (
        <p
          className={cn(
            "mb-2 text-sm font-semibold tracking-[0.2em] uppercase",
            light ? "text-lime-400" : "text-navy-800",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl sm:text-4xl md:text-5xl">{title}</h2>
      {description ? (
        <p
          className={cn(
            "mt-3 text-base sm:text-lg",
            light ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
