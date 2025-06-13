import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function highlightHTML(code: string): string {
  if (!code) return "";

  let result = code;

  result = result
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  result = result.replace(
    /(&lt;style[^&]*?&gt;)([\s\S]*?)(&lt;\/style&gt;)/gi,
    (match, openTag, cssContent, closeTag) => {
      const highlighted = cssContent
        .replace(
          /([a-zA-Z-]+)(\s*:\s*)([^;]+)(;?)/g,
          '<span style="color: #9cdcfe;">$1</span><span style="color: #d4d4d4;">$2</span><span style="color: #ce9178;">$3</span><span style="color: #d4d4d4;">$4</span>',
        )
        .replace(/(\{|\})/g, '<span style="color: #ffd700;">$1</span>');
      return openTag + highlighted + closeTag;
    },
  );

  result = result
    .replace(
      /(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)([\s\S]*?)(&gt;)/g,
      '<span style="color: #569cd6;">$1</span><span style="color: #4ec9b0;">$2</span><span style="color: #9cdcfe;">$3</span><span style="color: #569cd6;">$4</span>',
    )
    .replace(
      /(\s)([a-zA-Z-]+)(=)(&quot;[^&quot;]*&quot;)/g,
      '$1<span style="color: #92c5f8;">$2</span><span style="color: #d4d4d4;">$3</span><span style="color: #ce9178;">$4</span>',
    )
    .replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span style="color: #6a9955; font-style: italic;">$1</span>',
    )
    .replace(
      /(&lt;!DOCTYPE[^&]*?&gt;)/gi,
      '<span style="color: #c586c0;">$1</span>',
    );

  return result;
}
