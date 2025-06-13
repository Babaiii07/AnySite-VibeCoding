import React from "react";

interface AuthErrorPopupProps {
  show: boolean;
  authUrl?: string;
  onClose?: () => void;
}

export function AuthErrorPopup({
  show,
  authUrl = "/api/login",
  onClose,
}: AuthErrorPopupProps) {
  if (!show) return null;

  return (
    <div className="absolute right-0 bottom-20 mr-4 w-fit px-2.5 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl z-50">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 right-1 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <div className="flex flex-col items-center">
        <p className="mb-3 text-center">Sign in continue</p>
        <a href={authUrl} className="block w-[214px] h-[40px]">
          <img
            src="https://huggingface.co/datasets/huggingface/badges/resolve/main/sign-in-with-huggingface-lg-dark.svg"
            alt="Sign in with Hugging Face"
          />
        </a>
      </div>
    </div>
  );
}
