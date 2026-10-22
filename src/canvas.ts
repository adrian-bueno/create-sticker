// Canvas helpers that work both with the DOM (HTMLCanvasElement)
// and in Web Workers (OffscreenCanvas)

export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
export type AnyContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof document === "undefined")
    return new OffscreenCanvas(width, height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function getContext2D(canvas: AnyCanvas, settings?: CanvasRenderingContext2DSettings): AnyContext2D {
  return (canvas as HTMLCanvasElement).getContext('2d', settings)!;
}

export function canvasToBlob(canvas: AnyCanvas, type: string, quality: number): Promise<Blob> {
  if (isOffscreenCanvas(canvas))
    return canvas.convertToBlob({ type, quality });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error("Error encoding sticker image")),
      type,
      quality
    );
  });
}

export async function canvasToDataURL(canvas: AnyCanvas, type: string, quality: number): Promise<string> {
  if (!isOffscreenCanvas(canvas))
    return canvas.toDataURL(type, quality);

  const blob = await canvas.convertToBlob({ type, quality });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Error encoding sticker image"));
    reader.readAsDataURL(blob);
  });
}

export function isOffscreenCanvas(canvas: unknown): canvas is OffscreenCanvas {
  return typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas;
}
