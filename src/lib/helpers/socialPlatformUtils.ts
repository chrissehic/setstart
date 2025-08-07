export interface PlatformInfo {
  name: string;
  icon: string;
  handle?: string;
}

export function detectPlatformFromUrl(url: string): PlatformInfo | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // LinkedIn
    if (hostname.includes('linkedin.com')) {
      const handle = pathname.replace(/^\//, '').replace(/\/$/, '');
      return {
        name: 'LinkedIn',
        icon: 'linkedin',
        handle: handle || undefined,
      };
    }

    // Twitter/X
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      const handle = pathname.replace(/^\//, '').replace(/\/$/, '');
      return {
        name: 'Twitter',
        icon: 'twitter',
        handle: handle ? `@${handle}` : undefined,
      };
    }

    // Instagram
    if (hostname.includes('instagram.com')) {
      const handle = pathname.replace(/^\//, '').replace(/\/$/, '');
      return {
        name: 'Instagram',
        icon: 'instagram',
        handle: handle ? `@${handle}` : undefined,
      };
    }

    // Facebook
    if (hostname.includes('facebook.com')) {
      const handle = pathname.replace(/^\//, '').replace(/\/$/, '');
      return {
        name: 'Facebook',
        icon: 'facebook',
        handle: handle || undefined,
      };
    }

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      const handle = pathname.includes('/channel/') || pathname.includes('/c/') || pathname.includes('/user/') 
        ? pathname.replace(/^\//, '').replace(/\/$/, '')
        : undefined;
      return {
        name: 'YouTube',
        icon: 'youtube',
        handle: handle || undefined,
      };
    }

    // TikTok
    if (hostname.includes('tiktok.com')) {
      const handle = pathname.replace(/^\//, '').replace(/\/$/, '');
      return {
        name: 'TikTok',
        icon: 'tiktok',
        handle: handle ? `@${handle}` : undefined,
      };
    }

    // GitHub
    if (hostname.includes('github.com')) {
      const handle = pathname.replace(/^\//, '').replace(/\/$/, '');
      return {
        name: 'GitHub',
        icon: 'github',
        handle: handle || undefined,
      };
    }

    // Discord
    if (hostname.includes('discord.gg') || hostname.includes('discord.com')) {
      const handle = pathname.replace(/^\//, '').replace(/\/$/, '');
      return {
        name: 'Discord',
        icon: 'discord',
        handle: handle || undefined,
      };
    }

    // Website (generic)
    if (hostname && !hostname.includes('www.')) {
      return {
        name: 'Website',
        icon: 'globe',
        handle: hostname,
      };
    }

    // Default for unknown platforms
    return {
      name: 'Website',
      icon: 'globe',
      handle: url,
    };
  } catch {
    return null;
  }
} 