"use client";
// Tiny keyboard-shortcut hook. Registers a single-key listener (ignored when a
// text input/textarea/contenteditable is focused, with ctrl/meta, or with
// alt). Designed for app-wide shortcuts like "N" = new, "/" = focus search.
import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable;
      if (isEditable) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handler();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, handler, enabled]);
}
