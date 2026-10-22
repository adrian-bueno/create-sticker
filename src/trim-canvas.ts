// Crop a canvas to the bounding box of its non-transparent pixels.
// A fully transparent canvas is returned unchanged.
export function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const { width, height } = canvas;
  const data = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;

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

  const trimmed = document.createElement('canvas');
  trimmed.width = maxX - minX + 1;
  trimmed.height = maxY - minY + 1;
  trimmed.getContext('2d')!.drawImage(canvas, -minX, -minY);

  return trimmed;
}
