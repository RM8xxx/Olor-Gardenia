/**
 * Cloudinary & Image URL optimization and cache-busting helper
 * Ensures newly uploaded or updated photos in Cloudinary immediately refresh
 * on published apps without being blocked by stale CDN or browser cache.
 */

const PHOTO_CACHE_KEY = 'maria_maria_photo_cache_v2';
// Base build timestamp to ensure published app updates
const DEFAULT_PHOTO_VERSION = 1724490000;

export const getPhotoCacheVersion = (): number => {
  if (typeof window === 'undefined') return DEFAULT_PHOTO_VERSION;
  try {
    const saved = localStorage.getItem(PHOTO_CACHE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_PHOTO_VERSION;
};

export const bumpPhotoCacheVersion = (): number => {
  const newVersion = Date.now();
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PHOTO_CACHE_KEY, String(newVersion));
      window.dispatchEvent(new CustomEvent('photo-cache-bumped', { detail: { version: newVersion } }));
    } catch (e) {}
  }
  return newVersion;
};

/**
 * Returns a fresh, cache-busted URL for Cloudinary images.
 * Bypasses Cloudinary edge CDN stale cache and browser disk cache.
 */
export const getOptimizedImageUrl = (url?: string, customVersion?: number): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '';
  }

  const cleanUrl = url.trim();

  // If it's a Cloudinary URL, append version/timestamp cache-buster
  if (cleanUrl.includes('cloudinary.com') || cleanUrl.includes('res.cloudinary.com')) {
    const version = customVersion || getPhotoCacheVersion();
    
    // If URL already has query parameters, append with &
    if (cleanUrl.includes('?')) {
      // If it already has v= or t=, replace it
      if (cleanUrl.includes('v=') || cleanUrl.includes('t=')) {
        return cleanUrl.replace(/([?&](?:v|t)=)[^&]*/, `$1${version}`);
      }
      return `${cleanUrl}&v=${version}`;
    }
    
    // Otherwise add ?v=version
    return `${cleanUrl}?v=${version}`;
  }

  return cleanUrl;
};
