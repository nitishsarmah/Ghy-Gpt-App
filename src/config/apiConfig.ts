/**
 * GHY GPT — Unified API Client Configuration
 * 
 * Provides dynamic base URL resolution for:
 * 1. Web browser (same-origin relative paths or VITE_API_BASE_URL)
 * 2. Mobile APK / Capacitor / Cordova / file:// environments (fallback to production Render backend)
 */

export const PRODUCTION_BACKEND_URL = "https://ghy-gpt.onrender.com";

export function getApiBaseUrl(): string {
  // If explicitly overridden via Vite env var
  if (import.meta.env?.VITE_API_BASE_URL) {
    return (import.meta.env.VITE_API_BASE_URL as string).replace(/\/+$/, "");
  }

  // Detect if running inside a packaged mobile container or local file context
  if (typeof window !== "undefined") {
    const { protocol, hostname, origin } = window.location;

    // file://, capacitor://, ionic://, content://, or mobile local app protocols
    if (
      protocol === "file:" ||
      protocol === "capacitor:" ||
      protocol === "ionic:" ||
      protocol === "content:" ||
      protocol === "app:"
    ) {
      return PRODUCTION_BACKEND_URL;
    }

    // Android WebView Capacitor standard origins (https://localhost or http://localhost)
    if (origin === "https://localhost" || origin === "http://localhost") {
      return PRODUCTION_BACKEND_URL;
    }

    // Standard Android WebView user-agent check
    const ua = navigator?.userAgent || "";
    if (/wv|Android.*Version\/[0-9.]+/i.test(ua) && hostname === "localhost") {
      return PRODUCTION_BACKEND_URL;
    }

    // If served from an external device or localhost without a backend proxy on the same port
    if (hostname === "localhost" && window.location.port !== "3000") {
      return PRODUCTION_BACKEND_URL;
    }
  }

  // Default for web: use relative endpoints so it routes through Express Vite server
  return "";
}

export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return `${base}${cleanPath}`;
}
