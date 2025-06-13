"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Wand2, ArrowUp, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ColorPanel } from "./color-panel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FullscreenToggle } from "./ui/fullscreen-toggle";
import { AuthErrorPopup } from "./auth-error-popup";
import { getInferenceToken } from "@/lib/auth";
import posthog from "posthog-js";

interface PromptInputProps {
  onSubmit: (prompt: string, colors: string[]) => Promise<void>;
  isLoading?: boolean;
  initialPrompt?: string;
  onImproveError?: (error: string | null) => void;
}

export function PromptInput({
  onSubmit,
  isLoading = false,
  initialPrompt = "",
  onImproveError,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [improveError, setImproveError] = useState<string | null>(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  // Update prompt when initialPrompt changes
  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    if (onImproveError) {
      onImproveError(improveError);
    }
  }, [improveError, onImproveError]);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = await getInferenceToken();
      if (token) {
        return true;
      }
      const canBypass = await fetch("/api/auth/check-bypass").then((res) =>
        res.json(),
      );
      if (!canBypass) {
        throw new Error("Authentication required");
      }
      return true;
    } catch (error) {
      setShowAuthError(true);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === "" || isLoading) return;

    // Check for authentication
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    // Clear any previous errors
    setImproveError(null);
    await onSubmit(prompt, selectedColors);
  };

  const improvePrompt = async () => {
    if (prompt.trim() === "" || isImprovingPrompt || isLoading) return;

    // Check for authentication
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    posthog.capture("Improve prompt", {});

    // Clear previous errors
    setImproveError(null);
    setShowAuthError(false);
    setIsImprovingPrompt(true);

    try {
      const response = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        posthog.capture("Improve prompt", {
          type: "failed",
          status: response.status,
        });

        // Handle auth error with openLogin flag
        if (response.status === 401) {
          const errorData = await response.json();
          if (errorData.openLogin) {
            setShowAuthError(true);
            throw new Error("Authentication required");
          }
        }

        const errorText = await response.text();
        throw new Error(
          errorText || `Failed to improve prompt (${response.status})`,
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      // Handle streaming response
      const reader = response.body.getReader();
      let improvedPrompt = "";

      let textDecoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = textDecoder.decode(value, { stream: true });
        let parsedChunk: any;
        let appended = false;
        try {
          // Parse the JSON response
          parsedChunk = JSON.parse(chunkText);
        } catch (parseError) {
          appended = true;
          // If JSON parsing fails, treat it as plain text (backwards compatibility)
          improvedPrompt += chunkText;
          setPrompt(improvedPrompt);
        }
        if (parsedChunk && parsedChunk.type === "error") {
          throw new Error(parsedChunk.message || "An error occurred");
        } else if (!appended) {
          improvedPrompt += chunkText;
          setPrompt(improvedPrompt);
        }
      }
    } catch (error) {
      posthog.capture("Improve prompt", { type: "failed", error: error });
      console.error("Error improving prompt:", error);
      setImproveError(
        error instanceof Error ? error.message : "Failed to improve prompt",
      );
    } finally {
      setIsImprovingPrompt(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleColorsChange = (colors: string[]) => {
    setSelectedColors(colors);
  };

  const isPromptTooShort = prompt.length < 10;

  return (
    <div
      className={`border-t border-parthib-gray/20 p-4 relative transition-all duration-300 ease-in-out ${isFullScreen ? "h-[50vh]" : ""}`}
    >
      <div className="absolute top-1 right-1 z-10">
        <FullscreenToggle
          isFullScreen={isFullScreen}
          onClick={toggleFullScreen}
        />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full relative z-[1]">
        <div className={`relative ${isFullScreen ? "h-full" : ""}`}>
          <ColorPanel onColorsChange={handleColorsChange} />
          
          {/* Textarea with animated glowing border */}
          <div className={`relative ${isFullScreen ? "h-full" : ""}`}>
            <Textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                // Clear error when user types
                if (improveError) setImproveError(null);
              }}
              onBlur={() => setIsAnimationActive(true)}
              onFocus={() => setIsAnimationActive(false)}
              placeholder="Describe what site you want to build. E.g., Build a snake game"
              className={`min-h-24 pr-20 pt-12 bg-parthib-gray/20 text-white placeholder:text-white/40 resize-none relative z-[1] rounded-lg transition-colors duration-300 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-parthib-gray ${
                isFullScreen ? "h-full" : ""
              } ${
                isAnimationActive 
                  ? "border-2 unfocus-border" 
                  : "border-2 border-parthib-gray/30"
              }`}
              disabled={isLoading || isImprovingPrompt}
            />
          </div>
          <div className="absolute bottom-3 right-3 flex gap-2 z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 bg-parthib-gray/20 border-parthib-gray/30 text-white hover:bg-parthib-gray/30"
                      disabled={
                        isPromptTooShort || isLoading || isImprovingPrompt
                      }
                      onClick={improvePrompt}
                    >
                      {isImprovingPrompt ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Magic wand</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                {isPromptTooShort && (
                  <TooltipContent className="bg-parthib-gray text-white">
                    <p>Your prompt is too simple, we can&apos;t improve it.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 bg-parthib-green text-black hover:bg-parthib-green/90"
              disabled={prompt.trim() === "" || isLoading || isImprovingPrompt}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              <span className="sr-only">Submit</span>
            </Button>
          </div>
        </div>
      </form>

      <AuthErrorPopup
        show={showAuthError}
        onClose={() => setShowAuthError(false)}
      />
    </div>
  );
}
