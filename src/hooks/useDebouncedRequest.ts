"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Collapses bursts of calls (Strict Mode double effects, rapid clicks) into a
 * single trailing call made with the latest arguments.
 */
export const useDebouncedRequest = <Args extends unknown[]>(
  request: (...args: Args) => unknown,
  delay = 300,
) => {
  const requestRef = useRef(request);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    requestRef.current = request;
  });

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    },
    [],
  );

  return useCallback(
    (...args: Args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void requestRef.current(...args);
      }, delay);
    },
    [delay],
  );
};
