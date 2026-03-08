export type FinsTheme = "light" | "dark";

export function setFinsTheme(theme: FinsTheme): void {
  document.documentElement.dataset.theme = theme;
}

export function getFinsTheme(): FinsTheme | undefined {
  const t = document.documentElement.dataset.theme;
  if (t === "light" || t === "dark") return t;
  return undefined;
}
