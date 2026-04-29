// Helpers for image URLs that work with both:
//   1. Static paths under /public (e.g. /images/news/foo.jpg)
//   2. Cloudinary CDN URLs (https://res.cloudinary.com/<cloud>/image/upload/...)
//
// For Cloudinary URLs we inject delivery transformations (auto format,
// auto quality, target width, optional crop) so editors can upload at any
// size and the browser receives a properly sized image.
//
// For static paths we leave the URL untouched — they're already optimised
// at build time by scripts/compress-images.mjs.

const CLOUDINARY_HOST = 'res.cloudinary.com';

export interface ImageOpts {
  /** Target rendered width in CSS pixels. Cloudinary will deliver up to 2× for retina. */
  width?: number;
  /** Aspect ratio "16:9", "1:1", "4:3", etc. — when set, Cloudinary crops to this. */
  aspect?: string;
  /** Crop strategy when aspect is set. Default 'fill' (smart crop, gravity:auto). */
  crop?: 'fill' | 'fit' | 'thumb' | 'crop';
  /** Override quality. Default is auto (Cloudinary picks). */
  quality?: number | 'auto';
  /** Override format. Default is auto (WebP/AVIF/JPEG depending on browser). */
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

export function isCloudinary(src: string | undefined | null): boolean {
  return !!src && src.includes(CLOUDINARY_HOST);
}

/**
 * Return a delivery URL for the given image. Static paths pass through
 * unchanged; Cloudinary URLs get transformation params injected.
 */
export function imageUrl(src: string | undefined | null, opts: ImageOpts = {}): string {
  if (!src) return '';
  if (!isCloudinary(src)) return src;

  // Build transformation segment, e.g. "f_auto,q_auto,w_1200,c_fill,ar_16:9,g_auto"
  const parts: string[] = [];
  parts.push(`f_${opts.format ?? 'auto'}`);
  parts.push(`q_${opts.quality ?? 'auto'}`);
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.aspect) {
    parts.push(`c_${opts.crop ?? 'fill'}`);
    parts.push(`ar_${opts.aspect}`);
    parts.push('g_auto'); // smart gravity — pick the most interesting region
  }
  const tx = parts.join(',');

  // Inject right after /upload/. Cloudinary supports chained transformations
  // separated by /, so this is safe even if a transform already exists.
  return src.replace('/upload/', `/upload/${tx}/`);
}

/**
 * Generate a `srcset` string for responsive `<img>`. Uses progressively wider
 * Cloudinary deliveries (no-op for static paths — single src).
 */
export function imageSrcset(
  src: string | undefined | null,
  widths: number[] = [480, 800, 1200, 1600, 2000],
  opts: Omit<ImageOpts, 'width'> = {}
): string {
  if (!src) return '';
  if (!isCloudinary(src)) return ''; // static images: rely on default <img src>
  return widths
    .map((w) => `${imageUrl(src, { ...opts, width: w })} ${w}w`)
    .join(', ');
}
