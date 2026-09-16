import React, { useState } from "react";
import {
  PenTool,
  Languages,
  Heading,
  FileCheck,
  CheckCheck,
  ListCollapse,
  Search,
  Share2,
  Sparkles,
  Newspaper,
  ArrowRight,
  ShieldCheck,
  Zap,
  Link as LinkIcon,
  Tag,
  AtSign,
  FileText,
  Globe,
} from "lucide-react";
import { NewsMode } from "../types";

interface WelcomeScreenProps {
  onSelectAction: (mode: NewsMode, prefilledPrompt?: string) => void;
  onOpenWordPress?: () => void;
  onOpenSources?: (tab?: "press_release" | "reporter_notes" | "attached_image" | "source_url") => void;
}

interface ActionCard {
  id: NewsMode;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  samplePrompt: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectAction,
  onOpenWordPress,
  onOpenSources,
}) => {
  const [activeCategory, setActiveCategory] = useState<"all" | "newsroom" | "seo" | "social" | "image_studio">("all");

  const newsroomActions: ActionCard[] = [
    {
      id: "news_writing",
      label: "Write News",
      desc: "Inverted pyramid + SEO + Tags",
      icon: PenTool,
      samplePrompt:
        "Guwahati Municipal Corporation announced today that 24/7 piped drinking water will reach 15 new wards in South Guwahati starting next month. The project cost is 120 crore INR, funded under the Smart Cities Mission. 45,000 households will benefit. Trial runs will begin from Friday.",
    },
    {
      id: "translation",
      label: "Translate",
      desc: "Assamese, English, & Hindi wire translation",
      icon: Languages,
      samplePrompt:
        "ব্ৰহ্মপুত্ৰ নদীৰ জলপৃষ্ঠ গুৱাহাটীত বিপদসীমাৰ তললৈ নামিছে। কেন্দ্ৰীয় জল আয়োগৰ (CWC) তথ্য অনুসৰি বিগত ২৪ ঘণ্টাত পানীৰ মাত্ৰা ১৫ চেণ্টিমিটাৰ হ্ৰাস পাইছে। ফেৰী সেৱা পৰ্যায়ক্ৰমে পুনৰ আৰম্ভ কৰা হৈছে।",
    },
    {
      id: "rewrite",
      label: "Rewrite",
      desc: "Polish flow, preserve 100% facts",
      icon: FileCheck,
      samplePrompt:
        "Police has arrested two individuals in connection with the bank robbery reported yesterday at Dispur. Around 25 lakh rupees was recovered from their possession. The SP said interrogation is ongoing and further details are awaited.",
    },
    {
      id: "proofread",
      label: "Proofread",
      desc: "Eliminate typos, spelling, & script errors",
      icon: CheckCheck,
      samplePrompt:
        "Polise has arrest two person in connection with bank robbery yesterday at Dispur. Around 25 lakh ruppes was recovered from their posesion. Police SP said that interrogation is currently undergoing.",
    },
    {
      id: "summary",
      label: "Summarize",
      desc: "2-line digest, 5-point brief, & radio wire",
      icon: ListCollapse,
      samplePrompt:
        "The Reserve Bank of India's Monetary Policy Committee has decided unanimously to keep the repo rate unchanged at 6.50%. RBI Governor announced that retail inflation is moderating within the target band, while GDP growth projection for the current fiscal year is pegged at 7.2%. Global crude oil volatility and food price shocks remain monitorable risks.",
    },
    {
      id: "headline",
      label: "Headlines",
      desc: "5 factual options: Breaking, SEO, Short, Social",
      icon: Heading,
      samplePrompt:
        "The Assam Cabinet has approved the construction of a new 4-lane elevated corridor connecting Jalukbari to Khanapara in Guwahati to ease daily traffic congestion. The 18-km project is estimated at Rs 4,500 crore and targeted for completion by late 2028.",
    },
  ];

  const seoActions: ActionCard[] = [
    {
      id: "seo_title",
      label: "SEO Title",
      desc: "5 search-ranking headlines (<60 chars)",
      icon: Heading,
      samplePrompt:
        "Indian Space Research Organisation (ISRO) has scheduled the launch of its next-generation meteorological satellite INSAT-4DS from Sriharikota spaceport on Saturday at 5:35 PM IST.",
    },
    {
      id: "seo_meta",
      label: "Meta Description",
      desc: "3 high-CTR snippets (140-160 characters)",
      icon: FileText,
      samplePrompt:
        "Guwahati Smart City project reaches 80% completion with new smart traffic signals installed across 50 intersections, reducing congestion by 25%.",
    },
    {
      id: "seo_slug",
      label: "Slug",
      desc: "Clean kebab-case canonical URLs",
      icon: LinkIcon,
      samplePrompt:
        "Assam Cabinet Approves 4500 Crore Rupee Elevated Corridor Project Connecting Jalukbari to Khanapara in Guwahati",
    },
    {
      id: "seo_tags",
      label: "Tags",
      desc: "Primary keywords, long-tail, & CMS tags",
      icon: Tag,
      samplePrompt:
        "IIT Guwahati researchers develop affordable water purification filter utilizing natural bio-char from local agricultural residue.",
    },
  ];

  const socialActions: ActionCard[] = [
    {
      id: "social_facebook",
      label: "Facebook",
      desc: "Authoritative 2-para post + quotes + tags",
      icon: Share2,
      samplePrompt:
        "Assam health department has launched a state-wide mobile telemedicine initiative covering 1,200 rural health sub-centres across 35 districts. Specialists from Gauhati Medical College will conduct tele-consultations daily from 9 AM to 3 PM.",
    },
    {
      id: "social_x",
      label: "X (Twitter)",
      desc: "Breaking wire post (<280 chars) & 3-tweet thread",
      icon: AtSign,
      samplePrompt:
        "Assam Chief Minister announces Rs 500 crore relief package for flood-affected farmers across Darrang, Morigaon, and Nagaon districts today.",
    },
    {
      id: "social_instagram",
      label: "Instagram",
      desc: "Carousel caption with takeaways & hashtag cloud",
      icon: Share2,
      samplePrompt:
        "Kaziranga National Park records zero rhino poaching incidents for the second consecutive year, attributed to round-the-clock drone surveillance and local forest ranger vigilance.",
    },
  ];

  const imageActions: ActionCard[] = [
    {
      id: "image_gen",
      label: "AI Image Generation",
      desc: "Editorial illustrations & news graphics",
      icon: Sparkles,
      samplePrompt:
        "A dignified editorial illustration of the Brahmaputra river at twilight with river vessels in the distance and Guwahati hillside silhouette, news graphic style",
    },
  ];

  const visibleActions =
    activeCategory === "newsroom"
      ? newsroomActions
      : activeCategory === "seo"
      ? seoActions
      : activeCategory === "social"
      ? socialActions
      : activeCategory === "image_studio"
      ? imageActions
      : [...newsroomActions, ...seoActions.slice(0, 2), ...socialActions.slice(0, 2), ...imageActions];

  return (
    <div
      id="ghy-welcome-screen"
      className="flex-1 overflow-y-auto px-4 py-6 md:py-10 flex flex-col items-center max-w-5xl mx-auto w-full text-center"
    >
      {/* Brand Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-3 shadow-2xs">
        <Newspaper className="w-3.5 h-3.5 text-rose-600" />
        <span>Digital Newsroom Intelligence Desk</span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-1.5">
        GHY GPT
      </h1>
      <p className="text-base md:text-lg font-semibold text-slate-700 mb-2">
        AI Newsroom Assistant
      </p>

      {/* Slogan */}
      <div className="inline-block px-4 py-1 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-800 text-xs md:text-sm font-serif italic mb-4">
        &ldquo;Write. Translate. Edit. Publish.&rdquo;
      </div>

      {/* 4-Stage Publishing Pipeline Visual Flow */}
      <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>End-to-End Publishing Pipeline</span>
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            Direct REST API
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
          {/* Step 1: GHY GPT */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-400 mb-0.5">STEP 1</div>
            <div className="text-xs font-bold text-slate-900">GHY GPT</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Editorial Interface</div>
          </div>

          {/* Step 2: Gemini */}
          <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/70">
            <div className="text-[10px] font-bold text-rose-500 mb-0.5">STEP 2</div>
            <div className="text-xs font-bold text-rose-950">Gemini 3.8</div>
            <div className="text-[10px] text-rose-700 mt-0.5">GenAI Engine</div>
          </div>

          {/* Step 3: Newsroom */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
            <div className="text-[10px] font-bold text-amber-600 mb-0.5">STEP 3</div>
            <div className="text-xs font-bold text-amber-950">Newsroom</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Fact-check & SEO</div>
          </div>

          {/* Step 4: WordPress */}
          <div className="p-2.5 rounded-xl bg-sky-50/90 border border-sky-200 text-sky-950 relative group">
            <div className="text-[10px] font-bold text-sky-600 mb-0.5 flex items-center justify-between">
              <span>STEP 4</span>
              <Globe className="w-3 h-3 text-sky-600" />
            </div>
            <div className="text-xs font-bold text-sky-950 flex items-center gap-1">
              <span>WordPress</span>
            </div>
            {onOpenWordPress ? (
              <button
                id="welcome-pipeline-wp-btn"
                onClick={onOpenWordPress}
                className="mt-1 text-[10px] font-semibold text-sky-700 hover:text-sky-900 underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Open Desk</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            ) : (
              <div className="text-[10px] text-sky-700 mt-0.5">Publish / Draft</div>
            )}
          </div>
        </div>
      </div>

      {/* SOURCES Intake Desk Interactive Block */}
      {onOpenSources && (
        <div className="w-full max-w-2xl bg-slate-950 text-slate-100 rounded-2xl p-4 mb-6 shadow-md border border-slate-800 text-left font-mono">
          <div className="flex items-center justify-between pb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-400 tracking-wider">SOURCES</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                Multi-Source Intake
              </span>
            </div>
            <button
              id="welcome-open-sources-btn"
              onClick={() => onOpenSources()}
              className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-sans font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Open Desk</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="text-slate-600 text-xs select-none">────────────────────────────────────────────</div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2">
            <button
              id="welcome-source-press-release"
              onClick={() => onOpenSources("press_release")}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/60 transition-all text-left group cursor-pointer"
            >
              <div className="text-sm mb-1">📄</div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
                Press Release.pdf
              </div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">Official circular & PDF</div>
            </button>

            <button
              id="welcome-source-reporter-notes"
              onClick={() => onOpenSources("reporter_notes")}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/60 transition-all text-left group cursor-pointer"
            >
              <div className="text-sm mb-1">📝</div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
                Reporter Notes
              </div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">Ground quotes & facts</div>
            </button>

            <button
              id="welcome-source-attached-image"
              onClick={() => onOpenSources("attached_image")}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/60 transition-all text-left group cursor-pointer"
            >
              <div className="text-sm mb-1">🖼️</div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
                Attached Image
              </div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">Visuals & caption credit</div>
            </button>

            <button
              id="welcome-source-url"
              onClick={() => onOpenSources("source_url")}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/60 transition-all text-left group cursor-pointer"
            >
              <div className="text-sm mb-1">🔗</div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
                Source URL
              </div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">Live portal & wire link</div>
            </button>
          </div>

          <div className="text-slate-600 text-xs select-none">────────────────────────────────────────────</div>
        </div>
      )}

      {/* Category Tabs Matching the Tree Structure */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 p-1 bg-slate-100/90 border border-slate-200 rounded-xl max-w-2xl">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeCategory === "all"
              ? "bg-white text-slate-900 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Desks
        </button>
        <button
          onClick={() => setActiveCategory("newsroom")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeCategory === "newsroom"
              ? "bg-white text-rose-700 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <PenTool className="w-3 h-3 text-rose-600" />
          <span>Newsroom ({newsroomActions.length})</span>
        </button>
        <button
          onClick={() => setActiveCategory("seo")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeCategory === "seo"
              ? "bg-white text-sky-700 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Search className="w-3 h-3 text-sky-600" />
          <span>SEO ({seoActions.length})</span>
        </button>
        <button
          onClick={() => setActiveCategory("social")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeCategory === "social"
              ? "bg-white text-emerald-700 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Share2 className="w-3 h-3 text-emerald-600" />
          <span>Social ({socialActions.length})</span>
        </button>
        <button
          onClick={() => setActiveCategory("image_studio")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeCategory === "image_studio"
              ? "bg-white text-amber-700 shadow-2xs font-semibold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Image Studio</span>
        </button>
      </div>

      {/* Quick Action Grid */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                id={`btn-welcome-${action.id}`}
                onClick={() => onSelectAction(action.id, action.samplePrompt)}
                className="group p-3.5 rounded-xl border border-slate-200 bg-white hover:border-rose-300 hover:shadow-md transition-all text-left flex flex-col justify-between active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-rose-50 text-slate-700 group-hover:text-rose-600 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    {action.label}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {action.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Call to Action Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white w-full shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div>
          <div className="text-base md:text-lg font-bold text-amber-300">
            How can I help with your story today?
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Select a desk from the sidebar tree, upload field notes, or enter facts below.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Zero-Hallucination Mandate
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Unicode Wire Ready
          </span>
        </div>
      </div>
    </div>
  );
};
