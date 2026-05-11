/** Separator for multiple product images stored in one DB field (image_url). */
export const PRODUCT_IMAGE_GALLERY_SEP = '|||';

/** Split stored image_url into individual paths/URLs. */
export const splitProductImageGallery = (imageUrl: string | undefined | null): string[] => {
  if (!imageUrl?.trim()) {
    return [];
  }
  return imageUrl
    .split(PRODUCT_IMAGE_GALLERY_SEP)
    .map((s) => s.trim())
    .filter(Boolean);
};

/** First image for catalog cards / main product photo. */
export const getPrimaryImageUrl = (imageUrl: string | undefined | null): string => {
  const first = splitProductImageGallery(imageUrl)[0];
  return getImageUrl(first);
};

/**
 * Helper function to get the full image URL
 * Supports:
 * - Full URLs (http://, https://)
 * - Base64 data URIs (data:image/...)
 * - Local paths (/images/filename.jpg) - converts to full backend URL
 */
export const getImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) {
    return '';
  }

  // If it's already a full URL or base64, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  const backendOrigin = (): string => {
    const api = import.meta.env.VITE_API_URL;
    if (!api || api.startsWith('/')) {
      return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
    }
    return api.replace(/\/api\/v1\/?$/, '');
  };

  // If it's a local path (starts with /images/), convert to full URL
  if (imageUrl.startsWith('/images/')) {
    return backendOrigin() + imageUrl;
  }

  // If it's just a filename, assume it's in /images/
  if (!imageUrl.includes('/') && !imageUrl.includes(':')) {
    return `${backendOrigin()}/images/${imageUrl}`;
  }

  // Return as is for any other format
  return imageUrl;
};
