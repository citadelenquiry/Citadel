export const ASSET_VERSION = '20261010-v3';

/**
 * Resolves static asset URLs so they work across all hosting environments:
 * - Local development & AI Studio preview (baseUrl = '/')
 * - GitHub Pages project repository (baseUrl = '/repo-name/')
 * - Custom domain or static CDN (baseUrl = '/')
 * Automatically appends a cache-busting version query to prevent browsers and CDNs from caching old assets.
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';

  // Return unchanged if it is an external URL (http, https, //) or data/blob URI
  if (/^(https?:|data:|blob:|\/\/)/i.test(path)) {
    return path;
  }

  // Retrieve Vite's injected base URL (e.g. '/' or '/citadel-group/' or './')
  const baseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) || './';

  // Normalize path by stripping leading slashes
  const cleanPath = path.replace(/^\/+/, '');

  // Add cache-busting query parameter so updated images immediately invalidate browser/CDN caches
  const separator = cleanPath.includes('?') ? '&' : '?';
  const versionedPath = cleanPath.includes('v=') ? cleanPath : `${cleanPath}${separator}v=${ASSET_VERSION}`;

  // If baseUrl is relative
  if (baseUrl === './' || baseUrl === '') {
    return `./${versionedPath}`;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${versionedPath}`;
}
