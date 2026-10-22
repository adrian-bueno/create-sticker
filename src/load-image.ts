import { CreateStickerOptions, ImageCanvas } from "./models";

export function loadImage(imageSrc: string, options?: CreateStickerOptions): Promise<ImageCanvas> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        resolve(buildImageCanvas(img, options));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Error loading image"));

    // Request remote images with CORS so their pixels can be read
    const crossOrigin = options?.crossOrigin === undefined ? defaultOptions.crossOrigin : options.crossOrigin;
    if (crossOrigin != null)
      img.crossOrigin = crossOrigin;

    img.src = imageSrc;
  });
}

// Load the image in a canvas with a transparent border.
// The border ensures the contour algorithm works and that
// the sticker stroke is not clipped at the edges.
function buildImageCanvas(img: HTMLImageElement, options?: CreateStickerOptions): ImageCanvas {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const padding = getPadding(options);

  canvas.width = img.width + padding*2;
  canvas.height = img.height + padding*2;

  // Draw the image on canvas
  ctx.drawImage(img, padding, padding);

  assertCanvasIsReadable(ctx);

  return {
    img,
    canvas,
    ctx,
    width: canvas.width,
    height: canvas.height,
    padding: padding,
    options: { ...defaultOptions, ...options, padding }
  };
}

// A cross-origin image loaded without CORS taints the canvas and its pixels cannot be read
function assertCanvasIsReadable(ctx: CanvasRenderingContext2D): void {
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

  const strokeWidth = options?.strokeWidth ?? defaultOptions.strokeWidth!;
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
