"use client";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from "react";
import { DEFAULT_HTML } from "@/lib/constants";
import { PreviewRef } from "@/lib/types";
import {
  MinimizeIcon,
  MaximizeIcon,
  DownloadIcon,
  RefreshIcon,
} from "./ui/icons";
import { useModel } from "@/lib/contexts/model-context";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateShareLink } from "@/lib/sharelink";
import posthog from "posthog-js";

interface PreviewProps {
  initialHtml?: string;
  onCodeChange?: (html: string, save?: boolean) => void;
  onAuthErrorChange?: (show: boolean) => void;
  onLoadingChange?: (loading: boolean) => void;
  onErrorChange?: (error: string | null) => void;
  currentVersion?: string;
}

export const Preview = forwardRef<PreviewRef, PreviewProps>(function Preview(
  {
    initialHtml,
    onCodeChange,
    onAuthErrorChange,
    onLoadingChange,
    onErrorChange,
    currentVersion,
  },
  ref,
) {
  const [html, setHtml] = useState<string>(initialHtml || "");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPartialGenerating, setIsPartialGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { selectedModelId } = useModel();
  const renderCount = useRef(0);
  const headUpdated = useRef(false);

  // Update html when initialHtml changes
  useEffect(() => {
    if (initialHtml && !isPartialGenerating) {
      setHtml(initialHtml);
    }
  }, [initialHtml, isPartialGenerating]);

  // Update parent component when error changes
  useEffect(() => {
    if (onErrorChange) {
      onErrorChange(error);
    }
  }, [error, onErrorChange]);

  useImperativeHandle(ref, () => ({
    generateCode: async (
      prompt: string,
      colors: string[] = [],
      previousPrompt?: string,
    ) => {
      await generateCode(prompt, colors, previousPrompt);
    },
  }));

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const partialUpdate = (htmlStr: string) => {
    const parser = new DOMParser();
    const partialDoc = parser.parseFromString(htmlStr, "text/html");
    const iframe = document.querySelector("iframe");
    if (!iframe || !iframe.contentDocument) return;

    const iframeContainer = iframe.contentDocument;
    if (iframeContainer?.body && iframeContainer) {
      iframeContainer.body.innerHTML = partialDoc.body?.innerHTML;
    }
    if (renderCount.current % 10 === 0 && !headUpdated.current) {
      setHtml(htmlStr);
      if (htmlStr.includes("</head>")) {
        setTimeout(() => {
          headUpdated.current = true;
        }, 1000);
      }
    }
    renderCount.current++;
  };

  const downloadHtml = () => {
    if (!html) return;

    // Get current version and generate filename
    // If we have a currentVersion, use it; otherwise omit version part
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .slice(0, 19);

    // Load current version from localStorage if we have an ID
    let versionLabel = "";
    if (currentVersion) {
      versionLabel = `-${currentVersion}`;
    }

    // Format the filename with or without version
    const filename = `parthib-anysite-generated${versionLabel}-${timestamp}.html`;

    const blob = new Blob([html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const refreshPreview = () => {
    if (!html) return;
    setRefreshKey((prev) => prev + 1);
  };

  const generateCode = async (
    prompt: string,
    colors: string[] = [],
    previousPrompt?: string,
  ) => {
    setLoading(true);
    renderCount.current = 0;
    headUpdated.current = false;
    if (onLoadingChange) {
      onLoadingChange(true);
    }
    setError(null);
    setShowAuthError(false);
    if (onAuthErrorChange) {
      onAuthErrorChange(false);
    }

    // Clear HTML content when generation starts
    setHtml("");

    // Initialize generated code variable at function scope so it's accessible in finally block
    let generatedCode = "";

    try {
      // Only include html in the request if it's not DEFAULT_HTML
      const isDefaultHtml = initialHtml === DEFAULT_HTML;

      posthog.capture("Generate code", { model: selectedModelId });

      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          html: isDefaultHtml ? undefined : html,
          previousPrompt: isDefaultHtml ? undefined : previousPrompt,
          colors,
          modelId: selectedModelId,
        }),
      });

      if (!response.ok) {
        posthog.capture("Generate code", {
          type: "failed",
          model: selectedModelId,
          status: response.status,
        });
        // Check specifically for 401 error (authentication required)
        if (response.status === 401 || response.status === 403) {
          try {
            const errorData = await response.json();
            if (errorData.openLogin) {
              setShowAuthError(true);
              if (onAuthErrorChange) {
                onAuthErrorChange(true);
              }
              throw new Error("Signing in to Hugging Face is required.");
            }
          } catch (e) {
            // Fall back to default auth error handling if JSON parsing fails
            setShowAuthError(true);
            if (onAuthErrorChange) {
              onAuthErrorChange(true);
            }
            throw new Error("Signing in to Hugging Face is required.");
          }
        }

        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate code");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let lastRenderTime = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (!generatedCode.includes("</html>")) {
              generatedCode += "</html>";
            }
            const finalCode = generatedCode.match(
              /<!DOCTYPE html>[\s\S]*<\/html>/,
            )?.[0];
            if (finalCode) {
              // Update state with the final code
              setHtml(finalCode);
              // Only call onCodeChange once with the final code
              // Add a small delay to ensure all state updates have been applied
              if (onCodeChange) {
                setTimeout(() => {
                  onCodeChange(finalCode, true);
                }, 50);
              }
            }
            setIsPartialGenerating(false);
            break;
          } else {
            setIsPartialGenerating(true);
          }

          const chunkText = decoder.decode(value, { stream: true });
          let parsedChunk: any;
          let appended = false;
          try {
            // Try to parse as JSON
            parsedChunk = JSON.parse(chunkText);
          } catch (parseError) {
            appended = true;
            // If JSON parsing fails, treat it as plain text (backwards compatibility)
            generatedCode += chunkText;
          }
          if (parsedChunk && parsedChunk.type === "error") {
            throw new Error(parsedChunk.message || "An error occurred");
          } else if (!appended) {
            generatedCode += chunkText;
          }
          const newCode = generatedCode.match(/<!DOCTYPE html>[\s\S]*/)?.[0];
          if (newCode) {
            // Force-close the HTML tag so the iframe doesn't render half-finished markup
            let partialDoc = newCode;
            if (!partialDoc.endsWith("</html>")) {
              partialDoc += "\n</html>";
            }

            // Throttle the re-renders to avoid flashing/flicker
            const now = Date.now();
            if (now - lastRenderTime > 200) {
              // Update the UI with partial code, but don't call onCodeChange
              partialUpdate(partialDoc);
              if (onCodeChange) {
                onCodeChange(partialDoc, false);
              }

              lastRenderTime = now;
            }
          }
        }
      }
    } catch (err) {
      const errorMessage =
        (err as Error).message || "An error occurred while generating code";
      posthog.capture("Generate code", {
        type: "failed",
        model: selectedModelId,
        error: errorMessage,
      });
      setError(errorMessage);
      if (onErrorChange) {
        onErrorChange(errorMessage);
      }
      console.error("Error generating code:", err);
    } finally {
      setLoading(false);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    }
  };

  return (
    <div
      className={`${isFullscreen ? "fixed inset-0 z-10 bg-parthib-dark" : "h-full"} p-4 pl-2`}
    >
      {isPartialGenerating && (
        <div className="w-full bg-slate-50 border-b border-slate-200 py-2 px-4">
          <div className="container mx-auto flex items-center justify-center">
            <div className="flex items-center space-x-2 text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">building...</span>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white text-black h-full overflow-hidden relative isolation-auto">
        <div className="absolute top-3 right-3 flex gap-2 z-[100]">
          <button
            onClick={refreshPreview}
            className="bg-parthib-gray/90 text-white p-2 rounded-md shadow-md hover:bg-parthib-gray/70 transition-colors flex items-center justify-center"
            aria-label="Refresh Preview"
            title="Refresh Preview"
          >
            <RefreshIcon />
          </button>
          <button
            onClick={downloadHtml}
            className="bg-parthib-gray/90 text-white p-2 rounded-md shadow-md hover:bg-parthib-gray/70 transition-colors flex items-center justify-center"
            aria-label="Download HTML"
            title="Download HTML"
          >
            <DownloadIcon />
          </button>
          <button
            onClick={toggleFullscreen}
            className="bg-parthib-gray/90 text-white p-2 rounded-md shadow-md hover:bg-parthib-gray/70 transition-colors flex items-center justify-center"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Full Screen"}
            title={isFullscreen ? "Exit Fullscreen" : "Full Screen"}
          >
            {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          </button>
        </div>
        <iframe
          key={refreshKey}
          className={cn("relative z-10 w-full h-full select-none", {
            "pointer-events-none": loading,
          })}
          srcDoc={html}
          title="Preview"
        />
      </div>
    </div>
  );
});
