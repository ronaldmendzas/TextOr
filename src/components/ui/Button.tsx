"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "primary" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editor-accent",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-editor-bg text-editor-text hover:bg-editor-hover":
              variant === "default",
            "bg-transparent text-editor-text hover:bg-editor-hover":
              variant === "ghost",
            "border border-editor-border bg-transparent text-editor-text hover:bg-editor-hover":
              variant === "outline",
            "bg-editor-accent text-white hover:bg-editor-accent/90":
              variant === "primary",
            "bg-red-500 text-white hover:bg-red-600": variant === "danger",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
            "h-8 w-8 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
