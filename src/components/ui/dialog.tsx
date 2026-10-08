import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useTr } from "@/i18n/useTr";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const { t } = useTr();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[#081018]/75" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[min(100%-1.5rem,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-brass/40 bg-paper p-6 text-ink shadow-2xl",
            wide && "w-[min(100%-1.5rem,56rem)]",
          )}
        >
          <DialogPrimitive.Title className="pr-8 font-serif text-2xl">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-ink-soft">
            {description}
          </DialogPrimitive.Description>
          <div className="mt-4">{children}</div>
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm p-1 text-ink-soft hover:text-ink" aria-label={t("關閉")}>
            <X className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
