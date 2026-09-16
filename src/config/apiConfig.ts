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
  // Explicit environment override
  const envUrl = import.meta.env?.VITE_API_BASE_URL;

  if (envUrl) {
    return String(envUrl).replace(/\/+$/, "");
  }

  // Capacitor / Android detection
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const origin = window.location.origin;

    // Capacitor / native app protocols
    if (
      protocol === "file:" ||
      protocol === "capacitor:" ||
      protocol === "ionic:" ||
      protocol === "content:" ||
      protocol === "app:"
    ) {
      return PRODUCTION_BACKEND_URL;
    }

    // Capacitor Android WebView
    if (
      origin === "https://localhost" ||
      origin === "http://localhost"
    ) {
      return PRODUCTION_BACKEND_URL;
    }

    // Android WebView running on localhost
    const ua = navigator?.userAgent || "";

    if (
      hostname === "localhost" &&
      /Android/i.test(ua)
    ) {
      return PRODUCTION_BACKEND_URL;
    }

    // Other localhost app environments
    if (hostname === "localhost") {
      return PRODUCTION_BACKEND_URL;
    }
  }

  // Normal web deployment
  return "";
}

export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const base = getApiBaseUrl();

  return `${base}${cleanPath}`;
}
