"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ColorCircleProps {
  color: string;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
  size?: "sm" | "md";
  showDeleteIcon?: boolean;
}

function ColorCircle({
  color,
  onClick,
  onDelete,
  className,
  size = "sm",
  showDeleteIcon = false,
}: ColorCircleProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
  };

  return (
    <div className="relative group h-5">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          sizeClasses[size],
          "rounded-full border border-white/20 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30",
          className,
        )}
        style={{ backgroundColor: color }}
        aria-label={`Color ${color}`}
      />
      {showDeleteIcon && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="absolute -top-1 -right-1 bg-parthib-dark rounded-full w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Remove color ${color}`}
        >
          <X className="h-2 w-2 text-white" />
        </button>
      )}
    </div>
  );
}

const PRESET_COLORS = [
  "#23d57c", // Parthib green
  "#f43f5e", // Rose
  "#3b82f6", // Blue
  "#eab308", // Yellow
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#ef4444", // Red
  "#84cc16", // Lime
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#6366f1", // Indigo
];

interface ColorPanelProps {
  onColorsChange?: (colors: string[]) => void;
}

export function ColorPanel({ onColorsChange }: ColorPanelProps) {
  const maxColors = 6;
  const [colors, setColors] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isAddingDisabled, setIsAddingDisabled] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Call onColorsChange when colors change
    onColorsChange?.(colors);
  }, [colors, onColorsChange]);

  const addColor = () => {
    if (colors.length >= maxColors || !selectedColor || isAddingDisabled)
      return;

    if (!colors.includes(selectedColor)) {
      setIsAddingDisabled(true);
      setColors([...colors, selectedColor]);
      setSelectedColor(null);
      setIsPopoverOpen(false);

      // Debounce to prevent rapid clicking
      debounceTimeoutRef.current = setTimeout(() => {
        setIsAddingDisabled(false);
      }, 500);
    }
  };

  const selectColor = (color: string) => {
    setSelectedColor(color);
  };

  const removeColor = (indexToRemove: number) => {
    setColors(colors.filter((_, index) => index !== indexToRemove));
  };

  return (
    <TooltipProvider>
      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 z-10">
        {colors.map((color, index) => (
          <ColorCircle
            key={`${color}-${index}`}
            color={color}
            onClick={() => removeColor(index)}
            onDelete={() => removeColor(index)}
            showDeleteIcon={true}
          />
        ))}

        {colors.length < maxColors && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-5 h-5 rounded-full bg-parthib-gray/30 border border-parthib-gray/50 flex items-center justify-center transition-transform hover:scale-110 hover:bg-parthib-gray/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    aria-label="Add color"
                  >
                    <Plus className="h-2.5 w-2.5 text-white" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent className="bg-parthib-dark border-parthib-gray/30 text-white">
                <p>Choose Site Color palette</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent
              className="w-64 p-3 bg-parthib-dark border-parthib-gray/30 rounded-md shadow-lg"
              align="start"
              sideOffset={5}
            >
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Color Picker</h3>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <ColorCircle
                      key={color}
                      color={color}
                      size="md"
                      onClick={() => selectColor(color)}
                      className={cn(
                        selectedColor === color && "ring-2 ring-white/50",
                        colors.includes(color) && "opacity-50",
                      )}
                    />
                  ))}
                </div>
                <div className="pt-2 border-t border-parthib-gray/30">
                  <label className="block text-xs text-parthib-gray mb-1.5">
                    Custom color
                  </label>
                  <input
                    type="color"
                    className="w-full h-8 bg-transparent border border-parthib-gray/30 rounded cursor-pointer"
                    onChange={(e) => selectColor(e.target.value)}
                    value={selectedColor || "#ffffff"}
                  />
                </div>
                <div className="mt-3">
                  <Button
                    onClick={addColor}
                    disabled={!selectedColor || isAddingDisabled}
                    className="w-full h-6 bg-parthib-white hover:bg-parthib-gray/90 text-white rounded border border-parthib-gray/90"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
}
