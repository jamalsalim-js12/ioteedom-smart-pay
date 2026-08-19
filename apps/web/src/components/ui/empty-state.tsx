import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  body,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-field text-mute">
        <Icon size={22} strokeWidth={1.6} />
      </span>
      <p className="mt-4 font-display text-lg tracking-tight text-ink">{title}</p>
      {body ? <p className="mt-1 max-w-sm text-sm text-mute">{body}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
