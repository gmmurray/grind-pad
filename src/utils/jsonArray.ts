/**
 * Parse a JSON string into an array.
 * Always returns an array; logs and falls back to [] if input is invalid.
 */
export function parseJsonArray<T = unknown>(str: string): T[] {
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed as T[];
    }
    console.warn(
      'parseJsonArray: JSON is valid but not an array, defaulting to []',
      str,
    );
    return [];
  } catch (err) {
    console.error(
      'parseJsonArray: failed to parse JSON string, defaulting to []',
      err,
      str,
    );
    return [];
  }
}

/**
 * Convert an array into a JSON string.
 * Always returns a valid string; logs and defaults to [] if input is not an array.
 */
export function stringifyArray<T = unknown>(arr: T[]): string {
  if (!Array.isArray(arr)) {
    console.warn(
      'stringifyArray: input is not an array, defaulting to []',
      arr,
    );
    return '[]';
  }
  try {
    return JSON.stringify(arr);
  } catch (err) {
    console.error(
      'stringifyArray: failed to stringify array, defaulting to []',
      err,
      arr,
    );
    return '[]';
  }
}
