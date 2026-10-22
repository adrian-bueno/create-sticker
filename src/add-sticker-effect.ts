import { AnyContext2D } from "./canvas";
import { defineGeometryPath } from "./define-geometry-path";
import { CreateStickerOptions, Point2D, StickerOutline } from "./models";

// Stroke (and optionally fill) the outline of a discrete element
export function addStickerLayer(ctx: AnyContext2D, points: Point2D[], options: CreateStickerOptions): void {
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

// Stroke an outline layer centered on the element outline
export function addOutlineLayer(ctx: AnyContext2D, points: Point2D[], width: number, color: string): void {
  defineGeometryPath(ctx, points);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

// Line width of the stroke plus the outlines around it (on both sides)
export function totalStrokeWidth(strokeWidth: number, outlines: StickerOutline[] = []): number {
  return outlines.reduce((total, outline) => total + 2 * Math.max(0, outline.width), strokeWidth);
}
