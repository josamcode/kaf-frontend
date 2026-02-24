import React from "react";
import { AlertTriangle, Trash2, Info } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant?: ConfirmVariant;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    btnVariant: "danger" | "primary";
  }
> = {
  danger: {
    icon: <Trash2 size={22} />,
    iconBg: "bg-danger-100",
    iconColor: "text-danger-600",
    btnVariant: "danger",
  },
  warning: {
    icon: <AlertTriangle size={22} />,
    iconBg: "bg-warning-100",
    iconColor: "text-warning-600",
    btnVariant: "danger",
  },
  info: {
    icon: <Info size={22} />,
    iconBg: "bg-info-100",
    iconColor: "text-info-600",
    btnVariant: "primary",
  },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  variant = "danger",
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  loading = false,
}) => {
  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showClose={false}
      mobileSheet={true}
    >
      <div className="flex flex-col items-center text-center py-2">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${config.iconBg} ${config.iconColor}`}
        >
          {config.icon}
        </div>

        <h3 className="text-lg font-bold text-surface-900 mb-2">{title}</h3>
        <p className="text-sm text-surface-600 leading-relaxed max-w-xs">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full mt-6">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.btnVariant}
            size="lg"
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
