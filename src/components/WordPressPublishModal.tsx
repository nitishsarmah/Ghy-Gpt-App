import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Download,
  Image as ImageIcon,
  Key,
  User,
  Layers,
  Sparkles,
  Newspaper,
  ArrowRight,
  RefreshCw,
  FileCode,
  Tag,
  FolderOpen,
} from "lucide-react";
import {
  parseNewsToWordPress,
  generateWordPressWxrXml,
  ParsedWordPressPost,
} from "../utils/wordpressParser";
import { WordPressConfig, WordPressPublishResult, GeneratedImageMetadata } from "../types";
import { buildApiUrl } from "../config/apiConfig";

interface WordPressPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawNewsContent: string;
  imageMetadata?: GeneratedImageMetadata;
  savedConfig?: WordPressConfig;
  onSaveConfig: (config: WordPressConfig) => void;
}

export const WordPressPublishModal: React.FC<WordPressPublishModalProps> = ({
  isOpen,
  onClose,
  rawNewsContent,
  imageMetadata,
  savedConfig,
  onSaveConfig,
}) => {
  // Post fields
  const [post, setPost] = useState<ParsedWordPressPost>({
    title: "",
    content: "",
    excerpt: "",
    slug: "",
    tags: [],
    categories: ["News"],
  });

  // WordPress credentials
  const [siteUrl, setSiteUrl] = useState(savedConfig?.siteUrl || "https://theguwahatinews.com");
  const [username, setUsername] = useState(savedConfig?.username || "");
  const [applicationPassword, setApplicationPassword] = useState(
    savedConfig?.applicationPassword || ""
  );
  const [postStatus, setPostStatus] = useState<"draft" | "publish" | "pending">(
    savedConfig?.defaultStatus || "draft"
  );
  const [includeFeaturedImage, setIncludeFeaturedImage] = useState(Boolean(imageMetadata?.imageUrl));

  // State
  const [activeTab, setActiveTab] = useState<"compose" | "gutenberg" | "settings">("compose");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    user?: any;
    categories?: Array<{ id: number; name: string }>;
    error?: string;
  } | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<WordPressPublishResult | null>(null);
  const [copiedGutenberg, setCopiedGutenberg] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  // Parse raw content when modal opens or content changes
  useEffect(() => {
    if (rawNewsContent) {
      const parsed = parseNewsToWordPress(rawNewsContent);
      setPost(parsed);
      setTagsInput(parsed.tags.join(", "));
    }
  }, [rawNewsContent, isOpen]);

  useEffect(() => {
    if (savedConfig) {
      if (savedConfig.siteUrl) setSiteUrl(savedConfig.siteUrl);
      if (savedConfig.username) setUsername(savedConfig.username);
      if (savedConfig.applicationPassword) setApplicationPassword(savedConfig.applicationPassword);
      if (savedConfig.defaultStatus) setPostStatus(savedConfig.defaultStatus);
    }
  }, [savedConfig]);

  if (!isOpen) return null;

  const handleSaveCredentials = () => {
    const updated: WordPressConfig = {
      siteUrl,
      username,
      applicationPassword,
      defaultStatus: postStatus,
    };
    onSaveConfig(updated);
  };

  const handleTestConnection = async () => {
    if (!siteUrl || !username || !applicationPassword) {
      setTestResult({
        ok: false,
        error: "Please provide Site URL, Username, and Application Password.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const url = buildApiUrl("/api/wordpress/test");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteUrl,
          username,
          applicationPassword,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.ok) {
        handleSaveCredentials();
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        error: err.message || "Could not reach WordPress test endpoint.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePublish = async () => {
    if (!siteUrl || !username || !applicationPassword) {
      setActiveTab("settings");
      setTestResult({
        ok: false,
        error: "Please enter your WordPress credentials before publishing.",
      });
      return;
    }

    setIsPublishing(true);
    setPublishResult(null);

    handleSaveCredentials();

    const parsedTags = tagsInput
      .split(/[,#]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      siteUrl,
      username,
      applicationPassword,
      post: {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        slug: post.slug,
        status: postStatus,
        categories: post.categories,
        tags: parsedTags,
        featuredImageBase64:
          includeFeaturedImage && imageMetadata?.imageUrl ? imageMetadata.imageUrl : undefined,
      },
    };

    try {
      const url = buildApiUrl("/api/wordpress/publish");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setPublishResult(data);
    } catch (err: any) {
      setPublishResult({
        success: false,
        error: err.message || "Network error while publishing to WordPress.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyGutenberg = () => {
    navigator.clipboard.writeText(post.content);
    setCopiedGutenberg(true);
    setTimeout(() => setCopiedGutenberg(false), 2000);
  };

  const handleDownloadWxr = () => {
    const xml = generateWordPressWxrXml(post);
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ghy-wordpress-${post.slug || "post"}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleCategory = (cat: string) => {
    if (post.categories.includes(cat)) {
      setPost({
        ...post,
        categories: post.categories.filter((c) => c !== cat),
      });
    } else {
      setPost({
        ...post,
        categories: [...post.categories, cat],
      });
    }
  };

  const addCustomCategory = () => {
    if (customCategory.trim() && !post.categories.includes(customCategory.trim())) {
      setPost({
        ...post,
        categories: [...post.categories, customCategory.trim()],
      });
      setCustomCategory("");
    }
  };

  const standardCategories = [
    "News",
    "Breaking News",
    "Guwahati",
    "Assam",
    "Northeast Wire",
    "Politics",
    "Civic & Infra",
    "Business",
    "Culture",
  ];

  return (
    <div
      id="wordpress-publish-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6"
    >
      <div
        id="wordpress-publish-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Pipeline Visual Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-4 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  WordPress Publishing Pipeline
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 border border-sky-400/40 text-sky-300">
                  REST API v2
                </span>
              </div>
              {/* 4-Stage Flow Pipeline */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1 font-medium">
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  <Newspaper className="w-3 h-3 text-amber-400" /> GHY GPT
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-rose-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-400" /> Gemini
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-400" /> Newsroom
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-sky-300 font-bold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-sky-400" /> WordPress
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Tab navigation */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab("compose")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === "compose"
                    ? "bg-sky-600 text-white font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Article Review
              </button>
              <button
                onClick={() => setActiveTab("gutenberg")}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeTab === "gutenberg"
                    ? "bg-sky-600 text-white font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <FileCode className="w-3 h-3" /> Gutenberg Blocks
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeTab === "settings"
                    ? "bg-sky-600 text-white font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Key className="w-3 h-3" /> WP Credentials
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Publication Success Banner */}
          {publishResult && publishResult.success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Story Published to WordPress Successfully!</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  Status: {publishResult.status}
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                <strong>Post ID:</strong> #{publishResult.postId} &bull; &ldquo;{publishResult.title}&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {publishResult.postUrl && (
                  <a
                    href={publishResult.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Story on Site
                  </a>
                )}
                {publishResult.editUrl && (
                  <a
                    href={publishResult.editUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Open in WP Admin Editor
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Publication Error Banner */}
          {publishResult && !publishResult.success && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">WordPress Publishing Failed</div>
                <p className="text-rose-800">{publishResult.error}</p>
                <p className="text-[11px] text-rose-600">
                  Check your credentials in the &ldquo;WP Credentials&rdquo; tab or verify your WordPress Application Password permissions.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: COMPOSE / EDIT ARTICLE */}
          {activeTab === "compose" && (
            <div className="space-y-4 text-xs">
              {/* Post Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Headline / Title</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {post.title.length} characters
                  </span>
                </label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-sky-500"
                  placeholder="Enter news headline..."
                />
              </div>

              {/* Slug and Excerpt Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Canonical URL Slug</label>
                  <input
                    type="text"
                    value={post.slug}
                    onChange={(e) => setPost({ ...post, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:border-sky-500"
                    placeholder="kebab-case-url-slug"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center justify-between">
                    <span>Excerpt / Meta Description</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {post.excerpt.length} chars (140-160 optimal)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={post.excerpt}
                    onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-sky-500"
                    placeholder="Short summary for Google News and social cards..."
                  />
                </div>
              </div>

              {/* Featured Image Row if available */}
              {imageMetadata && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={imageMetadata.imageUrl}
                      alt={imageMetadata.prompt}
                      referrerPolicy="no-referrer"
                      className="w-16 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                        <span>AI Editorial Graphic Available</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {imageMetadata.prompt}
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={includeFeaturedImage}
                      onChange={(e) => setIncludeFeaturedImage(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>Attach as Featured Media in WP</span>
                  </label>
                </div>
              )}

              {/* Categories Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>WordPress Categories</span>
                </label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {standardCategories.map((cat) => {
                    const isSelected = post.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                          isSelected
                            ? "bg-sky-50 border-sky-300 text-sky-700 font-semibold"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {cat}
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-1 ml-1">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCategory())}
                      placeholder="Add custom..."
                      className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs w-28 focus:outline-hidden focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={addCustomCategory}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>WordPress Tags (Comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-sky-500"
                  placeholder="Guwahati, Assam, Smart City, Infrastructure"
                />
              </div>

              {/* Post Status & Quick Settings Bar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700">Publish As:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="postStatus"
                      value="draft"
                      checked={postStatus === "draft"}
                      onChange={() => setPostStatus("draft")}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-medium text-slate-800">Draft (Safe)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="postStatus"
                      value="pending"
                      checked={postStatus === "pending"}
                      onChange={() => setPostStatus("pending")}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span className="font-medium text-slate-800">Pending Review</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="postStatus"
                      value="publish"
                      checked={postStatus === "publish"}
                      onChange={() => setPostStatus("publish")}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-bold text-rose-700">Publish Live</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Target:</span>
                  <span className="font-mono font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {siteUrl || "No site configured"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GUTENBERG BLOCKS & HTML EXPORT */}
          {activeTab === "gutenberg" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">WordPress Gutenberg Block Code</div>
                  <p className="text-[11px] text-slate-500">
                    Copy and paste directly into the WordPress Block Editor (Gutenberg) canvas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyGutenberg}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
                  >
                    {copiedGutenberg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGutenberg ? "Copied Gutenberg Blocks!" : "Copy Block HTML"}</span>
                  </button>
                  <button
                    onClick={handleDownloadWxr}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
                    title="Export standard WordPress WXR XML for Tools > Import"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export XML (WXR)</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={post.content}
                  className="w-full h-80 font-mono text-[11px] p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 focus:outline-hidden resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: WORDPRESS CREDENTIALS & SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sky-900">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span>WordPress REST API v2 Authentication</span>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  GHY GPT connects directly to your WordPress installation using standard Application Passwords. No third-party plugins required.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">WordPress Site URL</label>
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:border-sky-500"
                    placeholder="https://theguwahatinews.com"
                  />
                  <p className="text-[10px] text-slate-400">
                    Your WordPress homepage address (e.g., https://yoursite.com).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>WordPress Username</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
                      placeholder="e.g. editor or admin"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      <span>Application Password</span>
                    </label>
                    <input
                      type="password"
                      value={applicationPassword}
                      onChange={(e) => setApplicationPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:border-sky-500"
                      placeholder="xxxx xxxx xxxx xxxx"
                    />
                  </div>
                </div>

                {/* How to create application password guide */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-600">
                  <div className="font-semibold text-slate-800">
                    How to generate an Application Password in WordPress:
                  </div>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1">
                    <li>Log into your WordPress Admin (`/wp-admin`)</li>
                    <li>Navigate to <strong>Users &gt; Profile</strong></li>
                    <li>Scroll down to the <strong>Application Passwords</strong> section</li>
                    <li>Enter Application Name: &ldquo;<strong>GHY GPT Newsroom</strong>&rdquo;</li>
                    <li>Click <strong>Add New Application Password</strong> and copy the 16-character key here</li>
                  </ol>
                </div>

                {/* Test Connection Button & Status */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                    <span>{isTesting ? "Testing Connection..." : "Test WordPress Connection"}</span>
                  </button>

                  {testResult && testResult.ok && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Connected! User: <strong>{testResult.user?.name}</strong> ({testResult.user?.roles?.join(", ")})
                      </span>
                    </div>
                  )}

                  {testResult && !testResult.ok && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{testResult.error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Ready for WordPress CMS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyGutenberg}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedGutenberg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedGutenberg ? "Copied!" : "Copy Gutenberg HTML"}</span>
            </button>

            <button
              type="button"
              id="btn-publish-to-wordpress-final"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Send className={`w-3.5 h-3.5 ${isPublishing ? "animate-spin" : ""}`} />
              <span>
                {isPublishing
                  ? "Publishing to WordPress..."
                  : postStatus === "publish"
                  ? "Publish Live to WordPress"
                  : "Save Draft to WordPress"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
