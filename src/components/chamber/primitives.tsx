import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CountryId } from "@/types/game";
import { DELEGATES } from "@/content/delegates";
import { useTr } from "@/i18n/useTr";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 42c7-13 25-13 32 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 34c5-8 17-8 22 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M26 27c3-4 9-4 12 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Paper({
  className,
  children,
  ...rest
}: { className?: string; children: ReactNode } & HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("rounded-md border border-[#e4d8c4] bg-paper text-ink shadow-[0_16px_40px_rgba(0,0,0,0.22)]", className)}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-[11px] tracking-[0.18em] text-brass uppercase">{children}</p>;
}

export function Seal({ id, size = "md" }: { id: CountryId; size?: "sm" | "md" }) {
  const delegate = DELEGATES[id];
  const dimension = size === "sm" ? "size-8 text-sm" : "size-11 text-lg";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-serif", dimension)}
      style={{ background: delegate.seal, color: delegate.sealInk }}
      aria-hidden="true"
    >
      {delegate.mark}
    </span>
  );
}

export function NoticeBanner({ tone, text }: { tone: "good" | "warn" | "info"; text: string }) {
  const { t } = useTr();
  const styles = {
    good: "border-laurel/40 bg-[#14382f] text-[#d7efe6]",
    warn: "border-seal/50 bg-[#3a1c22] text-[#f3d5d5]",
    info: "border-brass/40 bg-[#2a2418] text-[#f3e7c8]",
  }[tone];
  return (
    <p role="status" className={cn("rounded-sm border px-3 py-2 text-sm leading-6", styles)}>
      {t(text)}
    </p>
  );
}
