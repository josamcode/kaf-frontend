import React from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: AvatarSize;
  icon?: React.ReactNode;
  className?: string;
}

const sizeMap: Record<
  AvatarSize,
  { container: string; text: string; icon: number }
> = {
  xs: { container: "w-6 h-6", text: "text-[10px]", icon: 12 },
  sm: { container: "w-8 h-8", text: "text-xs", icon: 14 },
  md: { container: "w-10 h-10", text: "text-sm", icon: 18 },
  lg: { container: "w-12 h-12", text: "text-base", icon: 22 },
  xl: { container: "w-16 h-16", text: "text-xl", icon: 28 },
};

const colorPairs = [
  { bg: "bg-primary-100", text: "text-primary-700" },
  { bg: "bg-accent-100", text: "text-accent-700" },
  { bg: "bg-info-100", text: "text-info-700" },
  { bg: "bg-success-100", text: "text-success-700" },
  { bg: "bg-warning-100", text: "text-warning-700" },
  { bg: "bg-danger-100", text: "text-danger-700" },
];

// function getInitials(name: string): string {
//   const parts = name.trim().split(/\s+/);
//   if (parts.length >= 2) return parts[0][0] + parts[1][0];
//   return parts[0]?.slice(0, 2) || "?";
// }

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[0]?.[0]?.toUpperCase() || "?";
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colorPairs.length;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  icon,
  className = "",
}) => {
  const sizeConfig = sizeMap[size];
  const colorPair = name ? colorPairs[getColorIndex(name)] : colorPairs[0];

  if (src) {
    return (
      <img
        src={src}
        alt={name || ""}
        className={`${sizeConfig.container} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeConfig.container} rounded-full shrink-0
        flex items-center justify-center
        font-bold ${sizeConfig.text}
        ${colorPair.bg} ${colorPair.text}
        ${className}
      `}
      title={name}
    >
      {icon || (name ? getInitials(name) : "?")}
    </div>
  );
};

export default Avatar;
