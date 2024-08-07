
import { ImageCanvas } from "./models";

// Test if the main canvas is empty
// Note: do this because d3GeometryContour will fatal-error if canvas is empty
export function imageCanvasIsEmpty(imageCanvas: ImageCanvas): boolean {
  const ctx = imageCanvas.ctx;

  if (!ctx)
    return true;

  const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
  const data = imageData.data;

  for (var i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      return false;
    }
  }

  return true;
}
