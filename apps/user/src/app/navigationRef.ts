import type { NavigateFunction } from "react-router-dom";

let navigateRef: NavigateFunction | null = null;

export function setAppNavigate(fn: NavigateFunction | null): void {
  navigateRef = fn;
}

export function getAppNavigate(): NavigateFunction | null {
  return navigateRef;
}
