import { AnyCanvas, AnyContext2D } from "../canvas";
import { CreateStickerOptions } from "./create-sticker-options";

export interface ImageCanvas {
  /** Source image, drawn at (padding, padding) */
  image: CanvasImageSource;
  canvas: AnyCanvas;
  ctx: AnyContext2D;
  width: number;
  height: number;
  padding: number;
  options: CreateStickerOptions;
}
