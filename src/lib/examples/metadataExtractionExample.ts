/**
 * Example implementation of the enhanced metadata extraction system
 * This demonstrates how to use the platform-aware URL metadata extraction
 */

import { detectPlatformFromUrl, isUrlSupported, getSupportedPlatforms } from '../utils/platformDetection';

// Example URLs for different platforms
const EXAMPLE_URLS = {
  youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  instagram: "https://www.instagram.com/p/ABC123/",
  tiktok: "https://www.tiktok.com/@user/video/1234567890",
  twitter: "https://twitter.com/user/status/1234567890",
  linkedin: "https://www.linkedin.com/posts/user_activity-1234567890",
  medium: "https://medium.com/@user/article-title-123456",
  reddit: "https://www.reddit.com/r/subreddit/comments/123456/",
  facebook: "https://www.facebook.com/user/posts/1234567890"
};

/**
 * Example function to extract metadata from a URL
 * @param url - The URL to extract metadata from
 * @returns Promise with extracted metadata
 */
export async function extractMetadataExample(url: string) {
  try {
    // First, check if the URL is supported
    if (!isUrlSupported(url)) {
      throw new Error(`Unsupported platform for URL: ${url}`);
    }

    // Detect platform for additional context
    const platformInfo = detectPlatformFromUrl(url);
    console.log(`Detected platform: ${platformInfo?.name} (${platformInfo?.type})`);

    // Call the metadata extraction API
    const response = await fetch("/api/extract-metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.metadata) {
      return data.metadata;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Metadata extraction failed:", error);
    throw error;
  }
}

/**
 * Example function to batch extract metadata from multiple URLs
 * @param urls - Array of URLs to process
 * @returns Promise with array of metadata results
 */
export async function batchExtractMetadata(urls: string[]) {
  const results = [];
  
  for (const url of urls) {
    try {
      const metadata = await extractMetadataExample(url);
      results.push({ url, success: true, metadata });
    } catch (error) {
      results.push({ 
        url, 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
  
  return results;
}

/**
 * Example function to validate and process URLs before extraction
 * @param url - The URL to validate
 * @returns Validation result with suggestions
 */
export function validateUrlForExtraction(url: string) {
  try {
    const urlObj = new URL(url);
    const platformInfo = detectPlatformFromUrl(url);
    
    if (!platformInfo) {
      return {
        isValid: false,
        error: "Unsupported platform",
        suggestion: `Supported platforms: ${getSupportedPlatforms().join(", ")}`,
        url
      };
    }
    
    return {
      isValid: true,
      platform: platformInfo.name,
      type: platformInfo.type,
      icon: platformInfo.icon,
      color: platformInfo.color,
      url
    };
  } catch {
    return {
      isValid: false,
      error: "Invalid URL format",
      suggestion: "Please enter a valid URL starting with http:// or https://",
      url
    };
  }
}

/**
 * Example function to get platform-specific metadata hints
 * @param platform - Platform name
 * @returns Platform-specific metadata hints
 */
export function getPlatformMetadataHints(platform: string) {
  const hints = {
    youtube: {
      duration: "Video duration will be automatically extracted",
      thumbnail: "High-quality thumbnail will be available",
      tags: "Video category and tags will be included"
    },
    instagram: {
      mediaType: "Will detect if it's a photo or video",
      caption: "Post caption will be extracted as description",
      hashtags: "Hashtags will be included in tags"
    },
    tiktok: {
      duration: "Video duration will be estimated",
      music: "Music/sound information may be available",
      hashtags: "Trending hashtags will be included"
    },
    twitter: {
      text: "Tweet text will be extracted as description",
      media: "Attached images/videos will be detected",
      engagement: "Like/retweet counts may be available"
    },
    linkedin: {
      author: "Post author information will be extracted",
      company: "Company context will be included",
      professional: "Content will be tagged as professional"
    },
    article: {
      readingTime: "Estimated reading time may be calculated",
      author: "Author information will be extracted",
      publishDate: "Publication date will be included"
    }
  };
  
  return hints[platform.toLowerCase()] || {
    general: "Basic metadata will be extracted from the page"
  };
}

/**
 * Example usage demonstration
 */
export async function demonstrateMetadataExtraction() {
  console.log("🚀 Metadata Extraction System Demo");
  console.log("==================================");
  
  // Show supported platforms
  console.log("\n📱 Supported Platforms:");
  const platforms = getSupportedPlatforms();
  platforms.forEach(platform => {
    const info = detectPlatformFromUrl(`https://${platform}.com`);
    if (info) {
      console.log(`  ${info.icon} ${info.name} (${info.type})`);
    }
  });
  
  // Test URL validation
  console.log("\n🔍 URL Validation Examples:");
  Object.entries(EXAMPLE_URLS).forEach(([platform, url]) => {
    const validation = validateUrlForExtraction(url);
    if (validation.isValid) {
      console.log(`  ✅ ${platform}: ${validation.platform}`);
    } else {
      console.log(`  ❌ ${platform}: ${validation.error}`);
    }
  });
  
  // Test metadata extraction (commented out to avoid actual API calls)
  console.log("\n📊 Metadata Extraction:");
  console.log("  (API calls would be made here in real usage)");
  
  // Show platform hints
  console.log("\n💡 Platform-Specific Features:");
  Object.keys(EXAMPLE_URLS).forEach(platform => {
    const hints = getPlatformMetadataHints(platform);
    console.log(`  ${platform}: ${Object.values(hints).join(", ")}`);
  });
}

// Export example URLs for testing
export { EXAMPLE_URLS };

// Example React component usage (commented out for reference)
/*
import { useState } from 'react';
import { useMetadataExtraction } from '@/hooks/useMetadataExtraction';

export function MetadataExtractionDemo() {
  const [url, setUrl] = useState('');
  const { metadata, isLoading, error, extractMetadata } = useMetadataExtraction();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      await extractMetadata(url.trim());
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to extract metadata..."
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Extracting...' : 'Extract Metadata'}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      {metadata && (
        <div className="metadata">
          <h3>Extracted Metadata:</h3>
          <p><strong>Title:</strong> {metadata.title}</p>
          <p><strong>Description:</strong> {metadata.description}</p>
          <p><strong>Platform:</strong> {metadata.platformName}</p>
          <p><strong>Type:</strong> {metadata.contentType}</p>
          {metadata.estimatedDuration > 0 && (
            <p><strong>Duration:</strong> {metadata.estimatedDuration}s</p>
          )}
          {metadata.thumbnailUrl && (
            <p><strong>Thumbnail:</strong> <img src={metadata.thumbnailUrl} alt="Preview" /></p>
          )}
          <p><strong>Tags:</strong> {metadata.tags.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
*/
