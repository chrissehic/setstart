import { NextRequest, NextResponse } from "next/server";

// Platform configuration interface
interface PlatformConfig {
  name: string;
  domains: string[];
  contentType: "video" | "image" | "article" | "social" | "professional" | "other";
  defaultDuration?: number;
  extractors: {
    title: string[];
    description: string[];
    image: string[];
    author: string[];
    date: string[];
    duration?: string[];
  };
}

// Enhanced platform configurations
const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  youtube: {
    name: "YouTube",
    domains: ["youtube.com", "youtu.be", "m.youtube.com"],
    contentType: "video",
    defaultDuration: 300, // 5 minutes default
    extractors: {
      title: [
        'property="og:title"',
        'name="title"',
        'property="twitter:title"',
        '<title>'
      ],
      description: [
        'property="og:description"',
        'name="description"',
        'property="twitter:description"'
      ],
      image: [
        'property="og:image"',
        'property="twitter:image"',
        'name="twitter:image"'
      ],
      author: [
        'property="og:site_name"',
        'name="author"',
        'property="article:author"'
      ],
      date: [
        'property="article:published_time"',
        'property="og:updated_time"',
        'name="date"'
      ],
      duration: [
        '"lengthSeconds":"([^"]+)"',
        '"duration":"([^"]+)"',
        'data-duration="([^"]+)"'
      ]
    }
  },
  instagram: {
    name: "Instagram",
    domains: ["instagram.com", "instagr.am"],
    contentType: "image",
    defaultDuration: 30, // 30 seconds for videos
    extractors: {
      title: [
        'property="og:title"',
        'property="twitter:title"',
        '<title>'
      ],
      description: [
        'property="og:description"',
        'property="twitter:description"',
        'name="description"'
      ],
      image: [
        'property="og:image"',
        'property="twitter:image"',
        'name="twitter:image"'
      ],
      author: [
        'property="og:site_name"',
        'name="author"'
      ],
      date: [
        'property="article:published_time"',
        'property="og:updated_time"'
      ]
    }
  },
  tiktok: {
    name: "TikTok",
    domains: ["tiktok.com", "vm.tiktok.com"],
    contentType: "video",
    defaultDuration: 60, // 1 minute default
    extractors: {
      title: [
        'property="og:title"',
        'property="twitter:title"',
        '<title>'
      ],
      description: [
        'property="og:description"',
        'property="twitter:description"',
        'name="description"'
      ],
      image: [
        'property="og:image"',
        'property="twitter:image"'
      ],
      author: [
        'property="og:site_name"',
        'name="author"'
      ],
      date: [
        'property="article:published_time"',
        'property="og:updated_time"'
      ]
    }
  },
  twitter: {
    name: "Twitter/X",
    domains: ["twitter.com", "x.com", "mobile.twitter.com"],
    contentType: "social",
    extractors: {
      title: [
        'property="og:title"',
        'property="twitter:title"',
        '<title>'
      ],
      description: [
        'property="og:description"',
        'property="twitter:description"',
        'name="description"'
      ],
      image: [
        'property="og:image"',
        'property="twitter:image"',
        'name="twitter:image"'
      ],
      author: [
        'property="og:site_name"',
        'name="author"',
        'property="article:author"'
      ],
      date: [
        'property="article:published_time"',
        'property="og:updated_time"'
      ]
    }
  },
  facebook: {
    name: "Facebook",
    domains: ["facebook.com", "fb.com", "m.facebook.com"],
    contentType: "social",
    extractors: {
      title: [
        'property="og:title"',
        'property="twitter:title"',
        '<title>'
      ],
      description: [
        'property="og:description"',
        'property="twitter:description"',
        'name="description"'
      ],
      image: [
        'property="og:image"',
        'property="twitter:image"'
      ],
      author: [
        'property="og:site_name"',
        'name="author"'
      ],
      date: [
        'property="article:published_time"',
        'property="og:updated_time"'
      ]
    }
  },
  linkedin: {
    name: "LinkedIn",
    domains: ["linkedin.com", "www.linkedin.com"],
    contentType: "professional",
    extractors: {
      title: [
        'property="og:title"',
        'property="twitter:title"',
        '<title>'
      ],
      description: [
        'property="og:description"',
        'property="twitter:description"',
        'name="description"'
      ],
      image: [
        'property="og:image"',
        'property="twitter:image"'
      ],
      author: [
        'property="og:site_name"',
        'name="author"'
      ],
      date: [
        'property="article:published_time"',
        'property="og:updated_time"'
      ]
    }
  },
  pinterest: {
    name: "Pinterest",
    domains: ["pinterest.com", "pin.it"],
    contentType: "image",
    extractors: {
      title: [
        'property="og:title"',
        'property="twitter:title"',
        '<title>'
      ],
      description: [
        'property="og:description"',
        'property="twitter:description"',
        'name="description"'
      ],
      image: [
        'property="og:image"',
        'property="twitter:image"'
      ],
      author: [
        'property="og:site_name"',
        'name="author"'
      ],
      date: [
        'property="article:published_time"',
        'property="og:updated_time"'
      ]
    }
  },
  reddit: {
    name: "Reddit",
    domains: ["reddit.com", "old.reddit.com", "m.reddit.com"],
    contentType: "social",
    extractors: {
      title: [
        'property="og:title"',
        'property="twitter:title"',
        '<title>'
      ],
      description: [
        'property="og:description"',
        'property="twitter:description"',
        'name="description"'
      ],
      image: [
        'property="og:image"',
        'property="twitter:image"'
      ],
      author: [
        'property="og:site_name"',
        'name="author"'
      ],
      date: [
        'property="article:published_time"',
        'property="og:updated_time"'
      ]
    }
  },
  blog: {
    name: "Blog/Article",
    domains: ["medium.com", "substack.com", "wordpress.com", "blogspot.com"],
    contentType: "article",
    extractors: {
      title: [
        'property="og:title"',
        'property="twitter:title"',
        '<title>'
      ],
      description: [
        'property="og:description"',
        'property="twitter:description"',
        'name="description"'
      ],
      image: [
        'property="og:image"',
        'property="twitter:image"'
      ],
      author: [
        'property="og:site_name"',
        'name="author"',
        'property="article:author"'
      ],
      date: [
        'property="article:published_time"',
        'property="og:updated_time"',
        'name="date"'
      ]
    }
  }
};

// Enhanced metadata interface
interface ExtractedMetadata {
  title: string;
  description: string;
  contentType: "video" | "image" | "article" | "social" | "professional" | "other";
  estimatedDuration: number;
  tags: string[];
  platform: string;
  platformName: string;
  author?: string;
  publishedDate?: string;
  thumbnailUrl?: string;
  language: string;
  category: string;
  url: string;
  domain: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
    }

    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const domain = urlObj.hostname;
    
    // Determine platform from domain
    const platform = detectPlatform(domain);
    
    if (!platform) {
      return NextResponse.json({ 
        error: "Unsupported platform. Please check the URL and try again." 
      }, { status: 400 });
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // Enhanced fetch with better headers
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Extract metadata using enhanced platform-specific logic
      const metadata = extractMetadataFromHTML(html, domain, platform, url);
      
      return NextResponse.json({
        success: true,
        metadata,
      });
    } catch (fetchError) {
      console.warn("Failed to fetch URL content, falling back to basic metadata:", fetchError);
      
      // Enhanced fallback metadata
      const fallbackMetadata: ExtractedMetadata = {
        title: `Content from ${platform.name}`,
        description: `Reference content from ${platform.name}`,
        contentType: platform.contentType,
        estimatedDuration: platform.defaultDuration || 0,
        tags: [platform.name.toLowerCase(), "reference"],
        platform: platform.name.toLowerCase(),
        platformName: platform.name,
        author: undefined,
        publishedDate: undefined,
        thumbnailUrl: undefined,
        language: "English",
        category: platform.name,
        url,
        domain
      };

      return NextResponse.json({
        success: true,
        metadata: fallbackMetadata,
      });
    }
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return NextResponse.json({ 
      error: "Failed to extract metadata. Please try again." 
    }, { status: 500 });
  }
}

// Enhanced platform detection
function detectPlatform(domain: string): PlatformConfig | null {
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  
  for (const [key, config] of Object.entries(PLATFORM_CONFIGS)) {
    if (config.domains.some(d => normalizedDomain.includes(d.replace(/^www\./, '')))) {
      return config;
    }
  }
  
  // Fallback for unknown domains
  return {
    name: "Other",
    domains: [domain],
    contentType: "other",
    extractors: {
      title: ['<title>'],
      description: ['name="description"'],
      image: ['property="og:image"'],
      author: ['name="author"'],
      date: ['property="article:published_time"']
    }
  };
}

// Enhanced metadata extraction with platform-specific logic
function extractMetadataFromHTML(
  html: string, 
  domain: string, 
  platform: PlatformConfig,
  url: string
): ExtractedMetadata {
  
  // Helper function to extract content using multiple patterns
  const extractContent = (patterns: string[], fallback: string): string => {
    for (const pattern of patterns) {
      let match: RegExpMatchArray | null = null;
      
      if (pattern.startsWith('property=') || pattern.startsWith('name=')) {
        const attr = pattern.includes('property=') ? 'property' : 'name';
        const value = pattern.includes('og:') ? 'og:' + pattern.split('og:')[1] : 
                     pattern.includes('twitter:') ? 'twitter:' + pattern.split('twitter:')[1] :
                     pattern.split('=')[1]?.replace(/["']/g, '') || '';
        
        const regex = new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["']`, 'i');
        match = html.match(regex);
      } else if (pattern === '<title>') {
        match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      } else if (pattern.includes('"lengthSeconds"')) {
        match = html.match(/"lengthSeconds":"(\d+)"/);
      } else if (pattern.includes('"duration"')) {
        match = html.match(/"duration":"([^"]+)"/);
      }
      
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return fallback;
  };

  // Extract basic metadata
  const title = extractContent(platform.extractors.title, `Content from ${platform.name}`);
  const description = extractContent(platform.extractors.description, `Reference content from ${platform.name}`);
  const thumbnailUrl = extractContent(platform.extractors.image, '');
  const author = extractContent(platform.extractors.author, '');
  const publishedDate = extractContent(platform.extractors.date, '');

  // Enhanced content type detection
  let contentType = platform.contentType;
  let estimatedDuration = platform.defaultDuration || 0;

  // Platform-specific enhancements
  if (platform.name === "YouTube") {
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
    if (durationMatch) {
      estimatedDuration = parseInt(durationMatch[1]);
    }
  } else if (platform.name === "Instagram") {
    // Check for video content
    if (html.includes('"media_type":2') || html.includes('video')) {
      contentType = "video";
      estimatedDuration = 30;
    }
  } else if (platform.name === "TikTok") {
    // TikTok specific duration extraction
    const durationMatch = html.match(/"duration":"(\d+)"/);
    if (durationMatch) {
      estimatedDuration = parseInt(durationMatch[1]);
    }
  }

  // Enhanced tag extraction
  const tags = [platform.name.toLowerCase(), "reference"];
  
  // Platform-specific tags
  if (platform.contentType === "video") tags.push("video");
  if (platform.contentType === "image") tags.push("image");
  if (platform.contentType === "article") tags.push("article");
  if (platform.contentType === "social") tags.push("social");
  if (platform.contentType === "professional") tags.push("professional");

  // Extract keywords for additional tags
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  if (keywordsMatch) {
    const keywords = keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k.length > 0);
    tags.push(...keywords.slice(0, 5));
  }

  // Language detection
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const language = langMatch ? langMatch[1].split('-')[0] : "en";

  return {
    title,
    description,
    contentType,
    estimatedDuration,
    tags: [...new Set(tags)], // Remove duplicates
    platform: platform.name.toLowerCase(),
    platformName: platform.name,
    author: author || undefined,
    publishedDate: publishedDate || undefined,
    thumbnailUrl: thumbnailUrl || undefined,
    language,
    category: platform.name,
    url,
    domain
  };
}
