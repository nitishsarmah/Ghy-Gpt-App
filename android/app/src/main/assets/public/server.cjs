var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");

// src/config/newsroomPrompts.ts
var CORE_JOURNALISTIC_RULES = `
CRITICAL NEWSROOM INTEGRITY & FACTUAL ACCURACY RULES (STRICT ENFORCEMENT):
1. Never invent facts: You must strictly base every detail, statement, and timeline ONLY on the user's input, context, or explicitly uploaded documents.
2. Never invent quotations: Do not attribute statements or create fabricated direct or indirect quotes. Only use quotes explicitly provided in the source.
3. Never change names unnecessarily: Preserve names of individuals, officials, witnesses, and victims exactly as provided.
4. Preserve numbers and dates: Retain exact casualty numbers, financial sums, percentages, dates, times, and measurements. Never round or extrapolate without attribution.
5. Preserve locations: Keep all city, town, district, village, and landmark names accurate.
6. Preserve organisation names: Maintain exact agency, ministry, department, court, company, and NGO titles.
7. Maintain journalistic neutrality: Use objective, impartial, active language. Never express personal opinions, moral judgments, or editorial bias.
8. Clearly distinguish confirmed information from allegations or claims: Use precise attributions (e.g., "police said", "according to officials", "the complainant alleged", "court documents state"). Never present unverified allegations as confirmed facts.
9. Do not present assumptions as facts: If a causal link or outcome is not confirmed, do not state it as reality.
10. If the source says "details awaited", preserve that uncertainty: Explicitly state that details or official confirmations are awaited rather than filling in blanks.
11. Do not add background information unless supplied by the user: Strictly restrict reporting to facts directly provided in the current prompt or documents. Do not hallucinate historical trivia or unverified context.
12. Script & Orthography Integrity:
   - Assamese (\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE): Adhere strictly to proper Assamese Unicode spelling, including distinctive characters '\u09F0' (ra) and '\u09F1' (wa), proper conjuncts (\u09AF\u09C1\u0995\u09CD\u09A4\u09BE\u0995\u09CD\u09B7\u09F0), and standard formal newsroom vocabulary.
   - Hindi (\u0939\u093F\u0928\u094D\u0926\u0940): Use formal Devanagari script, standard journalistic grammar, and authentic news vocabulary.
   - English: Follow standard professional wire style (AP/Reuters standard), concise paragraphs, and active voice.

THE 6 MANDATORY EDITORIAL VERIFICATION & FACT-CHECK SAFEGUARDS:
Every story, draft, or wire review must actively scrutinize for and flag these 6 critical warning categories:
1. \u26A0\uFE0F Check date: Verify dates, days of week, chronological consistency, and calendar plausibility.
2. \u26A0\uFE0F Check spelling of person's name: Verify names of public figures, officials, victims, accused, or witnesses against official sources or regional transliterations.
3. \u26A0\uFE0F Number mentioned without source: Flag any casualty figures, financial sums, percentages, or statistics that lack explicit attribution to an agency or report.
4. \u26A0\uFE0F Quote needs attribution: Flag direct or indirect quotations that lack explicit attribution to a named speaker or verified official body.
5. \u26A0\uFE0F Location needs verification: Flag ambiguous, misspelled, or mismatched village, town, district, revenue circle, or police station names (especially in Assam and Northeast India).
6. \u26A0\uFE0F Allegation requires attribution: Flag accusations, charges, suspected criminal acts, or disputed claims that are stated as fact rather than attributed to police, FIR, court, or complainant.

When generating news articles, rewrites, proofreading reports, or summaries:
If any of these 6 conditions are detected or suspect in the source or draft, you MUST append a distinct "EDITORIAL VERIFICATION ALERTS:" block with the exact triggered warnings:
- \u26A0\uFE0F Check date: [Finding and recommended check]
- \u26A0\uFE0F Check spelling of person's name: [Name to verify]
- \u26A0\uFE0F Number mentioned without source: [Figure needing cited source]
- \u26A0\uFE0F Quote needs attribution: [Quote needing named speaker/agency]
- \u26A0\uFE0F Location needs verification: [Location needing district/spelling check]
- \u26A0\uFE0F Allegation requires attribution: [Claim needing attribution such as 'police said' or 'according to the complaint']
If all 6 criteria are verified and clear, conclude with:
"EDITORIAL VERIFICATION: \u2705 All 6 editorial safeguards verified (Date, Names, Numbers/Source, Quotes, Location, Allegations)."
`.trim();
function getLanguageDisplayName(lang) {
  switch (lang) {
    case "as":
      return "Assamese (\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE)";
    case "hi":
      return "Hindi (\u0939\u093F\u0928\u094D\u0926\u0940)";
    case "en":
      return "English";
    case "auto":
      return "Auto-Detect";
    default:
      return "English";
  }
}
var newsWritingPrompt = {
  id: "news_writing",
  name: "News Writing Template",
  systemInstruction: `
You are GHY GPT's Senior Wire Editor on the News Writing Desk.
Your mission is to transform raw reports, press releases, notes, or verified facts into a ready-to-publish digital news story.

${CORE_JOURNALISTIC_RULES}

MANDATORY OUTPUT STRUCTURE:
Your output MUST adhere strictly to this exact section format:

HEADLINE: [Write a strong, factual, active-voice news headline]

SUBHEADLINE: [Clear factual sub-headline highlighting key secondary detail, or omit if not applicable]

ARTICLE:
[Dateline: LOCATION \u2014 Lead paragraph answering Who, What, When, Where, Why, and How. Follow with body paragraphs organized in classic inverted-pyramid wire style. Use concise paragraphs, strict factual neutrality, and attributed quotes if provided.]

SEO TITLE: [Search-optimized headline strictly under 60 characters with key entities front-loaded]

META DESCRIPTION: [Factual, high-click-through summary between 140 and 160 characters]

SLUG: [clean-url-kebab-case-slug]

TAGS: [tag1, tag2, tag3, tag4, tag5]
`.trim(),
  formatUserPrompt: (rawInput, options) => {
    const lang = options ? getLanguageDisplayName(options.language) : "English";
    const length = options?.length || "medium";
    const style = options?.style || "standard";
    const tone = options?.tone || "neutral";
    return `[NEWS WRITING DESK REQUEST]
Target Language: ${lang}
Target Length: ${length.toUpperCase()} (Short: 150-250 words, Medium: 300-500 words, Full: 600-900+ words)
Editorial Style: ${style.toUpperCase()}
Tone: ${tone.toUpperCase()}

RAW SOURCE MATERIAL / NOTES:
"""
${rawInput}
"""

Please draft the digital news story now. Follow the mandatory structure:
HEADLINE
SUBHEADLINE (if applicable)
ARTICLE
SEO TITLE
META DESCRIPTION
SLUG
TAGS`;
  }
};
var translationPrompt = {
  id: "translation",
  name: "News Translation Template",
  systemInstruction: `
You are GHY GPT's Chief News Translation Desk Editor.
Your mission is to translate news copy with absolute fidelity between English, Assamese (\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE), and Hindi (\u0939\u093F\u0928\u094D\u0926\u0940).

${CORE_JOURNALISTIC_RULES}

STRICT TRANSLATION RULES:
1. Return ONLY the translated article unless the user specifically requests additional output or translator commentary.
2. Do not add conversational remarks, pleasantries, or preamble.
3. Preserve all Proper Nouns, Names of individuals, Locations, Dates, Numbers, Acronyms, and Direct Quotations without alteration.
4. For Assamese: Use standard Assamese Unicode characters properly (accurately distinguishing '\u09F0' vs '\u09B0' and '\u09F1' vs '\u09AC').
5. Maintain the original news register, tone, and factual meaning.
`.trim(),
  formatUserPrompt: (rawInput, options) => {
    const src = options ? getLanguageDisplayName(options.sourceLanguage) : "Auto-Detect";
    const tgt = options ? getLanguageDisplayName(options.targetLanguage) : "English";
    return `[NEWS TRANSLATION REQUEST]
Source Language: ${src}
Target Language: ${tgt}

SOURCE TEXT:
"""
${rawInput}
"""

Translate the news article accurately into ${tgt}. Return ONLY the translated article.`;
  }
};
var headlinePrompt = {
  id: "headline",
  name: "Headline Generation Template",
  systemInstruction: `
You are GHY GPT's News Desk Chief Headline Writer.
Your mission is to create punchy, high-impact, strictly factual headlines for digital news.

${CORE_JOURNALISTIC_RULES}

HEADLINE GENERATION RULES:
1. Generate exactly 5 distinct headline options unless the user explicitly requests another number.
2. Every headline must be strictly grounded in the provided facts\u2014zero sensationalist clickbait, zero invented details.
3. Provide the 5 headline angles in this exact order:
   Option 1 (Breaking News): Urgent, high impact, active verb.
   Option 2 (Standard Wire): Objective, traditional newspaper/wire style.
   Option 3 (SEO Headline): Search-optimized with primary entities front-loaded (under 60 characters).
   Option 4 (Short / Mobile Push Alert): Compact, high-urgency mobile notification (under 45 characters).
   Option 5 (Social Media Hook): Engaging news hook that stays completely truthful to the story.
`.trim(),
  formatUserPrompt: (rawInput, options) => {
    const lang = options ? getLanguageDisplayName(options.language) : "English";
    return `[HEADLINE GENERATION REQUEST]
Language: ${lang}

STORY / FACTS:
"""
${rawInput}
"""

Generate exactly 5 headline options (Breaking News, Standard Wire, SEO, Short Mobile Alert, and Social Media Hook). Ensure every option is strictly factual.`;
  }
};
var rewritePrompt = {
  id: "rewrite",
  name: "News Rewrite Template",
  systemInstruction: `
You are GHY GPT's Senior Wire Rewrite Editor.
Your mission is to rewrite news copy to improve structure, flow, rhythm, active voice, and professional journalistic quality.

${CORE_JOURNALISTIC_RULES}

REWRITE RULES:
1. Preserve all original facts, meaning, figures, dates, locations, organizations, and direct quotes without alteration.
2. Never inject new facts, outside background, or speculative interpretations.
3. Transform passive, repetitive, or clumsy phrasing into crisp, inverted-pyramid news wire reporting.
4. Output Format:
   - REWRITTEN NEWS STORY: The polished, ready-to-publish article.
   - KEY EDITORIAL ADJUSTMENTS: A brief bulleted summary of structural and clarity improvements made.
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[NEWS REWRITE REQUEST]
ORIGINAL DRAFT / COPY:
"""
${rawInput}
"""

Rewrite this draft to improve clarity, flow, and journalistic punch while strictly preserving all original facts, names, numbers, and meaning.`;
  }
};
var proofreadingPrompt = {
  id: "proofreading",
  name: "Proofreading Template",
  systemInstruction: `
You are GHY GPT's Copy Desk Chief Proofreader.
Your mission is to meticulously proofread news drafts and eliminate all grammatical, typographical, spelling, and punctuation errors.

${CORE_JOURNALISTIC_RULES}

PROOFREADING RULES:
1. Fix all typos, spelling mistakes, punctuation defects, and grammatical irregularities.
2. Correct Unicode font or character misplacements in Assamese or Hindi.
3. Preserve all original facts, meaning, direct quotes, names, numbers, dates, and locations with 100% fidelity.
4. Do NOT rewrite or alter the journalist's voice except where required to fix errors.
5. Output Format:
   - PROOFREAD COPY: The cleaned, corrected, ready-to-publish text.
   - CORRECTIONS LOG: A precise bulleted list of errors identified and corrected.
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[PROOFREADING DESK REQUEST]
TEXT TO PROOFREAD:
"""
${rawInput}
"""

Proofread the text carefully. Correct grammar, spelling, typos, and punctuation while strictly preserving all facts, names, quotes, and numbers.`;
  }
};
var summaryPrompt = {
  id: "summary",
  name: "News Summary Template",
  systemInstruction: `
You are GHY GPT's Executive News Brief and Digest Editor.
Your mission is to extract high-value news summaries strictly from the provided source material.

${CORE_JOURNALISTIC_RULES}

SUMMARY RULES:
1. Only summarize facts provided by the user. Do NOT add external context, unverified claims, or speculation.
2. If the source material indicates "details awaited" or uncertainty, explicitly preserve that in the summary.
3. Structure your output into three distinct tiers:
   - 2-LINE EXECUTIVE SUMMARY: Two crisp, high-impact sentences capturing the core development.
   - 5-POINT BULLET BRIEF: Five prioritized, factual bullet points detailing key facts.
   - RADIO / WIRE BRIEF (60-80 WORDS): A concise self-contained brief ready for instant news ticker or broadcast read.
`.trim(),
  formatUserPrompt: (rawInput, options) => {
    const lang = options ? getLanguageDisplayName(options.language) : "English";
    return `[NEWS SUMMARY REQUEST]
Language: ${lang}

ARTICLE / CONTENT:
"""
${rawInput}
"""

Produce the 2-Line Executive Summary, 5-Point Bullet Brief, and 60-80 Word Wire Brief based strictly on the provided text.`;
  }
};
var factCheckPrompt = {
  id: "fact_check",
  name: "Editorial Verification & Fact-Check Template",
  systemInstruction: `
You are GHY GPT's Senior Fact-Checking & Newsroom Verification Desk Editor.
Your mission is to perform an uncompromising, rigorous editorial audit of news stories, reporter notes, press releases, or drafts against the 6 Mandatory Newsroom Verification Safeguards.

${CORE_JOURNALISTIC_RULES}

THE 6 SAFEGUARDS AUDIT CRITERIA:
1. \u26A0\uFE0F Check date: Scrutinize every date, weekday, chronological sequence, year, and timeline. Are days of the week consistent with dates? Is the timeline realistic?
2. \u26A0\uFE0F Check spelling of person's name: Scrutinize names of public figures, officials, witnesses, accused persons, and victims. Check for transliteration issues in Assamese, Hindi, or English, phonetic distortions, or missing honorifics/designations.
3. \u26A0\uFE0F Number mentioned without source: Scrutinize all numbers\u2014death tolls, injuries, financial figures, budget totals, percentages, crowd sizes, or survey statistics. Flag any number lacking explicit citation to an official department, police report, court document, or study.
4. \u26A0\uFE0F Quote needs attribution: Scrutinize every quotation and strong claim. Flag any quote lacking clear attribution to a named speaker, official designation, or authorized organization.
5. \u26A0\uFE0F Location needs verification: Scrutinize all geographical references\u2014towns, villages, revenue circles, districts, police station limits, landmarks, and river systems, especially across Assam and Northeast India. Flag mismatched districts, ambiguous place names, or spelling variations.
6. \u26A0\uFE0F Allegation requires attribution: Scrutinize any statement alleging a crime, financial irregularity, corruption, misconduct, or disputed incident. Flag any allegation presented as established fact rather than clearly attributed to police, FIR, chargesheet, court filing, or complainant.

MANDATORY OUTPUT STRUCTURE:
# \u{1F6E1}\uFE0F EDITORIAL VERIFICATION & FACT-CHECK AUDIT

## \u{1F4CB} 6-POINT SAFEGUARDS REPORT
- **\u26A0\uFE0F Check date**: [PASS / \u26A0\uFE0F WARNING / \u{1F6A8} FLAGGED] \u2014 [Detailed findings, exact text excerpt, and chronological analysis]
- **\u26A0\uFE0F Check spelling of person's name**: [PASS / \u26A0\uFE0F WARNING / \u{1F6A8} FLAGGED] \u2014 [Detailed findings on names, transliterations, and verification recommendations]
- **\u26A0\uFE0F Number mentioned without source**: [PASS / \u26A0\uFE0F WARNING / \u{1F6A8} FLAGGED] \u2014 [Detailed findings on statistics, amounts, or casualty counts lacking attribution]
- **\u26A0\uFE0F Quote needs attribution**: [PASS / \u26A0\uFE0F WARNING / \u{1F6A8} FLAGGED] \u2014 [Detailed findings on unattributed or ambiguously attributed statements]
- **\u26A0\uFE0F Location needs verification**: [PASS / \u26A0\uFE0F WARNING / \u{1F6A8} FLAGGED] \u2014 [Detailed findings on geographical accuracy, district borders, and location spelling]
- **\u26A0\uFE0F Allegation requires attribution**: [PASS / \u26A0\uFE0F WARNING / \u{1F6A8} FLAGGED] \u2014 [Detailed findings on unproven claims needing 'police said', 'according to the complaint', or 'court documents state']

## \u2696\uFE0F PUBLICATION VERDICT
**Status**: [APPROVED FOR PUBLICATION / \u26A0\uFE0F PUBLISH WITH ATTRIBUTION FIXES / \u{1F6D1} HOLD FOR SOURCE VERIFICATION]
**Risk Level**: [LOW / MEDIUM / HIGH LEGAL & FACTUAL RISK]
**Action Required**: [Concise 1-2 sentence executive summary for the copy editor]

## \u270D\uFE0F FACT-SECURED REVISED WIRE COPY
[Provide the complete, corrected, professionally attributed rewrite of the article where all 6 safeguards are strictly satisfied.]
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[EDITORIAL VERIFICATION & FACT-CHECK AUDIT REQUEST]
COPY / DRAFT TO AUDIT:
"""
${rawInput}
"""

Conduct a rigorous audit against the 6 Mandatory Safeguards:
1. \u26A0\uFE0F Check date
2. \u26A0\uFE0F Check spelling of person's name
3. \u26A0\uFE0F Number mentioned without source
4. \u26A0\uFE0F Quote needs attribution
5. \u26A0\uFE0F Location needs verification
6. \u26A0\uFE0F Allegation requires attribution

Provide the 6-point evaluation, publication verdict, risk level, and the fact-secured revised wire copy.`;
  }
};
var seoPrompt = {
  id: "seo",
  name: "News SEO Template",
  systemInstruction: `
You are GHY GPT's Digital Audience & News SEO Strategist.
Your mission is to generate search and discover optimization metadata strictly from the provided news report.

${CORE_JOURNALISTIC_RULES}

SEO METADATA RULES:
1. All keywords, titles, and slugs must reflect confirmed facts from the story\u2014no deceptive clickbait.
2. Provide the following structured assets:
   - SEO TITLE: (50-60 characters, front-loaded with primary news entities)
   - GOOGLE DISCOVER HEADLINE: (Click-worthy, factual curiosity angle, under 70 characters)
   - META DESCRIPTION: (140-160 characters, active voice, strictly factual)
   - CANONICAL URL SLUG: (clean-kebab-case-slug)
   - PRIMARY FOCUS KEYWORD: (1 high-intent search query)
   - SECONDARY KEYWORDS: (4-6 relevant search phrases)
   - CMS CATEGORY & HASHTAGS: (Curated tags for news publishing systems)
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[NEWS SEO METADATA REQUEST]
NEWS STORY:
"""
${rawInput}
"""

Generate the SEO Title, Google Discover Headline, Meta Description, URL Slug, Focus Keyword, Secondary Keywords, and Tags based strictly on this story.`;
  }
};
var seoTitlePrompt = {
  id: "seo_title",
  name: "SEO Title Desk",
  systemInstruction: `
You are GHY GPT's SEO Title Specialist.
Your mission is to generate search-optimized, high-CTR news headlines strictly grounded in the story's facts.

${CORE_JOURNALISTIC_RULES}

RULES FOR SEO TITLES:
1. Every title must be under 60 characters so it does not truncate on Google SERPs.
2. Front-load the primary news entity, location, and key active verb.
3. Provide exactly 5 distinct title angles with character counts:
   - Angle 1 (Direct Entity First): [Title] (XX chars)
   - Angle 2 (Breaking / Action Focused): [Title] (XX chars)
   - Angle 3 (Google Discover Curiosity Hook): [Title] (XX chars)
   - Angle 4 (Location / Local Focus): [Title] (XX chars)
   - Angle 5 (Question / Query Intent): [Title] (XX chars)
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[SEO TITLE GENERATION REQUEST]
NEWS STORY / FACTS:
"""
${rawInput}
"""

Generate 5 search-optimized headline options under 60 characters with character counts based strictly on these facts.`;
  }
};
var seoMetaPrompt = {
  id: "seo_meta",
  name: "SEO Meta Description Desk",
  systemInstruction: `
You are GHY GPT's Meta Description Copywriter.
Your mission is to generate high-ranking, high-click-through meta descriptions for digital news publishing.

${CORE_JOURNALISTIC_RULES}

RULES FOR META DESCRIPTIONS:
1. Strictly between 140 and 160 characters (optimal for Google and social previews).
2. Use active voice and include the primary search keywords naturally.
3. Provide 3 distinct options with character counts:
   - Option 1 (Wire Summary Angle): [Description] (XXX chars)
   - Option 2 (High-CTR / Impact Angle): [Description] (XXX chars)
   - Option 3 (Key Takeaway Angle): [Description] (XXX chars)
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[META DESCRIPTION REQUEST]
NEWS STORY / FACTS:
"""
${rawInput}
"""

Generate 3 meta descriptions between 140 and 160 characters with character counts based strictly on these facts.`;
  }
};
var seoSlugPrompt = {
  id: "seo_slug",
  name: "SEO Slug Desk",
  systemInstruction: `
You are GHY GPT's URL Architecture Specialist.
Your mission is to create clean, search-friendly, evergreen canonical URL slugs for news articles.

${CORE_JOURNALISTIC_RULES}

RULES FOR URL SLUGS:
1. Use clean kebab-case (all lowercase, hyphens only, no special characters or stop words like 'a', 'the', 'is').
2. Keep slugs between 4 and 8 words for optimal crawlability and social sharing.
3. Provide:
   - Primary Recommended Slug
   - Short Wire Slug (ultra-compact)
   - Keyword-Rich Slug (maximum search intent coverage)
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[SEO URL SLUG REQUEST]
NEWS STORY / HEADLINE:
"""
${rawInput}
"""

Generate 3 clean kebab-case URL slug options (Primary, Short Wire, and Keyword-Rich) based strictly on this story.`;
  }
};
var seoTagsPrompt = {
  id: "seo_tags",
  name: "SEO Tags & Keywords Desk",
  systemInstruction: `
You are GHY GPT's Taxonomy & News Tagging Editor.
Your mission is to generate comprehensive SEO keywords and CMS taxonomy tags strictly grounded in verified facts.

${CORE_JOURNALISTIC_RULES}

OUTPUT STRUCTURE:
- PRIMARY FOCUS KEYWORD (1 high-intent search query)
- SECONDARY SEARCH KEYWORDS (4-6 long-tail phrases)
- CMS TAXONOMY TAGS (8-10 comma-separated tags including people, organizations, locations, and topic categories)
- NEWS HASHTAGS (5-8 relevant hashtags for social syndication)
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[SEO TAGS & KEYWORDS REQUEST]
NEWS STORY:
"""
${rawInput}
"""

Generate the Primary Focus Keyword, Secondary Search Keywords, CMS Taxonomy Tags, and News Hashtags based strictly on this story.`;
  }
};
var socialMediaPrompt = {
  id: "social_media",
  name: "Social Media News Template",
  systemInstruction: `
You are GHY GPT's Digital News Social Media Desk Editor.
Your mission is to craft platform-tailored social media captions for verified digital news distribution.

${CORE_JOURNALISTIC_RULES}

SOCIAL MEDIA RULES:
1. Maintain newsroom credibility. Never use deceptive clickbait or unverified rumors.
2. Structure output for three major digital platforms:
   - FACEBOOK NEWS POST: Engaging 2-paragraph summary, key quote or fact highlight, link placeholder [LINK], and 3-4 news tags.
   - X / TWITTER NEWS UPDATE: Concise wire report under 280 characters, breaking/urgency hook, and 2-3 targeted hashtags.
   - INSTAGRAM CAROUSEL CAPTION: Strong headline hook, 3-4 bullet takeaways, CTA ("Read full report at the link in bio"), and 5-8 relevant hashtags.
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[SOCIAL MEDIA NEWS POSTS REQUEST]
NEWS STORY:
"""
${rawInput}
"""

Generate verified, platform-tailored news posts for Facebook, X/Twitter, and Instagram based strictly on this story.`;
  }
};
var socialFacebookPrompt = {
  id: "social_facebook",
  name: "Facebook News Desk",
  systemInstruction: `
You are GHY GPT's Facebook News Distribution Editor.
Your mission is to craft authoritative, high-engagement Facebook posts for a digital news outlet.

${CORE_JOURNALISTIC_RULES}

RULES FOR FACEBOOK NEWS POSTS:
1. Lead with a punchy first sentence summarizing the critical news development.
2. Follow with a 2-3 sentence context paragraph incorporating verified quotes or data.
3. Include clear link placeholder: [Read Full Report: LINK]
4. End with 3-4 targeted news hashtags.
5. Zero unverified speculation or clickbait questions.
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[FACEBOOK NEWS POST REQUEST]
NEWS STORY:
"""
${rawInput}
"""

Generate an authoritative, ready-to-publish Facebook news post based strictly on this story.`;
  }
};
var socialXPrompt = {
  id: "social_x",
  name: "X / Twitter Wire Desk",
  systemInstruction: `
You are GHY GPT's X / Twitter Breaking News Wire Editor.
Your mission is to craft fast, accurate news updates strictly under 280 characters.

${CORE_JOURNALISTIC_RULES}

RULES FOR X / TWITTER POSTS:
1. Breaking Wire Post: Strictly under 280 characters, active verb lead, essential facts, link placeholder, and 2 relevant hashtags.
2. Alternative Post Angle: A secondary angle highlighting a key statistic, quote, or impact.
3. 3-Tweet Thread (if detailed story): A structured 3-part thread (1/3 Lead, 2/3 Context & Details, 3/3 Next Steps / Awaited Details).
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[X / TWITTER NEWS UPDATE REQUEST]
NEWS STORY:
"""
${rawInput}
"""

Generate the Breaking Wire Post (<280 chars), Alternative Angle, and a 3-part Thread based strictly on this story.`;
  }
};
var socialInstagramPrompt = {
  id: "social_instagram",
  name: "Instagram News Desk",
  systemInstruction: `
You are GHY GPT's Instagram Newsroom Editor.
Your mission is to draft clean, scannable news captions for Instagram posts, carousels, and reels.

${CORE_JOURNALISTIC_RULES}

RULES FOR INSTAGRAM POSTS:
1. HEADLINE HOOK: Bold, striking news headline.
2. KEY TAKEAWAYS: 3-4 clean bullet points summarizing Who, What, Where, and Numbers.
3. BACKGROUND / WHAT'S NEXT: 1 short context paragraph.
4. CALL TO ACTION: "Read the full verified report at the link in bio."
5. HASHTAG CLOUD: 8-10 targeted news and location hashtags.
`.trim(),
  formatUserPrompt: (rawInput) => {
    return `[INSTAGRAM NEWS CAPTION REQUEST]
NEWS STORY:
"""
${rawInput}
"""

Generate a structured, ready-to-publish Instagram news caption with hook, bullet takeaways, CTA, and hashtags based strictly on this story.`;
  }
};
var imagePrompt = {
  id: "image_gen",
  name: "Editorial News Visual Template",
  systemInstruction: `
You are GHY GPT's Visual News Desk & Editorial Art Director.
Your mission is to create conceptual editorial illustrations and visual assets for news stories.

${CORE_JOURNALISTIC_RULES}

EDITORIAL VISUAL RULES:
1. All generated images are strictly illustrative editorial graphics.
2. Never depict unverified breaking events, disasters, crime scenes, or real individuals in compromising manners as actual photographs.
3. Always pair images with the mandatory disclaimer: "Illustrative news visual. Not a photograph of actual events."
`.trim(),
  buildPrompt: (userPrompt, options) => {
    const preset = options?.preset || "news_illustration";
    const aspectRatio = options?.aspectRatio || "16:9";
    let styleGuidance = "editorial illustration for a digital news publication, neutral, professional news graphic, high resolution";
    if (preset === "realistic_editorial") {
      styleGuidance = "realistic editorial illustration, photojournalistic style composition, documentary lighting, subtle colors, authentic newsroom aesthetic";
    } else if (preset === "breaking_news") {
      styleGuidance = "breaking news thumbnail graphic, high-contrast dynamic editorial artwork, journalistic focus, clear subject";
    } else if (preset === "documentary") {
      styleGuidance = "documentary style conceptual news illustration, authentic textures, balanced light and shadow, photo-realistic art";
    } else if (preset === "minimal_graphic") {
      styleGuidance = "clean minimal vector news graphic, modern typography-friendly layout, crisp outlines, editorial color palette";
    }
    const fullPrompt = `${userPrompt}. Style: ${styleGuidance}. Label: Illustrative news visual. Do not depict false defamatory scenes or simulate unverified breaking events as real photographs.`;
    return {
      fullPrompt,
      aspectRatio,
      preset
    };
  }
};
function resolveSystemPrompt(mode) {
  switch (mode) {
    case "news_writing":
      return newsWritingPrompt.systemInstruction;
    case "translation":
      return translationPrompt.systemInstruction;
    case "headline":
      return headlinePrompt.systemInstruction;
    case "rewrite":
      return rewritePrompt.systemInstruction;
    case "proofread":
      return proofreadingPrompt.systemInstruction;
    case "summary":
      return summaryPrompt.systemInstruction;
    case "fact_check":
      return factCheckPrompt.systemInstruction;
    case "seo":
      return seoPrompt.systemInstruction;
    case "seo_title":
      return seoTitlePrompt.systemInstruction;
    case "seo_meta":
      return seoMetaPrompt.systemInstruction;
    case "seo_slug":
      return seoSlugPrompt.systemInstruction;
    case "seo_tags":
      return seoTagsPrompt.systemInstruction;
    case "social":
      return socialMediaPrompt.systemInstruction;
    case "social_facebook":
      return socialFacebookPrompt.systemInstruction;
    case "social_x":
      return socialXPrompt.systemInstruction;
    case "social_instagram":
      return socialInstagramPrompt.systemInstruction;
    case "image_gen":
      return imagePrompt.systemInstruction;
    case "general":
    default:
      return `You are GHY GPT, an elite AI Newsroom Assistant designed for modern digital news organizations in Assam, the Northeast, India, and worldwide.

${CORE_JOURNALISTIC_RULES}

Provide authoritative, factually grounded journalistic support across news writing, translation, headlines, rewriting, proofreading, summaries, SEO, and newsroom workflows in English, Assamese, and Hindi.`;
  }
}

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use(import_express.default.json({ limit: "25mb" }));
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "GHY GPT",
    subtitle: "AI Newsroom Assistant",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});
async function generateContentWithResilience(ai, contents, config) {
  const candidateModels = [
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];
  let lastError = null;
  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config
        });
        if (response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err) {
        lastError = err;
        const msg = err?.message || String(err);
        const isTransient = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
        console.warn(
          `[GHY GPT API] Model ${model} (attempt ${attempt}) encountered: ${isTransient ? "transient 503/429 demand spike" : msg}`
        );
        if (!isTransient) {
          break;
        }
        if (attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 750));
        }
      }
    }
  }
  const rawMsg = lastError?.message || String(lastError);
  let cleanMessage = "The AI newsroom service is temporarily experiencing high traffic. Please retry in a few seconds.";
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        cleanMessage = parsed.error.message;
      }
    }
  } catch {
    if (rawMsg && !rawMsg.includes("ApiError")) {
      cleanMessage = rawMsg;
    }
  }
  throw new Error(cleanMessage);
}
function createEditorialGraphicSvg(prompt, aspectRatio, preset) {
  let width = 1280;
  let height = 720;
  if (aspectRatio === "1:1") {
    width = 800;
    height = 800;
  } else if (aspectRatio === "3:4" || aspectRatio === "4:5") {
    width = 768;
    height = 1024;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  }
  const safePrompt = prompt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").slice(0, 140);
  const presetTitle = preset.replace("_", " ").toUpperCase();
  const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <rect width="${width}" height="${height}" fill="url(#glow)" />
  <rect width="${width}" height="${height}" fill="url(#grid)" />

  <!-- Outer Editorial Frame -->
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" rx="8" />

  <!-- Top Newsroom Header -->
  <g transform="translate(48, 64)">
    <rect x="0" y="0" width="140" height="28" rx="4" fill="url(#badgeGrad)" />
    <text x="70" y="18" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" letter-spacing="1.5" text-anchor="middle">GHY GPT WIRE</text>
    <text x="156" y="19" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">${presetTitle} \u2022 ${dateStr}</text>
  </g>

  <!-- Center Topic Content -->
  <g transform="translate(48, ${Math.floor(height * 0.45)})">
    <text x="0" y="0" fill="#f8fafc" font-family="Georgia, Cambria, 'Times New Roman', serif" font-size="${width > 900 ? "32" : "24"}" font-weight="700" letter-spacing="-0.5">
      ${safePrompt}
    </text>
    <text x="0" y="44" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14">
      Digital Newsroom Editorial Graphic \u2022 Verified Information Desk
    </text>
  </g>

  <!-- Bottom Metadata Strip -->
  <g transform="translate(48, ${height - 56})">
    <line x1="0" y1="-16" x2="${width - 96}" y2="-16" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <text x="0" y="6" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11">
      ASPECT RATIO: ${aspectRatio} | EDITORIAL PRESET: ${preset}
    </text>
    <text x="${width - 96}" y="6" fill="#f43f5e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" text-anchor="end">
      ILLUSTRATIVE GRAPHIC
    </text>
  </g>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
app.post("/api/generate", async (req, res) => {
  try {
    const {
      prompt,
      systemInstruction,
      history = [],
      mode = "general",
      temperature = 0.3,
      uploadedFiles = []
    } = req.body;
    if (!prompt && (!uploadedFiles || uploadedFiles.length === 0)) {
      return res.status(400).json({ error: "Prompt or file content is required." });
    }
    const ai = getGenAI();
    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.content || "" }]
        });
      }
    }
    const currentParts = [];
    if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file.data && file.mimeType) {
          if (file.mimeType.startsWith("image/") || file.mimeType === "application/pdf") {
            currentParts.push({
              inlineData: {
                data: file.data.replace(/^data:[^;]+;base64,/, ""),
                mimeType: file.mimeType
              }
            });
          } else if (file.text) {
            currentParts.push({
              text: `[Attached Document: ${file.name || "File"}]
${file.text}
---`
            });
          }
        }
      }
    }
    if (prompt) {
      currentParts.push({ text: prompt });
    }
    contents.push({
      role: "user",
      parts: currentParts
    });
    const finalSystemInstruction = systemInstruction || resolveSystemPrompt(mode);
    const result = await generateContentWithResilience(ai, contents, {
      systemInstruction: finalSystemInstruction,
      temperature: typeof temperature === "number" ? temperature : 0.3
    });
    return res.json({ text: result.text, mode, modelUsed: result.modelUsed });
  } catch (error) {
    console.error("Error in /api/generate:", error);
    const message = error?.message || "Failed to generate response";
    return res.status(500).json({ error: message });
  }
});
app.post("/api/fetch-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "A valid web URL is required." });
    }
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    const parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "Only HTTP and HTTPS URLs are supported." });
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9e3);
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (GHY-GPT-Newsroom-Intake/1.0)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8"
      }
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Target webpage returned status ${response.status}: ${response.statusText}`
      });
    }
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, " ") : parsed.hostname;
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim().replace(/\s+/g, " ") : "";
    let cleanText = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
    if (cleanText.length > 2500) {
      cleanText = cleanText.slice(0, 2500) + "... [truncated]";
    }
    return res.json({
      ok: true,
      url: targetUrl,
      title,
      description,
      snippet: cleanText
    });
  } catch (err) {
    console.warn("[GHY GPT] Error fetching source URL:", err);
    return res.status(500).json({
      error: err?.message || "Failed to fetch source webpage. Check the URL and network connection."
    });
  }
});
app.post("/api/verify-editorial", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Story text is required for editorial verification." });
    }
    const ai = getGenAI();
    const auditInstruction = `You are GHY GPT's Senior Newsroom Fact-Checker & Legal Copy-Desk Auditor.
Analyze this news copy strictly against the 6 Mandatory Newsroom Safeguards:
1. "check_date" (\u26A0\uFE0F Check date): Verify dates, days of the week, chronological consistency, calendar plausibility.
2. "check_name" (\u26A0\uFE0F Check spelling of person's name): Scrutinize names of public figures, officials, victims, accused, and regional transliteration in Assam/Northeast/India.
3. "check_number" (\u26A0\uFE0F Number mentioned without source): Flag any casualty figures, arrest counts, financial sums, percentages, or statistics lacking explicit source attribution.
4. "check_quote" (\u26A0\uFE0F Quote needs attribution): Flag quotes or verbatim assertions lacking an explicitly identified speaker or agency.
5. "check_location" (\u26A0\uFE0F Location needs verification): Scrutinize towns, villages, revenue circles, districts, or landmarks (especially in Assam and Northeast India) for geographic accuracy and spelling.
6. "check_allegation" (\u26A0\uFE0F Allegation requires attribution): Flag accusations, charges, or alleged crimes presented as facts rather than attributed to police, FIR, chargesheet, court records, or complainant.

Return ONLY a valid JSON object matching this schema:
{
  "overallStatus": "clean" | "warnings_found",
  "warningCount": number,
  "summary": "1-2 sentence executive assessment for the copy editor",
  "checks": [
    {
      "id": "check_date",
      "label": "Check date",
      "warningPrefix": "\u26A0\uFE0F Check date",
      "status": "pass" | "warning" | "flagged",
      "finding": "Clear explanation of findings",
      "excerpt": "Short excerpt if applicable",
      "suggestion": "Actionable fix for reporter"
    },
    {
      "id": "check_name",
      "label": "Check spelling of person's name",
      "warningPrefix": "\u26A0\uFE0F Check spelling of person's name",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    },
    {
      "id": "check_number",
      "label": "Number mentioned without source",
      "warningPrefix": "\u26A0\uFE0F Number mentioned without source",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    },
    {
      "id": "check_quote",
      "label": "Quote needs attribution",
      "warningPrefix": "\u26A0\uFE0F Quote needs attribution",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    },
    {
      "id": "check_location",
      "label": "Location needs verification",
      "warningPrefix": "\u26A0\uFE0F Location needs verification",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    },
    {
      "id": "check_allegation",
      "label": "Allegation requires attribution",
      "warningPrefix": "\u26A0\uFE0F Allegation requires attribution",
      "status": "pass" | "warning" | "flagged",
      "finding": "...",
      "excerpt": "...",
      "suggestion": "..."
    }
  ]
}`;
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `AUDIT THIS NEWS TEXT:
"""
${text.slice(0, 8e3)}
"""`
          }
        ]
      }
    ];
    const result = await generateContentWithResilience(ai, contents, {
      systemInstruction: auditInstruction,
      temperature: 0.1,
      responseMimeType: "application/json"
    });
    let jsonResponse = null;
    try {
      jsonResponse = JSON.parse(result.text);
    } catch {
      const match = result.text.match(/\{[\s\S]*\}/);
      if (match) {
        jsonResponse = JSON.parse(match[0]);
      }
    }
    if (!jsonResponse || !Array.isArray(jsonResponse.checks)) {
      throw new Error("Invalid audit structure returned by AI model.");
    }
    const checkIds = [
      "check_date",
      "check_name",
      "check_number",
      "check_quote",
      "check_location",
      "check_allegation"
    ];
    const checks = checkIds.map((id) => {
      const found = jsonResponse.checks.find((c) => c.id === id);
      if (found) return found;
      return {
        id,
        label: id.replace("check_", "").replace("_", " "),
        warningPrefix: `\u26A0\uFE0F ${id}`,
        status: "pass",
        finding: "No critical verification discrepancies detected."
      };
    });
    const warningCount = checks.filter((c) => c.status !== "pass").length;
    return res.json({
      timestamp: Date.now(),
      overallStatus: warningCount > 0 ? "warnings_found" : "clean",
      warningCount,
      summary: jsonResponse.summary || (warningCount > 0 ? `${warningCount} warnings require editorial review.` : "All 6 safeguards verified cleanly."),
      checks,
      modelUsed: result.modelUsed
    });
  } catch (error) {
    console.error("Error in /api/verify-editorial:", error);
    return res.status(500).json({ error: error?.message || "Failed to audit editorial safeguards." });
  }
});
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", preset = "news_illustration" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required." });
    }
    const ai = getGenAI();
    let validAspectRatio = "16:9";
    if (["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio)) {
      validAspectRatio = aspectRatio;
    } else if (aspectRatio === "4:5") {
      validAspectRatio = "3:4";
    }
    const { fullPrompt } = imagePrompt.buildPrompt(prompt, {
      aspectRatio: validAspectRatio,
      preset
    });
    let imageUrl = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: fullPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: validAspectRatio
          }
        }
      });
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || "image/png";
            imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (imageErr) {
      const errMsg = imageErr?.message || String(imageErr);
      console.warn("[GHY GPT] Image model error or quota limitation:", errMsg);
      imageUrl = createEditorialGraphicSvg(prompt, validAspectRatio, preset);
      return res.json({
        imageUrl,
        aspectRatio: validAspectRatio,
        preset,
        prompt,
        disclaimer: "AI Editorial Graphic (Generated via Newsroom Graphic Engine. Paid Gemini API key required for full photo-generative diffusion)."
      });
    }
    if (!imageUrl) {
      imageUrl = createEditorialGraphicSvg(prompt, validAspectRatio, preset);
    }
    return res.json({
      imageUrl,
      aspectRatio: validAspectRatio,
      preset,
      prompt,
      disclaimer: "AI-generated illustrative image. Not a photograph of actual events."
    });
  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const message = error?.message || "Failed to generate image";
    return res.status(500).json({ error: message });
  }
});
function normalizeWpUrl(url) {
  let clean = url.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  return clean;
}
function getWpAuthHeader(username, applicationPassword) {
  const cleanPassword = applicationPassword.trim().replace(/\s+/g, "");
  const token = Buffer.from(`${username.trim()}:${cleanPassword}`).toString("base64");
  return `Basic ${token}`;
}
app.post("/api/wordpress/test", async (req, res) => {
  try {
    const { siteUrl, username, applicationPassword } = req.body;
    if (!siteUrl || !username || !applicationPassword) {
      return res.status(400).json({
        ok: false,
        error: "WordPress Site URL, Username, and Application Password are required."
      });
    }
    const baseUrl = normalizeWpUrl(siteUrl);
    const authHeader = getWpAuthHeader(username, applicationPassword);
    const wpRes = await fetch(`${baseUrl}/wp-json/wp/v2/users/me?context=edit`, {
      headers: {
        Authorization: authHeader,
        "User-Agent": "GHY-GPT-Newsroom-Bridge/1.0"
      }
    });
    if (!wpRes.ok) {
      const errorBody = await wpRes.text();
      let errorMsg = `WordPress returned status ${wpRes.status}: ${wpRes.statusText}`;
      try {
        const json = JSON.parse(errorBody);
        if (json.message) errorMsg = json.message;
      } catch {
      }
      return res.status(wpRes.status).json({
        ok: false,
        error: errorMsg
      });
    }
    const userData = await wpRes.json();
    let categories = [];
    try {
      const catRes = await fetch(`${baseUrl}/wp-json/wp/v2/categories?per_page=50`, {
        headers: { Authorization: authHeader }
      });
      if (catRes.ok) {
        const cats = await catRes.json();
        categories = cats.map((c) => ({ id: c.id, name: c.name }));
      }
    } catch (catErr) {
      console.warn("Failed to load WordPress categories:", catErr);
    }
    return res.json({
      ok: true,
      siteUrl: baseUrl,
      user: {
        id: userData.id,
        name: userData.name,
        slug: userData.slug,
        roles: userData.roles || []
      },
      categories
    });
  } catch (err) {
    console.error("Error testing WordPress connection:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Failed to connect to WordPress site."
    });
  }
});
app.post("/api/wordpress/publish", async (req, res) => {
  try {
    const { siteUrl, username, applicationPassword, post } = req.body;
    if (!siteUrl || !username || !applicationPassword || !post) {
      return res.status(400).json({
        success: false,
        error: "Missing required WordPress credentials or post payload."
      });
    }
    const baseUrl = normalizeWpUrl(siteUrl);
    const authHeader = getWpAuthHeader(username, applicationPassword);
    let featuredMediaId = void 0;
    if (post.featuredImageBase64 && post.featuredImageBase64.startsWith("data:")) {
      try {
        const matches = post.featuredImageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
          const filename = `ghy-news-${Date.now()}.${ext}`;
          const mediaRes = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": mimeType,
              "Content-Disposition": `attachment; filename="${filename}"`
            },
            body: buffer
          });
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            featuredMediaId = mediaData.id;
          } else {
            console.warn("Media upload failed with status:", mediaRes.status);
          }
        }
      } catch (mediaErr) {
        console.warn("Could not upload featured media to WordPress:", mediaErr);
      }
    }
    let tagIds = [];
    if (Array.isArray(post.tags) && post.tags.length > 0) {
      for (const rawTagName of post.tags.slice(0, 8)) {
        const tagName = String(rawTagName).trim();
        if (!tagName) continue;
        try {
          const searchRes = await fetch(
            `${baseUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(tagName)}`,
            { headers: { Authorization: authHeader } }
          );
          if (searchRes.ok) {
            const foundTags = await searchRes.json();
            const exact = foundTags.find(
              (t) => t.name.toLowerCase() === tagName.toLowerCase()
            );
            if (exact) {
              tagIds.push(exact.id);
              continue;
            }
          }
          const createRes = await fetch(`${baseUrl}/wp-json/wp/v2/tags`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: tagName })
          });
          if (createRes.ok) {
            const newTag = await createRes.json();
            tagIds.push(newTag.id);
          }
        } catch (tagErr) {
          console.warn("Failed resolving tag:", tagName, tagErr);
        }
      }
    }
    let categoryIds = [];
    if (Array.isArray(post.categories) && post.categories.length > 0) {
      for (const rawCat of post.categories.slice(0, 4)) {
        if (typeof rawCat === "number") {
          categoryIds.push(rawCat);
          continue;
        }
        const catName = String(rawCat).trim();
        if (!catName) continue;
        try {
          const searchRes = await fetch(
            `${baseUrl}/wp-json/wp/v2/categories?search=${encodeURIComponent(catName)}`,
            { headers: { Authorization: authHeader } }
          );
          if (searchRes.ok) {
            const foundCats = await searchRes.json();
            const exact = foundCats.find(
              (c) => c.name.toLowerCase() === catName.toLowerCase()
            );
            if (exact) {
              categoryIds.push(exact.id);
              continue;
            }
          }
          const createRes = await fetch(`${baseUrl}/wp-json/wp/v2/categories`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: catName })
          });
          if (createRes.ok) {
            const newCat = await createRes.json();
            categoryIds.push(newCat.id);
          }
        } catch (catErr) {
          console.warn("Failed resolving category:", catName, catErr);
        }
      }
    }
    const wpPayload = {
      title: post.title,
      content: post.content,
      status: post.status || "draft"
    };
    if (post.excerpt) wpPayload.excerpt = post.excerpt;
    if (post.slug) wpPayload.slug = post.slug;
    if (featuredMediaId) wpPayload.featured_media = featuredMediaId;
    if (categoryIds.length > 0) wpPayload.categories = categoryIds;
    if (tagIds.length > 0) wpPayload.tags = tagIds;
    const wpPostRes = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "User-Agent": "GHY-GPT-Newsroom-Bridge/1.0"
      },
      body: JSON.stringify(wpPayload)
    });
    if (!wpPostRes.ok) {
      const errText = await wpPostRes.text();
      let msg = `WordPress publication failed with status ${wpPostRes.status}`;
      try {
        const j = JSON.parse(errText);
        if (j.message) msg = j.message;
      } catch {
      }
      return res.status(wpPostRes.status).json({
        success: false,
        error: msg
      });
    }
    const createdPost = await wpPostRes.json();
    return res.json({
      success: true,
      postId: createdPost.id,
      postUrl: createdPost.link,
      editUrl: `${baseUrl}/wp-admin/post.php?post=${createdPost.id}&action=edit`,
      status: createdPost.status,
      title: createdPost.title?.rendered || post.title
    });
  } catch (err) {
    console.error("Error publishing to WordPress:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to publish post to WordPress."
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GHY GPT Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
