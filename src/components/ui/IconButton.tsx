import React from "react";
import { Loader2 } from "lucide-react";

type IconButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
type IconButtonSize = "xs" | "sm" | "md" | "lg";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
}

const variants: Record<IconButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
  secondary:
    "bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-surface-800 active:bg-surface-300",
  outline:
    "border border-surface-300 text-surface-600 bg-white hover:bg-surface-50 hover:text-surface-800 active:bg-surface-100",
  ghost:
    "text-surface-500 hover:bg-surface-100 hover:text-surface-700 active:bg-surface-200",
  danger: "text-danger-600 hover:bg-danger-50 active:bg-danger-100",
};

const sizes: Record<IconButtonSize, { button: string; icon: number }> = {
  xs: { button: "w-7 h-7 rounded-lg", icon: 14 },
  sm: { button: "w-8 h-8 rounded-lg", icon: 16 },
  md: { button: "w-10 h-10 rounded-xl", icon: 18 },
  lg: { button: "w-12 h-12 rounded-xl", icon: 20 },
};

const IconButton: React.FC<IconButtonProps> = ({
  variant = "ghost",
  size = "md",
  icon,
  label,
  loading = false,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center shrink-0
        transition-all duration-200
        focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        active:scale-[0.93]
        ${variants[variant]}
        ${sizes[size].button}
        ${className}
      `}
      aria-label={label}
      title={label}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={sizes[size].icon} className="animate-spin" />
      ) : (
        icon
      )}
    </button>
  );
};

export default IconButton;
