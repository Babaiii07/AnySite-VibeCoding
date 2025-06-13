"use client";
import { Logo } from "./logo";
import { ModelSelector } from "./model-selector";
import { VersionDropdown } from "./version-dropdown";

export function Header({
  onVersionSelect,
  currentVersion,
  onClearAll,
}: {
  onVersionSelect?: (version: any) => void;
  currentVersion?: string;
  onClearAll?: () => void;
}) {
  return (
    <header className="border-b border-parthib-gray/20 p-3 flex justify-between items-center bg-parthib-dark">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-l text-white">Build any site using</span>
            <div className="flex items-center">
              <ModelSelector />
              {onVersionSelect && (
                <VersionDropdown
                  onVersionSelect={onVersionSelect}
                  currentVersion={currentVersion}
                  onClearAll={onClearAll}
                />
              )}
            </div>
          </div>
          <span className="text-sm text-white/40">
            <a
              href="https://github.com/babaiii07"
              target="_blank"
              className="underline hover:text-white/70 transition-colors duration-200"
            >
              Github
            </a>
          </span>
        </div>
      </div>
    </header>
  );
}
