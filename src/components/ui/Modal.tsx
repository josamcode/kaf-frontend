import React, { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showClose?: boolean;
  closeOnOverlay?: boolean;
  mobileSheet?: boolean;
  className?: string;
}

const modalSizes: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)]",
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  showClose = true,
  closeOnOverlay = true,
  mobileSheet = true,
  className = "",
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      <div
        className={`
          relative h-full flex
          ${mobileSheet ? "items-end lg:items-center justify-center" : "items-center justify-center"}
        `}
      >
        <div
          className={`
            relative bg-white w-full
            ${modalSizes[size]}
            overflow-hidden
            ${
              mobileSheet
                ? "rounded-t-3xl lg:rounded-2xl max-h-[92vh] lg:max-h-[85vh] lg:mx-4 animate-slide-up"
                : "rounded-2xl max-h-[85vh] mx-4 animate-scale-in"
            }
            flex flex-col shadow-modal
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {mobileSheet && (
            <div className="lg:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-surface-300 rounded-full" />
            </div>
          )}

          {(title || showClose) && (
            <div className="flex items-start justify-between gap-3 px-5 py-4 lg:px-6 border-b border-surface-100">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2 className="text-lg font-bold text-surface-900 leading-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-surface-500 mt-1">{description}</p>
                )}
              </div>
              {showClose && (
                <IconButton
                  icon={<X size={18} />}
                  label="إغلاق"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                />
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 lg:px-6">
            {children}
          </div>

          {footer && (
            <div className="px-5 py-4 lg:px-6 border-t border-surface-100 bg-surface-50/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
