import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
  noBorder?: boolean;
}

const paddingMap = {
  none: "",
  sm: "p-3 lg:p-4",
  md: "p-4 lg:p-5",
  lg: "p-5 lg:p-6",
};

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Section: React.FC<CardSectionProps>;
} = ({
  children,
  className = "",
  padding = "md",
  hoverable = false,
  onClick,
  style,
}) => {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={`
        bg-white rounded-2xl border border-surface-200/60 shadow-card
        ${hoverable ? "transition-all duration-200 hover:shadow-card-hover hover:border-surface-300/60 active:scale-[0.995]" : ""}
        ${onClick ? "cursor-pointer text-right w-full" : ""}
        ${paddingMap[padding]}
        ${className}
      `}
      onClick={onClick as any}
      style={style}
    >
      {children}
    </Component>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  className = "",
}) => (
  <div className={`flex items-center justify-between gap-3 ${className}`}>
    <div className="flex items-center gap-3 min-w-0">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-bold text-surface-900 text-sm lg:text-base leading-tight truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-surface-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

const CardSection: React.FC<CardSectionProps> = ({
  children,
  className = "",
  noBorder = false,
}) => (
  <div
    className={`
      ${!noBorder ? "border-t border-surface-100 pt-4 mt-4" : ""}
      ${className}
    `}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Section = CardSection;

export default Card;
