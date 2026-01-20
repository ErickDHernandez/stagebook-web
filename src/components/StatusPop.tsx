"use client";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface StatusPopupProps {
  show: boolean;
  message: string;
  type?: "success" | "error";
  onClose?: () => void;
}

export default function StatusPopup({
  show,
  message,
  type = "success",
  onClose
}: StatusPopupProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-20 pointer-events-none">
      <div
        className={`
          pointer-events-auto
          px-6 py-4 rounded-2xl border shadow-2xl
          animate-in fade-in slide-in-from-top-4
          ${type === "success"
            ? "bg-green-900/20 border-green-600 text-green-400"
            : "bg-red-900/20 border-red-600 text-red-400"}
        `}
        onClick={onClose}
      >
        <div className="flex items-center gap-3">
          {type === "success" ? (
            <CheckIcon className="w-5 h-5" />
          ) : (
            <XMarkIcon className="w-5 h-5" />
          )}

          <p className="text-[11px] font-mono uppercase tracking-widest">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
