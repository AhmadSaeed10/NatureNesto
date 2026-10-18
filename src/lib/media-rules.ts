// Shared by the uploader (client) and the media actions (server).
export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_MAX_EDGE = 2560;
export const MEDIA_TYPES = [
  "image/avif",
  "image/webp",
  "image/png",
  "image/jpeg",
  "image/gif",
] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const isMediaType = (value: string): value is MediaType =>
  (MEDIA_TYPES as readonly string[]).includes(value);

export const MEDIA_EXTENSIONS: Record<MediaType, string> = {
  "image/avif": "avif",
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
};

export const MEDIA_PAGE_SIZE = 48;
export const MEDIA_TEXT_MAX = 300;
