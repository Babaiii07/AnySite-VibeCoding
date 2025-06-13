"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { debounce, highlightHTML } from "@/lib/utils";

interface CodeEditorProps {
  code: string;
  isLoading?: boolean;
  onCodeChange?: (code: string) => void;
}

export function CodeEditor({
  code,
  isLoading = false,
  onCodeChange,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [localCode, setLocalCode] = useState(code);

  const debouncedSave = useCallback(
    debounce((newCode: string) => {
      if (onCodeChange) {
        onCodeChange(newCode);
      }
    }, 1000),
    [onCodeChange],
  );

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setLocalCode(newCode);
    debouncedSave(newCode);
  };

  // Sync scroll between textarea and highlight
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 30;
    setIsAtBottom(isNearBottom);
  };

  useEffect(() => {
    if (
      isAtBottom &&
      textareaRef.current &&
      document.activeElement !== textareaRef.current
    ) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      if (highlightRef.current) {
        highlightRef.current.scrollTop = highlightRef.current.scrollHeight;
      }
    }
  }, [localCode, isLoading, isAtBottom]);

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue =
        localCode.substring(0, start) + "  " + localCode.substring(end);
      setLocalCode(newValue);
      debouncedSave(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const highlightedCode = highlightHTML(localCode);

  return (
    <div className="flex-1 overflow-hidden p-4 pr-2">
      <div
        ref={containerRef}
        className="code-area rounded-md font-mono text-sm h-full border border-parthib-gray/20 relative overflow-hidden"
      >
        <div className="relative h-full">
          {/* Syntax highlighted background - always visible */}
          <div
            ref={highlightRef}
            className="absolute inset-0 overflow-auto p-4 pointer-events-none whitespace-pre-wrap font-mono text-sm leading-relaxed"
            style={{
              fontSize: "0.875rem",
              lineHeight: "1.5",
              fontFamily:
                'ui-monospace, SFMono-Regular, \"SF Mono\", Consolas, \"Liberation Mono\", Menlo, monospace',
              color: "#d4d4d4",
            }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />

          {/* Editable textarea - always transparent */}
          <textarea
            ref={textareaRef}
            value={localCode}
            onChange={handleCodeChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white resize-none outline-none whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 selection:bg-blue-500/30"
            style={{
              fontSize: "0.875rem",
              lineHeight: "1.5",
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            }}
            placeholder="Your generated code will appear here..."
            spellCheck={false}
          />
        </div>

        {isLoading && (
          <span className="absolute bottom-4 right-4 inline-block h-4 w-2 bg-white/70 animate-pulse z-10"></span>
        )}
      </div>
    </div>
  );
}
