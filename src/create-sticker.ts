import { addStickerEffectToDiscreteElements } from "./add-sticker-effect";
import { d3GeometryContour, d3GeometryContourStart } from "./d3-geometry-contour";
import { defineGeometryPath } from "./define-geometry-path";
import { loadImage } from "./load-image";
import { CreateStickerOptions, DiscreteElement, ImageCanvas, Point2D } from "./models";


export async function createSticker(imageSrc: string, options?: CreateStickerOptions): Promise<string> {
  const imageCanvas = await loadImage(imageSrc, options);

  // Move every discrete element from the main canvas to a separate canvas
  // The sticker effect is applied individually to each discrete element and
  // is done on a separate canvas for each discrete element

  const elems = splitIntoDiscreteElements(imageCanvas);

  await addStickerEffectToDiscreteElements(elems, imageCanvas);

  const stickerCanvas = joinDiscreteElementsInNewCanvas(elems, imageCanvas);

  // Draw original image on top of stickerCanvas for a better result
  const stickerCanvasCtx = stickerCanvas.getContext('2d')!;
  const p = imageCanvas.padding;
  stickerCanvasCtx.drawImage(imageCanvas.img, p, p);

  // Get the data URL of the resized image
  return stickerCanvas.toDataURL('image/png', 1); // 1 is the quality from 0 to 1
}

function joinDiscreteElementsInNewCanvas(elems: DiscreteElement[], imageCanvas: ImageCanvas): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

  canvas.width = imageCanvas.width;
  canvas.height = imageCanvas.height;

  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < elems.length; i++) {
    ctx.drawImage(elems[i].canvas, 0, 0);
  }

  return canvas;
}

function splitIntoDiscreteElements(imageCanvas: ImageCanvas): DiscreteElement[] {
  const elems: DiscreteElement[] = [];

  // Read the pixels once; only the area of each removed element is read again
  const data = imageCanvas.ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data;

  let start = d3GeometryContourStart(data, imageCanvas.width, imageCanvas.height);

  while (start) {
    elems.push(extractDiscreteElementFromCanvas(imageCanvas, data, start));
    start = d3GeometryContourStart(data, imageCanvas.width, imageCanvas.height, start);
  }

  return elems;
}

// This function finds discrete elements on the image
// (discrete elements == a group of pixels not touching
// another groups of pixels
// e.g. each individual sprite on a spritesheet is a discreet element
function extractDiscreteElementFromCanvas(imageCanvas: ImageCanvas, data: Uint8ClampedArray, start: Point2D): DiscreteElement {
  const elem = createDiscreteElement(imageCanvas, data, start);

  removeDiscreteElementFromCanvas(imageCanvas, data, elem);

  return elem;
}

function createDiscreteElement(imageCanvas: ImageCanvas, data: Uint8ClampedArray, start: Point2D): DiscreteElement {
  // get the point-path that outlines a discrete element
  const points = d3GeometryContour(data, imageCanvas.width, start);

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

function removeDiscreteElementFromCanvas(imageCanvas: ImageCanvas, data: Uint8ClampedArray, elem: DiscreteElement): void {
  const ctx = imageCanvas.ctx;
  defineGeometryPath(ctx, elem.points);
  ctx.save();
  ctx.clip();
  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  ctx.restore();

  // Sync the cleared area back into the pixel data
  const [minX, minY, maxX, maxY] = boundingBox(elem.points);
  const area = ctx.getImageData(minX, minY, maxX - minX, maxY - minY).data;
  const rowLength = (maxX - minX) * 4;
  for (let y = minY; y < maxY; y++) {
    const rowStart = (y - minY) * rowLength;
    data.set(area.subarray(rowStart, rowStart + rowLength), (y * imageCanvas.width + minX) * 4);
  }
}

function boundingBox(points: Point2D[]): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}
