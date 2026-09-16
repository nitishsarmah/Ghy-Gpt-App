import React, { useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Sparkles,
  X,
  FileText,
  AlertCircle,
  CornerDownLeft,
  PenTool,
  Languages,
  Heading,
  FileCheck,
  ListCollapse,
  Search,
  Share2,
  Image as ImageIcon,
  Loader2,
  Layers,
  Link2,
} from "lucide-react";
import { AttachedFile, NewsMode, NewsSources } from "../types";

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  currentMode: NewsMode;
  onSelectMode: (mode: NewsMode) => void;
  attachedFiles: AttachedFile[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  sources?: NewsSources;
  onOpenSources?: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  currentMode,
  onSelectMode,
  attachedFiles,
  setAttachedFiles,
  sources,
  onOpenSources,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUnicodePalette, setShowUnicodePalette] = useState(false);

  const hasPressRelease = Boolean(sources?.pressRelease.text.trim() || sources?.pressRelease.pdfData);
  const hasReporterNotes = Boolean(sources?.reporterNotes.text.trim());
  const hasAttachedImage = Boolean(sources?.attachedImage.data || sources?.attachedImage.caption);
  const hasSourceUrl = Boolean(sources?.sourceUrl.url.trim());
  const activeSourceCount = [hasPressRelease, hasReporterNotes, hasAttachedImage, hasSourceUrl].filter(Boolean).length;

  // Assamese Unicode characters helper for reporters typing on standard QWERTY keyboards
  const assameseChars = ["ৰ", "ৱ", "ড়", "ঢ়", "য়", "ৎ", "ং", "ঃ", "ঁ", "্"];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (input.trim() || attachedFiles.length > 0)) {
        onSend();
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              name: file.name,
              mimeType: file.type,
              size: file.size,
              data: reader.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        // Text / document file
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              name: file.name,
              mimeType: file.type || "text/plain",
              size: file.size,
              text: reader.result as string,
            },
          ]);
        };
        reader.readAsText(file);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const insertChar = (char: string) => {
    setInput(input + char);
    textareaRef.current?.focus();
  };

  const placeholderText: Record<NewsMode, string> = {
    general: "Ask GHY GPT anything, or enter wire facts for assistance...",
    news_writing: "Enter raw field notes, press release, or facts to write full news story...",
    translation: "Paste news copy to translate between Assamese, English, and Hindi...",
    rewrite: "Paste draft news copy to polish flow, active voice, and wire clarity...",
    proofread: "Paste news copy to eliminate typos, spelling, punctuation, and Unicode errors...",
    summary: "Paste article to produce 2-line summary, 5-point brief, and radio wire...",
    headline: "Paste news article to generate 5 factual headline options...",
    fact_check: "Paste news draft to audit against the 6 Mandatory Editorial Safeguards...",
    seo: "Paste news copy to generate full SEO suite (title, meta, slug, keywords)...",
    seo_title: "Paste news story or facts to generate 5 SEO headlines under 60 characters...",
    seo_meta: "Paste news story to generate 3 meta descriptions (140-160 characters)...",
    seo_slug: "Paste news headline or story to generate clean kebab-case URL slugs...",
    seo_tags: "Paste news story to generate focus keywords and CMS taxonomy tags...",
    social: "Paste news copy to create posts for Facebook, X/Twitter, and Instagram...",
    social_facebook: "Paste news copy to generate an authoritative Facebook news post...",
    social_x: "Paste news copy to generate breaking X/Twitter wire updates (<280 chars)...",
    social_instagram: "Paste news copy to generate an Instagram caption with takeaways & tags...",
    image_gen: "Describe the news illustration or editorial scene to generate...",
  };

  return (
    <div
      id="ghy-input-area"
      className="bg-white border-t border-slate-200 p-3 md:p-4 sticky bottom-0 z-20 shadow-lg"
    >
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Active Sources Strip (if any configured) */}
        {activeSourceCount > 0 && onOpenSources && (
          <div className="flex items-center justify-between bg-slate-900 text-slate-200 px-3 py-1.5 rounded-xl text-xs border border-slate-800 shadow-2xs">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <span className="text-[10px] uppercase font-bold text-rose-400 font-mono tracking-wider shrink-0 flex items-center gap-1">
                <Layers className="w-3 h-3 text-rose-400" />
                <span>SOURCES ({activeSourceCount}/4):</span>
              </span>
              {hasPressRelease && (
                <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-200 border border-slate-700 shrink-0">
                  <span>📄</span> {sources?.pressRelease.fileName || "Press Release"}
                </span>
              )}
              {hasReporterNotes && (
                <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-200 border border-slate-700 shrink-0">
                  <span>📝</span> Reporter Notes
                </span>
              )}
              {hasAttachedImage && (
                <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-200 border border-slate-700 shrink-0">
                  <span>🖼️</span> Attached Image
                </span>
              )}
              {hasSourceUrl && (
                <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-200 border border-slate-700 shrink-0">
                  <span>🔗</span> {sources?.sourceUrl.title ? sources.sourceUrl.title.slice(0, 20) + "..." : "URL"}
                </span>
              )}
            </div>
            <button
              type="button"
              id="btn-edit-active-sources"
              onClick={onOpenSources}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline shrink-0 ml-2 cursor-pointer"
            >
              Open Desk
            </button>
          </div>
        )}

        {/* Attached Files Strip */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg p-1 px-2 text-xs text-slate-700"
              >
                {file.mimeType.startsWith("image/") && file.data ? (
                  <img
                    src={file.data}
                    alt={file.name}
                    className="w-6 h-6 rounded object-cover"
                  />
                ) : (
                  <FileText className="w-4 h-4 text-slate-500" />
                )}
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-0.5 text-slate-400 hover:text-rose-600 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Container */}
        <div className="relative rounded-2xl border border-slate-300 bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10 shadow-xs transition-all">
          <textarea
            ref={textareaRef}
            id="news-prompt-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText[currentMode] || placeholderText.general}
            className="w-full px-4 pt-3 pb-12 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-hidden min-h-[72px] max-h-56 leading-relaxed"
          />

          {/* Bottom Toolbar inside the input card */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Left toolbar items */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* SOURCES Desk Trigger */}
              {onOpenSources && (
                <button
                  type="button"
                  id="btn-open-sources-desk"
                  onClick={onOpenSources}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-colors border shadow-2xs ${
                    activeSourceCount > 0
                      ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                  title="Open Sources Desk (Press Release, Reporter Notes, Attached Image, Source URL)"
                >
                  <Layers className="w-3.5 h-3.5 text-rose-600" />
                  <span>SOURCES</span>
                  {activeSourceCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-mono">
                      {activeSourceCount}
                    </span>
                  )}
                </button>
              )}

              {/* File / Image Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.txt,.doc,.docx,.pdf,.md,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              <button
                type="button"
                id="btn-upload-file"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Attach field notes, press release, document, or image"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Quick Image Generation Trigger */}
              <button
                type="button"
                id="btn-trigger-image-mode"
                onClick={() =>
                  onSelectMode(currentMode === "image_gen" ? "news_writing" : "image_gen")
                }
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  currentMode === "image_gen"
                    ? "bg-rose-50 text-rose-700 border border-rose-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Toggle AI Image Generation Mode"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Image Gen</span>
              </button>

              {/* Mode Selector Dropdown */}
              <div className="relative">
                <select
                  id="mode-selector-dropdown"
                  value={currentMode}
                  onChange={(e) => onSelectMode(e.target.value as NewsMode)}
                  className="bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden"
                >
                  <option value="general">Chat</option>

                  <optgroup label="Newsroom">
                    <option value="news_writing">Write News</option>
                    <option value="translation">Translate</option>
                    <option value="rewrite">Rewrite</option>
                    <option value="proofread">Proofread</option>
                    <option value="summary">Summarize</option>
                    <option value="headline">Headlines</option>
                  </optgroup>

                  <optgroup label="SEO">
                    <option value="seo_title">SEO Title</option>
                    <option value="seo_meta">Meta Description</option>
                    <option value="seo_slug">Slug</option>
                    <option value="seo_tags">Tags</option>
                    <option value="seo">All SEO Assets</option>
                  </optgroup>

                  <optgroup label="Social">
                    <option value="social_facebook">Facebook</option>
                    <option value="social_x">X</option>
                    <option value="social_instagram">Instagram</option>
                    <option value="social">All Social Desks</option>
                  </optgroup>

                  <optgroup label="Image Studio">
                    <option value="image_gen">AI Image Generation</option>
                  </optgroup>
                </select>
              </div>

              {/* Assamese Unicode Helper Toggle */}
              <button
                type="button"
                onClick={() => setShowUnicodePalette(!showUnicodePalette)}
                className={`hidden md:inline-flex items-center px-2 py-1 rounded-lg text-xs font-assamese border transition-colors ${
                  showUnicodePalette
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
                title="Assamese Unicode Quick Palette"
              >
                অসমীয়া কী
              </button>
            </div>

            {/* Right toolbar items: Send button */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="hidden md:inline text-[11px] text-slate-400">
                <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
                  Enter
                </kbd>{" "}
                to send
              </span>

              <button
                type="button"
                id="btn-send-message"
                disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                onClick={onSend}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-center hover:from-rose-500 hover:to-rose-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
                title="Send to GHY GPT"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Assamese Unicode Quick Palette (Foldable) */}
        {showUnicodePalette && (
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs">
            <span className="text-[11px] font-semibold text-amber-900 font-assamese mr-1">
              অসমীয়া বৰ্ণমালা সহায়িকা:
            </span>
            {assameseChars.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => insertChar(char)}
                className="w-7 h-7 bg-white hover:bg-amber-100 text-slate-800 font-assamese font-semibold rounded border border-amber-300 shadow-2xs flex items-center justify-center text-sm"
              >
                {char}
              </button>
            ))}
            <span className="text-[10px] text-amber-800/80 ml-auto hidden sm:inline">
              Click to insert into news copy
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
