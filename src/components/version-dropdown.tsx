"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Version } from "@/lib/types";

export function VersionDropdown({
  onVersionSelect,
  currentVersion,
  onClearAll,
}: {
  onVersionSelect: (version: Version) => void;
  currentVersion?: string;
  onClearAll?: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [userSelected, setUserSelected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update current version ID when prop changes
  useEffect(() => {
    if (currentVersion) {
      setCurrentVersionId(currentVersion);
      setUserSelected(true);
    }
  }, [currentVersion]);

  // Load versions from localStorage
  const loadVersions = () => {
    const storedVersions = localStorage.getItem("parthib-versions");
    if (storedVersions) {
      const parsedVersions = JSON.parse(storedVersions) as Version[];
      // Sort versions by creation time, newest first
      const sortedVersions = parsedVersions.sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      setVersions(sortedVersions);

      // Only set the current version to the newest one if there's no current version
      // We don't want to override a user selection
      if (!currentVersionId && sortedVersions.length > 0 && !userSelected) {
        setCurrentVersionId(sortedVersions[0].id);
      }
    } else {
      // Initialize with empty version list
      setVersions([]);
    }
  };

  // Load versions from localStorage on mount and when localStorage changes
  useEffect(() => {
    loadVersions();

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "parthib-versions") {
        loadVersions();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check for updates periodically since the storage event
    // may not fire if the change is made in the same window
    const interval = setInterval(loadVersions, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [currentVersionId, userSelected]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

  // Handle version selection
  const handleVersionSelect = (version: Version) => {
    setCurrentVersionId(version.id);
    setUserSelected(true);
    setIsOpen(false);
    onVersionSelect(version);
  };

  // Clear all versions
  const clearAllVersions = () => {
    setVersions([]);
    setCurrentVersionId(null);
    setUserSelected(false);
    localStorage.setItem("parthib-versions", JSON.stringify([]));
    setShowClearConfirm(false);

    // Call the onClearAll callback if provided
    if (onClearAll) {
      onClearAll();
    }
  };

  // Get version name based on index
  const getVersionName = (index: number) => {
    return `v${versions.length - 1 - index}`;
  };

  // Find the currently selected version's index
  const getCurrentVersionIndex = () => {
    if (!currentVersionId) return 0;
    const index = versions.findIndex((v) => v.id === currentVersionId);
    return index !== -1 ? index : 0;
  };

  if (versions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative inline-block text-left ml-2" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <span className="text-l text-white">current version</span>
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
              {versions.length > 0
                ? getVersionName(getCurrentVersionIndex())
                : "v0"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
            />
          </div>
          {versions.length > 0 && (
            <div
              className="cursor-pointer text-red-400 hover:text-red-300 px-2 py-1.5 rounded-md hover:bg-red-500/20 transition-all duration-200 flex items-center gap-1"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Clear Versions</span>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 min-w-[160px] w-max right-0 origin-top-right rounded-md bg-parthib-dark border border-parthib-gray/20 shadow-lg">
            <div className="py-1">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  onClick={() => handleVersionSelect(version)}
                  className={`
                    px-4 py-2 text-xs cursor-pointer hover:bg-parthib-gray/20
                    ${currentVersionId === version.id ? "text-white bg-parthib-gray/40" : "text-white/70"}
                  `}
                >
                  {getVersionName(index)} {index === 0 ? "(Newest)" : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent className="bg-parthib-dark border-parthib-gray/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Versions</AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              This will delete all saved versions, and you'll start with a new
              site.{" "}
              <b>
                <span className="text-red-400">
                  This action cannot be undone.
                </span>
              </b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-parthib-gray/20 border-parthib-gray/30 text-white hover:bg-parthib-gray/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={clearAllVersions}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
