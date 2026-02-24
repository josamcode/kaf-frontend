import React, { forwardRef, useState, useId } from "react";

type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  hint?: string;
  error?: string;
  size?: InputSize;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onEndIconClick?: () => void;
  fullWidth?: boolean;
  containerClassName?: string;
}

const inputSizes: Record<InputSize, string> = {
  sm: "h-9 text-sm px-3",
  md: "h-11 text-sm px-3.5",
  lg: "h-12 text-base px-4",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      size = "md",
      icon,
      endIcon,
      onEndIconClick,
      fullWidth = true,
      containerClassName = "",
      className = "",
      id: propId,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = propId || autoId;
    const [focused, setFocused] = useState(false);
    const hasError = !!error;

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className={`
              block text-sm font-semibold mb-1.5
              transition-colors duration-150
              ${hasError ? "text-danger-600" : focused ? "text-primary-700" : "text-surface-700"}
            `}
          >
            {label}
            {required && <span className="text-danger-500 mr-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              w-full rounded-xl border bg-white font-medium
              placeholder:text-surface-400 placeholder:font-normal
              transition-all duration-200
              ${inputSizes[size]}
              ${icon ? "pr-10" : ""}
              ${endIcon ? "pl-10" : ""}
              ${
                hasError
                  ? "border-danger-300 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/15"
                  : "border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/12 hover:border-surface-400"
              }
              ${disabled ? "bg-surface-100 text-surface-500 cursor-not-allowed" : "text-surface-900"}
              ${className}
            `}
            {...props}
          />

          {endIcon && (
            <div
              className={`
                absolute left-3 top-1/2 -translate-y-1/2 text-surface-400
                ${onEndIconClick ? "cursor-pointer hover:text-surface-600 transition-colors" : "pointer-events-none"}
              `}
              onClick={onEndIconClick}
            >
              {endIcon}
            </div>
          )}
        </div>

        {(hint || error) && (
          <p
            className={`mt-1.5 text-xs font-medium ${
              hasError ? "text-danger-600" : "text-surface-500"
            }`}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
