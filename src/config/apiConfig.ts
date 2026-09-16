/**
 * GHY GPT — Unified API Client Configuration
 *
 * Web:
 *   Uses VITE_API_BASE_URL when provided, otherwise relative API paths.
 *
 * Android / Capacitor:
 *   Always uses the production Render backend.
 */

export const PRODUCTION_BACKEND_URL =
  "https://ghy-gpt.onrender.com";

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env?.VITE_API_BASE_URL;

  if (envUrl) {
    const url = String(envUrl).replace(/\/+$/, "");
    console.log("[GHY GPT] API Base URL from env:", url);
    return url;
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const origin = window.location.origin;

    console.log("[GHY GPT] WebView info:", {
      protocol,
      hostname,
      origin,
      userAgent: navigator?.userAgent || "",
    });

    if (
      protocol === "file:" ||
      protocol === "capacitor:" ||
      protocol === "ionic:" ||
      protocol === "content:" ||
      protocol === "app:"
    ) {
      console.log(
        "[GHY GPT] Using production backend:",
        PRODUCTION_BACKEND_URL
      );
      return PRODUCTION_BACKEND_URL;
    }

    if (
      origin === "https://localhost" ||
      origin === "http://localhost"
    ) {
      console.log(
        "[GHY GPT] Capacitor localhost detected. Using:",
        PRODUCTION_BACKEND_URL
      );
      return PRODUCTION_BACKEND_URL;
    }

    const ua = navigator?.userAgent || "";

    if (hostname === "localhost" && /Android/i.test(ua)) {
      console.log(
        "[GHY GPT] Android localhost detected. Using:",
        PRODUCTION_BACKEND_URL
      );
      return PRODUCTION_BACKEND_URL;
    }

    if (hostname === "localhost") {
      console.log(
        "[GHY GPT] Localhost detected. Using:",
        PRODUCTION_BACKEND_URL
      );
      return PRODUCTION_BACKEND_URL;
    }
  }

  console.log("[GHY GPT] Normal web mode: using relative API paths");

  return "";
}

export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const base = getApiBaseUrl();
  const finalUrl = `${base}${cleanPath}`;

  console.log("[GHY GPT] API Request URL:", finalUrl);

  return finalUrl;
}
