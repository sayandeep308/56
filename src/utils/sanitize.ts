/**
 * Utility to recursively sanitize objects and arrays before writing to Firebase Realtime Database.
 * Realtime Database strictly rejects objects containing `undefined` values.
 */
export function cleanDatabasePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => cleanDatabasePayload(item)) as any;
  }

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanDatabasePayload(value);
      }
    }
    return cleaned as T;
  }

  return obj;
}

// Retain cleanFirestorePayload for backward compatibility
export const cleanFirestorePayload = cleanDatabasePayload;

/**
 * Ensures any base64 / data URL string in an image list or field is bounded
 * to prevent exceeding payload limits (target under 150KB-300KB).
 */
export function validateImagePayloadSize(images: string[] = []): boolean {
  for (const img of images) {
    if (img && img.startsWith('data:') && img.length > 500 * 1024) {
      return false;
    }
  }
  return true;
}
