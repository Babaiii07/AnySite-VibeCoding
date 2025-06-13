"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FullscreenToggleProps {
  isFullScreen: boolean;
  onClick: () => void;
  className?: string;
}

export function FullscreenToggle({
  isFullScreen,
  onClick,
  className = "",
}: FullscreenToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={`h-8 w-8 bg-parthib-gray border-parthib-gray/30 text-white hover:bg-parthib-gray/20 ${className}`}
            onClick={onClick}
          >
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle full screen</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-parthib-gray text-white">
          <p>{isFullScreen ? "Exit full screen" : "Enter full screen"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
