/**
 * Utility functions for date formatting
 */

/**
 * Format a date string to a readable format with timezone
 * @param {string} dateString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  // Default options for Indian timezone
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata', // Indian Standard Time
    hour12: true
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return date.toLocaleDateString('en-IN', formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a date string to show only date (no time)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDateOnly = (dateString) => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
};

/**
 * Format a date string to show only time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time string
 */
export const formatTimeOnly = (dateString) => {
  return formatDate(dateString, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    hour12: true
  });
};

/**
 * Format a date string for relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Ensure both dates are in the same timezone for accurate comparison
  const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  
  const diffInMs = utcNow - utcDate;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  // For older dates, show the actual date
  return formatDateOnly(dateString);
};
