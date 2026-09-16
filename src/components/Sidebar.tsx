import React, { useState } from "react";
import {
  PenTool,
  Languages,
  Heading,
  FileCheck,
  CheckCheck,
  ListCollapse,
  Search,
  Sparkles,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  Share2,
  Newspaper,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon,
  Tag,
  AtSign,
  FileText,
  Layers,
  Globe,
  ShieldAlert,
} from "lucide-react";
import { Conversation, NewsMode } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  currentMode: NewsMode;
  onSelectChat: (id: string) => void;
  onNewChat: (mode?: NewsMode) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onSelectMode: (mode: NewsMode) => void;
  onOpenSettings: () => void;
  onOpenWordPress: () => void;
  onOpenSources?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface TreeChildItem {
  id: NewsMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

interface TreeSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: TreeChildItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeChatId,
  currentMode,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onSelectMode,
  onOpenSettings,
  onOpenWordPress,
  onOpenSources,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // Collapsible sections state (all open by default for immediate discoverability)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    newsroom: true,
    seo: true,
    social: true,
    image_studio: true,
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Structured according to requested tree hierarchy
  const treeSections: TreeSection[] = [
    {
      id: "newsroom",
      label: "Newsroom",
      icon: Newspaper,
      children: [
        { id: "news_writing", label: "Write News", icon: PenTool },
        { id: "translation", label: "Translate", icon: Languages, tag: "EN/AS/HI" },
        { id: "rewrite", label: "Rewrite", icon: FileCheck },
        { id: "proofread", label: "Proofread", icon: CheckCheck },
        { id: "summary", label: "Summarize", icon: ListCollapse },
        { id: "headline", label: "Headlines", icon: Heading },
        { id: "fact_check", label: "Fact-Check Desk", icon: ShieldAlert, tag: "Safeguards" },
      ],
    },
    {
      id: "seo",
      label: "SEO",
      icon: Search,
      children: [
        { id: "seo_title", label: "SEO Title", icon: Heading },
        { id: "seo_meta", label: "Meta Description", icon: FileText },
        { id: "seo_slug", label: "Slug", icon: LinkIcon },
        { id: "seo_tags", label: "Tags", icon: Tag },
      ],
    },
    {
      id: "social",
      label: "Social",
      icon: Share2,
      children: [
        { id: "social_facebook", label: "Facebook", icon: Share2 },
        { id: "social_x", label: "X", icon: AtSign },
        { id: "social_instagram", label: "Instagram", icon: Share2 },
      ],
    },
    {
      id: "image_studio",
      label: "Image Studio",
      icon: Sparkles,
      children: [
        { id: "image_gen", label: "AI Image Generation", icon: Sparkles, tag: "Visuals" },
      ],
    },
  ];

  const handleStartRename = (convo: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(convo.id);
    setEditTitle(convo.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="ghy-sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800/90 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div
            onClick={() => onNewChat("general")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-md shadow-rose-950/40 text-white font-bold text-lg tracking-wider">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  GHY GPT
                </span>
                <span className="text-[9px] uppercase font-semibold tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-sm">
                  Newsroom
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Digital Desk Intelligence</p>
            </div>
          </div>
          <button
            id="close-sidebar-mobile"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary New Story / Chat Action */}
        <div className="p-3 pb-1">
          <button
            id="btn-new-chat"
            onClick={() => {
              onNewChat("general");
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium text-xs shadow-sm hover:shadow transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Story / Chat</span>
          </button>
        </div>

        {/* 4-Stage Publishing Pipeline Bar */}
        <div className="mx-3 my-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px]">
          <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">Publishing Pipeline</span>
            <span className="text-[9px] text-sky-400 font-mono">WP REST v2</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 font-medium text-[10px]">
            <span className="text-amber-300 font-bold">GHY GPT</span>
            <span className="text-slate-600 font-mono">→</span>
            <span className="text-rose-300 font-bold">Gemini</span>
            <span className="text-slate-600 font-mono">→</span>
            <span className="text-emerald-300 font-bold">Newsroom</span>
            <span className="text-slate-600 font-mono">→</span>
            <button
              id="sidebar-pipeline-wordpress"
              onClick={() => {
                onOpenWordPress();
                onCloseMobile();
              }}
              className="text-sky-400 hover:text-sky-300 font-bold underline decoration-sky-500/50 flex items-center gap-0.5 cursor-pointer"
              title="Open WordPress Publisher Desk"
            >
              <Globe className="w-2.5 h-2.5" /> WordPress
            </button>
          </div>
        </div>

        {/* SOURCES Desk Button in Sidebar */}
        {onOpenSources && (
          <div className="px-3 pt-2">
            <button
              id="sidebar-sources-desk-btn"
              onClick={() => {
                onOpenSources();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-900/60 hover:border-rose-600/80 text-rose-200 hover:text-white transition-all shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📂</span>
                <div className="text-left">
                  <div className="font-bold text-slate-100 flex items-center gap-1">
                    <span>SOURCES</span>
                  </div>
                  <div className="text-[10px] text-rose-300/80 font-normal">
                    Press • Notes • Image • URL
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-rose-900/60 text-rose-300 px-1.5 py-0.5 rounded font-mono border border-rose-800/80">
                Intake
              </span>
            </button>
          </div>
        )}

        {/* Hierarchical Newsroom Tree Navigation */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
          {/* Top-Level Item: Chat */}
          <div className="pt-1">
            <button
              id="tree-item-chat"
              onClick={() => {
                onSelectMode("general");
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentMode === "general"
                  ? "bg-slate-800 text-amber-300 font-semibold shadow-xs"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare
                  className={`w-4 h-4 ${
                    currentMode === "general" ? "text-amber-400" : "text-slate-400"
                  }`}
                />
                <span className="tracking-wide">Chat</span>
              </div>
              <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                General
              </span>
            </button>
          </div>

          {/* Tree Sections: Newsroom, SEO, Social, Image Studio */}
          <div className="space-y-2">
            {treeSections.map((section) => {
              const SectionIcon = section.icon;
              const isOpen = openSections[section.id] !== false;
              const hasActiveChild = section.children.some((c) => c.id === currentMode);

              return (
                <div key={section.id} className="space-y-0.5">
                  {/* Section Parent Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                      hasActiveChild
                        ? "text-amber-400/90 bg-slate-800/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{section.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-normal">
                        {section.children.length}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {/* Children Items with Tree Branch Visual Connector */}
                  {isOpen && (
                    <div className="ml-3 pl-2.5 border-l border-slate-800/90 space-y-0.5">
                      {section.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = currentMode === child.id;

                        return (
                          <button
                            key={child.id}
                            id={`tree-mode-${child.id}`}
                            onClick={() => {
                              onSelectMode(child.id);
                              onCloseMobile();
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isActive
                                ? "bg-slate-800 text-amber-300 font-semibold shadow-xs"
                                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ChildIcon
                                className={`w-3.5 h-3.5 ${
                                  isActive ? "text-amber-400" : "text-slate-400"
                                }`}
                              />
                              <span className="truncate">{child.label}</span>
                            </div>
                            {child.tag && (
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                {child.tag}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recent Stories & Chat History */}
          <div className="pt-3 border-t border-slate-800">
            <div className="px-1 pb-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  id="search-chat-history"
                  type="text"
                  placeholder="Search stories..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-slate-600"
                />
              </div>
            </div>

            <div className="px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1 flex items-center justify-between">
              <span>Recent Stories</span>
              <span className="text-[10px] text-slate-500">{filteredConversations.length}</span>
            </div>

            <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 px-2">
                  No recent stories found.
                </div>
              ) : (
                filteredConversations.map((convo) => {
                  const isActive = convo.id === activeChatId;
                  const isEditing = convo.id === editingId;

                  return (
                    <div
                      key={convo.id}
                      id={`chat-item-${convo.id}`}
                      onClick={() => {
                        onSelectChat(convo.id);
                        onCloseMobile();
                      }}
                      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isActive
                          ? "bg-slate-800/90 text-white border border-slate-700/60"
                          : "text-slate-300 hover:bg-slate-800/40 hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(convo.id, e as any);
                              if (e.key === "Escape") handleCancelRename(e as any);
                            }}
                            className="w-full bg-slate-900 border border-slate-600 px-1.5 py-0.5 rounded text-xs text-white focus:outline-hidden"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate text-xs">{convo.title}</span>
                        )}
                      </div>

                      <div className="flex items-center shrink-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleSaveRename(convo.id, e)}
                              className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded transition-colors"
                              title="Save"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={handleCancelRename}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                            <button
                              onClick={(e) => handleStartRename(convo, e)}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(convo.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer: Settings & Unicode Indicators */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1">
            <span className="font-medium">Unicode Desks:</span>
            <div className="flex items-center gap-1.5">
              <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[10px]">EN</span>
              <span className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-assamese">
                অসমীয়া
              </span>
              <span className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-[10px] font-hindi">
                हिन्दी
              </span>
            </div>
          </div>

          <button
            id="tree-item-wordpress"
            onClick={() => {
              onOpenWordPress();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-sky-300 hover:bg-sky-950/40 hover:text-white transition-colors border border-sky-900/40 mb-1.5 bg-sky-950/20"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span className="font-semibold">WordPress Publisher</span>
            </div>
            <span className="text-[9px] bg-sky-900/60 text-sky-200 px-1.5 py-0.5 rounded border border-sky-700/50 font-mono">
              Publish
            </span>
          </button>

          <button
            id="tree-item-settings"
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </aside>
    </>
  );
};
