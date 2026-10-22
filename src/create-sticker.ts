import { addShadow } from "./add-shadow";
import { addStickerLayer } from "./add-sticker-effect";
import { d3GeometryContour, d3GeometryContourStart } from "./d3-geometry-contour";
import { defineGeometryPath } from "./define-geometry-path";
import { loadImage } from "./load-image";
import { CreateStickerOptions, DiscreteElement, ImageCanvas, StickerImageSource } from "./models";


/** Create a sticker and return it as a data URL (PNG by default, see `outputType`) */
export async function createSticker(image: StickerImageSource, options?: CreateStickerOptions): Promise<string> {
  const canvas = await createStickerCanvas(image, options);
  return canvas.toDataURL(options?.outputType ?? 'image/png', options?.outputQuality ?? 1);
}

/** Create a sticker and return it as a Blob (PNG by default, see `outputType`) */
export async function createStickerBlob(image: StickerImageSource, options?: CreateStickerOptions): Promise<Blob> {
  const canvas = await createStickerCanvas(image, options);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error("Error encoding sticker image")),
      options?.outputType ?? 'image/png',
      options?.outputQuality ?? 1
    );
  });
}

/** Create a sticker and return it as a canvas */
export async function createStickerCanvas(image: StickerImageSource, options?: CreateStickerOptions): Promise<HTMLCanvasElement> {
  const imageCanvas = await loadImage(image, options);

  const stickerCanvas = document.createElement('canvas');
  stickerCanvas.width = imageCanvas.width;
  stickerCanvas.height = imageCanvas.height;
  const stickerCanvasCtx = stickerCanvas.getContext('2d')!;

  // The sticker effect is applied individually to each discrete element.
  // The element is drawn below and above its sticker layer: below, so
  // semi-transparent pixels the layer does not cover keep the same look.
  forEachDiscreteElement(imageCanvas, elem => {
    drawDiscreteElement(stickerCanvasCtx, imageCanvas, elem);
    addStickerLayer(stickerCanvasCtx, elem.points, imageCanvas.options);
    drawDiscreteElement(stickerCanvasCtx, imageCanvas, elem);
  });

  // Draw original image on top of stickerCanvas for a better result
  const p = imageCanvas.padding;
  stickerCanvasCtx.drawImage(imageCanvas.image, p, p);

  const shadow = imageCanvas.options.shadow;
  if (shadow)
    return addShadow(stickerCanvas, shadow);

  return stickerCanvas;
}

// Draw just the pixels of a discrete element
function drawDiscreteElement(ctx: CanvasRenderingContext2D, imageCanvas: ImageCanvas, elem: DiscreteElement): void {
  const { x, y, width, height } = elem.bounds;
  defineGeometryPath(ctx, elem.points);
  ctx.save();
  ctx.clip();
  ctx.drawImage(imageCanvas.canvas, x, y, width, height, x, y, width, height);
  ctx.restore();
}

// This function finds discrete elements on the image
// (discrete elements == a group of pixels not touching
// another groups of pixels
// e.g. each individual sprite on a spritesheet is a discreet element)
// and calls the callback with each one before removing it from the
// image canvas
function forEachDiscreteElement(imageCanvas: ImageCanvas, callback: (elem: DiscreteElement) => void): void {
  // Read the pixels once; only the area of each removed element is read again
  const data = imageCanvas.ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;

  const { width, height } = imageCanvas;
  const alphaThreshold = imageCanvas.options.alphaThreshold ?? 0;

  let start = d3GeometryContourStart(data, width, height, alphaThreshold);

  while (start) {
    // get the point-path that outlines a discrete element
    const points = d3GeometryContour(data, width, alphaThreshold, start);
    const elem = { points, bounds: boundingBox(points) };

    callback(elem);
    removeDiscreteElementFromCanvas(imageCanvas, data, elem);

    start = d3GeometryContourStart(data, width, height, alphaThreshold, start);
  }
}

function removeDiscreteElementFromCanvas(imageCanvas: ImageCanvas, data: Uint8ClampedArray, elem: DiscreteElement): void {
  const { x, y, width, height } = elem.bounds;
  const ctx = imageCanvas.ctx;
  defineGeometryPath(ctx, elem.points);
  ctx.save();
  ctx.clip();
  ctx.clearRect(x, y, width, height);
  ctx.restore();

  // Sync the cleared area back into the pixel data
  const area = ctx.getImageData(x, y, width, height).data;
  const rowLength = width * 4;
  for (let row = 0; row < height; row++) {
    const rowStart = row * rowLength;
    data.set(area.subarray(rowStart, rowStart + rowLength), ((y + row) * imageCanvas.width + x) * 4);
  }
}

function boundingBox(points: DiscreteElement['points']): DiscreteElement['bounds'] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
