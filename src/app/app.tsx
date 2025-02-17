"use client";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryCLient";

export default function App({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />

      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
