import { useState, useCallback } from 'react';

export function useImageCacheBuster() {
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  const refreshImage = useCallback(() => {
    setCacheBuster(Date.now());
  }, []);

  const getCacheBustedUrl = useCallback((url: string | null | undefined) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${cacheBuster}`;
  }, [cacheBuster]);

  return {
    cacheBuster,
    refreshImage,
    getCacheBustedUrl,
  };
}
