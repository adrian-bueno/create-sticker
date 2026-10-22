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

// Draw a test image: opaque squares plus optional single pixels with a given alpha
export function drawTestImage(
  width: number,
  height: number,
  squares: [x: number, y: number, size: number][],
  pixels: [x: number, y: number, alpha: number][] = [],
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'red';
  for (const [x, y, size] of squares) {
    ctx.fillRect(x, y, size, size);
  }
  const imageData = ctx.getImageData(0, 0, width, height);
  for (const [x, y, alpha] of pixels) {
    const i = (y * width + x) * 4;
    imageData.data.set([255, 0, 0, alpha], i);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export async function readPixels(src: string): Promise<Uint8ClampedArray> {
  const img = await decodeImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height).data;
}

// Largest difference between two images, per color and alpha channel
export async function maxPixelDifference(a: string, b: string): Promise<{ color: number; alpha: number }> {
  const [pa, pb] = await Promise.all([readPixels(a), readPixels(b)]);
  if (pa.length !== pb.length)
    throw new Error('Images have different sizes');
  let color = 0, alpha = 0;
  for (let i = 0; i < pa.length; i++) {
    const d = Math.abs(pa[i] - pb[i]);
    if (i % 4 === 3) alpha = Math.max(alpha, d);
    else color = Math.max(color, d);
  }
  return { color, alpha };
}
