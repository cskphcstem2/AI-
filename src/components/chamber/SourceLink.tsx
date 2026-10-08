import type { ReactNode, MouseEvent } from "react";
import { ExternalLink } from "lucide-react";
import { useTr } from "@/i18n/useTr";

export function SourceLink({
  href,
  label,
  className,
}: {
  href?: string;
  label?: string;
  className?: string;
}): ReactNode {
  const { t } = useTr();
  if (!href) return null;
  const text = label?.trim() ? t(label.trim()) : t("打開來源");
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={onClick}
      data-testid="source-link"
      className={className ?? "mt-1 inline-flex items-center gap-1 text-xs text-brass-deep underline underline-offset-2 hover:text-ink"}
    >
      <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </a>
  );
}
