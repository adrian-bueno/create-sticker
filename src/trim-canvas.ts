import { AnyCanvas, createCanvas, getContext2D } from "./canvas";

// Crop a canvas to the bounding box of its non-transparent pixels.
// A fully transparent canvas is returned unchanged.
export function trimCanvas(canvas: AnyCanvas): AnyCanvas {
  const { width, height } = canvas;
  const data = getContext2D(canvas).getImageData(0, 0, width, height).data;

  let minX = width, minY = height, maxX = -1, maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        maxY = y;
      }
    }
  }

  if (maxX < 0)
    return canvas;

  const trimmed = createCanvas(maxX - minX + 1, maxY - minY + 1);
  getContext2D(trimmed).drawImage(canvas, -minX, -minY);

  return trimmed;
}
