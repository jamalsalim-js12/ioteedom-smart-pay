export type Theme = "light" | "dark";

export const THEME_KEY = "ioteedom-theme";

export const themeInitScript = `try{if(localStorage.getItem("${THEME_KEY}")==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}}catch(e){}`;

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

export function readTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  return isTheme(stored) ? stored : "light";
}
