/**
 * Text normalization utilities for enhanced search functionality
 * Handles special characters, accents, symbols, and generates search variations
 */

// Character mapping for common accented characters
const ACCENT_MAP: Record<string, string> = {
  'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a', 'å': 'a', 'ā': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e', 'ē': 'e', 'ė': 'e', 'ę': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i', 'ī': 'i', 'į': 'i',
  'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o', 'ø': 'o', 'ō': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u', 'ū': 'u', 'ų': 'u',
  'ý': 'y', 'ÿ': 'y', 'ñ': 'n', 'ç': 'c', 'ß': 'ss',
  'Á': 'A', 'À': 'A', 'Â': 'A', 'Ä': 'A', 'Ã': 'A', 'Å': 'A', 'Ā': 'A',
  'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E', 'Ē': 'E', 'Ė': 'E', 'Ę': 'E',
  'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I', 'Ī': 'I', 'Į': 'I',
  'Ó': 'O', 'Ò': 'O', 'Ô': 'O', 'Ö': 'O', 'Õ': 'O', 'Ø': 'O', 'Ō': 'O',
  'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U', 'Ū': 'U', 'Ų': 'U',
  'Ý': 'Y', 'Ÿ': 'Y', 'Ñ': 'N', 'Ç': 'C'
};

// Symbol mapping for special characters
const SYMBOL_MAP: Record<string, string> = {
  '$': 'S',
  '€': 'E',
  '£': 'L',
  '¥': 'Y',
  '₹': 'R',
  '₩': 'W'
};

/**
 * Normalizes accented characters to their basic Latin equivalents
 */
export const normalizeAccents = (text: string): string => {
  return text.split('').map(char => ACCENT_MAP[char] || char).join('');
};

/**
 * Normalizes special symbols like currency symbols
 */
export const normalizeSymbols = (text: string): string => {
  return text.split('').map(char => SYMBOL_MAP[char] || char).join('');
};

/**
 * Removes punctuation while preserving hyphens and apostrophes in names
 */
export const normalizePunctuation = (text: string): string => {
  // Remove commas, periods (except in abbreviations), and other punctuation
  // but preserve hyphens, apostrophes, and spaces
  return text.replace(/[.,;:!?()[\]{}""'']/g, '').replace(/\s+/g, ' ').trim();
};

/**
 * Creates a fully normalized version of text for searching
 */
export const normalizeSearchText = (text: string): string => {
  if (!text) return '';
  
  let normalized = text.toLowerCase();
  normalized = normalizeAccents(normalized);
  normalized = normalizeSymbols(normalized);
  normalized = normalizePunctuation(normalized);
  
  return normalized;
};

/**
 * Generates multiple search variations for a given search term
 */
export const generateSearchVariations = (searchTerm: string): string[] => {
  if (!searchTerm || searchTerm.length < 2) return [];

  const variations = new Set<string>();
  const originalLower = searchTerm.toLowerCase().trim();
  
  // Add original term
  variations.add(originalLower);
  
  // Add normalized version
  const normalized = normalizeSearchText(originalLower);
  if (normalized !== originalLower) {
    variations.add(normalized);
  }
  
  // Add version without spaces (for compact searches)
  const noSpaces = originalLower.replace(/\s+/g, '');
  if (noSpaces !== originalLower && noSpaces.length >= 2) {
    variations.add(noSpaces);
  }
  
  // Add version without periods
  const noPeriods = originalLower.replace(/\./g, '');
  if (noPeriods !== originalLower) {
    variations.add(noPeriods);
  }
  
  // Add normalized version without spaces
  const normalizedNoSpaces = normalized.replace(/\s+/g, '');
  if (normalizedNoSpaces !== normalized && normalizedNoSpaces.length >= 2) {
    variations.add(normalizedNoSpaces);
  }

  return Array.from(variations);
};

/**
 * Creates PostgREST-compatible OR query patterns using ILIKE for case-insensitive search
 */
export const createSearchOrQuery = (searchTerm: string, columns: string[] = ['name']): string => {
  const variations = generateSearchVariations(searchTerm);
  if (variations.length === 0) return '';

  const patterns: string[] = [];
  
  variations.forEach(variation => {
    columns.forEach(column => {
      // Use ILIKE for case-insensitive matching (works without PostgreSQL extensions)
      patterns.push(`${column}.ilike.%${variation}%`);
    });
  });

  return patterns.join(',');
};

/**
 * Sorts search results by relevance based on search term
 */
export const sortBySearchRelevance = <T extends { name: string }>(
  results: T[], 
  searchTerm: string
): T[] => {
  if (!searchTerm || results.length === 0) return results;

  const normalizedSearch = normalizeSearchText(searchTerm);
  const originalLower = searchTerm.toLowerCase();

  return results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aNormalized = normalizeSearchText(aName);
    const bNormalized = normalizeSearchText(bName);

    // Exact matches first (original)
    if (aName === originalLower && bName !== originalLower) return -1;
    if (bName === originalLower && aName !== originalLower) return 1;
    
    // Exact matches (normalized)
    if (aNormalized === normalizedSearch && bNormalized !== normalizedSearch) return -1;
    if (bNormalized === normalizedSearch && aNormalized !== normalizedSearch) return 1;
    
    // Starts with matches (original)
    if (aName.startsWith(originalLower) && !bName.startsWith(originalLower)) return -1;
    if (bName.startsWith(originalLower) && !aName.startsWith(originalLower)) return 1;
    
    // Starts with matches (normalized)
    if (aNormalized.startsWith(normalizedSearch) && !bNormalized.startsWith(normalizedSearch)) return -1;
    if (bNormalized.startsWith(normalizedSearch) && !aNormalized.startsWith(normalizedSearch)) return 1;
    
    // Contains matches (original)
    if (aName.includes(originalLower) && !bName.includes(originalLower)) return -1;
    if (bName.includes(originalLower) && !aName.includes(originalLower)) return 1;
    
    // Contains matches (normalized)
    if (aNormalized.includes(normalizedSearch) && !bNormalized.includes(normalizedSearch)) return -1;
    if (bNormalized.includes(normalizedSearch) && !aNormalized.includes(normalizedSearch)) return 1;
    
    // Alphabetical fallback
    return aName.localeCompare(bName);
  });
};