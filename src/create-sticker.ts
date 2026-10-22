import { addShadow } from "./add-shadow";
import { addOutlineLayer, addStickerLayer, totalStrokeWidth } from "./add-sticker-effect";
import { d3GeometryContour, d3GeometryContourStart } from "./d3-geometry-contour";
import { boundingBox } from "./bounding-box";
import { AnyCanvas, AnyContext2D, canvasToBlob, canvasToDataURL, createCanvas, getContext2D } from "./canvas";
import { defineGeometryPath } from "./define-geometry-path";
import { findInnerContours } from "./inner-contours";
import { loadImage } from "./load-image";
import { trimCanvas } from "./trim-canvas";
import { CreateStickerOptions, DiscreteElement, ImageCanvas, StickerImageSource } from "./models";


/** Create a sticker and return it as a data URL (PNG by default, see `outputType`) */
export async function createSticker(image: StickerImageSource, options?: CreateStickerOptions): Promise<string> {
  const canvas = await renderSticker(image, options);
  return canvasToDataURL(canvas, options?.outputType ?? 'image/png', options?.outputQuality ?? 1);
}

/** Create a sticker and return it as a Blob (PNG by default, see `outputType`) */
export async function createStickerBlob(image: StickerImageSource, options?: CreateStickerOptions): Promise<Blob> {
  const canvas = await renderSticker(image, options);
  return canvasToBlob(canvas, options?.outputType ?? 'image/png', options?.outputQuality ?? 1);
}

/** Create a sticker and return it as a canvas. Needs the DOM (not available in Web Workers) */
export async function createStickerCanvas(image: StickerImageSource, options?: CreateStickerOptions): Promise<HTMLCanvasElement> {
  if (typeof document === "undefined")
    throw new Error("createStickerCanvas needs the DOM. In Web Workers use createSticker or createStickerBlob.");

  return await renderSticker(image, options) as HTMLCanvasElement;
}

async function renderSticker(image: StickerImageSource, options?: CreateStickerOptions): Promise<AnyCanvas> {
  const imageCanvas = await loadImage(image, options);

  const stickerCanvas = createCanvas(imageCanvas.width, imageCanvas.height);
  const stickerCanvasCtx = getContext2D(stickerCanvas);

  const elems = findDiscreteElements(imageCanvas);

  // Draw the extra outlines first, outermost first and for all elements at
  // once, so touching elements share them like a single sticker
  const { strokeWidth, strokeColor, outlines = [] } = imageCanvas.options;
  for (let i = outlines.length - 1; i >= 0; i--) {
    const width = totalStrokeWidth(strokeWidth!, outlines.slice(0, i + 1));
    for (const elem of elems) {
      for (const contour of [elem.points, ...elem.innerContours]) {
        addOutlineLayer(stickerCanvasCtx, contour, width, outlines[i].color);
      }
    }
  }

  // The sticker effect is applied individually to each discrete element.
  // The element is drawn below and above its sticker layer: below, so
  // semi-transparent pixels the layer does not cover keep the same look.
  for (const elem of elems) {
    drawDiscreteElement(stickerCanvasCtx, imageCanvas, elem);
    addStickerLayer(stickerCanvasCtx, elem.points, imageCanvas.options);
    for (const contour of elem.innerContours) {
      addOutlineLayer(stickerCanvasCtx, contour, strokeWidth!, strokeColor!);
    }
    drawDiscreteElement(stickerCanvasCtx, imageCanvas, elem);
  }

  // Draw original image on top of stickerCanvas for a better result
  const p = imageCanvas.padding;
  stickerCanvasCtx.drawImage(imageCanvas.image, p, p);

  let result = stickerCanvas;

  const shadow = imageCanvas.options.shadow;
  if (shadow)
    result = addShadow(result, shadow);

  if (imageCanvas.options.trim)
    result = trimCanvas(result);

  return result;
}

// Draw just the pixels of a discrete element (from the source image,
// as the image canvas has all elements removed)
function drawDiscreteElement(ctx: AnyContext2D, imageCanvas: ImageCanvas, elem: DiscreteElement): void {
  const { x, y, width, height } = elem.bounds;
  const p = imageCanvas.padding;
  defineGeometryPath(ctx, elem.points);
  ctx.save();
  ctx.clip();
  ctx.drawImage(imageCanvas.image, x - p, y - p, width, height, x, y, width, height);
  ctx.restore();
}

// This function finds discrete elements on the image
// (discrete elements == a group of pixels not touching
// another groups of pixels
// e.g. each individual sprite on a spritesheet is a discreet element)
// and removes each one from the image canvas
function findDiscreteElements(imageCanvas: ImageCanvas): DiscreteElement[] {
  const elems: DiscreteElement[] = [];

  // Read the pixels once; only the area of each removed element is read again
  const data = imageCanvas.ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;

  const { width, height } = imageCanvas;
  const alphaThreshold = imageCanvas.options.alphaThreshold ?? 0;
  const strokeHoles = !!imageCanvas.options.strokeHoles && !imageCanvas.options.fillHoles;

  let start = d3GeometryContourStart(data, width, height, alphaThreshold);

  while (start) {
    // get the point-path that outlines a discrete element
    const points = d3GeometryContour(data, width, alphaThreshold, start);
    const bounds = boundingBox(points);

    // Holes and nested elements are read before the element is removed
    const innerContours = strokeHoles
      ? findInnerContours(points, bounds, (x, y) => data[(y * width + x) * 4 + 3] > alphaThreshold)
      : [];

    const elem = { points, bounds, innerContours };

    elems.push(elem);
    removeDiscreteElementFromCanvas(imageCanvas, data, elem);

    start = d3GeometryContourStart(data, width, height, alphaThreshold, start);
  }

  return elems;
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
