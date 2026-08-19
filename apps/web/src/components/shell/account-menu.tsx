"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0];
  const last = parts[parts.length - 1]?.[0];
  return `${first ?? ""}${last ?? ""}`.toUpperCase() || "?";
}

const itemClass =
  "flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm outline-none select-none data-highlighted:bg-field";

export function AccountMenu({
  tone = "light",
  profileHref,
  layout = "icon",
}: {
  tone?: "light" | "dark";
  profileHref: string;
  layout?: "icon" | "row";
}) {
  const router = useRouter();
  const session = useDemoStore((s) => s.session);
  const profile = useDemoStore((s) => s.profile);
  const signOut = useDemoStore((s) => s.signOut);
  const name = session?.name || profile.name || "Account";
  const phone = session?.phone || profile.phone;
  const email = session?.email || profile.email;
  const ops = session?.role === "ops";
  const dark = tone === "dark";
  const row = layout === "row";

  function goToProfile() {
    router.push(profileHref);
  }

  function leave() {
    signOut();
    router.replace("/login");
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Account menu"
        className={cn(
          "flex shrink-0 items-center outline-none transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass",
          row
            ? cn(
                "w-full gap-3 rounded-lg px-1 py-1 text-left",
                dark ? "hover:bg-white/8" : "hover:bg-black/4",
              )
            : "rounded-full",
        )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            dark ? "bg-brass text-white" : "bg-stub text-white",
          )}
        >
          <User size={18} strokeWidth={1.75} />
        </span>
        {row ? (
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-sm font-medium",
                dark ? "text-white" : "text-ink",
              )}
            >
              {name}
            </span>
            <span
              className={cn(
                "mt-0.5 block truncate font-mono text-[11px]",
                dark ? "text-white/50" : "text-mute",
              )}
            >
              {phone || email}
            </span>
          </span>
        ) : null}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          className="z-[80] outline-none"
          sideOffset={8}
          align={row ? "start" : "end"}
          side={row ? "top" : "bottom"}
        >
          <Menu.Popup className="w-64 origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-line bg-card py-1 shadow-float outline-none transition-[opacity,transform] duration-150 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            <div className="flex items-start gap-3 border-b border-line px-3 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stub font-mono text-[11px] font-medium text-white">
                {initials(name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{name}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-mute">
                  {email || phone}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
                  {ops ? "Super admin" : "Household"}
                </p>
              </div>
            </div>
            <Menu.Item className={cn(itemClass, "text-ink")} onClick={goToProfile}>
              <User size={16} strokeWidth={1.75} />
              View profile
            </Menu.Item>
            <Menu.Separator className="my-1 h-px bg-line" />
            <Menu.Item className={cn(itemClass, "text-live")} onClick={leave}>
              <LogOut size={16} strokeWidth={1.75} />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export { AccountMenu as ProfileButton };
