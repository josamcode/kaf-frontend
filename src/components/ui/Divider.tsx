import React from "react";

interface DividerProps {
  label?: string;
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ label, className = "" }) => {
  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-px bg-surface-200" />
        <span className="text-xs font-semibold text-surface-400 shrink-0">
          {label}
        </span>
        <div className="flex-1 h-px bg-surface-200" />
      </div>
    );
  }

  return <div className={`h-px bg-surface-200 ${className}`} />;
};

export default Divider;
