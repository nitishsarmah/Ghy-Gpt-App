/**
 * Centralized Newsroom Prompts Service Layer
 * Re-exports from the centralized configuration in src/config/newsroomPrompts.ts
 */

export * from "../config/newsroomPrompts";

import {
  NewsLanguage,
  NewsMode,
  NewsWritingOptions,
  TranslationOptions,
  HeadlineOptions,
  SummaryOptions,
  ImageGenOptions,
} from "../types";

import {
  getLanguageDisplayName,
  resolveSystemPrompt,
  resolveUserPrompt,
} from "../config/newsroomPrompts";

export function getLanguageName(lang: NewsLanguage | "auto"): string {
  return getLanguageDisplayName(lang);
}

export function buildSystemPrompt(mode: NewsMode): string {
  return resolveSystemPrompt(mode);
}

export function formatUserPrompt(
  rawInput: string,
  mode: NewsMode,
  options?: {
    newsWriting?: NewsWritingOptions;
    translation?: TranslationOptions;
    headline?: HeadlineOptions;
    summary?: SummaryOptions;
    imageGen?: ImageGenOptions;
  }
): string {
  return resolveUserPrompt(rawInput, mode, options);
}
