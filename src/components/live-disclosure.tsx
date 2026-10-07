"use client";

import {
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import styles from "./live-disclosure.module.css";

const disclosureEvent = "rpg-live-disclosure";

/** A visual preference only: opening a section never changes campaign state. */
export function LiveDisclosure({
  title,
  storageKey,
  defaultOpen = false,
  children,
  className = "",
}: {
  title: string;
  storageKey: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const key = `rpg-disclosure:${storageKey}`;
  const [fallback, setFallback] = useState(defaultOpen);
  const read = useCallback(() => {
    try {
      return window.localStorage.getItem(key) ?? (fallback ? "open" : "closed");
    } catch {
      return fallback ? "open" : "closed";
    }
  }, [key, fallback]);
  const subscribe = useCallback((listener: () => void) => {
    window.addEventListener("storage", listener);
    window.addEventListener(disclosureEvent, listener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener(disclosureEvent, listener);
    };
  }, []);
  const open =
    useSyncExternalStore(subscribe, read, () =>
      defaultOpen ? "open" : "closed",
    ) === "open";
  return (
    <details
      className={`${styles.disclosure} ${className}`}
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        if (next === open) return;
        setFallback(next);
        try {
          window.localStorage.setItem(
            key,
            next ? "open" : "closed",
          );
        } catch {
          // Collapse remains a local visual choice even without persistence.
        }
        window.dispatchEvent(new Event(disclosureEvent));
      }}
    >
      <summary>{title}</summary>
      {open && <div className={styles.content}>{children}</div>}
    </details>
  );
}
