import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-xl";

  const variants = {
    primary:
      "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-subtle hover:shadow-card active:bg-athletic-forest",
    secondary:
      "bg-brand-primary-light text-brand-primary hover:bg-emerald-100 border border-brand-primary-border",
    gold:
      "bg-brand-accent text-white hover:bg-brand-accent-hover shadow-subtle active:bg-athletic-amber",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-subtle active:bg-red-800",
    ghost:
      "bg-transparent text-brand-text hover:bg-brand-primary-light hover:text-brand-primary",
    outline:
      "bg-white border border-gray-200 text-brand-text hover:bg-brand-surface hover:border-brand-primary-border",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
    md: "text-sm px-4 py-2.5 h-11 gap-2",
    lg: "text-base px-6 py-3 h-12 gap-2.5 font-semibold",
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
