import { totalStrokeWidth } from "./add-sticker-effect";
import { AnyContext2D, createCanvas, getContext2D } from "./canvas";
import { CreateStickerOptions, ImageCanvas, StickerImageSource } from "./models";

interface DrawableImage {
  image: CanvasImageSource;
  width: number;
  height: number;
}

export async function loadImage(source: StickerImageSource, options?: CreateStickerOptions): Promise<ImageCanvas> {
  const image = await toDrawableImage(source, options);
  return buildImageCanvas(limitSize(image, options?.maxSize), options);
}

// Scale the image down (keeping its aspect ratio) so neither side exceeds maxSize
function limitSize(image: DrawableImage, maxSize?: number): DrawableImage {
  if (!maxSize || maxSize <= 0 || (image.width <= maxSize && image.height <= maxSize))
    return image;

  const scale = maxSize / Math.max(image.width, image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = createCanvas(width, height);

  const ctx = getContext2D(canvas);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image.image, 0, 0, width, height);

  return { image: canvas, width, height };
}

async function toDrawableImage(source: StickerImageSource, options?: CreateStickerOptions): Promise<DrawableImage> {
  // Without the DOM (Web Workers) images are decoded with createImageBitmap
  const hasDOM = typeof Image !== "undefined";

  if (typeof source === "string") {
    // Request remote images with CORS so their pixels can be read
    const crossOrigin = options?.crossOrigin === undefined ? defaultOptions.crossOrigin : options.crossOrigin;
    return hasDOM
      ? fromImageElement(await loadImageElement(source, crossOrigin))
      : fromBitmap(await fetchImageBitmap(source, crossOrigin));
  }

  if (source instanceof Blob) {
    if (!hasDOM)
      return fromBitmap(await decodeBlob(source));

    const url = URL.createObjectURL(source);
    try {
      return fromImageElement(await loadImageElement(url, null));
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) {
    return fromImageElement(await waitForImageElement(source));
  }

  // Canvas or bitmap
  const drawable = source as HTMLCanvasElement | OffscreenCanvas | ImageBitmap;
  return { image: drawable, width: drawable.width, height: drawable.height };
}

async function fetchImageBitmap(src: string, crossOrigin: string | null | undefined): Promise<ImageBitmap> {
  let response: Response;
  try {
    response = await fetch(src, { mode: "cors", credentials: crossOrigin === "use-credentials" ? "include" : "same-origin" });
  } catch (error) {
    throw new Error("Error loading image", { cause: error });
  }
  if (!response.ok)
    throw new Error("Error loading image");
  return decodeBlob(await response.blob());
}

async function decodeBlob(blob: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(blob);
  } catch (error) {
    throw new Error("Error loading image", { cause: error });
  }
}

function fromBitmap(bitmap: ImageBitmap): DrawableImage {
  return { image: bitmap, width: bitmap.width, height: bitmap.height };
}

function fromImageElement(img: HTMLImageElement): DrawableImage {
  return { image: img, width: img.naturalWidth, height: img.naturalHeight };
}

function loadImageElement(src: string, crossOrigin: string | null | undefined): Promise<HTMLImageElement> {
  const img = new Image();

  if (crossOrigin != null)
    img.crossOrigin = crossOrigin;

  img.src = src;

  return waitForImageElement(img);
}

function waitForImageElement(img: HTMLImageElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // A complete image with no size failed to load (or has no src)
    if (img.complete) {
      if (img.naturalWidth > 0)
        resolve(img);
      else
        reject(new Error("Error loading image"));
      return;
    }

    img.addEventListener("load", () => resolve(img), { once: true });
    img.addEventListener("error", () => reject(new Error("Error loading image")), { once: true });
  });
}

// Load the image in a canvas with a transparent border.
// The border ensures the contour algorithm works and that
// the sticker stroke is not clipped at the edges.
function buildImageCanvas({ image, width, height }: DrawableImage, options?: CreateStickerOptions): ImageCanvas {
  const padding = getPadding(options);

  const canvas = createCanvas(width + padding*2, height + padding*2);
  const ctx = getContext2D(canvas, { willReadFrequently: true });

  // Draw the image on canvas
  ctx.drawImage(image, padding, padding);

  assertCanvasIsReadable(ctx);

  return {
    image,
    canvas,
    ctx,
    width: canvas.width,
    height: canvas.height,
    padding: padding,
    options: { ...defaultOptions, ...options, padding }
  };
}

// A cross-origin image loaded without CORS taints the canvas and its pixels cannot be read
function assertCanvasIsReadable(ctx: AnyContext2D): void {
  try {
    ctx.getImageData(0, 0, 1, 1);
  } catch (error) {
    throw new Error(
      "Cannot read the image pixels because it is a cross-origin image without CORS access. " +
      "The image server must send an Access-Control-Allow-Origin header (and the crossOrigin option must not be null), " +
      "or the image must be served from the same origin.",
      { cause: error }
    );
  }
}

function getPadding(options?: CreateStickerOptions): number {
  if (options?.padding != null && options.padding >= 1)
    return options.padding;

  const strokeWidth = totalStrokeWidth(options?.strokeWidth ?? defaultOptions.strokeWidth!, options?.outlines);
  return Math.max(1, Math.ceil(strokeWidth / 2));
}

const defaultOptions: CreateStickerOptions = {
  strokeColor: "white",
  strokeWidth: 20,
  padding: 1,
  fillHoles: true,
  alphaThreshold: 0,
  crossOrigin: "anonymous"
}
