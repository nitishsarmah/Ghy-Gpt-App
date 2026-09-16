```ts
import {
  Capacitor,
  CapacitorHttp,
} from "@capacitor/core";

import {
  AttachedFile,
  GeneratedImageMetadata,
  NewsMode,
} from "../types";

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
  modelUsed?: string;
}

function extractCleanErrorMessage(
  raw: any,
  fallbackStatus?: number
): string {
  if (!raw) {
    return fallbackStatus
      ? "Request failed (status " + fallbackStatus + ")"
      : "An error occurred";
  }

  let str =
    typeof raw === "string"
      ? raw
      : raw.error || raw.message || JSON.stringify(raw);

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

  str = str
    .replace(/^ApiError:\s*/i, "")
    .replace(/^Error:\s*/i, "");

  return str;
}

/**
 * Shared JSON POST helper.
 *
 * Native Android/iOS:
 * Uses CapacitorHttp.
 *
 * Normal web:
 * Uses browser fetch.
 */
async function postJson<T>(
  url: string,
  body: unknown
): Promise<T> {
  console.log("[GHY GPT] POST:", url);

  if (Capacitor.isNativePlatform()) {
    console.log("[GHY GPT] Using native Capacitor HTTP");

    const response = await CapacitorHttp.post({
      url,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: body,
    });

    console.log(
      "[GHY GPT] Native HTTP status:",
      response.status
    );

    if (
      response.status < 200 ||
      response.status >= 300
    ) {
      const message = extractCleanErrorMessage(
        response.data,
        response.status
      );

      throw new Error(message);
    }

    return response.data as T;
  }

  console.log("[GHY GPT] Using browser fetch");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({}));

    const message = extractCleanErrorMessage(
      errorData,
      response.status
    );

    throw new Error(message);
  }

  return (await response.json()) as T;
}

/**
 * Generate newsroom content.
 */
export async function requestNewsGeneration(
  payload: GenerateRequestPayload
): Promise<string> {
  const url = buildApiUrl("/api/generate");

  const data =
    await postJson<GenerateResponsePayload>(
      url,
      payload
    );

  if (!data?.text) {
    throw new Error(
      "The server returned an empty newsroom response."
    );
  }

  return data.text;
}

/**
 * Generate an AI image.
 */
export async function requestNewsImage(params: {
  prompt: string;
  aspectRatio: string;
  preset: string;
}): Promise<GeneratedImageMetadata> {
  const url = buildApiUrl("/api/generate-image");

  const data = await postJson<any>(
    url,
    params
  );

  return {
    imageUrl: data.imageUrl,
    aspectRatio: data.aspectRatio,
    preset: data.preset,
    prompt: data.prompt,
    disclaimer:
      data.disclaimer ||
      "Illustrative AI Image - Not a photograph of actual events",
  };
}

/**
 * Check backend health.
 */
export async function checkServerHealth(): Promise<{
  status: string;
  hasApiKey: boolean;
}> {
  try {
    const url = buildApiUrl("/api/health");

    console.log(
      "[GHY GPT] Health check:",
      url
    );

    if (Capacitor.isNativePlatform()) {
      console.log(
        "[GHY GPT] Health check using native HTTP"
      );

      const response =
        await CapacitorHttp.get({
          url,
          headers: {
            Accept: "application/json",
          },
        });

      if (
        response.status < 200 ||
        response.status >= 300
      ) {
        return {
          status: "offline",
          hasApiKey: false,
        };
      }

      return response.data;
    }

    const response = await fetch(url);

    if (!response.ok) {
      return {
        status: "offline",
        hasApiKey: false,
      };
    }

    return await response.json();
  } catch (error) {
    console.error(
      "[GHY GPT] Health check failed:",
      error
    );

    return {
      status: "offline",
      hasApiKey: false,
    };
  }
}
```
