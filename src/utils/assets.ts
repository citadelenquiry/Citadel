/**
 * Resolves static asset URLs so they work across all hosting environments:
 * - Local development & AI Studio preview (baseUrl = '/')
 * - GitHub Pages project repository (baseUrl = '/repo-name/')
 * - Custom domain or static CDN (baseUrl = '/')
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';

  // Return unchanged if it is an external URL (http, https, //) or data/blob URI
  if (/^(https?:|data:|blob:|\/\/)/i.test(path)) {
    return path;
  }

  // Retrieve Vite's injected base URL (e.g. '/' or '/citadel-group/' or './')
  const baseUrl = import.meta.env.BASE_URL || './';

  // Normalize path by stripping leading slashes
  const cleanPath = path.replace(/^\/+/, '');

  // If baseUrl is relative
  if (baseUrl === './' || baseUrl === '') {
    return `./${cleanPath}`;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanPath}`;
}
