/**
 * Utility functions for secure logging
 * Prevents log injection attacks by sanitizing user input
 */

/**
 * Sanitize user input for logging to prevent injection attacks
 * Removes control characters and limits length
 */
export function sanitizeForLogging(input: unknown): string {
  if (input === null || input === undefined) {
    return 'null';
  }
  
  let str = String(input);
  
  // Remove control characters that could be used for log injection
  str = str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  // Remove ANSI escape sequences
  str = str.replace(/\x1b\[[0-9;]*m/g, '');
  
  // Limit length to prevent log flooding
  if (str.length > 200) {
    str = str.substring(0, 197) + '...';
  }
  
  return str;
}

/**
 * Sanitize an object for logging by sanitizing all string values
 */
export function sanitizeObjectForLogging(obj: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize both key and value
    const cleanKey = sanitizeForLogging(key);
    const cleanValue = sanitizeForLogging(value);
    result[cleanKey] = cleanValue;
  }
  
  return result;
}