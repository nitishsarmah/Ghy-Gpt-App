import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  RotateCcw,
  Download,
  FileText,
  Sparkles,
  User,
  AlertCircle,
  ExternalLink,
  ZoomIn,
  X,
  Newspaper,
  Languages,
  Globe,
} from "lucide-react";
import { ChatMessage, NewsMode, GeneratedImageMetadata } from "../types";

interface MessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  onQuickTranslate?: (text: string, targetLang: "as" | "hi" | "en") => void;
  onPublishToWordPress?: (content: string, imageMetadata?: GeneratedImageMetadata) => void;
  isLatestAssistantMessage?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onRegenerate,
  onQuickTranslate,
  onPublishToWordPress,
  isLatestAssistantMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const isUser = message.role === "user";

  const handleCopy = () => {
    const textToCopy = message.content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ghy-news-report-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Word count & char count calculation
  const words = message.content.trim() ? message.content.trim().split(/\s+/).length : 0;
  const chars = message.content.length;

  return (
    <div
      id={`message-${message.id}`}
      className={`py-6 px-4 md:px-8 border-b border-slate-100 transition-colors ${
        isUser ? "bg-white" : "bg-slate-50/70"
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-3 md:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-xs font-bold text-xs">
              <Newspaper className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row with role name & time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {isUser ? "Reporter / Editor" : "GHY GPT News Desk"}
              </span>
              {message.mode && (
                <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded">
                  {message.mode.replace("_", " ")}
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* AI message stats */}
            {!isUser && !message.error && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
                <span>{words} words</span>
                <span>•</span>
                <span>{chars} chars</span>
              </div>
            )}
          </div>

          {/* Attached Files (User message) */}
          {message.attachedFiles && message.attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 my-2">
              {message.attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg p-1.5 pr-3 text-xs text-slate-700"
                >
                  {file.mimeType.startsWith("image/") && file.data ? (
                    <img
                      src={file.data}
                      alt={file.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div className="truncate max-w-[180px]">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Image Generation Output */}
          {message.imageMetadata && (
            <div className="my-3 space-y-2">
              <div className="relative group max-w-lg rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-sm">
                <img
                  src={message.imageMetadata.imageUrl}
                  alt={message.imageMetadata.prompt}
                  referrerPolicy="no-referrer"
                  className="w-full object-contain max-h-[420px] bg-slate-900"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-sm"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <a
                    href={message.imageMetadata.imageUrl}
                    download={`ghy-news-illustration-${Date.now()}.png`}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-sm"
                    title="Download high-res image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Mandatory Ethical Newsroom Disclaimer */}
              <div className="max-w-lg flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-semibold">Ethical Newsroom Label: </span>
                  <span>{message.imageMetadata.disclaimer}</span>
                  <div className="text-[10px] text-amber-700/80 mt-0.5">
                    Aspect ratio: {message.imageMetadata.aspectRatio} | Preset: {message.imageMetadata.preset}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Text Content */}
          {message.error ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold">Error processing newsroom request</p>
                <p className="mt-0.5 text-rose-600/90">{message.content}</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm md:prose-base max-w-none text-slate-800 leading-relaxed break-words font-sans selection:bg-rose-100 selection:text-rose-900">
              <div className="markdown-body">
                <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
              </div>
            </div>
          )}

          {/* Action Bar for AI Response */}
          {!isUser && !message.error && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-slate-200/60 text-xs">
              {/* Copy Button */}
              <button
                id={`btn-copy-${message.id}`}
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 transition-colors"
                title="Copy clean news report"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Publish to WordPress Button */}
              {onPublishToWordPress && (
                <button
                  id={`btn-wordpress-${message.id}`}
                  onClick={() => onPublishToWordPress(message.content, message.imageMetadata)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/80 border border-sky-200/80 font-semibold shadow-2xs transition-colors"
                  title="Open WordPress Publishing Desk (GHY GPT → Gemini → Newsroom → WordPress)"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  <span>WordPress</span>
                </button>
              )}

              {/* Download Markdown */}
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 transition-colors"
                title="Download as .md file for CMS"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export (.md)</span>
              </button>

              {/* Regenerate Button */}
              {onRegenerate && isLatestAssistantMessage && (
                <button
                  id="btn-regenerate-response"
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 transition-colors"
                  title="Regenerate this wire response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}

              {/* Quick Translate Shortcuts */}
              {onQuickTranslate && (
                <div className="hidden sm:flex items-center gap-1 ml-auto">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Languages className="w-3 h-3" /> Quick wire:
                  </span>
                  <button
                    onClick={() => onQuickTranslate(message.content, "as")}
                    className="px-2 py-0.5 text-[11px] bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 font-assamese"
                    title="Translate to Assamese"
                  >
                    অসমীয়া
                  </button>
                  <button
                    onClick={() => onQuickTranslate(message.content, "hi")}
                    className="px-2 py-0.5 text-[11px] bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 font-hindi"
                    title="Translate to Hindi"
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => onQuickTranslate(message.content, "en")}
                    className="px-2 py-0.5 text-[11px] bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200"
                    title="Translate to English"
                  >
                    English
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showImageModal && message.imageMetadata && (
        <div
          id="image-zoom-modal"
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={message.imageMetadata.imageUrl}
              alt={message.imageMetadata.prompt}
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-lg"
            />
            <div className="p-3 text-white text-xs flex items-center justify-between">
              <span>{message.imageMetadata.prompt}</span>
              <a
                href={message.imageMetadata.imageUrl}
                download="ghy-illustration.png"
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded text-white flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
