import { Conversation, NewsroomSettings } from "../types";

const STORAGE_KEY_CHATS = "ghy_gpt_conversations_v1";
const STORAGE_KEY_ACTIVE_CHAT = "ghy_gpt_active_chat_v1";
const STORAGE_KEY_SETTINGS = "ghy_gpt_settings_v1";

const DEFAULT_SETTINGS: NewsroomSettings = {
  defaultLanguage: "en",
  organizationName: "Guwahati Newsroom Desk",
  bylineName: "GHY Newsroom Desk",
  journalisticStrictness: "strict",
  autoCopyHeadlines: false,
};

export function getNewsroomSettings(): NewsroomSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveNewsroomSettings(settings: NewsroomSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
}

export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHATS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveConversation(convo: Conversation): void {
  try {
    const list = getStoredConversations();
    const index = list.findIndex((c) => c.id === convo.id);
    if (index >= 0) {
      list[index] = convo;
    } else {
      list.unshift(convo);
    }
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save conversation", e);
  }
}

export function deleteConversation(id: string): Conversation[] {
  try {
    const list = getStoredConversations().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

export function renameConversation(id: string, newTitle: string): Conversation[] {
  try {
    const list = getStoredConversations().map((c) => {
      if (c.id === id) {
        return { ...c, title: newTitle, updatedAt: Date.now() };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

export function clearAllConversations(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CHATS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_CHAT);
  } catch (e) {
    console.error("Failed to clear conversations", e);
  }
}

export function getActiveChatId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_CHAT);
  } catch {
    return null;
  }
}

export function setActiveChatId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_CHAT, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_CHAT);
    }
  } catch (e) {
    console.error("Failed to set active chat id", e);
  }
}
