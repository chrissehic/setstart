/**
 * Platform detection utilities for URL metadata extraction
 */

export interface PlatformInfo {
  name: string;
  type: "video" | "image" | "article" | "social" | "professional" | "other";
  icon: string;
  color: string;
  domains: string[];
}

/**
 * Supported platforms configuration
 */
export const SUPPORTED_PLATFORMS: Record<string, PlatformInfo> = {
  youtube: {
    name: "YouTube",
    type: "video",
    icon: "🎥",
    color: "#FF0000",
    domains: ["youtube.com", "youtu.be", "m.youtube.com"]
  },
  instagram: {
    name: "Instagram",
    type: "image",
    icon: "📸",
    color: "#E4405F",
    domains: ["instagram.com", "instagr.am"]
  },
  tiktok: {
    name: "TikTok",
    type: "video",
    icon: "🎵",
    color: "#000000",
    domains: ["tiktok.com", "vm.tiktok.com"]
  },
  twitter: {
    name: "Twitter/X",
    type: "social",
    icon: "🐦",
    color: "#1DA1F2",
    domains: ["twitter.com", "x.com", "mobile.twitter.com"]
  },
  facebook: {
    name: "Facebook",
    type: "social",
    icon: "📘",
    color: "#1877F2",
    domains: ["facebook.com", "fb.com", "m.facebook.com"]
  },
  linkedin: {
    name: "LinkedIn",
    type: "professional",
    icon: "💼",
    color: "#0A66C2",
    domains: ["linkedin.com", "www.linkedin.com"]
  },
  pinterest: {
    name: "Pinterest",
    type: "image",
    icon: "📌",
    color: "#BD081C",
    domains: ["pinterest.com", "pin.it"]
  },
  reddit: {
    name: "Reddit",
    type: "social",
    icon: "🤖",
    color: "#FF4500",
    domains: ["reddit.com", "old.reddit.com", "m.reddit.com"]
  },
  medium: {
    name: "Medium",
    type: "article",
    icon: "📝",
    color: "#00AB6C",
    domains: ["medium.com"]
  },
  substack: {
    name: "Substack",
    type: "article",
    icon: "📧",
    color: "#FF6719",
    domains: ["substack.com"]
  },
  wordpress: {
    name: "WordPress",
    type: "article",
    icon: "🔧",
    color: "#21759B",
    domains: ["wordpress.com"]
  }
};

/**
 * Detect platform from URL
 * @param url - The URL to analyze
 * @returns Platform info or null if not supported
 */
export function detectPlatformFromUrl(url: string): PlatformInfo | null {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase().replace(/^www\./, '');
    
    for (const [key, platform] of Object.entries(SUPPORTED_PLATFORMS)) {
      if (platform.domains.some(d => domain.includes(d.replace(/^www\./, '')))) {
        return platform;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get platform icon component
 * @param platform - Platform name
 * @returns Platform icon component
 */
export function getPlatformIcon(platform: string) {
  const platformInfo = SUPPORTED_PLATFORMS[platform.toLowerCase()];
  return platformInfo?.icon || "🌐";
}

/**
 * Get platform color
 * @param platform - Platform name
 * @returns Platform color
 */
export function getPlatformColor(platform: string): string {
  const platformInfo = SUPPORTED_PLATFORMS[platform.toLowerCase()];
  return platformInfo?.color || "#6B7280";
}

/**
 * Check if URL is supported
 * @param url - The URL to check
 * @returns True if platform is supported
 */
export function isUrlSupported(url: string): boolean {
  return detectPlatformFromUrl(url) !== null;
}

/**
 * Get all supported platforms
 * @returns Array of platform names
 */
export function getSupportedPlatforms(): string[] {
  return Object.keys(SUPPORTED_PLATFORMS);
}
