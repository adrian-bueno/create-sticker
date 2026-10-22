// markE, the person that wrote the Stack Overflow answer,
// took this code from the d3js library (in 2014).
// The original code is located here:
// https://github.com/d3/d3-contour
// at version v0.0.1:
// https://github.com/d3/d3-contour/blob/v0.0.1/src/contour.js


import { Point2D } from "./models";

// lookup tables for marching directions
const d3GeometryContourDx = [1, 0, 1, 1, -1, 0, -1, 1, 0, 0, 0, 0, -1, 0, -1, NaN],
      d3GeometryContourDy = [0, -1, 0, 0, 0, -1, 0, 0, 1, -1, 1, 1, 0, -1, 0, NaN];

// true/false function used by the edge detection method
function defineNonTransparent(data: Uint8ClampedArray, canvasWidth: number, x: number, y: number): boolean {
  return (data[(y * canvasWidth + x) * 4 + 3] > 0);
}

// Search for a starting point: begin at the origin and proceed along
// outward-expanding diagonals, resuming from the previous starting point
// (pixels before it were already checked and can only have been cleared).
export function d3GeometryContourStart(data: Uint8ClampedArray, canvasWidth: number, canvasHeight: number, from: Point2D = [0, 0]): Point2D | null {
  const maxDiagonal = canvasWidth + canvasHeight - 2;
  let d = from[0] + from[1];
  let x = from[0];

  while (d <= maxDiagonal) {
    const minX = Math.max(0, d - canvasHeight + 1);
    for (; x >= minX; x--) {
      if (defineNonTransparent(data, canvasWidth, x, d - x)) {
        return [x, d - x];
      }
    }
    d++;
    x = Math.min(d, canvasWidth - 1);
  }

  return null;
}

// Edge detection
export function d3GeometryContour(data: Uint8ClampedArray, canvasWidth: number, s: Point2D): Point2D[] {
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
