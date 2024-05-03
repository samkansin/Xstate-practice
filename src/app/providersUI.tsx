"use client";

import { NextUIProvider } from "@nextui-org/react";

export function ProvidersUI({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
