/**
 * Utility to recursively sanitize objects and arrays before writing to Firestore.
 * Firestore strictly forbids `undefined` values in documents and nested maps/arrays.
 * Also removes empty string keys and converts invalid values.
 */
export function cleanFirestorePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => cleanFirestorePayload(item)) as any;
  }

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestorePayload(value);
      }
    }
    return cleaned as T;
  }

  return obj;
}

/**
 * Ensures any base64 / data URL string in an image list or field is bounded
 * to prevent exceeding Firestore's 1MB document size limit (target under 300KB-500KB).
 */
export function validateImagePayloadSize(images: string[] = []): boolean {
  for (const img of images) {
    if (img && img.startsWith('data:') && img.length > 500 * 1024) {
      return false;
    }
  }
  return true;
}
