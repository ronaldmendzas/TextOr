"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex w-full rounded-md border border-editor-border bg-editor-bg px-3 py-2",
          "text-sm text-editor-text placeholder:text-editor-muted",
          "focus:border-editor-accent focus:outline-none focus:ring-1 focus:ring-editor-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
