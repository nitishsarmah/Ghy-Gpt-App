/**
 * WordPress Newsroom Parser & Exporter
 * Bridges GHY GPT -> Gemini -> Newsroom -> WordPress
 */

export interface ParsedWordPressPost {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  tags: string[];
  categories: string[];
  seoTitle?: string;
  metaDescription?: string;
}

/**
 * Extracts news elements from Gemini newsroom outputs
 */
export function parseNewsToWordPress(rawText: string): ParsedWordPressPost {
  if (!rawText || !rawText.trim()) {
    return {
      title: "Untitled Wire Report",
      content: "",
      excerpt: "",
      slug: "untitled-wire-report",
      tags: ["Guwahati", "Assam", "News"],
      categories: ["News"],
    };
  }

  const lines = rawText.split("\n");
  let title = "";
  let subheadline = "";
  let articleLines: string[] = [];
  let seoTitle = "";
  let metaDescription = "";
  let slug = "";
  let tags: string[] = [];

  let currentSection: "unknown" | "headline" | "subheadline" | "article" | "seo_title" | "meta" | "slug" | "tags" = "unknown";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Section header markers
    const upper = trimmed.toUpperCase();
    if (upper.startsWith("HEADLINE:") || upper === "**HEADLINE**" || upper === "## HEADLINE") {
      currentSection = "headline";
      const inline = trimmed.replace(/^(HEADLINE:|\*\*HEADLINE\*\*|## HEADLINE)\s*/i, "").trim();
      if (inline) title = inline.replace(/^\*+|\*+$/g, "");
      continue;
    }
    if (upper.startsWith("SUBHEADLINE:") || upper === "**SUBHEADLINE**" || upper === "## SUBHEADLINE") {
      currentSection = "subheadline";
      const inline = trimmed.replace(/^(SUBHEADLINE:|\*\*SUBHEADLINE\*\*|## SUBHEADLINE)\s*/i, "").trim();
      if (inline) subheadline = inline.replace(/^\*+|\*+$/g, "");
      continue;
    }
    if (upper.startsWith("ARTICLE:") || upper === "**ARTICLE**" || upper === "## ARTICLE") {
      currentSection = "article";
      continue;
    }
    if (upper.startsWith("SEO TITLE:") || upper === "**SEO TITLE**" || upper === "## SEO TITLE") {
      currentSection = "seo_title";
      const inline = trimmed.replace(/^(SEO TITLE:|\*\*SEO TITLE\*\*|## SEO TITLE)\s*/i, "").trim();
      if (inline) seoTitle = inline.replace(/^\*+|\*+$/g, "");
      continue;
    }
    if (upper.startsWith("META DESCRIPTION:") || upper === "**META DESCRIPTION**" || upper === "## META DESCRIPTION") {
      currentSection = "meta";
      const inline = trimmed.replace(/^(META DESCRIPTION:|\*\*META DESCRIPTION\*\*|## META DESCRIPTION)\s*/i, "").trim();
      if (inline) metaDescription = inline.replace(/^\*+|\*+$/g, "");
      continue;
    }
    if (upper.startsWith("SLUG:") || upper === "**SLUG**" || upper === "## SLUG") {
      currentSection = "slug";
      const inline = trimmed.replace(/^(SLUG:|\*\*SLUG\*\*|## SLUG)\s*/i, "").trim();
      if (inline) slug = inline.replace(/^\*+|\*+$/g, "");
      continue;
    }
    if (upper.startsWith("TAGS:") || upper === "**TAGS**" || upper === "## TAGS") {
      currentSection = "tags";
      const inline = trimmed.replace(/^(TAGS:|\*\*TAGS\*\*|## TAGS)\s*/i, "").trim();
      if (inline) {
        tags = inline
          .split(/[,#]/)
          .map((t) => t.replace(/^\*+|\*+$/g, "").trim())
          .filter(Boolean);
      }
      continue;
    }

    // Accumulate according to section
    switch (currentSection) {
      case "headline":
        if (trimmed && !title) {
          title = trimmed.replace(/^\*+|\*+$/g, "");
        }
        break;
      case "subheadline":
        if (trimmed && !subheadline) {
          subheadline = trimmed.replace(/^\*+|\*+$/g, "");
        }
        break;
      case "article":
        articleLines.push(line);
        break;
      case "seo_title":
        if (trimmed && !seoTitle) {
          seoTitle = trimmed.replace(/^\*+|\*+$/g, "");
        }
        break;
      case "meta":
        if (trimmed && !metaDescription) {
          metaDescription = trimmed.replace(/^\*+|\*+$/g, "");
        }
        break;
      case "slug":
        if (trimmed && !slug) {
          slug = trimmed.replace(/^\*+|\*+$/g, "");
        }
        break;
      case "tags":
        if (trimmed) {
          const parsed = trimmed
            .split(/[,#]/)
            .map((t) => t.replace(/^\*+|\*+$/g, "").trim())
            .filter(Boolean);
          tags.push(...parsed);
        }
        break;
      default:
        // Before any header is seen, if line looks like a title
        if (!title && trimmed.startsWith("# ")) {
          title = trimmed.replace(/^#\s*/, "");
        } else if (!title && trimmed.length > 5 && trimmed.length < 120 && !trimmed.startsWith("[")) {
          title = trimmed.replace(/^\*+|\*+$/g, "");
        } else {
          articleLines.push(line);
        }
        break;
    }
  }

  // Fallbacks if not structured
  if (!title) {
    const firstNonEmpty = lines.find((l) => l.trim() && !l.startsWith("[")) || "Guwahati News Wire Report";
    title = firstNonEmpty.replace(/^[#*]+\s*/, "").replace(/[*]+$/, "").slice(0, 100);
  }

  const rawArticleBody = articleLines.join("\n").trim() || rawText;

  // Clean Markdown into formatted HTML with Gutenberg paragraph comments
  const paragraphs = rawArticleBody
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const formattedHtml = paragraphs
    .map((p) => {
      if (p.startsWith("## ")) {
        const h2 = p.replace(/^##\s*/, "");
        return `<!-- wp:heading {"level":2} -->\n<h2 class="wp-block-heading">${h2}</h2>\n<!-- /wp:heading -->`;
      }
      if (p.startsWith("### ")) {
        const h3 = p.replace(/^###\s*/, "");
        return `<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">${h3}</h3>\n<!-- /wp:heading -->`;
      }
      if (p.startsWith("> ")) {
        const quote = p.replace(/^>\s*/, "");
        return `<!-- wp:quote -->\n<blockquote class="wp-block-quote"><p>${quote}</p></blockquote>\n<!-- /wp:quote -->`;
      }
      // Standard paragraph
      return `<!-- wp:paragraph -->\n<p>${p}</p>\n<!-- /wp:paragraph -->`;
    })
    .join("\n\n");

  const cleanSlug = (slug || title)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  const excerpt = metaDescription || subheadline || (paragraphs[0] ? paragraphs[0].slice(0, 160) : "");

  return {
    title,
    content: formattedHtml,
    excerpt,
    slug: cleanSlug,
    tags: tags.length > 0 ? Array.from(new Set(tags)) : ["Guwahati", "Northeast", "News"],
    categories: ["News", "Breaking"],
    seoTitle,
    metaDescription,
  };
}

/**
 * Generates ready-to-import WordPress XML (WXR format)
 */
export function generateWordPressWxrXml(post: ParsedWordPressPost): string {
  const now = new Date().toISOString();
  const pubDate = new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8" ?>
<!-- generator="GHY GPT / WordPress Newsroom Exporter" created="${now}" -->
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
  <title>GHY GPT News Wire</title>
  <link>https://theguwahatinews.com</link>
  <description>AI Newsroom Export</description>
  <pubDate>${pubDate}</pubDate>
  <language>en-US</language>
  <wp:wxr_version>1.2</wp:wxr_version>
  <wp:base_site_url>https://theguwahatinews.com</wp:base_site_url>
  <wp:base_blog_url>https://theguwahatinews.com</wp:base_blog_url>

  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>https://theguwahatinews.com/${post.slug}</link>
    <pubDate>${pubDate}</pubDate>
    <dc:creator><![CDATA[GHY News Desk]]></dc:creator>
    <description></description>
    <content:encoded><![CDATA[${post.content}]]></content:encoded>
    <excerpt:encoded><![CDATA[${post.excerpt}]]></excerpt:encoded>
    <wp:post_id>1001</wp:post_id>
    <wp:post_date><![CDATA[${now.slice(0, 19).replace("T", " ")}]]></wp:post_date>
    <wp:post_name><![CDATA[${post.slug}]]></wp:post_name>
    <wp:status><![CDATA[draft]]></wp:status>
    <wp:post_type><![CDATA[post]]></wp:post_type>
    ${post.categories
      .map((cat) => `<category domain="category" nicename="${cat.toLowerCase()}"><![CDATA[${cat}]]></category>`)
      .join("\n    ")}
    ${post.tags
      .map((tag) => `<category domain="post_tag" nicename="${tag.toLowerCase()}"><![CDATA[${tag}]]></category>`)
      .join("\n    ")}
  </item>
</channel>
</rss>`;
}
