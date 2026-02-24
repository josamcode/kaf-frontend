import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  size?: "sm" | "md";
  autoFocus?: boolean;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "بحث...",
  debounceMs = 300,
  size = "md",
  autoFocus = false,
  className = "",
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  };

  const sizeClasses =
    size === "sm" ? "h-9 text-sm pr-9 pl-8" : "h-11 text-sm pr-10 pl-9";

  return (
    <div className={`relative ${className}`}>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
        <Search size={size === "sm" ? 15 : 17} />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full rounded-xl border border-surface-300 bg-white
          font-medium placeholder:text-surface-400 placeholder:font-normal
          transition-all duration-200
          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/12
          hover:border-surface-400
          ${sizeClasses}
        `}
      />

      {localValue && (
        <button
          onClick={handleClear}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          aria-label="مسح البحث"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
