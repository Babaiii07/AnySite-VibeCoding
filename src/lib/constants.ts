// This file conditionally exports constants based on the environment
// In development (pnpm dev), it uses constants.dev.ts
// In production (pnpm build/start), it uses constants.prod.ts

import * as constantsDev from "./constants.dev";
import * as constantsProd from "./constants.prod";

// Export the appropriate constants based on NODE_ENV
const constants =
  process.env.NODE_ENV === "development" ? constantsDev : constantsProd;

export const REDIRECT_URI = constants.REDIRECT_URI;
export const MODEL_CONFIG_PROMPT_IMPROVEMENT =
  constants.MODEL_CONFIG_PROMPT_IMPROVEMENT;
export const MODEL_CONFIG_CODE_GENERATION =
  constants.MODEL_CONFIG_CODE_GENERATION;
export const DEFAULT_HTML = constants.DEFAULT_HTML;
