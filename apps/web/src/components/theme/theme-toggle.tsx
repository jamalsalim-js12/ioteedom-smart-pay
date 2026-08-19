"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "@/lib/use-theme";

export function ThemeToggle({
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const { theme, setTheme } = useTheme();
  const chrome = tone === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass",
        chrome
          ? "bg-white/10 text-white hover:bg-white/16"
          : "border border-line bg-card text-ink hover:bg-field",
      )}
    >
      {theme === "dark" ? (
        <Sun size={18} strokeWidth={1.75} />
      ) : (
        <Moon size={18} strokeWidth={1.75} />
      )}
    </button>
  );
}
