import { StickerShadowOptions } from "./models";

const defaultShadow: Required<StickerShadowOptions> = {
  color: "rgba(0, 0, 0, 0.4)",
  blur: 8,
  offsetX: 0,
  offsetY: 4
};

// Draw the sticker on a new canvas with a drop shadow,
// growing the canvas so the shadow is not clipped
export function addShadow(sticker: HTMLCanvasElement, options: true | StickerShadowOptions): HTMLCanvasElement {
  const shadow = { ...defaultShadow, ...(options === true ? {} : options) };

  // A canvas shadow blur spreads about 1.5 times its blur value
  const spread = Math.ceil(Math.max(0, shadow.blur) * 1.5);
  const left = Math.max(0, Math.ceil(spread - shadow.offsetX));
  const right = Math.max(0, Math.ceil(spread + shadow.offsetX));
  const top = Math.max(0, Math.ceil(spread - shadow.offsetY));
  const bottom = Math.max(0, Math.ceil(spread + shadow.offsetY));

  const canvas = document.createElement('canvas');
  canvas.width = sticker.width + left + right;
  canvas.height = sticker.height + top + bottom;

  const ctx = canvas.getContext('2d')!;
  ctx.shadowColor = shadow.color;
  ctx.shadowBlur = shadow.blur;
  ctx.shadowOffsetX = shadow.offsetX;
  ctx.shadowOffsetY = shadow.offsetY;
  ctx.drawImage(sticker, left, top);

  return canvas;
}
