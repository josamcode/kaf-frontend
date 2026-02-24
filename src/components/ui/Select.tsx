import React, { forwardRef, useState, useId } from "react";
import { ChevronDown } from "lucide-react";

type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  label?: string;
  hint?: string;
  error?: string;
  size?: SelectSize;
  icon?: React.ReactNode;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  containerClassName?: string;
}

const selectSizes: Record<SelectSize, string> = {
  sm: "h-9 text-sm px-3",
  md: "h-11 text-sm px-3.5",
  lg: "h-12 text-base px-4",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hint,
      error,
      size = "md",
      icon,
      options,
      placeholder,
      fullWidth = true,
      containerClassName = "",
      className = "",
      id: propId,
      disabled,
      required,
      value,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = propId || autoId;
    const [focused, setFocused] = useState(false);
    const hasError = !!error;
    const hasValue = value !== undefined && value !== "";

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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            value={value}
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
              appearance-none cursor-pointer
              transition-all duration-200
              ${selectSizes[size]}
              ${icon ? "pr-10" : ""}
              pl-9
              ${!hasValue && placeholder ? "text-surface-400" : "text-surface-900"}
              ${
                hasError
                  ? "border-danger-300 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/15"
                  : "border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/12 hover:border-surface-400"
              }
              ${disabled ? "bg-surface-100 text-surface-500 cursor-not-allowed" : ""}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            <ChevronDown size={16} />
          </div>
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

Select.displayName = "Select";

export default Select;
