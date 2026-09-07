"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading = false,
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  const variantClasses = {
    primary: "bg-navy-950 text-white hover:bg-brand-600 shadow-sm border border-navy-900 focus:ring-brand-500",
    secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 focus:ring-brand-400",
    outline: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 focus:ring-slate-300",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm border border-rose-700 focus:ring-rose-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border border-emerald-700 focus:ring-emerald-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm font-semibold rounded-xl gap-2",
    lg: "px-6 py-2.5 text-base font-semibold rounded-xl gap-2.5",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon ? icon : null}
      <span>{children}</span>
    </button>
  );
}
