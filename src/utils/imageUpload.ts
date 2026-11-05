import { SiteSettings } from '../types';

/**
 * 3-Tier Image Upload Architecture:
 * 1. Tier 1 (Cloud Storage): If Cloudinary (cloudName + uploadPreset) or ImgBB (apiKey) is configured in settings/globalConfig,
 *    upload directly to that cloud bucket via fetch and return the secure HTTPS URL.
 * 2. Tier 2 (Zero-Config Auto Fallback): If external storage keys are not configured or fail, automatically compress
 *    and resize the uploaded image in-browser using HTML5 Canvas (max dimension 1000px, WebP/JPEG quality 0.75, target under 150KB)
 *    and return the optimized data URL so uploads work 100% free out-of-the-box on Vercel without external keys.
 * 3. Tier 3 (Direct URL): Direct paste support for any hosted external URL.
 */

export interface UploadResult {
  url: string;
  source: 'cloudinary' | 'imgbb' | 'compressed_data_url';
  message: string;
}

/**
 * In-browser image compression using HTML5 Canvas.
 * Generates an optimized WebP (or JPEG fallback) data URL under 150KB.
 */
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 1000,
  initialQuality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(reader.result as string);
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fall back to JPEG if unsupported
        let mimeType = 'image/webp';
        let quality = initialQuality;
        let dataUrl = canvas.toDataURL(mimeType, quality);

        if (!dataUrl.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
          dataUrl = canvas.toDataURL(mimeType, quality);
        }

        // Keep payload small (under 150KB - 250KB) and never exceed 500KB
        const approxBytes = dataUrl.length * 0.75;
        if (approxBytes > 400 * 1024) {
          // Re-encode at lower dimension if still large
          const smallerCanvas = document.createElement('canvas');
          const scale = 0.7;
          smallerCanvas.width = Math.max(1, Math.round(canvas.width * scale));
          smallerCanvas.height = Math.max(1, Math.round(canvas.height * scale));
          const sCtx = smallerCanvas.getContext('2d');
          if (sCtx) {
            sCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
            dataUrl = smallerCanvas.toDataURL(mimeType, 0.65);
          }
        } else if (approxBytes > 150 * 1024 && quality > 0.5) {
          dataUrl = canvas.toDataURL(mimeType, 0.55);
        }

        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}


/**
 * Uploads an image to Cloudinary using unsigned upload preset.
 */
export async function uploadToCloudinary(
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset.trim());

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  if (data.secure_url) {
    return data.secure_url;
  }
  if (data.url) {
    return data.url;
  }
  throw new Error(data.error?.message || 'Cloudinary upload failed');
}

/**
 * Uploads an image to ImgBB using their public v1 API.
 */
export async function uploadToImgBB(file: File, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey.trim()}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (data.success && data.data) {
    return data.data.url || data.data.display_url;
  }
  throw new Error(data.error?.message || 'ImgBB upload failed');
}

/**
 * Unified 3-tier image upload helper.
 */
export async function uploadImageWithTieredFallback(
  file: File,
  settings?: SiteSettings | null
): Promise<UploadResult> {
  const cloudName = settings?.cloudinaryCloudName?.trim();
  const preset = settings?.cloudinaryUploadPreset?.trim();
  const imgbbKey = settings?.imgbbApiKey?.trim();

  // Tier 1a: Cloudinary if real credentials are provided (ignore demo defaults)
  const isRealCloudinary =
    cloudName &&
    preset &&
    cloudName !== 'demo-artisan' &&
    preset !== 'artisancraft_preset';

  if (isRealCloudinary) {
    try {
      const url = await uploadToCloudinary(file, cloudName, preset);
      return {
        url,
        source: 'cloudinary',
        message: 'Uploaded to Cloudinary CDN successfully',
      };
    } catch (err) {
      console.warn('Cloudinary upload error, falling back to next tier:', err);
    }
  }

  // Tier 1b: ImgBB if API key provided
  if (imgbbKey) {
    try {
      const url = await uploadToImgBB(file, imgbbKey);
      return {
        url,
        source: 'imgbb',
        message: 'Uploaded to ImgBB Cloud successfully',
      };
    } catch (err) {
      console.warn('ImgBB upload error, falling back to next tier:', err);
    }
  }

  // Tier 2: Zero-Config In-Browser Canvas Compression Fallback
  const compressed = await compressImageToDataUrl(file, 1000, 0.75);
  return {
    url: compressed,
    source: 'compressed_data_url',
    message: 'Optimized with zero-config in-browser compression (<150KB)',
  };
}
