import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  compact = false,
  className = "",
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${compact ? "py-8 px-4" : "py-16 px-6"}
        ${className}
      `}
    >
      {icon && (
        <div
          className={`
            flex items-center justify-center rounded-2xl bg-surface-100 text-surface-400
            ${compact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"}
          `}
        >
          {icon}
        </div>
      )}
      <h3
        className={`font-bold text-surface-800 ${compact ? "text-sm" : "text-base"}`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`text-surface-500 mt-1.5 max-w-sm ${compact ? "text-xs" : "text-sm"}`}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
