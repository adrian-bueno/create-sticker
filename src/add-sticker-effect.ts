import { defineGeometryPath } from "./define-geometry-path";
import { DiscreteElement, ImageCanvas } from "./models";

export async function addStickerEffectToDiscreteElements(elems: DiscreteElement[], imageCanvas: ImageCanvas) {
  await Promise.all(elems.map(el => addStickerEffect(el, imageCanvas)));
}

function addStickerEffect(elem: DiscreteElement, imageCanvas: ImageCanvas): Promise<void> {
  const url = elem.canvas.toDataURL();
  const ctx = elem.canvas.getContext("2d")!;

  addStickerLayer(elem, imageCanvas);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0); resolve(); };
    img.onerror = () => reject(new Error("Failed to load element image"));
    img.src = url;
  });
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
