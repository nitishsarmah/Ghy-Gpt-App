export type NewsMode =
  | "general"
  // Newsroom
  | "news_writing"
  | "translation"
  | "rewrite"
  | "proofread"
  | "summary"
  | "headline"
  | "fact_check"
  // SEO
  | "seo"
  | "seo_title"
  | "seo_meta"
  | "seo_slug"
  | "seo_tags"
  // Social
  | "social"
  | "social_facebook"
  | "social_x"
  | "social_instagram"
  // Image Studio
  | "image_gen";

export type NewsLanguage = "en" | "as" | "hi";

export type EditorialCheckType =
  | "check_date"
  | "check_name"
  | "check_number"
  | "check_quote"
  | "check_location"
  | "check_allegation";

export interface EditorialCheckItem {
  id: EditorialCheckType;
  label: string; // e.g., "Check date", "Check spelling of person's name"
  warningPrefix: string; // "⚠️ Check date", etc.
  status: "pass" | "warning" | "flagged";
  finding?: string;
  excerpt?: string;
  suggestion?: string;
}

export interface EditorialAuditReport {
  timestamp: number;
  overallStatus: "clean" | "warnings_found";
  warningCount: number;
  checks: EditorialCheckItem[];
  summary: string;
}

export interface AttachedFile {
  name: string;
  mimeType: string;
  size: number;
  data?: string; // base64 data for images or PDFs
  text?: string; // extracted text for text documents
}

export interface PressReleaseSource {
  fileName?: string;
  text: string;
  issuingAuthority?: string;
  date?: string;
  pdfData?: string; // base64 if PDF
}

export interface ReporterNotesSource {
  text: string;
  reporterName?: string;
  location?: string;
  eyewitnessQuotes?: string;
}

export interface AttachedImageSource {
  fileName?: string;
  data?: string; // base64 data
  caption: string;
  credit: string;
  altText: string;
}

export interface SourceUrlSource {
  url: string;
  title?: string;
  snippet?: string;
  description?: string;
  fetched: boolean;
}

export interface NewsSources {
  pressRelease: PressReleaseSource;
  reporterNotes: ReporterNotesSource;
  attachedImage: AttachedImageSource;
  sourceUrl: SourceUrlSource;
}

export interface NewsWritingOptions {
  language: NewsLanguage;
  length: "short" | "medium" | "full";
  style: "breaking" | "standard" | "detailed";
  tone: "neutral" | "formal";
  includeSeo: boolean;
  includeSlug: boolean;
  includeTags: boolean;
}

export interface TranslationOptions {
  sourceLanguage: NewsLanguage | "auto";
  targetLanguage: NewsLanguage;
  newsStyle: boolean;
}

export interface HeadlineOptions {
  language: NewsLanguage;
  category: "breaking" | "standard" | "seo" | "short" | "social" | "all_5";
}

export interface SummaryOptions {
  language: NewsLanguage;
  type: "all" | "two_line" | "five_point" | "short_brief";
}

export interface ImageGenOptions {
  aspectRatio: "16:9" | "1:1" | "4:5" | "3:4" | "4:3" | "9:16";
  preset: "news_illustration" | "realistic_editorial" | "breaking_news" | "documentary" | "minimal_graphic";
}

export interface GeneratedImageMetadata {
  imageUrl: string;
  aspectRatio: string;
  preset: string;
  prompt: string;
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  mode?: NewsMode;
  attachedFiles?: AttachedFile[];
  imageMetadata?: GeneratedImageMetadata;
  error?: boolean;
  modelUsed?: string;
  metadata?: {
    wordCount?: number;
    charCount?: number;
    language?: NewsLanguage;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  currentMode: NewsMode;
}

export interface WordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
  defaultStatus: "draft" | "publish" | "pending";
  defaultCategory?: string;
}

export interface WordPressPostPayload {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  status: "draft" | "publish" | "pending";
  categories?: string[];
  tags?: string[];
  featuredImageBase64?: string;
}

export interface WordPressPublishResult {
  success: boolean;
  postId?: number;
  postUrl?: string;
  editUrl?: string;
  status?: string;
  title?: string;
  error?: string;
}

export interface NewsroomSettings {
  defaultLanguage: NewsLanguage;
  organizationName: string;
  bylineName: string;
  journalisticStrictness: "strict" | "flexible";
  autoCopyHeadlines: boolean;
  wordpress?: WordPressConfig;
}
