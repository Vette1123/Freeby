"use client";
// SSR-safe prefers-reduced-motion hook via useSyncExternalStore. Returns false
// on the server (no motion to reduce), then resolves to the real media-query
// value on the client. useSyncExternalStore is the React-blessed primitive for
// reading external (browser) state without a setState-in-effect.
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
