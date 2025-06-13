"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { MODEL_CONFIG_CODE_GENERATION } from "../constants";

type ModelContextType = {
  selectedModelIndex: number;
  setSelectedModelIndex: (index: number) => void;
  selectedModelId: string;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);

  const selectedModelId =
    MODEL_CONFIG_CODE_GENERATION[selectedModelIndex]?.id ||
    MODEL_CONFIG_CODE_GENERATION[0].id;

  return (
    <ModelContext.Provider
      value={{ selectedModelIndex, setSelectedModelIndex, selectedModelId }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
