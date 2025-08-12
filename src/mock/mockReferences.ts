export interface Reference {
  id: string;
  title: string;
  sourcePlatform: string;
  url: string;
  tags: string[];
  description: string;
  relatedProductId: string;
  addedBy: string;
  dateAdded: string;
  thumbnailUrl: string;
  durationSeconds: number;
  notes: string;
}

export const mockReferences: Reference[] = [
  {
    id: "ref_001",
    title: "TikTok demo of similar fitness tracker",
    sourcePlatform: "tiktok",
    url: "https://www.tiktok.com/@username/video/1234567890",
    tags: ["fitness", "wearable", "health-tracking"],
    description: "Quick overview of competitor's motion sensor features.",
    relatedProductId: "prod_002",
    addedBy: "user_001",
    dateAdded: "2025-08-12T14:32:00Z",
    thumbnailUrl: "https://cdn.example.com/thumbnails/ref_001.jpg",
    durationSeconds: 38,
    notes: "Interesting UI animation on data screen transitions."
  },
  {
    id: "ref_002",
    title: "Instagram reel about productivity tips",
    sourcePlatform: "instagram",
    url: "https://www.instagram.com/reel/ABCDEFGHIJK",
    tags: ["productivity", "saas", "teamwork"],
    description: "Short reel showing benefits of structured task management.",
    relatedProductId: "prod_005",
    addedBy: "user_003",
    dateAdded: "2025-08-10T09:14:00Z",
    thumbnailUrl: "https://cdn.example.com/thumbnails/ref_002.jpg",
    durationSeconds: 22,
    notes: "Could adapt 'three steps' format for onboarding videos."
  },
  {
    id: "ref_003",
    title: "YouTube tutorial on app development",
    sourcePlatform: "youtube",
    url: "https://www.youtube.com/watch?v=abcdefghijk",
    tags: ["development", "tutorial", "app-building"],
    description: "Comprehensive guide to building modern web applications.",
    relatedProductId: "prod_001",
    addedBy: "user_002",
    dateAdded: "2025-08-11T16:45:00Z",
    thumbnailUrl: "https://cdn.example.com/thumbnails/ref_003.jpg",
    durationSeconds: 1247,
    notes: "Great explanation of state management patterns."
  },
  {
    id: "ref_004",
    title: "LinkedIn post about startup growth",
    sourcePlatform: "linkedin",
    url: "https://www.linkedin.com/posts/username_startup-growth-123",
    tags: ["startup", "growth", "business"],
    description: "Insights on scaling from 0 to 1000 users.",
    relatedProductId: "prod_003",
    addedBy: "user_001",
    dateAdded: "2025-08-09T11:20:00Z",
    thumbnailUrl: "https://cdn.example.com/thumbnails/ref_004.jpg",
    durationSeconds: 0,
    notes: "Key metrics to track during early growth phase."
  },
  {
    id: "ref_005",
    title: "Twitter thread on UX design",
    sourcePlatform: "twitter",
    url: "https://twitter.com/username/status/1234567890",
    tags: ["ux", "design", "user-experience"],
    description: "Thread discussing modern UX design principles.",
    relatedProductId: "prod_004",
    addedBy: "user_003",
    dateAdded: "2025-08-08T14:15:00Z",
    thumbnailUrl: "https://cdn.example.com/thumbnails/ref_005.jpg",
    durationSeconds: 0,
    notes: "Good examples of micro-interactions."
  },
  {
    id: "ref_006",
    title: "Another TikTok fitness video",
    sourcePlatform: "tiktok",
    url: "https://www.tiktok.com/@username/video/0987654321",
    tags: ["fitness", "motivation", "workout"],
    description: "Quick workout routine demonstration.",
    relatedProductId: "prod_002",
    addedBy: "user_002",
    dateAdded: "2025-08-12T10:30:00Z",
    thumbnailUrl: "https://cdn.example.com/thumbnails/ref_006.jpg",
    durationSeconds: 45,
    notes: "Simple but effective exercise sequence."
  },
  {
    id: "ref_007",
    title: "Review of your-product features",
    sourcePlatform: "youtube",
    url: "https://www.youtube.com/watch?v=directref123",
    tags: ["your-product", "review", "features"],
    description: "Amazing review of your-product showing all the key features.",
    relatedProductId: "prod_001",
    addedBy: "user_001",
    dateAdded: "2025-08-13T15:20:00Z",
    thumbnailUrl: "https://cdn.example.com/thumbnails/ref_007.jpg",
    durationSeconds: 320,
    notes: "Great customer feedback and feature highlights."
  },
  {
    id: "ref_008",
    title: "Instagram post featuring your-product",
    sourcePlatform: "instagram",
    url: "https://www.instagram.com/p/yourproduct123",
    tags: ["your-product", "showcase", "social-proof"],
    description: "Customer sharing their experience with your-product.",
    relatedProductId: "prod_001",
    addedBy: "user_002",
    dateAdded: "2025-08-13T12:45:00Z",
    thumbnailUrl: "https://cdn.example.com/thumbnails/ref_008.jpg",
    durationSeconds: 0,
    notes: "Authentic user-generated content."
  }
];
