"use client";

import { useState, useRef, useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { CodeEditor } from "./code-editor";
import { Preview } from "./preview";
import { PromptInput } from "./prompt-input";
import { Header } from "./header";
import { VersionDropdown } from "./version-dropdown";
import { AuthErrorPopup } from "./auth-error-popup";
import { toast } from "sonner";
import { DEFAULT_HTML } from "@/lib/constants";
import { Version, PreviewRef } from "@/lib/types";
import { ErrorMessage } from "./ui/error-message";

export function AppContainer() {
  const [code, setCode] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showAuthError, setShowAuthError] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [improveError, setImproveError] = useState<string | null>(null);
  const previewRef = useRef<PreviewRef>(null);
  const currentPromptRef = useRef<string>("");
  // Add a ref to track the latest created version ID
  const latestVersionIdRef = useRef<string | null>(null);

  // Keep a reference to the current prompt for use in callbacks
  useEffect(() => {
    currentPromptRef.current = prompt;
  }, [prompt]);

  // Initialize current version ID from localStorage on mount
  useEffect(() => {
    setInitialLoading(true);

    const storedVersions = localStorage.getItem("parthib-versions");
    if (storedVersions) {
      const parsedVersions = JSON.parse(storedVersions) as Version[];
      if (parsedVersions.length > 0) {
        // Sort by creation time, newest first
        const sortedVersions = parsedVersions.sort(
          (a, b) => b.createdAt - a.createdAt,
        );
        const newestVersion = sortedVersions[0];

        // Set the current version ID and also load its code and prompt
        setCurrentVersionId(newestVersion.id);
        latestVersionIdRef.current = newestVersion.id;
        setCode(newestVersion.code);
        setPrompt(newestVersion.prompt);
        currentPromptRef.current = newestVersion.prompt;
      } else {
        // No versions found, set default code but don't create a version
        setCode(DEFAULT_HTML);
        setCurrentVersionId(null);
        latestVersionIdRef.current = null;
      }
    } else {
      // No versions in localStorage, set default code but don't create a version
      setCode(DEFAULT_HTML);
      setCurrentVersionId(null);
      latestVersionIdRef.current = null;
      localStorage.setItem("parthib-versions", JSON.stringify([]));
    }

    // Finish loading after a short delay to ensure everything renders properly
    setTimeout(() => {
      setInitialLoading(false);
    }, 100);
  }, []);

  const handlePromptSubmit = async (newPrompt: string, colors: string[]) => {
    // Store the current prompt as previous prompt
    const oldPrompt = currentPromptRef.current;

    // Update prompt state
    setPrompt(newPrompt);
    currentPromptRef.current = newPrompt; // Update the ref immediately

    // Clear code and preview when submit is pressed
    setCode("");

    // Create a new version immediately with empty code when submit is clicked
    const newVersionId = saveVersionInitial(newPrompt);
    setCurrentVersionId(newVersionId);

    if (previewRef.current) {
      // Pass both the new prompt and old prompt for context
      await previewRef.current.generateCode(newPrompt, colors, oldPrompt);
    }
  };

  // Handle code change and save version
  const handleCodeChange = (newCode: string, save = false) => {
    setCode(newCode);

    // Save version when code changes and we're not loading
    // This will now only be called once with the final code
    if (save && currentPromptRef.current) {
      // Make sure we're updating the latest version
      updateVersionWithFinalCode(newCode);
    }
  };

  // Explicitly save version when loading completes
  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  // Function to create a new version initially with empty code
  const saveVersionInitial = (promptToSave: string) => {
    // Get existing versions
    const storedVersions = localStorage.getItem("parthib-versions");
    let versions: Version[] = storedVersions ? JSON.parse(storedVersions) : [];

    // Create new version with empty code
    const newVersion: Version = {
      id: Date.now().toString(),
      code: "", // Empty code field initially
      prompt: promptToSave,
      createdAt: Date.now(),
    };

    // Add to beginning (newest first)
    versions = [newVersion, ...versions];

    // Save to localStorage
    localStorage.setItem("parthib-versions", JSON.stringify(versions));

    // Update current version ID
    setCurrentVersionId(newVersion.id);
    // Also update the latest version ID ref
    latestVersionIdRef.current = newVersion.id;

    return newVersion.id;
  };

  // Function to update existing version with final code
  const updateVersionWithFinalCode = (finalCode: string) => {
    // Get existing versions
    const storedVersions = localStorage.getItem("parthib-versions");
    if (!storedVersions) return;

    let versions: Version[] = JSON.parse(storedVersions);

    if (!versions.length) return;

    // Prioritize using the latestVersionIdRef, then fall back to currentVersionId, then to the most recent version
    const versionIdToUpdate =
      latestVersionIdRef.current || currentVersionId || versions[0].id;

    if (!versionIdToUpdate) return;

    // Find and update the current version
    const updatedVersions = versions.map((version) => {
      if (version.id === versionIdToUpdate) {
        return { ...version, code: finalCode };
      }
      return version;
    });

    // Save to localStorage
    localStorage.setItem("parthib-versions", JSON.stringify(updatedVersions));

    // Show a subtle toast notification when code generation completes
    toast.success("Generated code saved", {
      position: "top-right",
      duration: 2000,
    });
  };

  // Handle selecting a version from the dropdown
  const handleVersionSelect = (version: Version) => {
    setCode(version.code);
    setPrompt(version.prompt);
    currentPromptRef.current = version.prompt;
    setCurrentVersionId(version.id);
    latestVersionIdRef.current = version.id;
  };

  // Handle clearing all versions
  const handleClearAll = () => {
    // Reset to default HTML
    setCode(DEFAULT_HTML);
    setPrompt("");
    currentPromptRef.current = "";
    setCurrentVersionId(null);
    latestVersionIdRef.current = null;
  };

  const handleManualCodeEdit = (newCode: string) => {
    setCode(newCode);

    if (currentVersionId) {
      updateVersionWithCode(newCode);
    }
  };

  const updateVersionWithCode = (editedCode: string) => {
    // Get existing versions
    const storedVersions = localStorage.getItem("parthib-versions");
    if (!storedVersions || !currentVersionId) return;

    let versions: Version[] = JSON.parse(storedVersions);

    const updatedVersions = versions.map((version) => {
      if (version.id === currentVersionId) {
        return { ...version, code: editedCode };
      }
      return version;
    });

    localStorage.setItem("parthib-versions", JSON.stringify(updatedVersions));
  };

  return (
    <div className="flex flex-col h-screen bg-parthib-dark text-white">
      <Header
        onVersionSelect={handleVersionSelect}
        currentVersion={currentVersionId || undefined}
        onClearAll={handleClearAll}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel
            defaultSize={33}
            minSize={20}
            maxSize={60}
            className="flex flex-col relative"
          >
            <CodeEditor
              code={code}
              isLoading={loading}
              onCodeChange={handleManualCodeEdit}
            />

            <AuthErrorPopup
              show={showAuthError}
              onClose={() => setShowAuthError(false)}
            />

            <PromptInput
              onSubmit={handlePromptSubmit}
              isLoading={loading}
              initialPrompt={prompt}
              onImproveError={setImproveError}
            />
          </ResizablePanel>

          <ResizableHandle
            withHandle={false}
            className="w-1 bg-parthib-gray/20 hover:bg-parthib-gray/40 transition-colors duration-200 relative group cursor-col-resize"
          >
            <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-0.5 h-8 bg-parthib-gray/60 rounded-full" />
            </div>
          </ResizableHandle>

          <ResizablePanel
            defaultSize={67}
            minSize={40}
            className="flex flex-col"
          >
            <Preview
              ref={previewRef}
              initialHtml={code}
              onCodeChange={handleCodeChange}
              onLoadingChange={handleLoadingChange}
              onAuthErrorChange={setShowAuthError}
              onErrorChange={setGenerationError}
              currentVersion={currentVersionId || undefined}
            />
          </ResizablePanel>
        </ResizablePanelGroup>

        {initialLoading && (
          <div className="absolute inset-0 bg-parthib-dark/80 backdrop-blur-sm flex items-center justify-center z-[999]">
            <div className="p-4 text-center">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
              <p className="mt-2">Preparing the workspace...</p>
            </div>
          </div>
        )}
      </div>

      <ErrorMessage
        message={improveError || generationError}
        onClose={() => {
          if (improveError) {
            setImproveError(null);
          } else if (generationError) {
            setGenerationError(null);
          }
        }}
      />
    </div>
  );
}
