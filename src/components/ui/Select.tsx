import React, {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Check } from "lucide-react";

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

const btnSizes: Record<SelectSize, string> = {
  sm: "h-9 text-sm px-3",
  md: "h-11 text-sm px-3.5",
  lg: "h-12 text-base px-4",
};

const itemPaddings: Record<SelectSize, string> = {
  sm: "px-3 py-2",
  md: "px-3 py-2.5",
  lg: "px-4 py-3",
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
      onChange,
      name,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = propId || autoId;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);

    const hasError = !!error;
    const stringValue = value == null ? "" : String(value);
    const hasValue = stringValue !== "";

    const selectedOption = useMemo(
      () => options.find((o) => o.value === stringValue),
      [options, stringValue],
    );

    const visibleOptions = useMemo(() => {
      // If placeholder exists, we still show only real options in dropdown
      return options;
    }, [options]);

    const selectedIndex = useMemo(() => {
      const idx = visibleOptions.findIndex((o) => o.value === stringValue);
      return idx >= 0 ? idx : 0;
    }, [visibleOptions, stringValue]);

    const [activeIndex, setActiveIndex] = useState(selectedIndex);

    useEffect(() => {
      setActiveIndex(selectedIndex);
    }, [selectedIndex]);

    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
          setFocused(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const fireChange = (nextValue: string) => {
      // Create a synthetic change event compatible with normal onChange handlers
      const event = {
        target: { value: nextValue, name, id },
        currentTarget: { value: nextValue, name, id },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;

      onChange?.(event);
    };

    const pick = (opt: SelectOption) => {
      if (disabled || opt.disabled) return;
      fireChange(opt.value);
      setOpen(false);
      setFocused(false);
    };

    const moveActive = (dir: 1 | -1) => {
      if (!visibleOptions.length) return;
      let i = activeIndex;

      for (let step = 0; step < visibleOptions.length; step++) {
        i = (i + dir + visibleOptions.length) % visibleOptions.length;
        if (!visibleOptions[i].disabled) {
          setActiveIndex(i);
          return;
        }
      }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (e.key === "Escape") {
        setOpen(false);
        setFocused(false);
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocused(true);
        } else {
          const opt = visibleOptions[activeIndex];
          if (opt) pick(opt);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) setOpen(true);
        moveActive(1);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!open) setOpen(true);
        moveActive(-1);
        return;
      }

      if (e.key === "Tab") {
        setOpen(false);
        setFocused(false);
      }
    };

    return (
      <div
        className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}
        ref={wrapperRef}
      >
        {label && (
          <label
            htmlFor={id}
            className={`
              block text-sm font-semibold mb-1.5
              transition-colors duration-150
              ${
                hasError
                  ? "text-danger-600"
                  : focused
                    ? "text-primary-700"
                    : "text-surface-700"
              }
            `}
          >
            {label}
            {required && <span className="text-danger-500 mr-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Right Icon (like your old select) */}
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          {/* Trigger */}
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => {
              if (disabled) return;
              setOpen((p) => !p);
              setFocused(true);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            className={`
              w-full rounded-xl border bg-white font-medium
              flex items-center justify-between gap-2
              transition-all duration-200
              ${btnSizes[size]}
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
          >
            <span
              className={`truncate text-sm font-medium ${
                selectedOption ? "text-surface-900" : "text-surface-400"
              }`}
            >
              {selectedOption?.label || placeholder || "Select"}
            </span>

            <ChevronDown
              size={16}
              className={`text-surface-400 shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {open && !disabled && (
            <div
              role="listbox"
              aria-labelledby={id}
              className="absolute z-30 top-full mt-1 w-full bg-white border border-surface-200 rounded-xl shadow-lg max-h-56 overflow-y-auto"
            >
              {visibleOptions.map((option, idx) => {
                const isSelected = option.value === stringValue;
                const isActive = idx === activeIndex;
                const isDisabled = !!option.disabled;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={isDisabled}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(event) => {
                      // keep focus, prevent button blur before select
                      event.preventDefault();
                      pick(option);
                    }}
                    className={`
                      w-full ${itemPaddings[size]} text-right
                      text-sm font-medium flex items-center justify-between gap-2
                      transition-colors
                      ${
                        isDisabled
                          ? "text-surface-400 cursor-not-allowed"
                          : isSelected
                            ? "bg-primary-50 text-primary-700"
                            : isActive
                              ? "bg-surface-50 text-surface-800"
                              : "text-surface-700 hover:bg-surface-50"
                      }
                    `}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check size={14} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Hidden native select for forms/autofill */}
          <select
            ref={ref}
            name={name}
            value={stringValue}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
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
