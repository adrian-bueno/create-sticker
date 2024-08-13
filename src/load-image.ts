import { CreateStickerOptions, ImageCanvas } from "./models";

export function loadImage(imageSrc: string, options?: CreateStickerOptions): Promise<ImageCanvas> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(buildImageCanvas(img, options));

    img.onerror = () => reject(new Error("Error loading image"));

    img.src = imageSrc;
  });
}

// Load the image in a canvas with a 1px transparent border
// We add the border to make the algorithm work with any image type
function buildImageCanvas(img: HTMLImageElement, options?: CreateStickerOptions): ImageCanvas {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const padding = getPadding(options);

  canvas.width = img.width + padding*2;
  canvas.height = img.height + padding*2;

  // Draw the image on canvas
  ctx.drawImage(img, padding, padding, img.width - padding, img.height - padding);

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
  if (!options?.padding || options.padding! < 1)
    return defaultOptions.padding!;

  return options.padding;
}

const defaultOptions: CreateStickerOptions = {
  strokeColor: "white",
  strokeWidth: 20,
  padding: 1,
  fillHoles: true
}
