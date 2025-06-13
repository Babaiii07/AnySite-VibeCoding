import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { ModelProvider } from "@/lib/contexts/model-context";
import { PostHogProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Novita AnySite",
  description:
    "Create stunning websites with cutting-edge AI models powered by Novita AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ModelProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster richColors />
            </ModelProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
