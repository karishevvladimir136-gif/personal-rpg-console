"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Durable exact operation recovery. Reloads never allocate a replacement for
// an unconfirmed write. Only an explicit owner action sends a recovered request.
export function usePending<T>(
  key: string,
  parse: (value: string | null) => T | null,
) {
  const [pending, setPending] = useState<T | null>(null),
    [ready, setReady] = useState(false);
  const current = useRef<T | null>(null),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    Promise.resolve().then(() => {
      if (!mounted.current) return;
      try {
        const restored = parse(sessionStorage.getItem(key));
        current.current = restored;
        setPending(restored);
      } catch {
        /* Retain any exact in-memory attempt. */
      }
      setReady(true);
    });
    return () => {
      mounted.current = false;
    };
  }, [key, parse]);
  const remember = useCallback(
    (value: T | null) => {
      current.current = value;
      setPending(value);
      try {
        if (value) sessionStorage.setItem(key, JSON.stringify(value));
        else sessionStorage.removeItem(key);
      } catch {
        /* Keep the exact in-memory request. */
      }
    },
    [key],
  );
  return { pending, current, mounted, remember, ready };
}
