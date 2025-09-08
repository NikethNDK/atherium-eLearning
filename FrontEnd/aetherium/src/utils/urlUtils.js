/**
 * Utility functions for URL handling
 */

/**
 * Ensures a URL is absolute by adding protocol if missing
 * @param {string} url - The URL to process
 * @returns {string|null} - The absolute URL or null if invalid
 */
export const getAbsoluteUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Trim whitespace
  url = url.trim();
  
  console.log('Processing URL:', url);
  
  // If URL already has protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('URL already has protocol:', url);
    return url;
  }
  
  // If URL starts with //, add https: protocol
  if (url.startsWith('//')) {
    const result = `https:${url}`;
    console.log('Added https: protocol:', result);
    return result;
  }
  
  // If URL starts with /, it's a relative path - this shouldn't happen for external URLs
  // but we'll handle it by treating it as a relative path to the current domain
  if (url.startsWith('/')) {
    console.warn('External URL appears to be relative:', url);
    return url; // Let browser handle relative URLs
  }
  
  // If URL doesn't start with protocol, assume it's a domain and add https://
  const result = `https://${url}`;
  console.log('Added https:// protocol:', result);
  return result;
};

/**
 * Validates if a URL is properly formatted
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL is valid
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const absoluteUrl = getAbsoluteUrl(url);
    new URL(absoluteUrl);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extracts domain from a URL
 * @param {string} url - The URL to extract domain from
 * @returns {string|null} - The domain or null if invalid
 */
export const getDomainFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const absoluteUrl = getAbsoluteUrl(url);
    const urlObj = new URL(absoluteUrl);
    return urlObj.hostname;
  } catch {
    return null;
  }
};
