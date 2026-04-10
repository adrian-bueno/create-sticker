import { CreateStickerOptions, ImageCanvas } from "./models";

export function loadImage(imageSrc: string, options?: CreateStickerOptions): Promise<ImageCanvas> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(buildImageCanvas(img, options));

    img.onerror = () => reject(new Error("Error loading image"));

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
  fillHoles: true
}
