import { CreateStickerOptions } from "./create-sticker-options";

export interface ImageCanvas {
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  padding: number;
  options: CreateStickerOptions;
}
