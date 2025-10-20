// utils/validation.js
/**
 * Validates search term input
 * @param {string} term - The search term
 * @returns {string} Validated and sanitized term
 * @throws {Error} If validation fails
 */
export const validateSearchTerm = (term) => {
  // Type check
  if (!term || typeof term !== 'string') {
    throw new Error('Search term must be a non-empty string');
  }

  const trimmed = term.trim();

  // Length check - empty
  if (trimmed.length === 0) {
    throw new Error('Please enter a search term');
  }

  // Length check - too long
  if (trimmed.length > 2000) {
    throw new Error('Search term cannot exceed 2000 characters');
  }

  // Basic sanitization - remove potentially dangerous characters
  // Allow: alphanumeric, spaces, hyphens, periods, quotes, ampersand, parentheses, underscores
  const sanitized = trimmed.replace(/[^\w\s\-.\"'&()]/g, '');

  if (sanitized.length === 0) {
    throw new Error('Search term contains invalid characters');
  }

  return sanitized;
};

/**
 * Validates search type
 * @param {string} type - The search type
 * @returns {string} Validated search type
 * @throws {Error} If validation fails
 */
export const validateSearchType = (type) => {
  const validTypes = ['all', 'image', 'video', 'news'];

  if (!type) {
    return 'all';
  }

  if (!validTypes.includes(type)) {
    throw new Error(`Invalid search type. Must be one of: ${validTypes.join(', ')}`);
  }

  return type;
};

/**
 * Validates pagination start parameter
 * @param {string|number} start - The start parameter
 * @returns {number} Validated start parameter
 * @throws {Error} If validation fails
 */
export const validatePaginationStart = (start) => {
  const parsed = parseInt(start, 10);

  if (isNaN(parsed) || parsed < 1) {
    throw new Error('Start parameter must be a positive number');
  }

  if (parsed > 1000) {
    throw new Error('Start parameter cannot exceed 1000');
  }

  return parsed;
};
