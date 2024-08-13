import { defineGeometryPath } from "./define-geometry-path";
import { DiscreteElement, ImageCanvas } from "./models";

export function addStickerEffectToDiscreteElements(elems: DiscreteElement[], imageCanvas: ImageCanvas) {
  elems.forEach(el => addStickerEffect(el, imageCanvas));
}

function addStickerEffect(elem: DiscreteElement, imageCanvas: ImageCanvas) {
  const url = elem.canvas.toDataURL();
  const ctx = elem.canvas.getContext("2d")!;

  addStickerLayer(elem, imageCanvas);

  const img = new Image();
  const w = imageCanvas.width;
  const h = imageCanvas.height;
  const p = imageCanvas.padding;
  img.onload = () => ctx.drawImage(img, p, p, w, h);
  img.src = url;
}

function addStickerLayer(elem: DiscreteElement, imageCanvas: ImageCanvas) {
  const ctx = elem.canvas.getContext("2d")!;

  defineGeometryPath(ctx, elem.points);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = imageCanvas.options.strokeColor!;
  ctx.lineWidth = imageCanvas.options.strokeWidth!;
  ctx.stroke();

  if (imageCanvas.options.fillHoles) {
    ctx.fillStyle = imageCanvas.options.strokeColor!;
    ctx.fill();
  }
}
