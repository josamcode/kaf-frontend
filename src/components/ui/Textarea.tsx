import React, { forwardRef, useState, useId } from "react";

type TextareaSize = "sm" | "md" | "lg";

interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  label?: string;
  hint?: string;
  error?: string;
  size?: TextareaSize;
  fullWidth?: boolean;
  containerClassName?: string;
}

const textareaSizes: Record<TextareaSize, string> = {
  sm: "text-sm px-3 py-2 min-h-[5rem]",
  md: "text-sm px-3.5 py-2.5 min-h-[6rem]",
  lg: "text-base px-4 py-3 min-h-[8rem]",
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      size = "md",
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

        <textarea
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
            w-full rounded-xl border bg-white font-medium resize-y
            placeholder:text-surface-400 placeholder:font-normal
            transition-all duration-200 scrollbar-thin
            ${textareaSizes[size]}
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

Textarea.displayName = "Textarea";

export default Textarea;
