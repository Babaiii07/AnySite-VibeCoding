"use client";

import { useState, useEffect, useRef } from "react";
import { MODEL_CONFIG_CODE_GENERATION } from "@/lib/constants";
import { useModel } from "@/lib/contexts/model-context";
import { ChevronDown } from "lucide-react";

export function ModelSelector() {
  const { selectedModelIndex, setSelectedModelIndex } = useModel();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const handleSelect = (index: number) => {
    setSelectedModelIndex(index);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={selectorRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          cursor-pointer flex items-center justify-between gap-2 
          text-white/90 hover:text-white 
          px-3 py-1.5 rounded-md
          border border-parthib-gray/30 hover:border-parthib-gray/60
          bg-parthib-gray/5 hover:bg-parthib-gray/20
          transition-all duration-200 ease-in-out
          ${isOpen ? "border-parthib-gray/60 bg-parthib-gray/20" : ""}
        `}
      >
        <span className="text-sm">
          {MODEL_CONFIG_CODE_GENERATION[selectedModelIndex]?.id ||
            "Select model"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-40 mt-1 w-full origin-top-right rounded-md bg-parthib-dark border border-parthib-gray/20 shadow-lg">
          <div className="py-1">
            {MODEL_CONFIG_CODE_GENERATION.map((model, index) => (
              <div
                key={model.id}
                onClick={() => handleSelect(index)}
                className={`
                  px-4 py-2 text-xs cursor-pointer hover:bg-parthib-gray/20
                  ${selectedModelIndex === index ? "text-white bg-parthib-gray/40" : "text-white/70"}
                `}
              >
                {model.id}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
