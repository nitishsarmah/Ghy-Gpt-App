import React from "react";
import {
  Menu,
  Trash2,
  Settings,
  Sparkles,
  PenTool,
  Languages,
  Heading,
  FileCheck,
  CheckCheck,
  ListCollapse,
  Search,
  Share2,
  Newspaper,
  BookOpen,
  Link as LinkIcon,
  Tag,
  AtSign,
  FileText,
  Globe,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { NewsMode } from "../types";

interface HeaderProps {
  currentMode: NewsMode;
  onSelectMode: (mode: NewsMode) => void;
  onOpenMobileMenu: () => void;
  onClearConversation: () => void;
  onOpenSettings: () => void;
  onOpenWordPress?: () => void;
  onOpenSources?: () => void;
  activeSourcesCount?: number;
  hasMessages: boolean;
  totalWords: number;
}

const MODE_METADATA: Record<
  NewsMode,
  { label: string; icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  general: {
    label: "Chat",
    icon: Newspaper,
    description: "Multi-purpose newsroom intelligence, fact checks, & desk queries",
  },
  news_writing: {
    label: "Write News",
    icon: PenTool,
    description: "Transform raw notes into inverted-pyramid wire reports with SEO assets",
  },
  translation: {
    label: "Translate",
    icon: Languages,
    description: "Factual news wire translation across Assamese, English, & Hindi",
  },
  rewrite: {
    label: "Rewrite",
    icon: FileCheck,
    description: "Polish grammar, readability, and wire flow while preserving 100% factual integrity",
  },
  proofread: {
    label: "Proofread",
    icon: CheckCheck,
    description: "Copy desk proofreader for typos, spelling, punctuation, and Unicode script",
  },
  summary: {
    label: "Summarize",
    icon: ListCollapse,
    description: "2-line digest, 5-point key takeaways, and short 70-word news briefs",
  },
  headline: {
    label: "Headlines",
    icon: Heading,
    description: "Generate 5 factual headline variations: Breaking, SEO, Short, Social",
  },
  fact_check: {
    label: "Fact-Check Desk",
    icon: ShieldAlert,
    description: "Audit news copy strictly against the 6 Mandatory Newsroom Safeguards",
  },
  seo: {
    label: "SEO Suite",
    icon: Search,
    description: "Google News titles, meta descriptions, clean URL slugs, and focus tags",
  },
  seo_title: {
    label: "SEO Title",
    icon: Heading,
    description: "Generate 5 high-CTR, search-optimized headlines under 60 characters",
  },
  seo_meta: {
    label: "Meta Description",
    icon: FileText,
    description: "High-CTR search meta descriptions strictly between 140 and 160 characters",
  },
  seo_slug: {
    label: "Slug",
    icon: LinkIcon,
    description: "Clean kebab-case canonical URL slugs optimized for crawlability and search",
  },
  seo_tags: {
    label: "Tags",
    icon: Tag,
    description: "Primary focus keywords, long-tail search queries, and CMS taxonomy tags",
  },
  social: {
    label: "Social Media",
    icon: Share2,
    description: "Instant, verified posts for Facebook, X/Twitter, and Instagram newsrooms",
  },
  social_facebook: {
    label: "Facebook",
    icon: Share2,
    description: "Authoritative Facebook news post with summary, quote, link, and tags",
  },
  social_x: {
    label: "X",
    icon: AtSign,
    description: "Breaking news updates under 280 characters with wire hashtags and threads",
  },
  social_instagram: {
    label: "Instagram",
    icon: Share2,
    description: "Structured Instagram caption with headline hook, key takeaways, and hashtags",
  },
  image_gen: {
    label: "AI Image Generation",
    icon: Sparkles,
    description: "Editorial illustrations & conceptual news graphics via Google AI",
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenMobileMenu,
  onClearConversation,
  onOpenSettings,
  onOpenWordPress,
  onOpenSources,
  activeSourcesCount = 0,
  hasMessages,
  totalWords,
}) => {
  const current = MODE_METADATA[currentMode] || MODE_METADATA.general;
  const Icon = current.icon;

  return (
    <header
      id="ghy-main-header"
      className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs"
    >
      {/* Left side: Mobile burger + active mode badge */}
      <div className="flex items-center gap-3">
        <button
          id="btn-mobile-sidebar-toggle"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/80">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                {current.label}
              </h1>
              <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                GHY GPT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block leading-none truncate max-w-md">
              {current.description}
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Story stats & Controls */}
      <div className="flex items-center gap-2">
        {hasMessages && totalWords > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong className="font-semibold text-slate-700">{totalWords}</strong> words
            </span>
            <span className="text-slate-300">•</span>
            <span>
              ~{Math.max(1, Math.ceil(totalWords / 200))} min read
            </span>
          </div>
        )}

        {/* SOURCES Desk Launch Button */}
        {onOpenSources && (
          <button
            id="btn-header-sources"
            onClick={onOpenSources}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors shadow-2xs border cursor-pointer ${
              activeSourcesCount > 0
                ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-bold"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
            title="Open Sources Desk (Press Release, Reporter Notes, Attached Image, Source URL)"
          >
            <Layers className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">SOURCES</span>
            {activeSourcesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-mono">
                {activeSourcesCount}
              </span>
            )}
          </button>
        )}

        {/* WordPress Publishing Quick Launch */}
        {onOpenWordPress && (
          <button
            id="btn-header-wordpress"
            onClick={onOpenWordPress}
            className="flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-lg font-semibold transition-colors shadow-2xs cursor-pointer"
            title="Publish or draft current story to WordPress"
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">WordPress</span>
          </button>
        )}

        {hasMessages && (
          <button
            id="btn-clear-conversation"
            onClick={onClearConversation}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors"
            title="Clear current story messages"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Story</span>
          </button>
        )}

        <button
          id="btn-header-settings"
          onClick={onOpenSettings}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Newsroom Preferences"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
