"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "@/lib/use-theme";

export function AppearancePanel() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-2 p-5">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
          theme === "light"
            ? "border-ink bg-ink text-on-ink"
            : "border-line bg-field text-ink hover:border-ink/30",
        )}
      >
        <Sun size={16} strokeWidth={1.75} />
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
          theme === "dark"
            ? "border-ink bg-ink text-on-ink"
            : "border-line bg-field text-ink hover:border-ink/30",
        )}
      >
        <Moon size={16} strokeWidth={1.75} />
        Dark
      </button>
    </div>
  );
}
