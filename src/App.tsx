/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import {
  AttachedFile,
  ChatMessage,
  Conversation,
  HeadlineOptions,
  ImageGenOptions,
  NewsMode,
  NewsWritingOptions,
  NewsroomSettings,
  SummaryOptions,
  TranslationOptions,
  GeneratedImageMetadata,
  WordPressConfig,
  NewsSources,
} from "./types";
import {
  getStoredConversations,
  saveConversation,
  deleteConversation,
  renameConversation,
  clearAllConversations,
  getActiveChatId,
  setActiveChatId,
  getNewsroomSettings,
  saveNewsroomSettings,
} from "./services/storage";
import { buildSystemPrompt, formatUserPrompt } from "./services/prompts";
import { requestNewsGeneration, requestNewsImage } from "./services/api";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ModeControls } from "./components/ModeControls";
import { MessageItem } from "./components/MessageItem";
import { InputArea } from "./components/InputArea";
import { SettingsModal } from "./components/SettingsModal";
import { WordPressPublishModal } from "./components/WordPressPublishModal";
import { SourcesDeskModal } from "./components/SourcesDeskModal";
import { Loader2 } from "lucide-react";

export default function App() {
  // Persistence state
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getStoredConversations()
  );
  const [activeChatId, setActiveChatIdState] = useState<string | null>(() =>
    getActiveChatId()
  );
  const [settings, setSettings] = useState<NewsroomSettings>(() =>
    getNewsroomSettings()
  );

  // Active chat state
  const [currentMode, setCurrentMode] = useState<NewsMode>("general");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  // Mode-specific options
  const [newsWritingOptions, setNewsWritingOptions] = useState<NewsWritingOptions>({
    language: "en",
    length: "medium",
    style: "standard",
    tone: "neutral",
    includeSeo: true,
    includeSlug: true,
    includeTags: true,
  });

  const [translationOptions, setTranslationOptions] = useState<TranslationOptions>({
    sourceLanguage: "auto",
    targetLanguage: "as",
    newsStyle: true,
  });

  const [headlineOptions, setHeadlineOptions] = useState<HeadlineOptions>({
    language: "en",
    category: "all_5",
  });

  const [summaryOptions, setSummaryOptions] = useState<SummaryOptions>({
    language: "en",
    type: "all",
  });

  const [imageGenOptions, setImageGenOptions] = useState<ImageGenOptions>({
    aspectRatio: "16:9",
    preset: "news_illustration",
  });

  // UI state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);
  const [wordPressContent, setWordPressContent] = useState("");
  const [wordPressImage, setWordPressImage] = useState<GeneratedImageMetadata | undefined>(undefined);

  // SOURCES Desk state
  const DEFAULT_SOURCES: NewsSources = {
    pressRelease: { text: "", fileName: "", issuingAuthority: "", date: "" },
    reporterNotes: { text: "", reporterName: "", location: "", eyewitnessQuotes: "" },
    attachedImage: { fileName: "", data: undefined, caption: "", credit: "", altText: "" },
    sourceUrl: { url: "", title: "", snippet: "", description: "", fetched: false },
  };

  const [sources, setSources] = useState<NewsSources>(() => {
    try {
      const saved = localStorage.getItem("ghy_news_sources");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SOURCES;
  });

  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [sourcesInitialTab, setSourcesInitialTab] = useState<
    "press_release" | "reporter_notes" | "attached_image" | "source_url"
  >("press_release");

  const handleUpdateSources = (newSources: NewsSources) => {
    setSources(newSources);
    try {
      localStorage.setItem("ghy_news_sources", JSON.stringify(newSources));
    } catch {}
  };

  const handleOpenSources = (
    tab?: "press_release" | "reporter_notes" | "attached_image" | "source_url"
  ) => {
    if (tab) {
      setSourcesInitialTab(tab);
    }
    setIsSourcesModalOpen(true);
  };

  const handleSynthesizeStory = (
    assembledPrompt: string,
    sourceFiles: AttachedFile[],
    targetMode: NewsMode
  ) => {
    setIsSourcesModalOpen(false);
    setCurrentMode(targetMode);
    setInput(assembledPrompt);
    if (sourceFiles.length > 0) {
      setAttachedFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const novel = sourceFiles.filter((f) => !existingNames.has(f.name));
        return [...prev, ...novel];
      });
    }
  };

  const activeSourcesCount = [
    Boolean(sources.pressRelease.text.trim() || sources.pressRelease.pdfData),
    Boolean(sources.reporterNotes.text.trim()),
    Boolean(sources.attachedImage.data || sources.attachedImage.caption),
    Boolean(sources.sourceUrl.url.trim()),
  ].filter(Boolean).length;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Open WordPress Publishing Desk modal
  const handleOpenWordPress = (content?: string, imageMeta?: GeneratedImageMetadata) => {
    if (content) {
      setWordPressContent(content);
      setWordPressImage(imageMeta);
    } else {
      // Find latest assistant message with content
      const latestAssistant = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
      if (latestAssistant) {
        setWordPressContent(latestAssistant.content);
        setWordPressImage(latestAssistant.imageMetadata);
      } else {
        setWordPressContent("");
        setWordPressImage(undefined);
      }
    }
    setIsWordPressModalOpen(true);
  };

  // Derive current conversation
  const activeConversation = conversations.find((c) => c.id === activeChatId) || null;
  const messages = activeConversation ? activeConversation.messages : [];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Sync active chat id in storage
  const handleSelectChat = (id: string) => {
    setActiveChatIdState(id);
    setActiveChatId(id);
    const found = conversations.find((c) => c.id === id);
    if (found) {
      setCurrentMode(found.currentMode || "general");
    }
  };

  // Start new chat
  const handleNewChat = (mode: NewsMode = "general", prefillInput: string = "") => {
    const newId = `story-${Date.now()}`;
    const newConvo: Conversation = {
      id: newId,
      title: "New Story Draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      currentMode: mode,
    };
    const updated = [newConvo, ...conversations];
    setConversations(updated);
    saveConversation(newConvo);
    setActiveChatIdState(newId);
    setActiveChatId(newId);
    setCurrentMode(mode);
    if (prefillInput) {
      setInput(prefillInput);
    }
  };

  // Delete chat
  const handleDeleteChat = (id: string) => {
    const updated = deleteConversation(id);
    setConversations(updated);
    if (activeChatId === id) {
      const nextId = updated.length > 0 ? updated[0].id : null;
      setActiveChatIdState(nextId);
      setActiveChatId(nextId);
    }
  };

  // Rename chat
  const handleRenameChat = (id: string, newTitle: string) => {
    const updated = renameConversation(id, newTitle);
    setConversations(updated);
  };

  // Clear conversation
  const handleClearConversation = () => {
    if (!activeChatId) return;
    if (window.confirm("Are you sure you want to clear all messages in this story?")) {
      const updated = conversations.map((c) => {
        if (c.id === activeChatId) {
          return { ...c, messages: [], updatedAt: Date.now() };
        }
        return c;
      });
      setConversations(updated);
      const current = updated.find((c) => c.id === activeChatId);
      if (current) saveConversation(current);
    }
  };

  // Mode switcher
  const handleSelectMode = (mode: NewsMode) => {
    setCurrentMode(mode);
    if (activeChatId) {
      const updated = conversations.map((c) => {
        if (c.id === activeChatId) {
          return { ...c, currentMode: mode };
        }
        return c;
      });
      setConversations(updated);
      const current = updated.find((c) => c.id === activeChatId);
      if (current) saveConversation(current);
    }
  };

  // Send message
  const handleSend = async () => {
    const textPrompt = input.trim();
    const filesToAttach = [...attachedFiles];

    if (!textPrompt && filesToAttach.length === 0) return;

    let targetConvoId = activeChatId;
    let targetConvo = activeConversation;

    // If no active conversation, create one now
    if (!targetConvoId || !targetConvo) {
      targetConvoId = `story-${Date.now()}`;
      // Auto-title from first prompt
      const previewTitle = textPrompt.slice(0, 32) || "News Story";
      targetConvo = {
        id: targetConvoId,
        title: previewTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        currentMode,
      };
      setConversations((prev) => [targetConvo!, ...prev]);
      setActiveChatIdState(targetConvoId);
      setActiveChatId(targetConvoId);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: textPrompt,
      timestamp: Date.now(),
      mode: currentMode,
      attachedFiles: filesToAttach,
    };

    const newMessages = [...targetConvo.messages, userMessage];

    // Update title if it's the first message
    let newTitle = targetConvo.title;
    if (targetConvo.messages.length === 0 && textPrompt) {
      newTitle = textPrompt.slice(0, 36) + (textPrompt.length > 36 ? "..." : "");
    }

    const updatedConvo: Conversation = {
      ...targetConvo,
      title: newTitle,
      messages: newMessages,
      updatedAt: Date.now(),
      currentMode,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === targetConvoId ? updatedConvo : c))
    );
    saveConversation(updatedConvo);

    // Reset input fields
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      if (currentMode === "image_gen") {
        // AI Image Generation Mode
        const imgResult = await requestNewsImage({
          prompt: textPrompt,
          aspectRatio: imageGenOptions.aspectRatio,
          preset: imageGenOptions.preset,
        });

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: `Generated newsroom visual illustration for: **"${textPrompt}"**`,
          timestamp: Date.now(),
          mode: "image_gen",
          imageMetadata: imgResult,
        };

        const finalConvo: Conversation = {
          ...updatedConvo,
          messages: [...newMessages, assistantMessage],
          updatedAt: Date.now(),
        };

        setConversations((prev) =>
          prev.map((c) => (c.id === targetConvoId ? finalConvo : c))
        );
        saveConversation(finalConvo);
      } else {
        // Text News Modes
        const systemInstruction = buildSystemPrompt(currentMode);
        const formattedPrompt = formatUserPrompt(textPrompt, currentMode, {
          newsWriting: newsWritingOptions,
          translation: translationOptions,
          headline: headlineOptions,
          summary: summaryOptions,
        });

        // Build history from previous turns
        const history = targetConvo.messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const responseText = await requestNewsGeneration({
          prompt: formattedPrompt,
          systemInstruction,
          history,
          mode: currentMode,
          uploadedFiles: filesToAttach,
        });

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: responseText,
          timestamp: Date.now(),
          mode: currentMode,
        };

        const finalConvo: Conversation = {
          ...updatedConvo,
          messages: [...newMessages, assistantMessage],
          updatedAt: Date.now(),
        };

        setConversations((prev) =>
          prev.map((c) => (c.id === targetConvoId ? finalConvo : c))
        );
        saveConversation(finalConvo);
      }
    } catch (err: any) {
      console.error("Newsroom generation error:", err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content:
          err?.message ||
          "Failed to generate newsroom response. Please check your prompt or network connection and retry.",
        timestamp: Date.now(),
        mode: currentMode,
        error: true,
      };

      const finalConvo: Conversation = {
        ...updatedConvo,
        messages: [...newMessages, errorMessage],
        updatedAt: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === targetConvoId ? finalConvo : c))
      );
      saveConversation(finalConvo);
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = async () => {
    if (!activeConversation || messages.length === 0 || isLoading) return;

    // Find the last user message
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessageIndex = i;
        break;
      }
    }

    if (lastUserMessageIndex === -1) return;

    const lastUserMsg = messages[lastUserMessageIndex];
    // Keep messages up to the user message
    const trimmedMessages = messages.slice(0, lastUserMessageIndex + 1);

    const updatedConvo: Conversation = {
      ...activeConversation,
      messages: trimmedMessages,
      updatedAt: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === activeChatId ? updatedConvo : c))
    );
    saveConversation(updatedConvo);
    setIsLoading(true);

    try {
      if (lastUserMsg.mode === "image_gen") {
        const imgResult = await requestNewsImage({
          prompt: lastUserMsg.content,
          aspectRatio: imageGenOptions.aspectRatio,
          preset: imageGenOptions.preset,
        });

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: `Regenerated newsroom visual illustration for: **"${lastUserMsg.content}"**`,
          timestamp: Date.now(),
          mode: "image_gen",
          imageMetadata: imgResult,
        };

        const finalConvo: Conversation = {
          ...updatedConvo,
          messages: [...trimmedMessages, assistantMessage],
          updatedAt: Date.now(),
        };

        setConversations((prev) =>
          prev.map((c) => (c.id === activeChatId ? finalConvo : c))
        );
        saveConversation(finalConvo);
      } else {
        const targetMode = lastUserMsg.mode || currentMode;
        const systemInstruction = buildSystemPrompt(targetMode);
        const formattedPrompt = formatUserPrompt(lastUserMsg.content, targetMode, {
          newsWriting: newsWritingOptions,
          translation: translationOptions,
          headline: headlineOptions,
          summary: summaryOptions,
        });

        const history = trimmedMessages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const responseText = await requestNewsGeneration({
          prompt: formattedPrompt,
          systemInstruction,
          history,
          mode: targetMode,
          uploadedFiles: lastUserMsg.attachedFiles,
        });

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: responseText,
          timestamp: Date.now(),
          mode: targetMode,
        };

        const finalConvo: Conversation = {
          ...updatedConvo,
          messages: [...trimmedMessages, assistantMessage],
          updatedAt: Date.now(),
        };

        setConversations((prev) =>
          prev.map((c) => (c.id === activeChatId ? finalConvo : c))
        );
        saveConversation(finalConvo);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: err?.message || "Failed to regenerate response. Please retry.",
        timestamp: Date.now(),
        mode: currentMode,
        error: true,
      };

      const finalConvo: Conversation = {
        ...updatedConvo,
        messages: [...trimmedMessages, errorMessage],
        updatedAt: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === activeChatId ? finalConvo : c))
      );
      saveConversation(finalConvo);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick translate a response
  const handleQuickTranslate = (text: string, targetLang: "as" | "hi" | "en") => {
    setCurrentMode("translation");
    setTranslationOptions((prev) => ({
      ...prev,
      targetLanguage: targetLang,
      newsStyle: true,
    }));
    setInput(text);
  };

  // Welcome screen action click
  const handleSelectWelcomeAction = (mode: NewsMode, prefilledPrompt?: string) => {
    handleNewChat(mode, prefilledPrompt || "");
  };

  // Calculate total words in current story
  const totalWords = messages.reduce((acc, msg) => {
    return acc + (msg.content.trim() ? msg.content.trim().split(/\s+/).length : 0);
  }, 0);

  return (
    <div id="ghy-gpt-app" className="flex h-screen w-screen overflow-hidden bg-white text-slate-900">
      {/* 1. Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeChatId={activeChatId}
        currentMode={currentMode}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onSelectMode={handleSelectMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWordPress={() => handleOpenWordPress()}
        onOpenSources={() => handleOpenSources()}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Work Area */}
      <main id="ghy-main-area" className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
        {/* Sticky Header */}
        <Header
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onClearConversation={handleClearConversation}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenWordPress={() => handleOpenWordPress()}
          onOpenSources={() => handleOpenSources()}
          activeSourcesCount={activeSourcesCount}
          hasMessages={messages.length > 0}
          totalWords={totalWords}
        />

        {/* Dynamic Mode Controls (Top bar) */}
        <ModeControls
          mode={currentMode}
          newsWritingOptions={newsWritingOptions}
          setNewsWritingOptions={setNewsWritingOptions}
          translationOptions={translationOptions}
          setTranslationOptions={setTranslationOptions}
          imageGenOptions={imageGenOptions}
          setImageGenOptions={setImageGenOptions}
        />

        {/* Message Stream OR Welcome Screen */}
        <div id="news-conversation-canvas" className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSelectAction={handleSelectWelcomeAction}
              onOpenWordPress={() => handleOpenWordPress()}
              onOpenSources={(tab) => handleOpenSources(tab)}
            />
          ) : (
            <div className="flex-1">
              {messages.map((msg, index) => {
                const isLatestAssistantMessage =
                  msg.role === "assistant" &&
                  index === messages.length - 1;

                return (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    onRegenerate={isLatestAssistantMessage ? handleRegenerate : undefined}
                    onQuickTranslate={handleQuickTranslate}
                    onPublishToWordPress={handleOpenWordPress}
                    isLatestAssistantMessage={isLatestAssistantMessage}
                  />
                );
              })}

              {/* Loading Indicator Turn */}
              {isLoading && (
                <div
                  id="assistant-loading-turn"
                  className="py-6 px-4 md:px-8 bg-slate-50/70 border-b border-slate-100"
                >
                  <div className="max-w-4xl mx-auto flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          GHY GPT News Desk
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Writing verified news report...
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="inline-block w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                        <span>Applying inverted-pyramid structure & factual verification</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Multi-line Newsroom Input Area */}
        <InputArea
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          sources={sources}
          onOpenSources={() => handleOpenSources()}
        />
        <footer className="app-footer shrink-0">
  <div className="footer-brand">
    <strong>GHY GPT</strong>
    <span>AI Newsroom Assistant</span>
  </div>

  <p>Built by Nitish Sarmah in collaboration with The Guwahati.</p>

  <p>
    GHY GPT is an AI-powered newsroom assistant designed to help journalists
    and editors write, translate, edit, summarize, optimize, and prepare
    digital news content.
  </p>

  <strong className="footer-motto">
    Write. Translate. Edit. Publish.
  </strong>

  <p className="copyright">
    © 2026 The Guwahati. All rights reserved.
  </p>
</footer>
      </main>

    

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveNewsroomSettings(newSettings);
        }}
      />

      {/* WordPress Publishing Desk Modal */}
      <WordPressPublishModal
        isOpen={isWordPressModalOpen}
        onClose={() => setIsWordPressModalOpen(false)}
        rawNewsContent={wordPressContent}
        imageMetadata={wordPressImage}
        savedConfig={settings.wordpress}
        onSaveConfig={(wpConfig) => {
          const updated = { ...settings, wordpress: wpConfig };
          setSettings(updated);
          saveNewsroomSettings(updated);
        }}
      />

      {/* SOURCES Multi-Source Ingestion Desk Modal */}
      <SourcesDeskModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
        sources={sources}
        onUpdateSources={handleUpdateSources}
        onSynthesizeStory={handleSynthesizeStory}
        initialTab={sourcesInitialTab}
      />
    </div>
  );
}
