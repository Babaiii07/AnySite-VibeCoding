import React from "react";

interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  onClose,
  className = "",
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`p-2 bg-red-600/20 text-red-200 text-sm text-center relative ${className}`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-red-200 hover:text-white"
          aria-label="Close error message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
      {message}
    </div>
  );
}
