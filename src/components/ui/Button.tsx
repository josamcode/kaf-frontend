import React from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white shadow-btn hover:bg-primary-700 hover:shadow-btn-hover active:bg-primary-800 disabled:bg-primary-300",
  secondary:
    "bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300 disabled:bg-surface-50 disabled:text-surface-400",
  outline:
    "border border-surface-300 text-surface-700 bg-white hover:bg-surface-50 hover:border-surface-400 active:bg-surface-100 disabled:border-surface-200 disabled:text-surface-400",
  ghost:
    "text-surface-600 hover:bg-surface-100 hover:text-surface-800 active:bg-surface-200 disabled:text-surface-400",
  danger:
    "bg-danger-600 text-white shadow-btn hover:bg-danger-700 active:bg-danger-800 disabled:bg-danger-300",
  success:
    "bg-success-600 text-white shadow-btn hover:bg-success-700 active:bg-success-800 disabled:bg-success-300",
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-8 px-2.5 text-xs gap-1.5 rounded-lg",
  sm: "h-9 px-3 text-sm gap-1.5 rounded-xl",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-base gap-2.5 rounded-xl",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "start",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200
        focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-70
        active:scale-[0.97]
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2
          size={size === "xs" ? 14 : size === "sm" ? 15 : 16}
          className="animate-spin"
        />
      ) : (
        icon &&
        iconPosition === "start" && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === "end" && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};

export default Button;
