import React, { useState, useRef } from "react";
import {
  X,
  FileText,
  Edit3,
  Image as ImageIcon,
  Link2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Send,
  Loader2,
  Bookmark,
  Building2,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import { NewsSources, AttachedFile, NewsMode } from "../types";
import { buildApiUrl } from "../config/apiConfig";

interface SourcesDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: NewsSources;
  onUpdateSources: (sources: NewsSources) => void;
  onSynthesizeStory: (assembledPrompt: string, attachedFiles: AttachedFile[], mode: NewsMode) => void;
  initialTab?: "press_release" | "reporter_notes" | "attached_image" | "source_url";
}

export const SourcesDeskModal: React.FC<SourcesDeskModalProps> = ({
  isOpen,
  onClose,
  sources,
  onUpdateSources,
  onSynthesizeStory,
  initialTab = "press_release",
}) => {
  const [activeTab, setActiveTab] = useState<"press_release" | "reporter_notes" | "attached_image" | "source_url">(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlFetchError, setUrlFetchError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Check which sources have content
  const hasPressRelease = Boolean(sources.pressRelease.text.trim() || sources.pressRelease.pdfData);
  const hasReporterNotes = Boolean(sources.reporterNotes.text.trim());
  const hasAttachedImage = Boolean(sources.attachedImage.data || sources.attachedImage.caption);
  const hasSourceUrl = Boolean(sources.sourceUrl.url.trim());

  const activeSourceCount = [hasPressRelease, hasReporterNotes, hasAttachedImage, hasSourceUrl].filter(Boolean).length;

  // Handle PDF / Text File Upload for Press Release
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        onUpdateSources({
          ...sources,
          pressRelease: {
            ...sources.pressRelease,
            fileName: file.name,
            pdfData: base64Data,
            text: sources.pressRelease.text || `[PDF Document Attached: ${file.name} - Gemini Multi-Modal Ingestion Active]`,
          },
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text / Markdown / Word-compatible text
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateSources({
          ...sources,
          pressRelease: {
            ...sources.pressRelease,
            fileName: file.name,
            text: reader.result as string,
          },
        });
      };
      reader.readAsText(file);
    }
  };

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdateSources({
        ...sources,
        attachedImage: {
          ...sources.attachedImage,
          fileName: file.name,
          data: reader.result as string,
          caption: sources.attachedImage.caption || `News photograph: ${file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")}`,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  // Fetch URL content
  const handleFetchUrl = async () => {
    const rawUrl = sources.sourceUrl.url.trim();
    if (!rawUrl) return;

    setIsFetchingUrl(true);
    setUrlFetchError(null);

    try {
      const url = buildApiUrl("/api/fetch-url");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      onUpdateSources({
        ...sources,
        sourceUrl: {
          url: data.url,
          title: data.title,
          description: data.description,
          snippet: data.snippet,
          fetched: true,
        },
      });
    } catch (err: any) {
      setUrlFetchError(err.message || "Failed to fetch webpage content.");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Load Full 4-Source Realistic Guwahati Sample
  const handleLoadSampleSources = () => {
    onUpdateSources({
      pressRelease: {
        fileName: "Press_Release_GMC_SmartCity_Bridge_2026.pdf",
        issuingAuthority: "Guwahati Municipal Corporation & PWD (Roads) Assam",
        date: "September 14, 2026",
        text: `GUWAHATI MUNICIPAL CORPORATION & PWD ROADS
PRESS RELEASE — FOR IMMEDIATE CIRCULATION
Subject: Commissioning of North Guwahati Twin-City Riverfront Corridor and Traffic Advisory

GUWAHATI: The Public Works Department (Roads) in coordination with Guwahati Smart City Ltd announces that the final structural trials for the 6-lane elevated approach corridor connecting Fancy Bazar with North Guwahati over the Brahmaputra River have concluded successfully. 

Key Official Points:
1. Formal vehicular dry runs commence from Wednesday 06:00 hrs.
2. Estimated travel time between South Guwahati (Bharalumukh) and AIIMS Changsari reduced from 65 minutes to 14 minutes.
3. Heavy goods commercial vehicles remain restricted from 08:00 to 20:00 hrs to ensure commuter safety.
4. Total project outlay: Rs 2,608 Crore, executed under state infrastructure fund with technical oversight from IIT Guwahati.

Issued by: Directorate of Information & Public Relations (DIPR), Dispur, Guwahati.`,
      },
      reporterNotes: {
        reporterName: "Staff Reporter (Brahmaputra Beat)",
        location: "Bharalumukh Riverfront & Fancy Bazar Ghat",
        eyewitnessQuotes: `"We have lived through ferry queues for 30 years. Driving straight across in 15 minutes will change schooling and emergency hospital transfers forever," said Bhaben Kalita, local ferry operator at Rajaduwar.`,
        text: `FIELD OBSERVATIONS & DESK NOTES:
• Ground status: Asphalt surface layer completed on both flanks. Street lights with solar panels installed along the 1.24 km river span.
• Police verification: Guwahati Traffic Police DCP confirmed deployment of 4 new intersection signals at Bharalumukh junction to prevent bottlenecks during evening peak rush.
• Local concern: Small boat operators union submitted memorandum to Deputy Commissioner Kamrup Metro requesting compensation and alternative tourism ferrying permits.
• Weather/River check: Water level at DC Court Gauge currently 48.2m (well below danger mark 49.68m), favorable for opening trial.`,
      },
      attachedImage: {
        fileName: "brahmaputra_bridge_guwahati_2026.jpg",
        caption: "A panoramic perspective of the newly completed 6-lane Brahmaputra River corridor linking South and North Guwahati under twilight illumination.",
        credit: "Photo: Special Arrangement / GHY Newsroom Wire",
        altText: "Elevated 6-lane cable-stayed bridge over Brahmaputra river connecting Guwahati and North Guwahati",
      },
      sourceUrl: {
        url: "https://assam.gov.in/guwahati-smart-city-connectivity-update",
        title: "Assam State Portal - Guwahati Urban Infrastructure Projects",
        description: "Official status dashboard of capital transit and riverfront road connectivity projects under Guwahati Smart City Mission.",
        snippet: "Project Phase II covers 8.4 km total length including approach viaducts. Environmental clearance certificate issued by SEIAA Assam with ecological river dolphin sanctuary safeguards maintained.",
        fetched: true,
      },
    });
  };

  // Clear All Sources
  const handleClearAll = () => {
    onUpdateSources({
      pressRelease: { text: "", fileName: "", issuingAuthority: "", date: "" },
      reporterNotes: { text: "", reporterName: "", location: "", eyewitnessQuotes: "" },
      attachedImage: { fileName: "", data: undefined, caption: "", credit: "", altText: "" },
      sourceUrl: { url: "", title: "", snippet: "", description: "", fetched: false },
    });
  };

  // Assemble and trigger story generation
  const handleSynthesize = () => {
    const parts: string[] = [];

    parts.push(`=======================================================`);
    parts.push(`SOURCES INGESTION DESK: VERIFIED EDITORIAL DOSSIER`);
    parts.push(`=======================================================\n`);

    if (hasPressRelease) {
      parts.push(`[SOURCE 1: OFFICIAL PRESS RELEASE / DOCUMENT]`);
      if (sources.pressRelease.issuingAuthority) {
        parts.push(`Issuing Authority: ${sources.pressRelease.issuingAuthority}`);
      }
      if (sources.pressRelease.date) {
        parts.push(`Release Date: ${sources.pressRelease.date}`);
      }
      if (sources.pressRelease.fileName) {
        parts.push(`Document: ${sources.pressRelease.fileName}`);
      }
      parts.push(`Official Content:\n${sources.pressRelease.text}\n`);
    }

    if (hasReporterNotes) {
      parts.push(`[SOURCE 2: ON-GROUND REPORTER NOTES]`);
      if (sources.reporterNotes.reporterName) {
        parts.push(`Byline / Reporter: ${sources.reporterNotes.reporterName}`);
      }
      if (sources.reporterNotes.location) {
        parts.push(`Field Location: ${sources.reporterNotes.location}`);
      }
      if (sources.reporterNotes.eyewitnessQuotes) {
        parts.push(`Quotes & Testimonies: ${sources.reporterNotes.eyewitnessQuotes}`);
      }
      parts.push(`Ground Observations:\n${sources.reporterNotes.text}\n`);
    }

    if (hasAttachedImage) {
      parts.push(`[SOURCE 3: ATTACHED PHOTOGRAPH / VISUAL ASSET]`);
      parts.push(`Caption: ${sources.attachedImage.caption || "Editorial Photograph"}`);
      parts.push(`Photo Credit: ${sources.attachedImage.credit || "Staff Photographer"}`);
      if (sources.attachedImage.altText) {
        parts.push(`Alt Text: ${sources.attachedImage.altText}`);
      }
      parts.push(``);
    }

    if (hasSourceUrl) {
      parts.push(`[SOURCE 4: VERIFIED SOURCE URL & CITATION]`);
      parts.push(`Source URL: ${sources.sourceUrl.url}`);
      if (sources.sourceUrl.title) {
        parts.push(`Webpage Title: ${sources.sourceUrl.title}`);
      }
      if (sources.sourceUrl.snippet) {
        parts.push(`Verified Web Content Snippet:\n${sources.sourceUrl.snippet}\n`);
      }
    }

    parts.push(`=======================================================`);
    parts.push(`EDITORIAL DIRECTIVE FOR GHY GPT:`);
    parts.push(`1. Synthesize a professional, inverted-pyramid news report based strictly on these verified sources.`);
    parts.push(`2. Cross-verify the official statements against the on-ground reporter notes and local citizen reactions.`);
    parts.push(`3. Include a factual lead paragraph (Who, What, Where, When, Why, and How).`);
    parts.push(`4. Attribute all statements and official figures clearly to their designated authorities.`);
    parts.push(`5. Include the photo credit, caption, and reference to the source URL at the conclusion of the story.`);
    parts.push(`6. Ready for newsroom editorial staging and WordPress CMS publishing.`);

    const assembledPrompt = parts.join("\n");

    // Prepare files array
    const filesToAttach: AttachedFile[] = [];

    // PDF attachment
    if (sources.pressRelease.pdfData && sources.pressRelease.fileName) {
      filesToAttach.push({
        name: sources.pressRelease.fileName,
        mimeType: "application/pdf",
        size: 1024,
        data: sources.pressRelease.pdfData,
        text: sources.pressRelease.text,
      });
    }

    // Image attachment
    if (sources.attachedImage.data && sources.attachedImage.fileName) {
      filesToAttach.push({
        name: sources.attachedImage.fileName,
        mimeType: "image/jpeg",
        size: 1024,
        data: sources.attachedImage.data,
      });
    }

    onSynthesizeStory(assembledPrompt, filesToAttach, "news_writing");
    onClose();
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div
      id="sources-desk-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header with Aesthetic Sources Spec */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white shadow-xs">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider uppercase font-mono text-rose-400">
                  SOURCES DESK
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                  {activeSourceCount}/4 Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-source editorial ingestion for verified reporting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-load-sample-sources"
              type="button"
              onClick={handleLoadSampleSources}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1.5 rounded-lg border border-slate-700 font-semibold transition-colors flex items-center gap-1.5"
              title="Load 4 realistic sample sources for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load 4-Source Sample</span>
            </button>

            {activeSourceCount > 0 && (
              <button
                id="btn-clear-all-sources"
                type="button"
                onClick={handleClearAll}
                className="text-xs bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                title="Clear all 4 sources"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            <button
              id="btn-close-sources-modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Exact Visual Spec Banner matching the prompt */}
        <div className="bg-slate-950 text-slate-200 px-5 py-3 border-b border-slate-800 font-mono text-xs">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider">SOURCES INTAKE DIRECTORY</div>
          <div className="text-slate-600 font-mono select-none">────────────────────────────────────────────</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* 1. Press Release.pdf */}
            <button
              id="spec-tab-press-release"
              onClick={() => setActiveTab("press_release")}
              className={`p-2 rounded-lg text-left transition-all border ${
                activeTab === "press_release"
                  ? "bg-slate-800 border-rose-500 text-white shadow-xs"
                  : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5 text-xs">
                  <span>📄</span> Press Release.pdf
                </span>
                {hasPressRelease && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {sources.pressRelease.fileName || (hasPressRelease ? "Text loaded" : "Empty")}
              </div>
            </button>

            {/* 2. Reporter Notes */}
            <button
              id="spec-tab-reporter-notes"
              onClick={() => setActiveTab("reporter_notes")}
              className={`p-2 rounded-lg text-left transition-all border ${
                activeTab === "reporter_notes"
                  ? "bg-slate-800 border-rose-500 text-white shadow-xs"
                  : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5 text-xs">
                  <span>📝</span> Reporter Notes
                </span>
                {hasReporterNotes && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {sources.reporterNotes.text
                  ? `${sources.reporterNotes.text.split(/\s+/).filter(Boolean).length} words`
                  : "Empty"}
              </div>
            </button>

            {/* 3. Attached Image */}
            <button
              id="spec-tab-attached-image"
              onClick={() => setActiveTab("attached_image")}
              className={`p-2 rounded-lg text-left transition-all border ${
                activeTab === "attached_image"
                  ? "bg-slate-800 border-rose-500 text-white shadow-xs"
                  : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5 text-xs">
                  <span>🖼️</span> Attached Image
                </span>
                {hasAttachedImage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {sources.attachedImage.fileName || (hasAttachedImage ? "Caption added" : "Empty")}
              </div>
            </button>

            {/* 4. Source URL */}
            <button
              id="spec-tab-source-url"
              onClick={() => setActiveTab("source_url")}
              className={`p-2 rounded-lg text-left transition-all border ${
                activeTab === "source_url"
                  ? "bg-slate-800 border-rose-500 text-white shadow-xs"
                  : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5 text-xs">
                  <span>🔗</span> Source URL
                </span>
                {hasSourceUrl && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {sources.sourceUrl.fetched
                  ? "Fetched & verified"
                  : sources.sourceUrl.url
                  ? "URL added"
                  : "Empty"}
              </div>
            </button>
          </div>
          <div className="text-slate-600 font-mono select-none pt-1">────────────────────────────────────────────</div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: 📄 PRESS RELEASE.PDF */}
          {activeTab === "press_release" && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                    📄
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Press Release / Official Circular</h3>
                    <p className="text-xs text-slate-500">
                      Upload PDF/document or paste official government/corporate press announcements
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf,.txt,.docx,.md"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-300 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload PDF / Text</span>
                  </button>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Issuing Authority / Department</span>
                  </label>
                  <input
                    type="text"
                    value={sources.pressRelease.issuingAuthority || ""}
                    onChange={(e) =>
                      onUpdateSources({
                        ...sources,
                        pressRelease: { ...sources.pressRelease, issuingAuthority: e.target.value },
                      })
                    }
                    placeholder="e.g., Guwahati Municipal Corporation / Assam Police HQs"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Release Date / Embargo Status</span>
                  </label>
                  <input
                    type="text"
                    value={sources.pressRelease.date || ""}
                    onChange={(e) =>
                      onUpdateSources({
                        ...sources,
                        pressRelease: { ...sources.pressRelease, date: e.target.value },
                      })
                    }
                    placeholder="e.g., For Immediate Release / Embargo until 18:00 hrs"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              {/* PDF Status Indicator */}
              {sources.pressRelease.fileName && (
                <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-900">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span className="font-semibold">{sources.pressRelease.fileName}</span>
                    {sources.pressRelease.pdfData && (
                      <span className="bg-rose-200 text-rose-800 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                        PDF Native OCR Active
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSources({
                        ...sources,
                        pressRelease: { ...sources.pressRelease, fileName: "", pdfData: undefined },
                      })
                    }
                    className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                  >
                    Remove File
                  </button>
                </div>
              )}

              {/* Press Release Content Textarea */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Press Release Text Copy / Key Quotes
                </label>
                <textarea
                  rows={9}
                  value={sources.pressRelease.text}
                  onChange={(e) =>
                    onUpdateSources({
                      ...sources,
                      pressRelease: { ...sources.pressRelease, text: e.target.value },
                    })
                  }
                  placeholder="Paste the official press release body, circular text, or official notification points here..."
                  className="w-full p-3 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-rose-500 font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: 📝 REPORTER NOTES */}
          {activeTab === "reporter_notes" && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    📝
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Field Notes & Ground Observations</h3>
                    <p className="text-xs text-slate-500">
                      Eyewitness statements, on-ground reality checks, police inspector quotes, casualty checks
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-500 font-mono">
                  {sources.reporterNotes.text
                    ? `${sources.reporterNotes.text.split(/\s+/).filter(Boolean).length} words recorded`
                    : "0 words"}
                </span>
              </div>

              {/* Reporter Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reporter / Byline</span>
                  </label>
                  <input
                    type="text"
                    value={sources.reporterNotes.reporterName || ""}
                    onChange={(e) =>
                      onUpdateSources({
                        ...sources,
                        reporterNotes: { ...sources.reporterNotes, reporterName: e.target.value },
                      })
                    }
                    placeholder="e.g., Staff Correspondent / Special Correspondent, Guwahati"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Incident Location / Beat</span>
                  </label>
                  <input
                    type="text"
                    value={sources.reporterNotes.location || ""}
                    onChange={(e) =>
                      onUpdateSources({
                        ...sources,
                        reporterNotes: { ...sources.reporterNotes, location: e.target.value },
                      })
                    }
                    placeholder="e.g., Jalukbari, Khanapara, Dispur Capital Complex"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Eyewitness Quotes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Key Eyewitness or Official Quotes (Attributed)
                </label>
                <input
                  type="text"
                  value={sources.reporterNotes.eyewitnessQuotes || ""}
                  onChange={(e) =>
                    onUpdateSources({
                      ...sources,
                      reporterNotes: { ...sources.reporterNotes, eyewitnessQuotes: e.target.value },
                    })
                  }
                  placeholder='e.g., "The water level receded by 3 feet by morning," confirmed District Project Officer.'
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {/* Notes Body */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Ground Notes & Verification Points
                </label>
                <textarea
                  rows={8}
                  value={sources.reporterNotes.text}
                  onChange={(e) =>
                    onUpdateSources({
                      ...sources,
                      reporterNotes: { ...sources.reporterNotes, text: e.target.value },
                    })
                  }
                  placeholder="Record bullet points, chronology of events, numbers, counter-claims, and facts observed on the scene..."
                  className="w-full p-3 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-rose-500 font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: 🖼️ ATTACHED IMAGE */}
          {activeTab === "attached_image" && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    🖼️
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">News Photograph & Visual Asset</h3>
                    <p className="text-xs text-slate-500">
                      Attach photojournalism image, press handout, caption, and credit byline
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-300 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              </div>

              {/* Image Preview & Upload Container */}
              {sources.attachedImage.data ? (
                <div className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="relative group max-w-[220px] max-h-[160px] overflow-hidden rounded-lg border border-slate-300 bg-slate-900 flex items-center justify-center shrink-0">
                    <img
                      src={sources.attachedImage.data}
                      alt={sources.attachedImage.altText || "Attached visual"}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSources({
                          ...sources,
                          attachedImage: {
                            ...sources.attachedImage,
                            data: undefined,
                            fileName: undefined,
                          },
                        })
                      }
                      className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-md transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 text-xs">
                    <div className="text-xs font-semibold text-slate-700">
                      File: <span className="font-mono text-slate-900">{sources.attachedImage.fileName || "Uploaded Image"}</span>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-0.5">Caption</label>
                      <input
                        type="text"
                        value={sources.attachedImage.caption}
                        onChange={(e) =>
                          onUpdateSources({
                            ...sources,
                            attachedImage: { ...sources.attachedImage, caption: e.target.value },
                          })
                        }
                        placeholder="e.g., Rescue personnel carrying out relief operations in Kamrup..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-hidden focus:border-rose-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-0.5">Photo Credit / Byline</label>
                      <input
                        type="text"
                        value={sources.attachedImage.credit}
                        onChange={(e) =>
                          onUpdateSources({
                            ...sources,
                            attachedImage: { ...sources.attachedImage, credit: e.target.value },
                          })
                        }
                        placeholder="e.g., Staff Photographer / GHY News / PTI"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 focus:outline-hidden focus:border-rose-500 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => imgInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-xs">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Click to attach news photograph or press visual
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, WebP up to 10MB • Auto-syncs to WordPress featured media
                  </span>
                </div>
              )}

              {/* Text metadata when no image uploaded yet */}
              {!sources.attachedImage.data && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Expected Photo Caption</label>
                    <input
                      type="text"
                      value={sources.attachedImage.caption}
                      onChange={(e) =>
                        onUpdateSources({
                          ...sources,
                          attachedImage: { ...sources.attachedImage, caption: e.target.value },
                        })
                      }
                      placeholder="e.g., Drone view of the new riverfront terminal"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Photo Credit</label>
                    <input
                      type="text"
                      value={sources.attachedImage.credit}
                      onChange={(e) =>
                        onUpdateSources({
                          ...sources,
                          attachedImage: { ...sources.attachedImage, credit: e.target.value },
                        })
                      }
                      placeholder="e.g., Staff Photojournalist / GHY News"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 🔗 SOURCE URL */}
          {activeTab === "source_url" && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                    🔗
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Source Web URL & Citation</h3>
                    <p className="text-xs text-slate-500">
                      Live portal link, government press release URL, wire report, or verified publication
                    </p>
                  </div>
                </div>
              </div>

              {/* URL Input Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={sources.sourceUrl.url}
                    onChange={(e) =>
                      onUpdateSources({
                        ...sources,
                        sourceUrl: { ...sources.sourceUrl, url: e.target.value, fetched: false },
                      })
                    }
                    placeholder="https://pib.gov.in/PressReleasePage.aspx?PRID=... or official website"
                    className="w-full pl-8 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500 font-mono"
                  />
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <button
                  type="button"
                  id="btn-fetch-source-url"
                  disabled={isFetchingUrl || !sources.sourceUrl.url.trim()}
                  onClick={handleFetchUrl}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {isFetchingUrl ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                  <span>{isFetchingUrl ? "Ingesting..." : "Fetch & Ingest"}</span>
                </button>
              </div>

              {urlFetchError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{urlFetchError}</span>
                </div>
              )}

              {/* Fetched Preview Card */}
              {sources.sourceUrl.fetched && (
                <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded font-mono">
                      Verified Webpage Content
                    </span>
                    <a
                      href={sources.sourceUrl.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-sky-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="font-bold text-slate-900 text-sm">
                    {sources.sourceUrl.title || "Untitled Document"}
                  </div>

                  {sources.sourceUrl.description && (
                    <p className="text-slate-600 italic text-xs leading-relaxed">
                      {sources.sourceUrl.description}
                    </p>
                  )}

                  {sources.sourceUrl.snippet && (
                    <div className="p-2.5 bg-white border border-sky-100 rounded-lg text-slate-800 font-mono text-[11px] max-h-36 overflow-y-auto leading-relaxed">
                      {sources.sourceUrl.snippet}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="font-semibold text-slate-900">{activeSourceCount} of 4</span> sources configured.
            {activeSourceCount === 0 && (
              <span className="text-amber-700">Add any source or click &ldquo;Load 4-Source Sample&rdquo;</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-modal-cancel"
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              Close
            </button>

            <button
              id="btn-synthesize-sources-story"
              type="button"
              disabled={activeSourceCount === 0}
              onClick={handleSynthesize}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Synthesize News Story</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
