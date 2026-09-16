import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  UserCheck,
  Binary,
  Quote,
  MapPin,
  Scale,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { EditorialCheckItem, EditorialAuditReport } from "../types";
import { EDITORIAL_SAFEGUARDS, requestEditorialAudit } from "../utils/editorialVerifier";

interface EditorialVerificationCardProps {
  content: string;
  initialChecks?: EditorialCheckItem[];
  onApplyFix?: (fixDirective: string) => void;
  standalone?: boolean;
}

export const EditorialVerificationCard: React.FC<EditorialVerificationCardProps> = ({
  content,
  initialChecks,
  onApplyFix,
  standalone = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(standalone);
  const [isLoading, setIsLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<EditorialAuditReport | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Safeguard icon resolver
  const getIcon = (id: string) => {
    switch (id) {
      case "check_date":
        return <Calendar className="w-3.5 h-3.5" />;
      case "check_name":
        return <UserCheck className="w-3.5 h-3.5" />;
      case "check_number":
        return <Binary className="w-3.5 h-3.5" />;
      case "check_quote":
        return <Quote className="w-3.5 h-3.5" />;
      case "check_location":
        return <MapPin className="w-3.5 h-3.5" />;
      case "check_allegation":
        return <Scale className="w-3.5 h-3.5" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5" />;
    }
  };

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const report = await requestEditorialAudit(content);
      setAuditReport(report);
      setIsExpanded(true);
    } catch (err) {
      console.error("Editorial audit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Compile active checks: prioritize deep auditReport, then initialChecks, otherwise default safeguard definitions
  const activeChecks: EditorialCheckItem[] =
    auditReport?.checks ||
    initialChecks ||
    EDITORIAL_SAFEGUARDS.map((s) => ({
      id: s.id,
      label: s.label,
      warningPrefix: s.warningPrefix,
      status: "pass",
      finding: "Ready for verification scan.",
    }));

  const warnings = activeChecks.filter((c) => c.status !== "pass");
  const hasWarnings = warnings.length > 0;

  const handleCopySuggestion = (suggestion: string, idx: number) => {
    navigator.clipboard.writeText(suggestion);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      id="editorial-safeguards-card"
      className={`rounded-xl border transition-all ${
        hasWarnings
          ? "bg-amber-50/70 border-amber-200/90"
          : "bg-slate-50 border-slate-200/90"
      } p-3 sm:p-4 my-3 text-xs`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold ${
              hasWarnings
                ? "bg-amber-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {hasWarnings ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight">
                6 Editorial Verification Safeguards
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  hasWarnings
                    ? "bg-amber-200 text-amber-900"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {hasWarnings ? `${warnings.length} Flagged` : "All Verified"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Copy-editing & legal protection against unsourced figures, allegations & misspellings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRunAudit}
            disabled={isLoading || !content.trim()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors disabled:opacity-50"
            title="Perform deep line-by-line audit using Gemini"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-rose-600" : ""}`} />
            <span className="hidden sm:inline">
              {isLoading ? "Auditing..." : "Deep Audit"}
            </span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            aria-label={isExpanded ? "Collapse safeguards" : "Expand safeguards"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Pills Bar (Visible even when collapsed) */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60">
        {EDITORIAL_SAFEGUARDS.map((s) => {
          const match = activeChecks.find((c) => c.id === s.id);
          const isWarning = match && match.status !== "pass";
          return (
            <button
              key={s.id}
              onClick={() => setIsExpanded(true)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                isWarning
                  ? "bg-amber-100/90 text-amber-900 border border-amber-300 font-semibold shadow-2xs"
                  : "bg-white/80 text-slate-600 border border-slate-200 hover:bg-white"
              }`}
            >
              <span>{isWarning ? "⚠️" : "✓"}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5">
          {auditReport?.summary && (
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs">
              <span className="font-semibold text-slate-900">Copy Desk Verdict: </span>
              <span>{auditReport.summary}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EDITORIAL_SAFEGUARDS.map((safeguard, idx) => {
              const check = activeChecks.find((c) => c.id === safeguard.id);
              const isWarning = check && check.status !== "pass";

              return (
                <div
                  key={safeguard.id}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isWarning
                      ? "bg-white border-amber-300 shadow-2xs"
                      : "bg-white/90 border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-slate-500">{getIcon(safeguard.id)}</span>
                      <span
                        className={
                          isWarning ? "text-amber-900" : "text-slate-800"
                        }
                      >
                        {isWarning ? `⚠️ ${safeguard.label}` : `✅ ${safeguard.label}`}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                        isWarning
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {check?.status === "flagged"
                        ? "FLAGGED"
                        : isWarning
                        ? "WARNING"
                        : "CLEAN"}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    {check?.finding || safeguard.description}
                  </p>

                  {check?.excerpt && (
                    <div className="mt-1.5 p-1 px-1.5 rounded bg-slate-50 border border-slate-200/80 font-mono text-[10px] text-slate-700 truncate">
                      "{check.excerpt}"
                    </div>
                  )}

                  {check?.suggestion && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-emerald-800 bg-emerald-50/80 p-1.5 rounded border border-emerald-200/80">
                      <span>
                        <strong>Action:</strong> {check.suggestion}
                      </span>
                      <button
                        onClick={() => handleCopySuggestion(check.suggestion!, idx)}
                        className="ml-2 text-emerald-700 hover:text-emerald-900 shrink-0"
                        title="Copy suggestion"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {onApplyFix && hasWarnings && (
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  const fixPrompt = `Please revise and fix the news draft strictly satisfying these verified editorial safeguards:\n${warnings
                    .map((w) => `${w.warningPrefix}: ${w.finding}`)
                    .join("\n")}`;
                  onApplyFix(fixPrompt);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fix Safeguards in Newsroom Composer</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
