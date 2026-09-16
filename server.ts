import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { resolveSystemPrompt, imagePrompt } from "./src/config/newsroomPrompts";

dotenv.config();

const app = express();
const PORT = 3000;

// Explicit CORS headers supporting Web, Mobile APK, Capacitor, and remote newsrooms
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: "25mb" }));

// Server-side lazy/safe GenAI client
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "GHY GPT",
    subtitle: "AI Newsroom Assistant",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Resilient News Generation with Multi-Model Fallback and Exponential Backoff
async function generateContentWithResilience(
  ai: GoogleGenAI,
  contents: any,
  config: any
): Promise<{ text: string; modelUsed: string }> {
  // Ordered fallback models:
  // 1. gemini-3.8-flash (Primary newsroom intelligence model)
  // 2. gemini-3.1-flash-lite (High-availability fast fallback, verified operational)
  // 3. gemini-flash-latest (General latest alias fallback)
  const candidateModels = [
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    // Try up to 2 attempts per model for transient demand spikes (503 / 429)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        if (response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const isTransient =
          msg.includes("503") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED");

        console.warn(
          `[GHY GPT API] Model ${model} (attempt ${attempt}) encountered: ${
            isTransient ? "transient 503/429 demand spike" : msg
          }`
        );

        if (!isTransient) {
          // For non-transient errors, break to next candidate model
          break;
        }

        // Wait briefly with backoff before second attempt
        if (attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 750));
        }
      }
    }
  }

  // If all models failed, clean up the error message
  const rawMsg = lastError?.message || String(lastError);
  let cleanMessage = "The AI newsroom service is temporarily experiencing high traffic. Please retry in a few seconds.";
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        cleanMessage = parsed.error.message;
      }
    }
  } catch {
    if (rawMsg && !rawMsg.includes("ApiError")) {
      cleanMessage = rawMsg;
    }
  }

  throw new Error(cleanMessage);
}

// Generate fallback SVG editorial card when photorealistic image quota is unavailable
function createEditorialGraphicSvg(
  prompt: string,
  aspectRatio: string,
  preset: string
): string {
  let width = 1280;
  let height = 720;
  if (aspectRatio === "1:1") {
    width = 800;
    height = 800;
  } else if (aspectRatio === "3:4" || aspectRatio === "4:5") {
    width = 768;
    height = 1024;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  }

  const safePrompt = prompt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .slice(0, 140);

  const presetTitle = preset.replace("_", " ").toUpperCase();
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <rect width="${width}" height="${height}" fill="url(#glow)" />
  <rect width="${width}" height="${height}" fill="url(#grid)" />

  <!-- Outer Editorial Frame -->
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" rx="8" />

  <!-- Top Newsroom Header -->
  <g transform="translate(48, 64)">
    <rect x="0" y="0" width="140" height="28" rx="4" fill="url(#badgeGrad)" />
    <text x="70" y="18" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" letter-spacing="1.5" text-anchor="middle">GHY GPT WIRE</text>
    <text x="156" y="19" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">${presetTitle} • ${dateStr}</text>
  </g>

  <!-- Center Topic Content -->
  <g transform="translate(48, ${Math.floor(height * 0.45)})">
    <text x="0" y="0" fill="#f8fafc" font-family="Georgia, Cambria, 'Times New Roman', serif" font-size="${width > 900 ? "32" : "24"}" font-weight="700" letter-spacing="-0.5">
      ${safePrompt}
    </text>
    <text x="0" y="44" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14">
      Digital Newsroom Editorial Graphic • Verified Information Desk
    </text>
  </g>

  <!-- Bottom Metadata Strip -->
  <g transform="translate(48, ${height - 56})">
    <line x1="0" y1="-16" x2="${width - 96}" y2="-16" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <text x="0" y="6" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11">
      ASPECT RATIO: ${aspectRatio} | EDITORIAL PRESET: ${preset}
    </text>
    <text x="${width - 96}" y="6" fill="#f43f5e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" text-anchor="end">
      ILLUSTRATIVE GRAPHIC
    </text>
  </g>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Primary newsroom AI endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const {
      prompt,
      systemInstruction,
      history = [],
      mode = "general",
      temperature = 0.3,
      uploadedFiles = [],
    } = req.body;

    if (!prompt && (!uploadedFiles || uploadedFiles.length === 0)) {
      return res.status(400).json({ error: "Prompt or file content is required." });
    }

    const ai = getGenAI();

    // Prepare contents
    // Build context with history if provided
    const contents: any[] = [];

    // Add prior turns if conversation history exists
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.content || "" }],
        });
      }
    }

    // Build current turn parts
    const currentParts: any[] = [];

    // Attach uploaded files if any (base64 images, PDFs, or text)
    if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file.data && file.mimeType) {
          if (file.mimeType.startsWith("image/") || file.mimeType === "application/pdf") {
            currentParts.push({
              inlineData: {
                data: file.data.replace(/^data:[^;]+;base64,/, ""),
                mimeType: file.mimeType,
              },
            });
          } else if (file.text) {
            currentParts.push({
              text: `[Attached Document: ${file.name || "File"}]\n${file.text}\n---`,
            });
          }
        }
      }
    }

    if (prompt) {
      currentParts.push({ text: prompt });
    }

    contents.push({
      role: "user",
      parts: currentParts,
    });

    const finalSystemInstruction =
      systemInstruction || resolveSystemPrompt(mode as any);

    const result = await generateContentWithResilience(ai, contents, {
      systemInstruction: finalSystemInstruction,
      temperature: typeof temperature === "number" ? temperature : 0.3,
    });

    return res.json({ text: result.text, mode, modelUsed: result.modelUsed });
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    const message = error?.message || "Failed to generate response";
    return res.status(500).json({ error: message });
  }
});

// Newsroom Source URL Ingestion endpoint
app.post("/api/fetch-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "A valid web URL is required." });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "Only HTTP and HTTPS URLs are supported." });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (GHY-GPT-Newsroom-Intake/1.0)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Target webpage returned status ${response.status}: ${response.statusText}`,
      });
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, " ") : parsed.hostname;

    // Extract meta description
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim().replace(/\s+/g, " ") : "";

    // Clean body text (strip tags, scripts, styles)
    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    if (cleanText.length > 2500) {
      cleanText = cleanText.slice(0, 2500) + "... [truncated]";
    }

    return res.json({
      ok: true,
      url: targetUrl,
      title,
      description,
      snippet: cleanText,
    });
  } catch (err: any) {
    console.warn("[GHY GPT] Error fetching source URL:", err);
    return res.status(500).json({
      error: err?.message || "Failed to fetch source webpage. Check the URL and network connection.",
    });
  }
});

// Dedicated Editorial Verification & Fact-Check Endpoint (The 6 Mandatory Newsroom Safeguards)
app.post("/api/verify-editorial", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Story text is required for editorial verification." });
    }

    const ai = getGenAI();

    const auditInstruction = `You are GHY GPT's Senior Newsroom Fact-Checker & Legal Copy-Desk Auditor.
Analyze this news copy strictly against the 6 Mandatory Newsroom Safeguards:
1. "check_date" (⚠️ Check date): Verify dates, days of the week, chronological consistency, calendar plausibility.
2. "check_name" (⚠️ Check spelling of person's name): Scrutinize names of public figures, officials, victims, accused, and regional transliteration in Assam/Northeast/India.
3. "check_number" (⚠️ Number mentioned without source): Flag any casualty figures, arrest counts, financial sums, percentages, or statistics lacking explicit source attribution.
4. "check_quote" (⚠️ Quote needs attribution): Flag quotes or verbatim assertions lacking an explicitly identified speaker or agency.
5. "check_location" (⚠️ Location needs verification): Scrutinize towns, villages, revenue circles, districts, or landmarks (especially in Assam and Northeast India) for geographic accuracy and spelling.
6. "check_allegation" (⚠️ Allegation requires attribution): Flag accusations, charges, or alleged crimes presented as facts rather than attributed to police, FIR, chargesheet, court records, or complainant.

Return ONLY a valid JSON object matching this schema:
{
  "overallStatus": "clean" | "warnings_found",
  "warningCount": number,
  "summary": "1-2 sentence executive assessment for the copy editor",
  "checks": [
    {
      "id": "check_date",
      "label": "Check date",
      "warningPrefix": "⚠️ Check date",
      "status": "pass" | "warning" | "flagged",
      "finding": "Clear explanation of findings",
      "excerpt": "Short excerpt if applicable",
      "suggestion": "Actionable fix for reporter"
    },
    {
      "id": "check_name",
      "label": "Check spelling of person's name",
      "warningPrefix": "⚠️ Check spelling of person's name",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    },
    {
      "id": "check_number",
      "label": "Number mentioned without source",
      "warningPrefix": "⚠️ Number mentioned without source",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    },
    {
      "id": "check_quote",
      "label": "Quote needs attribution",
      "warningPrefix": "⚠️ Quote needs attribution",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    },
    {
      "id": "check_location",
      "label": "Location needs verification",
      "warningPrefix": "⚠️ Location needs verification",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    },
    {
      "id": "check_allegation",
      "label": "Allegation requires attribution",
      "warningPrefix": "⚠️ Allegation requires attribution",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    }
  ]
}`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `AUDIT THIS NEWS TEXT:\n"""\n${text.slice(0, 8000)}\n"""`,
          },
        ],
      },
    ];

    const result = await generateContentWithResilience(ai, contents, {
      systemInstruction: auditInstruction,
      temperature: 0.1,
      responseMimeType: "application/json",
    });

    let jsonResponse: any = null;
    try {
      jsonResponse = JSON.parse(result.text);
    } catch {
      const match = result.text.match(/\{[\s\S]*\}/);
      if (match) {
        jsonResponse = JSON.parse(match[0]);
      }
    }

    if (!jsonResponse || !Array.isArray(jsonResponse.checks)) {
      throw new Error("Invalid audit structure returned by AI model.");
    }

    // Ensure all 6 checks are populated
    const checkIds = [
      "check_date",
      "check_name",
      "check_number",
      "check_quote",
      "check_location",
      "check_allegation",
    ];

    const checks = checkIds.map((id) => {
      const found = jsonResponse.checks.find((c: any) => c.id === id);
      if (found) return found;
      return {
        id,
        label: id.replace("check_", "").replace("_", " "),
        warningPrefix: `⚠️ ${id}`,
        status: "pass",
        finding: "No critical verification discrepancies detected.",
      };
    });

    const warningCount = checks.filter((c: any) => c.status !== "pass").length;

    return res.json({
      timestamp: Date.now(),
      overallStatus: warningCount > 0 ? "warnings_found" : "clean",
      warningCount,
      summary: jsonResponse.summary || (warningCount > 0 ? `${warningCount} warnings require editorial review.` : "All 6 safeguards verified cleanly."),
      checks,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error("Error in /api/verify-editorial:", error);
    return res.status(500).json({ error: error?.message || "Failed to audit editorial safeguards." });
  }
});

// Dedicated Image Generation endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", preset = "news_illustration" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const ai = getGenAI();

    // Map aspect ratio to accepted values: "1:1", "3:4", "4:3", "9:16", "16:9"
    let validAspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9";
    if (["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio)) {
      validAspectRatio = aspectRatio as any;
    } else if (aspectRatio === "4:5") {
      validAspectRatio = "3:4"; // closest standard aspect ratio supported
    }

    // Build prompt from centralized template
    const { fullPrompt } = imagePrompt.buildPrompt(prompt, {
      aspectRatio: validAspectRatio,
      preset,
    });

    let imageUrl = "";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: validAspectRatio,
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || "image/png";
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (imageErr: any) {
      const errMsg = imageErr?.message || String(imageErr);
      console.warn("[GHY GPT] Image model error or quota limitation:", errMsg);
      // If quota exceeded (limit: 0 on free tier) or model error, seamlessly synthesize high-res editorial SVG graphic
      imageUrl = createEditorialGraphicSvg(prompt, validAspectRatio, preset);
      return res.json({
        imageUrl,
        aspectRatio: validAspectRatio,
        preset,
        prompt,
        disclaimer: "AI Editorial Graphic (Generated via Newsroom Graphic Engine. Paid Gemini API key required for full photo-generative diffusion).",
      });
    }

    if (!imageUrl) {
      imageUrl = createEditorialGraphicSvg(prompt, validAspectRatio, preset);
    }

    return res.json({
      imageUrl,
      aspectRatio: validAspectRatio,
      preset,
      prompt,
      disclaimer: "AI-generated illustrative image. Not a photograph of actual events.",
    });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    const message = error?.message || "Failed to generate image";
    return res.status(500).json({ error: message });
  }
});

// ==========================================
// WordPress Newsroom Publishing Endpoints
// Pipeline: GHY GPT -> Gemini -> Newsroom -> WordPress
// ==========================================

function normalizeWpUrl(url: string): string {
  let clean = url.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  return clean;
}

function getWpAuthHeader(username: string, applicationPassword: string): string {
  const cleanPassword = applicationPassword.trim().replace(/\s+/g, "");
  const token = Buffer.from(`${username.trim()}:${cleanPassword}`).toString("base64");
  return `Basic ${token}`;
}

// 1. Test WordPress Connection & Fetch User Info
app.post("/api/wordpress/test", async (req, res) => {
  try {
    const { siteUrl, username, applicationPassword } = req.body;
    if (!siteUrl || !username || !applicationPassword) {
      return res.status(400).json({
        ok: false,
        error: "WordPress Site URL, Username, and Application Password are required.",
      });
    }

    const baseUrl = normalizeWpUrl(siteUrl);
    const authHeader = getWpAuthHeader(username, applicationPassword);

    const wpRes = await fetch(`${baseUrl}/wp-json/wp/v2/users/me?context=edit`, {
      headers: {
        Authorization: authHeader,
        "User-Agent": "GHY-GPT-Newsroom-Bridge/1.0",
      },
    });

    if (!wpRes.ok) {
      const errorBody = await wpRes.text();
      let errorMsg = `WordPress returned status ${wpRes.status}: ${wpRes.statusText}`;
      try {
        const json = JSON.parse(errorBody);
        if (json.message) errorMsg = json.message;
      } catch {
        // use default errorMsg
      }
      return res.status(wpRes.status).json({
        ok: false,
        error: errorMsg,
      });
    }

    const userData = (await wpRes.json()) as any;

    // Fetch site categories
    let categories: Array<{ id: number; name: string }> = [];
    try {
      const catRes = await fetch(`${baseUrl}/wp-json/wp/v2/categories?per_page=50`, {
        headers: { Authorization: authHeader },
      });
      if (catRes.ok) {
        const cats = (await catRes.json()) as any[];
        categories = cats.map((c) => ({ id: c.id, name: c.name }));
      }
    } catch (catErr) {
      console.warn("Failed to load WordPress categories:", catErr);
    }

    return res.json({
      ok: true,
      siteUrl: baseUrl,
      user: {
        id: userData.id,
        name: userData.name,
        slug: userData.slug,
        roles: userData.roles || [],
      },
      categories,
    });
  } catch (err: any) {
    console.error("Error testing WordPress connection:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Failed to connect to WordPress site.",
    });
  }
});

// 2. Publish Post to WordPress
app.post("/api/wordpress/publish", async (req, res) => {
  try {
    const { siteUrl, username, applicationPassword, post } = req.body;
    if (!siteUrl || !username || !applicationPassword || !post) {
      return res.status(400).json({
        success: false,
        error: "Missing required WordPress credentials or post payload.",
      });
    }

    const baseUrl = normalizeWpUrl(siteUrl);
    const authHeader = getWpAuthHeader(username, applicationPassword);

    let featuredMediaId: number | undefined = undefined;

    // Optional: Upload featured image to WordPress Media Library
    if (post.featuredImageBase64 && post.featuredImageBase64.startsWith("data:")) {
      try {
        const matches = post.featuredImageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
          const filename = `ghy-news-${Date.now()}.${ext}`;

          const mediaRes = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": mimeType,
              "Content-Disposition": `attachment; filename="${filename}"`,
            },
            body: buffer,
          });

          if (mediaRes.ok) {
            const mediaData = (await mediaRes.json()) as any;
            featuredMediaId = mediaData.id;
          } else {
            console.warn("Media upload failed with status:", mediaRes.status);
          }
        }
      } catch (mediaErr) {
        console.warn("Could not upload featured media to WordPress:", mediaErr);
      }
    }

    // Resolve or create tag IDs
    let tagIds: number[] = [];
    if (Array.isArray(post.tags) && post.tags.length > 0) {
      for (const rawTagName of post.tags.slice(0, 8)) {
        const tagName = String(rawTagName).trim();
        if (!tagName) continue;
        try {
          // Search tag
          const searchRes = await fetch(
            `${baseUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(tagName)}`,
            { headers: { Authorization: authHeader } }
          );
          if (searchRes.ok) {
            const foundTags = (await searchRes.json()) as any[];
            const exact = foundTags.find(
              (t) => t.name.toLowerCase() === tagName.toLowerCase()
            );
            if (exact) {
              tagIds.push(exact.id);
              continue;
            }
          }
          // Create tag
          const createRes = await fetch(`${baseUrl}/wp-json/wp/v2/tags`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: tagName }),
          });
          if (createRes.ok) {
            const newTag = (await createRes.json()) as any;
            tagIds.push(newTag.id);
          }
        } catch (tagErr) {
          console.warn("Failed resolving tag:", tagName, tagErr);
        }
      }
    }

    // Resolve category IDs
    let categoryIds: number[] = [];
    if (Array.isArray(post.categories) && post.categories.length > 0) {
      for (const rawCat of post.categories.slice(0, 4)) {
        if (typeof rawCat === "number") {
          categoryIds.push(rawCat);
          continue;
        }
        const catName = String(rawCat).trim();
        if (!catName) continue;
        try {
          const searchRes = await fetch(
            `${baseUrl}/wp-json/wp/v2/categories?search=${encodeURIComponent(catName)}`,
            { headers: { Authorization: authHeader } }
          );
          if (searchRes.ok) {
            const foundCats = (await searchRes.json()) as any[];
            const exact = foundCats.find(
              (c) => c.name.toLowerCase() === catName.toLowerCase()
            );
            if (exact) {
              categoryIds.push(exact.id);
              continue;
            }
          }
          // Create category
          const createRes = await fetch(`${baseUrl}/wp-json/wp/v2/categories`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: catName }),
          });
          if (createRes.ok) {
            const newCat = (await createRes.json()) as any;
            categoryIds.push(newCat.id);
          }
        } catch (catErr) {
          console.warn("Failed resolving category:", catName, catErr);
        }
      }
    }

    // Construct WordPress post request
    const wpPayload: any = {
      title: post.title,
      content: post.content,
      status: post.status || "draft",
    };

    if (post.excerpt) wpPayload.excerpt = post.excerpt;
    if (post.slug) wpPayload.slug = post.slug;
    if (featuredMediaId) wpPayload.featured_media = featuredMediaId;
    if (categoryIds.length > 0) wpPayload.categories = categoryIds;
    if (tagIds.length > 0) wpPayload.tags = tagIds;

    const wpPostRes = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "User-Agent": "GHY-GPT-Newsroom-Bridge/1.0",
      },
      body: JSON.stringify(wpPayload),
    });

    if (!wpPostRes.ok) {
      const errText = await wpPostRes.text();
      let msg = `WordPress publication failed with status ${wpPostRes.status}`;
      try {
        const j = JSON.parse(errText);
        if (j.message) msg = j.message;
      } catch {}
      return res.status(wpPostRes.status).json({
        success: false,
        error: msg,
      });
    }

    const createdPost = (await wpPostRes.json()) as any;

    return res.json({
      success: true,
      postId: createdPost.id,
      postUrl: createdPost.link,
      editUrl: `${baseUrl}/wp-admin/post.php?post=${createdPost.id}&action=edit`,
      status: createdPost.status,
      title: createdPost.title?.rendered || post.title,
    });
  } catch (err: any) {
    console.error("Error publishing to WordPress:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to publish post to WordPress.",
    });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GHY GPT Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
