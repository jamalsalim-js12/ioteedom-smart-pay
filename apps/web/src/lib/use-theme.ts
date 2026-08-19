"use client";

import { useSyncExternalStore } from "react";
import { applyTheme, isTheme, readTheme, THEME_KEY, type Theme } from "@/lib/theme";

let current: Theme = "light";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  current = document.documentElement.classList.contains("dark")
    ? "dark"
    : readTheme();
  applyTheme(current);
  window.addEventListener("storage", (event) => {
    if (event.key !== THEME_KEY || !isTheme(event.newValue)) return;
    current = event.newValue;
    applyTheme(current);
    emit();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return current;
}

function getServerSnapshot(): Theme {
  return "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setTheme(next: Theme) {
    current = next;
    applyTheme(next);
    emit();
  }

  return {
    theme,
    setTheme,
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
