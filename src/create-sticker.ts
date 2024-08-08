import { addStickerEffectToDiscreteElements } from "./add-sticker-effect";
import { d3GeometryContour } from "./d3-geometry-contour";
import { defineGeometryPath } from "./define-geometry-path";
import { imageCanvasIsEmpty } from "./image-canvas-is-empty";
import { loadImage } from "./load-image";
import { CreateStickerOptions, DiscreteElement, ImageCanvas } from "./models";


export async function createSticker(imageSrc: string, options?: CreateStickerOptions): Promise<string> {
  const imageCanvas = await loadImage(imageSrc, options);

  // Move every discrete element from the main canvas to a separate canvas
  // The sticker effect is applied individually to each discrete element and
  // is done on a separate canvas for each discrete element

  const elems = splitIntoDiscreteElements(imageCanvas);

  addStickerEffectToDiscreteElements(elems, imageCanvas);

  const stickerCanvas = joinDiscreteElementsInNewCanvas(elems, imageCanvas);

  // Draw original image on top of stickerCanvas for a better result
  const stickerCanvasCtx = stickerCanvas.getContext('2d')!;
  const w = imageCanvas.img.width;
  const h = imageCanvas.img.height;
  const p = imageCanvas.padding * 2;
  stickerCanvasCtx.drawImage(imageCanvas.img, p, p, w - p, h - p);

  // Get the data URL of the resized image
  return stickerCanvas.toDataURL('image/png', 1); // 1 is the quality from 0 to 1
}

function joinDiscreteElementsInNewCanvas(elems: DiscreteElement[], imageCanvas: ImageCanvas): HTMLCanvasElement {
  const w = imageCanvas.width;
  const h = imageCanvas.height;
  const p = imageCanvas.padding;

  const canvas = document.createElement('canvas');

  canvas.width = imageCanvas.width;
  canvas.height = imageCanvas.height;

  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < elems.length; i++) {
    ctx.drawImage(elems[i].canvas, p, p, w - p, h - p);
  }

  return canvas;
}

function splitIntoDiscreteElements(imageCanvas: ImageCanvas): DiscreteElement[] {
  const elems: DiscreteElement[] = [];

  let hasMoreElements = true;

  while (hasMoreElements) {
    const res = extractDiscreteElementFromCanvas(imageCanvas);

    if (res)
      elems.push(res);

    hasMoreElements = !!res;
  }

  return elems;
}

// This function finds discrete elements on the image
// (discrete elements == a group of pixels not touching
// another groups of pixels
// e.g. each individual sprite on a spritesheet is a discreet element
function extractDiscreteElementFromCanvas(imageCanvas: ImageCanvas): DiscreteElement | null {

  const elem = findNextDiscreteElement(imageCanvas);

  if (!elem)
    return null;

  removeDiscreteElementFromCanvas(imageCanvas, elem);

  return elem;
}

function findNextDiscreteElement(imageCanvas: ImageCanvas): DiscreteElement | null {
  if (imageCanvasIsEmpty(imageCanvas))
    return null;

  // get the point-path that outlines a discrete element
  const points = d3GeometryContour(imageCanvas);

  // create a new canvas
  const newCanvas = document.createElement('canvas');
  newCanvas.width = imageCanvas.width;
  newCanvas.height = imageCanvas.height;

  // draw just that element to the new canvas
  const newCtx = newCanvas.getContext('2d')!;
  defineGeometryPath(newCtx, points);
  newCtx.save();
  newCtx.clip();
  newCtx.drawImage(imageCanvas.canvas, 0, 0);
  newCtx.restore();

  return { canvas: newCanvas, points };
}

function removeDiscreteElementFromCanvas(imageCanvas: ImageCanvas, elem: DiscreteElement): void {
  const ctx = imageCanvas.ctx;
  defineGeometryPath(ctx, elem.points);
  ctx.save();
  ctx.clip();
  ctx.globalCompositeOperation = "destination-out";
  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  ctx.restore();
}
