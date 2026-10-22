export interface PixelSummary {
  width: number;
  height: number;
  sha256: string;
}

// Decode an image src and summarize its pixels, so snapshots compare
// the actual RGBA data instead of the PNG encoding.
export async function summarizePixels(src: string): Promise<PixelSummary> {
  const img = await decodeImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const digest = await crypto.subtle.digest('SHA-256', data);
  const sha256 = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  return { width: img.width, height: img.height, sha256 };
}

export function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to decode ${src.slice(0, 50)}`));
    img.src = src;
  });
}

export function blankImageDataURL(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas.toDataURL('image/png');
}
