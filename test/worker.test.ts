import { describe, expect, it } from 'vitest';
import { createSticker, CreateStickerOptions } from '../src';
import { decodeImage, maxPixelDifference } from './helpers';
import type { WorkerRequest, WorkerResponse } from './sticker.worker';
import StickerWorker from './sticker.worker?worker';

import angularWithHoles from '../demo/images/angular-with-holes.png?url';
import react from '../demo/images/react.png?url';

function runInWorker(request: WorkerRequest): Promise<WorkerResponse> {
  const worker = new StickerWorker();
  return new Promise<WorkerResponse>(resolve => {
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => resolve(event.data);
    worker.postMessage(request);
  }).finally(() => worker.terminate());
}

describe('Web Worker support', () => {
  const cases: [string, string, CreateStickerOptions | undefined][] = [
    ['react.png / defaults', react, undefined],
    ['angular-with-holes.png / all options', angularWithHoles, {
      strokeColor: 'black', fillHoles: false, strokeHoles: true, outlines: [{ width: 4, color: 'red' }], shadow: true, trim: true,
    }],
  ];

  for (const [name, url, options] of cases) {
    it(`gives the same result as the main thread: ${name}`, async () => {
      const absoluteURL = new URL(url, location.href).href;
      const response = await runInWorker({ image: absoluteURL, options });
      expect(response.error).toBeUndefined();
      expect(response.dataURL!.startsWith('data:image/png;base64,')).toBe(true);
      expect(response.blobType).toBe('image/png');

      // Workers decode with createImageBitmap, which rounds semi-transparent
      // colors slightly differently than <img>
      const diff = await maxPixelDifference(response.dataURL!, await createSticker(url, options));
      expect(diff.alpha).toBe(0);
      expect(diff.color).toBeLessThanOrEqual(2);
    });
  }

  it('scales images down with maxSize', async () => {
    // Downscaled pixels differ slightly from the main thread (ImageBitmap vs <img> resampling),
    // so only the size is compared
    const response = await runInWorker({ image: new URL(react, location.href).href, options: { strokeWidth: 10, maxSize: 256 } });
    const img = await decodeImage(response.dataURL!);
    expect([img.width, img.height]).toEqual([256 + 10, 228 + 10]);
  });

  it('accepts a Blob', async () => {
    const blob = await (await fetch(react)).blob();
    const response = await runInWorker({ image: blob });
    expect(response.error).toBeUndefined();
    expect(response.dataURL!.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('rejects createStickerCanvas with a clear error', async () => {
    const response = await runInWorker({ image: new URL(react, location.href).href });
    expect(response.canvasError).toContain('needs the DOM');
  });

  it('rejects images that cannot be loaded', async () => {
    const response = await runInWorker({ image: new URL('/does-not-exist.png', location.href).href });
    expect(response.error).toBe('Error loading image');
  });
});
