import React, { useEffect, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const colorMap: Record<
  ToastType,
  { bg: string; icon: string; border: string }
> = {
  success: {
    bg: "bg-success-50",
    icon: "text-success-600",
    border: "border-success-200",
  },
  error: {
    bg: "bg-danger-50",
    icon: "text-danger-600",
    border: "border-danger-200",
  },
  warning: {
    bg: "bg-warning-50",
    icon: "text-warning-600",
    border: "border-warning-200",
  },
  info: {
    bg: "bg-info-50",
    icon: "text-info-600",
    border: "border-info-200",
  },
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const colors = colorMap[toast.type];

  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div
      className={`
        flex items-start gap-3 p-3.5 rounded-xl border shadow-elevated
        animate-slide-up max-w-sm w-full
        ${colors.bg} ${colors.border}
      `}
      role="alert"
    >
      <span className={`shrink-0 mt-0.5 ${colors.icon}`}>
        {iconMap[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-surface-900">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-surface-600 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-white/50 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-[200] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success: (title: string, message?: string) =>
      addToast("success", title, message),
    error: (title: string, message?: string) =>
      addToast("error", title, message),
    warning: (title: string, message?: string) =>
      addToast("warning", title, message),
    info: (title: string, message?: string) => addToast("info", title, message),
  };
}

export default ToastContainer;
