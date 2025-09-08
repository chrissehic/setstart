import { NextRequest, NextResponse } from "next/server";

// Interface for competitor-specific metadata
interface CompetitorMetadata {
  name: string;
  description: string;
  faviconUrl?: string;
  logoUrl?: string;
  domain: string;
  url: string;
  title?: string;
  author?: string;
  publishedDate?: string;
  language: string;
  category?: string;
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

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
      
      // Extract competitor-specific metadata
      const metadata = extractCompetitorMetadata(html, domain, url);
      
      return NextResponse.json({
        success: true,
        metadata,
      });
    } catch (fetchError) {
      console.warn("Failed to fetch URL content, falling back to basic metadata:", fetchError);
      
      // Enhanced fallback metadata
      const fallbackMetadata: CompetitorMetadata = {
        name: domain.replace(/^www\./, '').split('.')[0],
        description: `Competitor website: ${domain}`,
        domain,
        url,
        language: "en",
        category: "competitor"
      };

      return NextResponse.json({
        success: true,
        metadata: fallbackMetadata,
      });
    }
  } catch (error) {
    console.error("Error extracting competitor metadata:", error);
    return NextResponse.json({ 
      error: "Failed to extract competitor metadata. Please try again." 
    }, { status: 500 });
  }
}

// Extract competitor-specific metadata from HTML
function extractCompetitorMetadata(
  html: string, 
  domain: string, 
  url: string
): CompetitorMetadata {
  
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
      } else if (pattern === '<h1>') {
        match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      }
      
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return fallback;
  };

  // Extract company name - try multiple sources
  const namePatterns = [
    'property="og:site_name"',
    'property="og:title"',
    'property="twitter:title"',
    '<title>',
    '<h1>',
    'name="application-name"',
    'name="apple-mobile-web-app-title"'
  ];
  
  const extractedName = extractContent(namePatterns, domain.replace(/^www\./, '').split('.')[0]);
  
  // Clean up the name (remove common suffixes and clean up)
  const companyName = extractedName
    .replace(/\s*-\s*.*$/, '') // Remove everything after first dash
    .replace(/\s*\|\s*.*$/, '') // Remove everything after first pipe
    .replace(/\s*::\s*.*$/, '') // Remove everything after first double colon
    .replace(/\s*:\s*.*$/, '') // Remove everything after first colon
    .replace(/\s*—\s*.*$/, '') // Remove everything after first em dash
    .replace(/\s*–\s*.*$/, '') // Remove everything after first en dash
    .trim();

  // Extract description
  const descriptionPatterns = [
    'property="og:description"',
    'property="twitter:description"',
    'name="description"',
    'name="twitter:description"'
  ];
  
  const description = extractContent(descriptionPatterns, `Competitor website: ${domain}`);

  // Extract favicon - try multiple sources
  const faviconPatterns = [
    '<link[^>]*rel=["\']icon["\'][^>]*href=["\']([^"\']+)["\']',
    '<link[^>]*rel=["\']shortcut icon["\'][^>]*href=["\']([^"\']+)["\']',
    '<link[^>]*rel=["\']apple-touch-icon["\'][^>]*href=["\']([^"\']+)["\']',
    '<link[^>]*rel=["\']apple-touch-icon-precomposed["\'][^>]*href=["\']([^"\']+)["\']',
    'property="og:image"',
    'property="twitter:image"'
  ];

  let faviconUrl = '';
  for (const pattern of faviconPatterns) {
    let match: RegExpMatchArray | null = null;
    
    if (pattern.startsWith('<link')) {
      const regex = new RegExp(pattern, 'i');
      match = html.match(regex);
    } else if (pattern.startsWith('property=')) {
      const value = pattern.includes('og:') ? 'og:' + pattern.split('og:')[1] : 
                   pattern.includes('twitter:') ? 'twitter:' + pattern.split('twitter:')[1] : '';
      const regex = new RegExp(`<meta[^>]*property=["']${value}["'][^>]*content=["']([^"']+)["']`, 'i');
      match = html.match(regex);
    }
    
    if (match && match[1]) {
      faviconUrl = match[1].trim();
      break;
    }
  }

  // Convert relative URLs to absolute
  if (faviconUrl && !faviconUrl.startsWith('http')) {
    if (faviconUrl.startsWith('//')) {
      faviconUrl = 'https:' + faviconUrl;
    } else if (faviconUrl.startsWith('/')) {
      faviconUrl = `https://${domain}${faviconUrl}`;
    } else {
      faviconUrl = `https://${domain}/${faviconUrl}`;
    }
  }

  // Extract additional metadata
  const title = extractContent(['<title>'], companyName);
  const author = extractContent(['name="author"', 'property="article:author"'], '');
  const publishedDate = extractContent(['property="article:published_time"', 'property="og:updated_time"'], '');
  
  // Language detection
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  const language = langMatch ? langMatch[1].split('-')[0] : "en";

  // Extract category from meta tags or content
  const categoryMatch = html.match(/<meta[^>]*name=["']category["'][^>]*content=["']([^"']+)["']/i);
  const category = categoryMatch ? categoryMatch[1] : 'competitor';

  return {
    name: companyName,
    description,
    faviconUrl: faviconUrl || undefined,
    logoUrl: faviconUrl || undefined, // Use favicon as logo for now
    domain,
    url,
    title: title !== companyName ? title : undefined,
    author: author || undefined,
    publishedDate: publishedDate || undefined,
    language,
    category
  };
}
