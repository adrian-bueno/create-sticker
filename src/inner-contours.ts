import { d3GeometryContour, d3GeometryContourStart } from "./d3-geometry-contour";
import { boundingBox } from "./bounding-box";
import { DiscreteElement, Point2D } from "./models";

type Bounds = DiscreteElement['bounds'];
type Region = Pick<DiscreteElement, 'points' | 'bounds'>;

// Outlines inside a discrete element: the edges of its transparent holes and the
// outlines of elements inside those holes (and so on, recursively).
// `isOpaque` reads the image pixels (in image coordinates) before the element is removed.
export function findInnerContours(points: Point2D[], bounds: Bounds, isOpaque: (x: number, y: number) => boolean): Point2D[][] {
  const contours: Point2D[][] = [];

  const holes = findOuterContours(points, bounds, (x, y) => !isOpaque(x, y));

  for (const hole of holes) {
    contours.push(hole.points);

    const nestedElems = findOuterContours(hole.points, hole.bounds, isOpaque);

    for (const nested of nestedElems) {
      contours.push(nested.points);
      contours.push(...findInnerContours(nested.points, nested.bounds, isOpaque));
    }
  }

  return contours;
}

// Outer outlines of the groups of pixels inside a polygon that match `include`
function findOuterContours(points: Point2D[], bounds: Bounds, include: (x: number, y: number) => boolean): Region[] {
  // Mask with a 1px empty margin, as the contour algorithm reads neighbor pixels
  const originX = bounds.x - 1;
  const originY = bounds.y - 1;
  const width = bounds.width + 2;
  const height = bounds.height + 2;

  const inside = rasterizePolygon(points, originX, originY, width, height);
  const mask = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (inside[i] && include(x + originX, y + originY))
        mask[i * 4 + 3] = 255;
    }
  }

  const regions: Region[] = [];

  let start = d3GeometryContourStart(mask, width, height, 0);

  while (start) {
    const local = d3GeometryContour(mask, width, 0, start);

    // Remove the group (and anything inside it) from the mask
    const area = rasterizePolygon(local, 0, 0, width, height);
    for (let i = 0; i < area.length; i++) {
      if (area[i])
        mask[i * 4 + 3] = 0;
    }

    const global = local.map(([x, y]): Point2D => [x + originX, y + originY]);
    regions.push({ points: global, bounds: boundingBox(global) });

    start = d3GeometryContourStart(mask, width, height, 0, start);
  }

  return regions;
}

// Pixels whose center is inside a polygon with horizontal and vertical edges
// (like the contours), as a mask of the given area
function rasterizePolygon(points: Point2D[], originX: number, originY: number, width: number, height: number): Uint8Array {
  const mask = new Uint8Array(width * height);
  const crossings: number[][] = Array.from({ length: height }, () => []);

  for (let i = 0; i < points.length; i++) {
    const [x, y0] = points[i];
    const [x1, y1] = points[(i + 1) % points.length];
    if (x !== x1)
      continue; // only vertical edges cross a row

    const top = Math.max(Math.min(y0, y1) - originY, 0);
    const bottom = Math.min(Math.max(y0, y1) - originY, height);
    for (let row = top; row < bottom; row++) {
      crossings[row].push(x - originX);
    }
  }

  for (let row = 0; row < height; row++) {
    const xs = crossings[row].sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const from = Math.max(xs[i], 0);
      const to = Math.min(xs[i + 1], width);
      mask.fill(1, row * width + from, row * width + Math.max(from, to));
    }
  }

  return mask;
}
