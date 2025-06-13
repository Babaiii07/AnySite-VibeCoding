import { Metadata } from "next";
import { AppContainer } from "@/components/app-container";

export const metadata: Metadata = {
  title: "DeepSite - Create AI-Generated Websites",
  description: "Create beautiful websites using AI with DeepSite",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <AppContainer />
    </main>
  );
}
