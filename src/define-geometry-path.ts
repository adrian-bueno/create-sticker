import { Point2D } from "./models";

// Defines a path on the canvas without stroking or filling that path
export function defineGeometryPath(ctx: CanvasRenderingContext2D, points: Point2D[]): void {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (var i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.lineTo(points[0][0], points[0][1]);
  ctx.closePath();
}
