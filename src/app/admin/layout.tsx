"use client";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React, { ReactNode } from "react";

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <header className="mt-4 ml-8 flex  items-center justify-center gap-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Admin Dashboard</h1>
        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          <span className="text-sm">
            {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          </span>
        </Button>
      </header>
      <main>{children}</main>
    </div>
  );
}
