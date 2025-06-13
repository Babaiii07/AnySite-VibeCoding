export interface Version {
  id: string;
  code: string;
  prompt: string;
  createdAt: number;
}

export interface PreviewRef {
  generateCode: (
    prompt: string,
    colors?: string[],
    previousPrompt?: string,
  ) => Promise<void>;
}

export interface VersionDropdownRef {
  getCurrentVersion: () => Version | null;
}

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
};
