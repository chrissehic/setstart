# 🚀 Enhanced URL Metadata Extraction System

A robust, platform-aware metadata extraction system that automatically detects social media platforms and extracts relevant metadata from URLs. Built with TypeScript, Next.js, and designed for extensibility.

## ✨ Features

- **🔍 Platform Detection**: Automatically detects 10+ social media platforms
- **📊 Rich Metadata**: Extracts title, description, thumbnails, duration, and more
- **🔄 Fallback Handling**: Graceful degradation when content fetching fails
- **⚡ Performance**: 15-second timeout with optimized HTTP requests
- **🎯 Type Safety**: Full TypeScript support with comprehensive interfaces
- **🔧 Extensible**: Easy to add new platforms and metadata extractors

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Route      │    │   Platform      │
│   Component     │───▶│   /extract-      │───▶│   Configs       │
│                 │    │   metadata       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   HTML Parser    │
                       │   & Extractors   │
                       └──────────────────┘
```

## 🎯 Supported Platforms

| Platform | Type | Icon | Domains |
|----------|------|------|---------|
| **YouTube** | Video | 🎥 | youtube.com, youtu.be |
| **Instagram** | Image/Video | 📸 | instagram.com, instagr.am |
| **TikTok** | Video | 🎵 | tiktok.com, vm.tiktok.com |
| **Twitter/X** | Social | 🐦 | twitter.com, x.com |
| **Facebook** | Social | 📘 | facebook.com, fb.com |
| **LinkedIn** | Professional | 💼 | linkedin.com |
| **Pinterest** | Image | 📌 | pinterest.com, pin.it |
| **Reddit** | Social | 🤖 | reddit.com, old.reddit.com |
| **Medium** | Article | 📝 | medium.com |
| **Substack** | Article | 📧 | substack.com |
| **WordPress** | Article | 🔧 | wordpress.com |

## 🛠️ Installation & Setup

### 1. API Route
The main extraction logic is in `/api/extract-metadata/route.ts`:

```typescript
// POST /api/extract-metadata
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### 2. React Hook
Use the `useMetadataExtraction` hook in your components:

```typescript
import { useMetadataExtraction } from '@/hooks/useMetadataExtraction';

function MyComponent() {
  const { metadata, isLoading, error, extractMetadata } = useMetadataExtraction();
  
  const handleUrlSubmit = async (url: string) => {
    await extractMetadata(url);
  };
  
  // ... rest of component
}
```

### 3. Platform Detection Utilities
Import platform detection utilities:

```typescript
import { 
  detectPlatformFromUrl, 
  isUrlSupported,
  getSupportedPlatforms 
} from '@/lib/utils/platformDetection';

// Check if URL is supported
if (isUrlSupported(url)) {
  const platform = detectPlatformFromUrl(url);
  console.log(`Platform: ${platform?.name}`);
}
```

## 📊 Metadata Structure

The system extracts comprehensive metadata:

```typescript
interface ExtractedMetadata {
  title: string;                    // Content title
  description: string;              // Content description
  contentType: "video" | "image" | "article" | "social" | "professional" | "other";
  estimatedDuration: number;        // Duration in seconds (for videos)
  tags: string[];                   // Content tags and categories
  platform: string;                 // Platform identifier
  platformName: string;             // Human-readable platform name
  author?: string;                  // Content author
  publishedDate?: string;           // Publication date
  thumbnailUrl?: string;            // Preview image URL
  language: string;                 // Content language
  category: string;                 // Content category
  url: string;                      // Original URL
  domain: string;                   // Domain name
}
```

## 🔧 Platform Configuration

Each platform has a detailed configuration:

```typescript
interface PlatformConfig {
  name: string;                     // Display name
  domains: string[];                // Supported domains
  contentType: ContentType;         // Content type
  defaultDuration?: number;         // Default duration for videos
  extractors: {                     // Metadata extraction patterns
    title: string[];                // Title extraction patterns
    description: string[];          // Description patterns
    image: string[];                // Image/thumbnail patterns
    author: string[];               // Author patterns
    date: string[];                 // Date patterns
    duration?: string[];            // Duration patterns (for videos)
  };
}
```

## 🚀 Usage Examples

### Basic Metadata Extraction

```typescript
import { extractMetadataExample } from '@/lib/examples/metadataExtractionExample';

// Extract metadata from a single URL
const metadata = await extractMetadataExample(
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
);

console.log(metadata.title);        // "Rick Astley - Never Gonna Give You Up"
console.log(metadata.platformName); // "YouTube"
console.log(metadata.contentType);  // "video"
console.log(metadata.estimatedDuration); // 212
```

### Batch Processing

```typescript
import { batchExtractMetadata } from '@/lib/examples/metadataExtractionExample';

const urls = [
  "https://www.instagram.com/p/ABC123/",
  "https://twitter.com/user/status/1234567890",
  "https://medium.com/@user/article-title"
];

const results = await batchExtractMetadata(urls);
results.forEach(result => {
  if (result.success) {
    console.log(`${result.url}: ${result.metadata.title}`);
  } else {
    console.error(`${result.url}: ${result.error}`);
  }
});
```

### URL Validation

```typescript
import { validateUrlForExtraction } from '@/lib/examples/metadataExtractionExample';

const validation = validateUrlForExtraction("https://invalid-url.com");

if (validation.isValid) {
  console.log(`✅ ${validation.platform} (${validation.type})`);
} else {
  console.log(`❌ ${validation.error}: ${validation.suggestion}`);
}
```

### React Component Integration

```typescript
import { useState } from 'react';
import { useMetadataExtraction } from '@/hooks/useMetadataExtraction';

export function MetadataExtractor() {
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
          <p><strong>Platform:</strong> {metadata.platformName}</p>
          <p><strong>Type:</strong> {metadata.contentType}</p>
          {metadata.estimatedDuration > 0 && (
            <p><strong>Duration:</strong> {metadata.estimatedDuration}s</p>
          )}
          {metadata.thumbnailUrl && (
            <img src={metadata.thumbnailUrl} alt="Preview" />
          )}
        </div>
      )}
    </div>
  );
}
```

## 🔍 How It Works

### 1. URL Validation & Platform Detection
- Validates URL format
- Detects platform from domain
- Checks if platform is supported

### 2. Content Fetching
- Sends HTTP request with realistic browser headers
- 15-second timeout with AbortController
- Handles various HTTP status codes

### 3. Metadata Extraction
- Platform-specific extraction patterns
- Multiple fallback strategies
- HTML parsing with regex patterns
- Open Graph and Twitter Card support

### 4. Content Type Detection
- Platform-aware content type determination
- Video duration extraction where possible
- Fallback to platform defaults

### 5. Response Formatting
- Consistent metadata structure
- Platform-specific enhancements
- Error handling and fallbacks

## 🎨 Customization & Extension

### Adding New Platforms

1. **Update Platform Configs**:
```typescript
// In /api/extract-metadata/route.ts
const PLATFORM_CONFIGS = {
  // ... existing platforms
  newplatform: {
    name: "New Platform",
    domains: ["newplatform.com", "np.com"],
    contentType: "social",
    extractors: {
      title: ['property="og:title"', '<title>'],
      description: ['property="og:description"'],
      image: ['property="og:image"'],
      author: ['name="author"'],
      date: ['property="article:published_time"']
    }
  }
};
```

2. **Update Platform Detection**:
```typescript
// In /lib/utils/platformDetection.ts
export const SUPPORTED_PLATFORMS = {
  // ... existing platforms
  newplatform: {
    name: "New Platform",
    type: "social",
    icon: "🆕",
    color: "#FF6B6B",
    domains: ["newplatform.com", "np.com"]
  }
};
```

### Custom Metadata Extractors

```typescript
// Add custom extraction patterns
const customExtractors = {
  title: [
    'property="custom:title"',     // Custom meta property
    'data-title="([^"]+)"',        // Data attribute
    '<h1[^>]*>([^<]+)</h1>'       // Custom HTML pattern
  ],
  // ... other extractors
};
```

## 🧪 Testing

### Test URLs

```typescript
import { EXAMPLE_URLS } from '@/lib/examples/metadataExtractionExample';

// Test with various platforms
Object.entries(EXAMPLE_URLS).forEach(([platform, url]) => {
  console.log(`Testing ${platform}: ${url}`);
  // ... test logic
});
```

### Error Scenarios

- Invalid URLs
- Unsupported platforms
- Network timeouts
- Malformed HTML
- Missing metadata

## 🚨 Error Handling

The system handles various error scenarios gracefully:

- **Invalid URLs**: Returns validation error with suggestions
- **Unsupported Platforms**: Clear error message with supported platforms list
- **Network Failures**: Fallback to basic metadata extraction
- **Timeout Errors**: 15-second timeout with user-friendly messages
- **Malformed Content**: Graceful degradation to available metadata

## 📈 Performance Considerations

- **Timeout**: 15-second maximum for content fetching
- **Caching**: React Query integration for repeated requests
- **Fallbacks**: Multiple extraction strategies for reliability
- **Headers**: Realistic browser headers to avoid blocking
- **Error Recovery**: Graceful degradation when possible

## 🔒 Security Features

- **URL Validation**: Strict URL format validation
- **Content Sanitization**: Safe HTML parsing
- **Timeout Protection**: Prevents hanging requests
- **Error Masking**: User-friendly error messages without exposing internals

## 🚀 Future Enhancements

- **AI-Powered Extraction**: Machine learning for better metadata detection
- **Video Analysis**: Thumbnail generation and video processing
- **Social Metrics**: Engagement data extraction
- **Content Categorization**: Automatic content classification
- **Multi-Language Support**: Enhanced language detection and processing
- **Real-time Updates**: WebSocket support for live content monitoring

## 📚 API Reference

### POST /api/extract-metadata

**Request Body:**
```json
{
  "url": "https://example.com/content"
}
```

**Response:**
```json
{
  "success": true,
  "metadata": {
    "title": "Content Title",
    "description": "Content description...",
    "contentType": "video",
    "estimatedDuration": 120,
    "tags": ["tag1", "tag2"],
    "platform": "youtube",
    "platformName": "YouTube",
    "author": "Author Name",
    "publishedDate": "2024-01-01T00:00:00Z",
    "thumbnailUrl": "https://example.com/thumb.jpg",
    "language": "en",
    "category": "YouTube",
    "url": "https://example.com/content",
    "domain": "example.com"
  }
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-platform`
3. **Add platform support**: Update platform configs and detection
4. **Test thoroughly**: Use various URLs and error scenarios
5. **Submit pull request**: Include tests and documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check existing documentation
- Review example implementations
- Test with supported platforms

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
