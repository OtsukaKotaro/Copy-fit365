"use client";

import { useEffect, useState, useRef } from "react";

type SheetPageProps = {
  title: string;
  message: string;
  onClose?: () => void;
  onStartClose?: () => void;
  onVisibilityChange?: (visible: boolean) => void;
  showClose?: boolean;
  slideFrom?: "bottom" | "right";
  closeSignal?: number;
};

export default function SheetPage({
  title,
  message,
  onClose,
  showClose = true,
  slideFrom = "right",
  closeSignal = 0,
  onStartClose,
  onVisibilityChange,
}: SheetPageProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const lastSignal = useRef(closeSignal);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (closeSignal !== lastSignal.current) {
      lastSignal.current = closeSignal;
      handleClose();
    }
  }, [closeSignal]);

  const handleClose = () => {
    if (closing) return;
    if (onStartClose) onStartClose();
    setClosing(true);
    setVisible(false);
  };

  useEffect(() => {
    if (onVisibilityChange) onVisibilityChange(visible);
  }, [visible, onVisibilityChange]);

  const finishClose = () => {
    if (onClose) onClose();
  };

  const overlayClass = "bg-transparent";
  const translateClass =
    slideFrom === "bottom"
      ? visible
        ? "translate-y-0"
        : "translate-y-full"
      : visible
        ? "translate-x-0"
        : "translate-x-full";

  return (
    <div
      className={`fixed inset-x-0 top-14 bottom-0 z-50 transition-colors duration-300 ${overlayClass}`}
      onClick={handleClose}
    >
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-full transform transition-transform duration-300 ease-out ${translateClass}`}
        onTransitionEnd={() => {
          if (closing && !visible) finishClose();
        }}
      >
        <div className="relative flex h-full flex-col bg-white shadow-none">
          {showClose ? (
            <button
              type="button"
              onClick={handleClose}
              aria-label="閉じる"
              className="absolute left-4 -top-12 z-[65] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#3b2f32] shadow-md ring-1 ring-white/60 transition hover:bg-white"
            >
              <CloseIcon />
            </button>
          ) : null}
          <div className="p-5">
            <div className="text-base font-bold text-[#3b2f32]">{title}</div>
            <p className="mt-3 text-sm leading-relaxed text-[#4f4347]">{message}</p>
          </div>
          <div className="flex-1" />
          <div className="h-[env(safe-area-inset-bottom)] bg-white" />
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
