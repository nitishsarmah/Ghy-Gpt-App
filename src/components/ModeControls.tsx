import React from "react";
import {
  NewsLanguage,
  NewsMode,
  NewsWritingOptions,
  TranslationOptions,
  ImageGenOptions,
} from "../types";
import {
  Globe,
  Sliders,
  Type,
  FileText,
  Sparkles,
  Layers,
  Info,
  ArrowRightLeft,
  CheckSquare,
  Square,
} from "lucide-react";

interface ModeControlsProps {
  mode: NewsMode;
  newsWritingOptions: NewsWritingOptions;
  setNewsWritingOptions: React.Dispatch<React.SetStateAction<NewsWritingOptions>>;
  translationOptions: TranslationOptions;
  setTranslationOptions: React.Dispatch<React.SetStateAction<TranslationOptions>>;
  imageGenOptions: ImageGenOptions;
  setImageGenOptions: React.Dispatch<React.SetStateAction<ImageGenOptions>>;
}

export const ModeControls: React.FC<ModeControlsProps> = ({
  mode,
  newsWritingOptions,
  setNewsWritingOptions,
  translationOptions,
  setTranslationOptions,
  imageGenOptions,
  setImageGenOptions,
}) => {
  if (mode === "general") {
    return null;
  }

  return (
    <div
      id="mode-controls-bar"
      className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs text-slate-700 transition-all"
    >
      {/* 1. NEWS WRITING MODE CONTROLS */}
      {mode === "news_writing" && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Selection */}
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Language:</span>
            <select
              value={newsWritingOptions.language}
              onChange={(e) =>
                setNewsWritingOptions((prev) => ({
                  ...prev,
                  language: e.target.value as NewsLanguage,
                }))
              }
              className="bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:outline-hidden focus:border-rose-500"
            >
              <option value="en">English (Wire)</option>
              <option value="as">Assamese (অসমীয়া)</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>

          {/* Length */}
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Length:</span>
            <div className="inline-flex rounded-md shadow-2xs border border-slate-300 bg-white overflow-hidden">
              {(["short", "medium", "full"] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() =>
                    setNewsWritingOptions((prev) => ({ ...prev, length: len }))
                  }
                  className={`px-2 py-0.5 capitalize transition-colors ${
                    newsWritingOptions.length === len
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Style:</span>
            <select
              value={newsWritingOptions.style}
              onChange={(e) =>
                setNewsWritingOptions((prev) => ({
                  ...prev,
                  style: e.target.value as any,
                }))
              }
              className="bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:outline-hidden focus:border-rose-500"
            >
              <option value="breaking">Breaking News</option>
              <option value="standard">Standard News</option>
              <option value="detailed">Detailed Report</option>
            </select>
          </div>

          {/* Tone */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Tone:</span>
            <div className="inline-flex rounded-md shadow-2xs border border-slate-300 bg-white overflow-hidden">
              {(["neutral", "formal"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setNewsWritingOptions((prev) => ({ ...prev, tone: t }))
                  }
                  className={`px-2 py-0.5 capitalize transition-colors ${
                    newsWritingOptions.tone === t
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Assets */}
          <div className="flex items-center gap-2 border-l border-slate-300 pl-3">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newsWritingOptions.includeSeo}
                onChange={(e) =>
                  setNewsWritingOptions((prev) => ({
                    ...prev,
                    includeSeo: e.target.checked,
                  }))
                }
                className="rounded border-slate-300 text-rose-600 focus:ring-0"
              />
              <span>SEO Title & Meta</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newsWritingOptions.includeSlug}
                onChange={(e) =>
                  setNewsWritingOptions((prev) => ({
                    ...prev,
                    includeSlug: e.target.checked,
                  }))
                }
                className="rounded border-slate-300 text-rose-600 focus:ring-0"
              />
              <span>URL Slug</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newsWritingOptions.includeTags}
                onChange={(e) =>
                  setNewsWritingOptions((prev) => ({
                    ...prev,
                    includeTags: e.target.checked,
                  }))
                }
                className="rounded border-slate-300 text-rose-600 focus:ring-0"
              />
              <span>Tags</span>
            </label>
          </div>
        </div>
      )}

      {/* 2. TRANSLATION MODE CONTROLS */}
      {mode === "translation" && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Source:</span>
            <select
              value={translationOptions.sourceLanguage}
              onChange={(e) =>
                setTranslationOptions((prev) => ({
                  ...prev,
                  sourceLanguage: e.target.value as any,
                }))
              }
              className="bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800"
            >
              <option value="auto">Auto-Detect</option>
              <option value="en">English</option>
              <option value="as">Assamese (অসমীয়া)</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              if (translationOptions.sourceLanguage !== "auto") {
                const currentSrc = translationOptions.sourceLanguage;
                const currentTgt = translationOptions.targetLanguage;
                setTranslationOptions((prev) => ({
                  ...prev,
                  sourceLanguage: currentTgt,
                  targetLanguage: currentSrc as NewsLanguage,
                }));
              }
            }}
            className="p-1 text-slate-500 hover:text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-100"
            title="Swap languages"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Target:</span>
            <select
              value={translationOptions.targetLanguage}
              onChange={(e) =>
                setTranslationOptions((prev) => ({
                  ...prev,
                  targetLanguage: e.target.value as NewsLanguage,
                }))
              }
              className="bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800"
            >
              <option value="as">Assamese (অসমীয়া)</option>
              <option value="en">English (Wire)</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer ml-auto border-l border-slate-300 pl-3 select-none">
            <input
              type="checkbox"
              checked={translationOptions.newsStyle}
              onChange={(e) =>
                setTranslationOptions((prev) => ({
                  ...prev,
                  newsStyle: e.target.checked,
                }))
              }
              className="rounded border-slate-300 text-rose-600 focus:ring-0"
            />
            <span className="font-medium text-slate-700">News Wire Style Translation</span>
            <span className="text-[10px] text-slate-400 font-mono">(Preserves official terminology)</span>
          </label>
        </div>
      )}

      {/* 3. IMAGE GENERATION MODE CONTROLS */}
      {mode === "image_gen" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Aspect Ratio */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Aspect Ratio:</span>
              <div className="inline-flex rounded-md shadow-2xs border border-slate-300 bg-white overflow-hidden">
                {(["16:9", "1:1", "4:5", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() =>
                      setImageGenOptions((prev) => ({ ...prev, aspectRatio: ratio }))
                    }
                    className={`px-2 py-0.5 transition-colors ${
                      imageGenOptions.aspectRatio === ratio
                        ? "bg-slate-800 text-white font-semibold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {ratio}
                    {ratio === "16:9" && " (Hero)"}
                    {ratio === "1:1" && " (Square)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Editorial Preset:</span>
              <select
                value={imageGenOptions.preset}
                onChange={(e) =>
                  setImageGenOptions((prev) => ({
                    ...prev,
                    preset: e.target.value as any,
                  }))
                }
                className="bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800"
              >
                <option value="news_illustration">News illustration</option>
                <option value="realistic_editorial">Realistic editorial illustration</option>
                <option value="breaking_news">Breaking news thumbnail</option>
                <option value="documentary">Documentary style</option>
                <option value="minimal_graphic">Minimal graphic</option>
              </select>
            </div>
          </div>

          {/* Ethical Disclaimer Label */}
          <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>AI images are strictly illustrative to prevent misinformation.</span>
          </div>
        </div>
      )}

      {/* 4. HEADLINE / SUMMARY / SEO / REWRITE / SOCIAL Quick hints */}
      {mode === "headline" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Produces 5 verified headline variations: <strong>Breaking</strong>, <strong>Standard</strong>, <strong>SEO (55 chars)</strong>, <strong>Short Mobile</strong>, and <strong>Social</strong>.
          </span>
          <span className="text-[11px] text-slate-400">Strictly no fabricated details</span>
        </div>
      )}

      {mode === "rewrite" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            News Rewrite: Elevate flow, rhythm, and active sentence structure while preserving 100% of original facts, quotes, and names.
          </span>
          <span className="text-[11px] text-slate-400">Includes editorial adjustments log</span>
        </div>
      )}

      {mode === "proofread" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Copy Desk Proofreading: Eliminate typos, spelling, punctuation, and Unicode script errors with absolute fidelity to facts.
          </span>
          <span className="text-[11px] text-slate-400">Includes corrections log</span>
        </div>
      )}

      {mode === "summary" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Generating 3-tier news summary: <strong>2-Line Executive</strong>, <strong>5-Point Key Takeaways</strong>, and <strong>Radio/Wire Brief (75w)</strong>.
          </span>
        </div>
      )}

      {mode === "fact_check" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Editorial Fact-Check Desk: Deep audit of Dates, Names, Unattributed Numbers, Quotes, Locations, and Allegations.
          </span>
          <span className="text-[11px] text-rose-600 font-semibold">6 Mandatory Newsroom Safeguards</span>
        </div>
      )}

      {mode === "seo" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Full SEO Suite: Canonical slug, Meta description (140-160 chars), Google News keywords, and CMS topic tags.
          </span>
        </div>
      )}

      {mode === "seo_title" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            SEO Title Desk: Generates 5 entity-front-loaded headlines under 60 characters with character counts.
          </span>
          <span className="text-[11px] text-slate-400">Google SERP Safe (&lt;60 chars)</span>
        </div>
      )}

      {mode === "seo_meta" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Meta Description Desk: 3 active-voice, click-through-optimized snippets strictly between 140 and 160 characters.
          </span>
          <span className="text-[11px] text-slate-400">140-160 char target</span>
        </div>
      )}

      {mode === "seo_slug" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            URL Slug Desk: Generates clean, search-friendly kebab-case canonical slugs (Primary, Short, Keyword-Rich).
          </span>
          <span className="text-[11px] text-slate-400">Clean URL taxonomy</span>
        </div>
      )}

      {mode === "seo_tags" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Tags &amp; Keywords Desk: Primary search query, long-tail variations, CMS tags, and news syndication hashtags.
          </span>
        </div>
      )}

      {mode === "social" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Multi-Platform Social Suite: Facebook News Post, X/Twitter breaking dispatch (&lt;280 chars), and Instagram caption.
          </span>
        </div>
      )}

      {mode === "social_facebook" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Facebook News Desk: Authoritative post with lead hook, 2-paragraph context, link placeholder, and news tags.
          </span>
        </div>
      )}

      {mode === "social_x" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            X / Twitter Wire Desk: Breaking news update under 280 characters, alternative angle, and 3-part thread.
          </span>
          <span className="text-[11px] text-slate-400">&lt;280 chars</span>
        </div>
      )}

      {mode === "social_instagram" && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            Instagram News Desk: Strong visual headline hook, 3-4 bullet takeaways, CTA, and news hashtag cloud.
          </span>
        </div>
      )}
    </div>
  );
};
