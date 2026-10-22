import { defineGeometryPath } from "./define-geometry-path";
import { CreateStickerOptions, Point2D } from "./models";

// Stroke (and optionally fill) the outline of a discrete element
export function addStickerLayer(ctx: CanvasRenderingContext2D, points: Point2D[], options: CreateStickerOptions): void {
  defineGeometryPath(ctx, points);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = options.strokeColor!;
  ctx.lineWidth = options.strokeWidth!;
  ctx.stroke();

  if (options.fillHoles) {
    ctx.fillStyle = options.strokeColor!;
    ctx.fill();
  }
}
