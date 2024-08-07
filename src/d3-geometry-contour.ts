import { ImageCanvas, Point2D } from "./models";

// lookup tables for marching directions
const d3GeometryContourDx = [1, 0, 1, 1, -1, 0, -1, 1, 0, 0, 0, 0, -1, 0, -1, NaN],
      d3GeometryContourDy = [0, -1, 0, 0, 0, -1, 0, 0, 1, -1, 1, 1, 0, -1, 0, NaN];

// true/false function used by the edge detection method
function defineNonTransparent(data: Uint8ClampedArray, canvasWidth: number, x: number, y: number): boolean {
  return (data[(y * canvasWidth + x) * 4 + 3] > 0);
}

function d3GeometryContourStart(data: Uint8ClampedArray, canvasWidth: number): number[] {
  let x = 0,
      y = 0;

  // search for a starting point; begin at origin
  // and proceed along outward-expanding diagonals
  while (true) {
    if (defineNonTransparent(data, canvasWidth, x, y)) {
      return [x, y];
    }
    if (x === 0) {
      x = y + 1;
      y = 0;
    } else {
      x = x - 1;
      y = y + 1;
    }
  }
}

// Edge detection
export function d3GeometryContour(imageCanvas: ImageCanvas): Point2D[] {
  const ctx = imageCanvas.ctx;
  const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
  const data = imageData.data;
  const canvasWidth = imageCanvas.width;

  const s = d3GeometryContourStart(data, canvasWidth); // starting point
  const c: Point2D[] = []; // contour polygon

  let x = s[0], // current x position
      y = s[1], // current y position
      dx = 0, // next x direction
      dy = 0, // next y direction
      pdx = NaN, // previous x direction
      pdy = NaN, // previous y direction
      i = 0;

  do {
    // determine marching squares index
    i = 0;
    if (defineNonTransparent(data, canvasWidth, x - 1, y - 1)) i += 1;
    if (defineNonTransparent(data, canvasWidth, x, y - 1)) i += 2;
    if (defineNonTransparent(data, canvasWidth, x - 1, y)) i += 4;
    if (defineNonTransparent(data, canvasWidth, x, y)) i += 8;

    // determine next direction
    if (i === 6) {
      dx = pdy === -1 ? -1 : 1;
      dy = 0;
    } else if (i === 9) {
      dx = 0;
      dy = pdx === 1 ? -1 : 1;
    } else {
      dx = d3GeometryContourDx[i];
      dy = d3GeometryContourDy[i];
    }

    // update contour polygon
    if (dx != pdx && dy != pdy) {
      c.push([x, y]);
      pdx = dx;
      pdy = dy;
    }

    x += dx;
    y += dy;
  } while (s[0] != x || s[1] != y);

  return c;
}
