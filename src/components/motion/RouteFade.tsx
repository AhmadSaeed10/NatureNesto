"use client";

import { useEffect, useState, type ReactNode } from "react";

// Module scoped so it survives template remounts: the first page load renders without
// the fade (protects LCP), every client side navigation after that fades in.
let hasNavigated = false;

export function RouteFade({ children }: { children: ReactNode }) {
  const [animate] = useState(() => hasNavigated);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  return <div className={animate ? "animate-route-fade" : undefined}>{children}</div>;
}
