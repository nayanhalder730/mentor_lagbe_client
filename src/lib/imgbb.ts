/**
 * Direct browser-to-ImgBB image upload.
 *
 * The Express backend only ever receives the resulting public URL as
 * `bannerImage`; image files are never forwarded to it. The API key is a
 * `NEXT_PUBLIC_*` value by design and is never logged or persisted here.
 */

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";
const MAX_FILE_SIZE = 32 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
]);

export class ImgBbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImgBbError";
  }
}

export function isImgBbConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_IMGBB_API_KEY?.trim());
}

/** Client-side checks before any bytes leave the browser. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Choose a JPG, PNG, GIF, WEBP, or BMP image.";
  }

  if (file.size === 0) {
    return "The selected file is empty.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "The image must be 32 MB or smaller.";
  }

  return null;
}

function readSafeUploadError(payload: unknown): string | null {
  if (payload === null || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    error?: { message?: unknown } | string;
    data?: { error_message?: unknown };
  };

  const messages = [
    typeof candidate.error === "string" ? candidate.error : null,
    candidate.error && typeof candidate.error === "object"
      ? candidate.error.message
      : null,
    candidate.data?.error_message,
  ];

  for (const message of messages) {
    if (typeof message === "string" && message.trim() !== "") {
      return message.trim();
    }
  }

  return null;
}

/** Uploads an image and resolves with its public ImgBB URL. */
export async function uploadImageToImgBb(file: File): Promise<string> {
  const validationError = validateImageFile(file);

  if (validationError) {
    throw new ImgBbError(validationError);
  }

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY?.trim();

  if (!apiKey) {
    throw new ImgBbError(
      "Image uploads are not configured. Set NEXT_PUBLIC_IMGBB_API_KEY in your environment and restart the app.",
    );
  }

  const body = new FormData();

  body.append("key", apiKey);
  body.append("image", file);

  let response: Response;

  try {
    response = await fetch(IMGBB_ENDPOINT, {
      method: "POST",
      body,
      cache: "no-store",
    });
  } catch {
    throw new ImgBbError(
      "Could not reach the image upload service. Please try again.",
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new ImgBbError(
      "The image upload service returned an unexpected response.",
    );
  }

  if (!response.ok) {
    throw new ImgBbError(
      readSafeUploadError(payload) ??
        "Image upload failed. Please try again.",
    );
  }

  const data = (payload as { data?: { url?: unknown } }).data;

  if (!data || typeof data.url !== "string" || data.url.trim() === "") {
    throw new ImgBbError("Image upload did not return a usable image URL.");
  }

  return data.url;
}
