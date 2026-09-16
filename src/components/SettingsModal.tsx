import React from "react";
import { X, ShieldCheck, Newspaper, Sparkles, Check, Globe } from "lucide-react";
import { NewsroomSettings } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NewsroomSettings;
  onSaveSettings: (newSettings: NewsroomSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="settings-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Newsroom Settings</h2>
              <p className="text-xs text-slate-500">GHY GPT Preferences & Journalistic Charter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700 overflow-y-auto max-h-[75vh]">
          {/* Organization Bureau */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800">News Organization / Bureau</label>
            <input
              type="text"
              value={settings.organizationName}
              onChange={(e) =>
                onSaveSettings({ ...settings, organizationName: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-rose-500"
              placeholder="e.g. Guwahati Newsroom / Northeast Wire"
            />
          </div>

          {/* Default News Language */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Default Desk Language</span>
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) =>
                onSaveSettings({ ...settings, defaultLanguage: e.target.value as any })
              }
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-rose-500"
            >
              <option value="en">English (Standard Wire)</option>
              <option value="as">Assamese (অসমীয়া Unicode)</option>
              <option value="hi">Hindi (हिन्दी Devnagari)</option>
            </select>
          </div>

          {/* WordPress Publishing Integration */}
          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sky-950">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>WordPress CMS Publishing Pipeline</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                REST API
              </span>
            </div>
            <p className="text-[11px] text-sky-900 leading-relaxed">
              Auto-publish or save drafts directly from GHY GPT to your WordPress website:
            </p>
            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Site URL</label>
                <input
                  type="url"
                  value={settings.wordpress?.siteUrl || ""}
                  onChange={(e) =>
                    onSaveSettings({
                      ...settings,
                      wordpress: {
                        siteUrl: e.target.value,
                        username: settings.wordpress?.username || "",
                        applicationPassword: settings.wordpress?.applicationPassword || "",
                        defaultStatus: settings.wordpress?.defaultStatus || "draft",
                      },
                    })
                  }
                  placeholder="https://theguwahatinews.com"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-hidden focus:border-sky-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Username</label>
                  <input
                    type="text"
                    value={settings.wordpress?.username || ""}
                    onChange={(e) =>
                      onSaveSettings({
                        ...settings,
                        wordpress: {
                          siteUrl: settings.wordpress?.siteUrl || "https://theguwahatinews.com",
                          username: e.target.value,
                          applicationPassword: settings.wordpress?.applicationPassword || "",
                          defaultStatus: settings.wordpress?.defaultStatus || "draft",
                        },
                      })
                    }
                    placeholder="editor / admin"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Application Password</label>
                  <input
                    type="password"
                    value={settings.wordpress?.applicationPassword || ""}
                    onChange={(e) =>
                      onSaveSettings({
                        ...settings,
                        wordpress: {
                          siteUrl: settings.wordpress?.siteUrl || "https://theguwahatinews.com",
                          username: settings.wordpress?.username || "",
                          applicationPassword: e.target.value,
                          defaultStatus: settings.wordpress?.defaultStatus || "draft",
                        },
                      })
                    }
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-hidden focus:border-sky-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Strictness */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Journalistic Verification Standard</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              GHY GPT is hardcoded to adhere strictly to verified information:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
              <li>Never invents unverified quotes, casualty numbers, or dates</li>
              <li>Preserves stated uncertainties (&ldquo;alleged&rdquo;, &ldquo;sources said&rdquo;)</li>
              <li>Zero-sensationalism factual inverted-pyramid style</li>
              <li>Mandatory illustrative disclaimer on all generated images</li>
            </ul>
          </div>

          {/* Models info */}
          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 text-slate-600 text-[11px] space-y-1">
            <div className="font-semibold text-rose-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>AI Engine Configuration</span>
            </div>
            <p>
              Text & News Modes: <strong>Google Gemini 3.8 Flash</strong>
            </p>
            <p>
              Image Generation: <strong>Gemini 3.1 Flash Lite Image</strong>
            </p>
            <p className="text-[10px] text-slate-400">
              Integrated via Google GenAI server proxy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
