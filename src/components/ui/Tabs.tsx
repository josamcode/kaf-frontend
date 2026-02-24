import React from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "pills" | "underline";
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "pills",
  size = "md",
  fullWidth = false,
  className = "",
}) => {
  if (variant === "underline") {
    return (
      <div className={`border-b border-surface-200 ${className}`}>
        <div
          className={`flex gap-1 ${fullWidth ? "" : "overflow-x-auto scrollbar-hidden"}`}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  flex items-center gap-2 whitespace-nowrap font-semibold
                  border-b-2 transition-all duration-200
                  ${size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"}
                  ${fullWidth ? "flex-1 justify-center" : ""}
                  ${
                    isActive
                      ? "border-primary-600 text-primary-700"
                      : "border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300"
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`
                      text-[10px] px-1.5 py-0.5 rounded-md font-bold
                      ${isActive ? "bg-primary-100 text-primary-700" : "bg-surface-100 text-surface-500"}
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center bg-surface-100 rounded-xl p-1 gap-0.5
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center justify-center gap-1.5 font-semibold rounded-lg
              transition-all duration-200
              ${size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}
              ${fullWidth ? "flex-1" : ""}
              ${
                isActive
                  ? "bg-white text-surface-900 shadow-xs"
                  : "text-surface-500 hover:text-surface-700"
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`
                  text-[10px] px-1.5 py-0.5 rounded-md font-bold
                  ${isActive ? "bg-primary-50 text-primary-700" : "bg-surface-200 text-surface-500"}
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
