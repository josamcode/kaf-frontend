import React, { forwardRef, useId } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  label?: string;
  description?: string;
  error?: string;
  size?: "sm" | "md";
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      size = "md",
      containerClassName = "",
      className = "",
      id: propId,
      disabled,
      checked,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = propId || autoId;
    const boxSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    const iconSize = size === "sm" ? 10 : 13;

    return (
      <div className={containerClassName}>
        <label
          htmlFor={id}
          className={`
            inline-flex items-start gap-2.5 cursor-pointer group
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          `}
        >
          <div className="relative mt-0.5 shrink-0">
            <input
              ref={ref}
              type="checkbox"
              id={id}
              checked={checked}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`
                ${boxSize} rounded-md border-2 flex items-center justify-center
                transition-all duration-200
                ${
                  checked
                    ? "bg-primary-600 border-primary-600"
                    : "border-surface-300 bg-white group-hover:border-surface-400"
                }
                ${error ? "border-danger-400" : ""}
              `}
            >
              {checked && (
                <Check size={iconSize} className="text-white" strokeWidth={3} />
              )}
            </div>
          </div>

          {(label || description) && (
            <div>
              {label && (
                <span
                  className={`text-sm font-semibold ${
                    error ? "text-danger-600" : "text-surface-800"
                  }`}
                >
                  {label}
                </span>
              )}
              {description && (
                <p className="text-xs text-surface-500 mt-0.5">{description}</p>
              )}
            </div>
          )}
        </label>

        {error && (
          <p className="mt-1 text-xs font-medium text-danger-600 mr-7">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
