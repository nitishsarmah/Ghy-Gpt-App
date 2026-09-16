import { AttachedFile, GeneratedImageMetadata, NewsMode } from "../types";
import { buildApiUrl } from "../config/apiConfig";

export interface GenerateRequestPayload {
  prompt: string;
  systemInstruction?: string;
  history?: Array<{ role: string; content: string }>;
  mode?: NewsMode;
  temperature?: number;
  uploadedFiles?: AttachedFile[];
}

export interface GenerateResponsePayload {
  text: string;
  mode?: NewsMode;
}

function extractCleanErrorMessage(raw: any, fallbackStatus?: number): string {
  if (!raw) return fallbackStatus ? `Request failed (status ${fallbackStatus})` : "An error occurred";
  let str = typeof raw === "string" ? raw : raw.error || raw.message || JSON.stringify(raw);
  
  // Try to parse nested JSON if present (e.g. {"error":{"message":"..."}})
  try {
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
      if (parsed?.message) {
        return parsed.message;
      }
    }
  } catch {}

  // Strip technical callstack or prefix
  str = str.replace(/^ApiError:\s*/i, "").replace(/^Error:\s*/i, "");
  return str;
}

export async function requestNewsGeneration(
  payload: GenerateRequestPayload
): Promise<string> {
  const url = buildApiUrl("/api/generate");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = extractCleanErrorMessage(errorData, response.status);
    throw new Error(message);
  }

  const data: GenerateResponsePayload = await response.json();
  return data.text;
}

export async function requestNewsImage(params: {
  prompt: string;
  aspectRatio: string;
  preset: string;
}): Promise<GeneratedImageMetadata> {
  const url = buildApiUrl("/api/generate-image");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = extractCleanErrorMessage(errorData, response.status);
    throw new Error(message);
  }

  const data = await response.json();
  return {
    imageUrl: data.imageUrl,
    aspectRatio: data.aspectRatio,
    preset: data.preset,
    prompt: data.prompt,
    disclaimer: data.disclaimer || "Illustrative AI Image - Not a photograph of actual events",
  };
}

export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const url = buildApiUrl("/api/health");
    const response = await fetch(url);
    if (!response.ok) return { status: "offline", hasApiKey: false };
    return await response.json();
  } catch {
    return { status: "offline", hasApiKey: false };
  }
}
