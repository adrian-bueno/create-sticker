import { CreateStickerOptions } from "./create-sticker-options";

export interface ImageCanvas {
  /** Source image, drawn at (padding, padding) */
  image: CanvasImageSource;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  padding: number;
  options: CreateStickerOptions;
}
