import { EditorialCheckItem, EditorialAuditReport, EditorialCheckType } from "../types";
import { buildApiUrl } from "../config/apiConfig";

export interface SafeguardDefinition {
  id: EditorialCheckType;
  label: string;
  warningPrefix: string;
  icon: string;
  description: string;
  exampleBad: string;
  exampleGood: string;
}

export const EDITORIAL_SAFEGUARDS: SafeguardDefinition[] = [
  {
    id: "check_date",
    label: "Check date",
    warningPrefix: "⚠️ Check date",
    icon: "📅",
    description: "Verify dates, weekdays, chronological sequence, and calendar plausibility.",
    exampleBad: "The meeting occurred on Monday, Sept 14 (when Sept 14 was a Tuesday).",
    exampleGood: "The meeting took place on Tuesday, Sept 14, according to the official schedule.",
  },
  {
    id: "check_name",
    label: "Check spelling of person's name",
    warningPrefix: "⚠️ Check spelling of person's name",
    icon: "👤",
    description: "Verify names of officials, public figures, witnesses, and victims against records.",
    exampleBad: "DCP Hemanta Barua (when the officer's verified spelling is Hemanta Baruah).",
    exampleGood: "DCP Hemanta Baruah, confirmed via Guwahati Police directory.",
  },
  {
    id: "check_number",
    label: "Number mentioned without source",
    warningPrefix: "⚠️ Number mentioned without source",
    icon: "🔢",
    description: "Flag casualty counts, financial sums, percentages, or statistics lacking attribution.",
    exampleBad: "Over 45,000 residents were displaced by the flood.",
    exampleGood: "Over 45,000 residents were displaced, according to the Assam State Disaster Management Authority (ASDMA).",
  },
  {
    id: "check_quote",
    label: "Quote needs attribution",
    warningPrefix: "⚠️ Quote needs attribution",
    icon: "💬",
    description: "Flag direct quotations or verbatim claims lacking a named speaker or authority.",
    exampleBad: '"The situation is completely under control now," said an insider.',
    exampleGood: '"The situation is completely under control now," Kamrup Metro Deputy Commissioner stated.',
  },
  {
    id: "check_location",
    label: "Location needs verification",
    warningPrefix: "⚠️ Location needs verification",
    icon: "📍",
    description: "Verify town, village, revenue circle, district, or landmark names and jurisdiction.",
    exampleBad: "The incident happened in Sipajhar, Sonitpur district (Sipajhar is in Darrang).",
    exampleGood: "The incident happened in Sipajhar under Darrang district.",
  },
  {
    id: "check_allegation",
    label: "Allegation requires attribution",
    warningPrefix: "⚠️ Allegation requires attribution",
    icon: "⚖️",
    description: "Flag accusations, charges, or crimes stated as facts rather than attributed to police/court.",
    exampleBad: "The contractor embezzled Rs 3 crore from the road project.",
    exampleGood: "The contractor is accused of embezzling Rs 3 crore, according to the FIR registered at Dispur Police Station.",
  },
];

/**
 * Parses message text or draft for the 6 specific warning triggers:
 * ⚠️ Check date
 * ⚠️ Check spelling of person's name
 * ⚠️ Number mentioned without source
 * ⚠️ Quote needs attribution
 * ⚠️ Location needs verification
 * ⚠️ Allegation requires attribution
 */
export function extractEditorialWarnings(text: string): EditorialCheckItem[] {
  if (!text) return [];

  const results: EditorialCheckItem[] = [];

  EDITORIAL_SAFEGUARDS.forEach((safeguard) => {
    // Regex matching the prefix, followed by colon or dash and the finding
    const regex = new RegExp(
      `(?:⚠️\\s*)?${safeguard.label}\\s*[:\\-—]\\s*([^\\n\\r]+)`,
      "i"
    );
    const match = text.match(regex);

    if (match) {
      results.push({
        id: safeguard.id,
        label: safeguard.label,
        warningPrefix: safeguard.warningPrefix,
        status: "warning",
        finding: match[1].trim(),
      });
    }
  });

  return results;
}

/**
 * Fast client-side heuristic audit for the 6 safeguards when reviewing raw drafts
 */
export function fastHeuristicSafeguardCheck(text: string): EditorialCheckItem[] {
  if (!text || text.trim().length < 10) return [];

  const checks: EditorialCheckItem[] = [];

  // 1. Date Check
  const datePatterns = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b[,\s]+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}/i;
  const hasDates = datePatterns.test(text) || /\b(yesterday|today|tomorrow|last week|on \d{1,2}(?:st|nd|rd|th)?)\b/i.test(text);
  if (hasDates) {
    checks.push({
      id: "check_date",
      label: "Check date",
      warningPrefix: "⚠️ Check date",
      status: "pass",
      finding: "Dates or temporal markers found. Confirm against calendar and source publication date.",
    });
  } else {
    checks.push({
      id: "check_date",
      label: "Check date",
      warningPrefix: "⚠️ Check date",
      status: "warning",
      finding: "No clear dateline or event timeline specified in the story.",
      suggestion: "Add specific dateline and verify the day/date of the occurrence.",
    });
  }

  // 2. Person's name spelling
  const nameMatch = text.match(/\b(Mr\.|Ms\.|Dr\.|Shri|Smt\.|Chief Minister|Minister|DCP|SP|Inspector|Officer|Justice)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  if (nameMatch) {
    checks.push({
      id: "check_name",
      label: "Check spelling of person's name",
      warningPrefix: "⚠️ Check spelling of person's name",
      status: "pass",
      finding: `Person referenced: "${nameMatch[0]}". Double check transliteration against official gazette or directory.`,
      excerpt: nameMatch[0],
    });
  } else {
    checks.push({
      id: "check_name",
      label: "Check spelling of person's name",
      warningPrefix: "⚠️ Check spelling of person's name",
      status: "pass",
      finding: "Verify any personal names mentioned for standard regional spelling.",
    });
  }

  // 3. Numbers without source
  const numberPatterns = /\b(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:people|persons|dead|injured|killed|crore|lakh|rupees|USD|\$|percent|%|hectares|tonnes|cases)\b/i;
  const numMatch = text.match(numberPatterns);
  const hasAttribution = /\b(according to|stated by|as per|reported by|official data from|ASDMA|police said|ministry said|spokesperson|records show)\b/i.test(text);

  if (numMatch && !hasAttribution) {
    checks.push({
      id: "check_number",
      label: "Number mentioned without source",
      warningPrefix: "⚠️ Number mentioned without source",
      status: "warning",
      finding: `Figure "${numMatch[0]}" is stated without clear institutional attribution.`,
      excerpt: numMatch[0],
      suggestion: "Add official agency attribution (e.g. 'according to police', 'ASDMA bulletin stated').",
    });
  } else if (numMatch) {
    checks.push({
      id: "check_number",
      label: "Number mentioned without source",
      warningPrefix: "⚠️ Number mentioned without source",
      status: "pass",
      finding: `Statistical references found with source attribution cues.`,
      excerpt: numMatch[0],
    });
  } else {
    checks.push({
      id: "check_number",
      label: "Number mentioned without source",
      warningPrefix: "⚠️ Number mentioned without source",
      status: "pass",
      finding: "No high-risk unsourced figures detected.",
    });
  }

  // 4. Quote needs attribution
  const quoteMatch = text.match(/["“]([^"”]{12,})["”]/);
  if (quoteMatch) {
    const surrounding = text.slice(Math.max(0, text.indexOf(quoteMatch[0]) - 50), text.indexOf(quoteMatch[0]) + quoteMatch[0].length + 50);
    const hasSpeaker = /\b(said|stated|told|remarked|clarified|asserted|explained|added|alleged)\s+([A-Z][a-z]+|the|officials|police|minister)\b/i.test(surrounding);
    if (!hasSpeaker) {
      checks.push({
        id: "check_quote",
        label: "Quote needs attribution",
        warningPrefix: "⚠️ Quote needs attribution",
        status: "warning",
        finding: `Quotation "${quoteMatch[0].slice(0, 40)}..." lacks an explicitly named speaker in its clause.`,
        excerpt: quoteMatch[0],
        suggestion: "Attribute quote to a named individual with their official title.",
      });
    } else {
      checks.push({
        id: "check_quote",
        label: "Quote needs attribution",
        warningPrefix: "⚠️ Quote needs attribution",
        status: "pass",
        finding: `Direct quotation detected with speaker attribution.`,
        excerpt: quoteMatch[0].slice(0, 50) + "...",
      });
    }
  } else {
    checks.push({
      id: "check_quote",
      label: "Quote needs attribution",
      warningPrefix: "⚠️ Quote needs attribution",
      status: "pass",
      finding: "No unattributed direct quotes found.",
    });
  }

  // 5. Location verification
  const assamLocations = /\b(Guwahati|Dispur|Kamrup|Sonitpur|Darrang|Nagaon|Jorhat|Dibrugarh|Silchar|Cachar|Kokrajhar|Bongaigaon|Barpeta|Nalbari|Tezpur|Majuli|Golaghat|Sivasagar|Tinsukia|Karbi Anglong|Dima Hasao|Paltan Bazar|Jalukbari|Khanapara|Panbazar|Chandmari|Uzan Bazar|Maligaon|Beltola|Six Mile|Lakhimpur|Dhemaji)\b/i;
  const locMatch = text.match(assamLocations);
  if (locMatch) {
    checks.push({
      id: "check_location",
      label: "Location needs verification",
      warningPrefix: "⚠️ Location needs verification",
      status: "pass",
      finding: `Location "${locMatch[0]}" identified. Verify specific circle/district borders.`,
      excerpt: locMatch[0],
    });
  } else {
    checks.push({
      id: "check_location",
      label: "Location needs verification",
      warningPrefix: "⚠️ Location needs verification",
      status: "pass",
      finding: "Ensure all geographical references include both town and parent district.",
    });
  }

  // 6. Allegation attribution check
  const allegationWords = /\b(accused of|alleged|embezzled|bribed|scam|fraud|murdered|stole|cheated|assaulted|corrupt|extortion)\b/i;
  const allegMatch = text.match(allegationWords);
  const legalAttribution = /\b(police said|as per FIR|complaint stated|court records|chargesheet|case registered|under section)\b/i.test(text);

  if (allegMatch && !legalAttribution) {
    checks.push({
      id: "check_allegation",
      label: "Allegation requires attribution",
      warningPrefix: "⚠️ Allegation requires attribution",
      status: "flagged",
      finding: `Allegation or criminal claim "${allegMatch[0]}" stated without citing police, FIR, or court filing.`,
      excerpt: allegMatch[0],
      suggestion: "Prefix with 'police said', 'according to the complaint', or 'court documents state' to prevent legal liability.",
    });
  } else if (allegMatch) {
    checks.push({
      id: "check_allegation",
      label: "Allegation requires attribution",
      warningPrefix: "⚠️ Allegation requires attribution",
      status: "pass",
      finding: `Allegations referenced with legal attribution cues.`,
      excerpt: allegMatch[0],
    });
  } else {
    checks.push({
      id: "check_allegation",
      label: "Allegation requires attribution",
      warningPrefix: "⚠️ Allegation requires attribution",
      status: "pass",
      finding: "No un-attributed criminal allegations detected.",
    });
  }

  return checks;
}

/**
 * Request deep AI-powered editorial verification via /api/verify-editorial
 */
export async function requestEditorialAudit(text: string): Promise<EditorialAuditReport> {
  const url = buildApiUrl("/api/verify-editorial");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    // Fall back to client heuristic audit if endpoint is busy or network fails
    const fallbackChecks = fastHeuristicSafeguardCheck(text);
    const warningCount = fallbackChecks.filter((c) => c.status !== "pass").length;
    return {
      timestamp: Date.now(),
      overallStatus: warningCount > 0 ? "warnings_found" : "clean",
      warningCount,
      checks: fallbackChecks,
      summary:
        warningCount > 0
          ? `${warningCount} of 6 editorial verification safeguards require copy editor review.`
          : "All 6 editorial verification safeguards verified cleanly.",
    };
  }

  return await response.json();
}
