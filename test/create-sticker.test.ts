import { describe, expect, it } from 'vitest';
import { createSticker, createStickerBlob, createStickerCanvas, CreateStickerOptions } from '../src';
import { blankImageDataURL, decodeImage, drawTestImage, maxPixelDifference, summarizePixels } from './helpers';

import angularWithHoles from '../demo/images/angular-with-holes.png?url';
import angularWebp from '../demo/images/angular.webp?url';
import hand from '../demo/images/hand.png?url';
import happyCat from '../demo/images/openmoji-happy-cat.png?url';
import react from '../demo/images/react.png?url';
import square2 from '../demo/images/square-2.png?url';
import squareJpg from '../demo/images/square.jpg?url';

const images: Record<string, string> = {
  'angular-with-holes.png': angularWithHoles,
  'angular.webp': angularWebp,
  'hand.png': hand,
  'openmoji-happy-cat.png': happyCat,
  'react.png': react,
  'square-2.png': square2,
  'square.jpg': squareJpg,
};

const optionSets: Record<string, CreateStickerOptions | undefined> = {
  'defaults': undefined,
  'demo': { strokeWidth: 20, strokeColor: 'blue', padding: 20, fillHoles: true },
  'no-fill-holes': { strokeWidth: 10, strokeColor: 'black', fillHoles: false },
};

describe('createSticker output snapshots', () => {
  for (const [imageName, url] of Object.entries(images)) {
    for (const [optionsName, options] of Object.entries(optionSets)) {
      it(`${imageName} / ${optionsName}`, async () => {
        const result = await createSticker(url, options);
        expect(result.startsWith('data:image/png;base64,')).toBe(true);
        expect(await summarizePixels(result)).toMatchSnapshot();
      });
    }
  }
});

describe('createSticker dimensions', () => {
  it('pads by half the stroke width when padding is not set', async () => {
    const img = await decodeImage(hand);
    const result = await decodeImage(await createSticker(hand, { strokeWidth: 30 }));
    expect(result.width).toBe(img.width + 30);
    expect(result.height).toBe(img.height + 30);
  });

  it('uses the given padding when it is at least 1', async () => {
    const img = await decodeImage(hand);
    const result = await decodeImage(await createSticker(hand, { padding: 5 }));
    expect(result.width).toBe(img.width + 10);
    expect(result.height).toBe(img.height + 10);
  });
});

describe('createSticker edge cases', () => {
  it('returns a padded transparent image for a fully transparent input', async () => {
    const result = await createSticker(blankImageDataURL(40, 30), { strokeWidth: 10 });
    expect(await summarizePixels(result)).toMatchObject({ width: 50, height: 40 });
    expect(await summarizePixels(result)).toEqual(await summarizePixels(blankImageDataURL(50, 40)));
  });

  it('rejects when the image cannot be loaded', async () => {
    await expect(createSticker('data:image/png;base64,not-an-image')).rejects.toThrow('Error loading image');
  });
});

describe('alphaThreshold option', () => {
  const squareOnly = drawTestImage(60, 60, [[10, 10, 20]]);
  const squareWithFaintPixel = drawTestImage(60, 60, [[10, 10, 20]], [[50, 50, 8]]);
  const options: CreateStickerOptions = { strokeWidth: 6, strokeColor: 'black' };

  it('outlines faint pixels by default (alphaThreshold 0)', async () => {
    const withPixel = await summarizePixels(await createSticker(squareWithFaintPixel, options));
    const without = await summarizePixels(await createSticker(squareOnly, options));
    expect(withPixel.sha256).not.toBe(without.sha256);
  });

  it('gives the same result as alphaThreshold 0 when not set', async () => {
    const unset = await createSticker(squareWithFaintPixel, options);
    const zero = await createSticker(squareWithFaintPixel, { ...options, alphaThreshold: 0 });
    expect(await summarizePixels(unset)).toEqual(await summarizePixels(zero));
  });

  it('ignores pixels at or below the threshold when finding outlines', async () => {
    const result = await createSticker(squareWithFaintPixel, { ...options, alphaThreshold: 8 });
    const ignored = await decodeImage(result);
    const reference = await decodeImage(await createSticker(squareOnly, options));
    const read = (img: HTMLImageElement) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, img.width, img.height).data;
    };
    const a = read(ignored), b = read(reference);
    // Only the faint pixel itself (padding 3 + 50) differs: it is drawn, but not outlined
    const faintIndex = ((3 + 50) * ignored.width + (3 + 50)) * 4;
    for (let i = 0; i < a.length; i += 4) {
      if (i === faintIndex) continue;
      expect([a[i], a[i + 1], a[i + 2], a[i + 3]]).toEqual([b[i], b[i + 1], b[i + 2], b[i + 3]]);
    }
    expect(a[faintIndex + 3]).toBe(8);
  });
});

describe('crossOrigin option', () => {
  // Same server, but a different origin (localhost <-> 127.0.0.1).
  // The Vite test server allows CORS requests from localhost origins.
  function crossOriginURL(url: string): string {
    const crossOrigin = new URL(url, location.href);
    crossOrigin.hostname = location.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
    return crossOrigin.href;
  }

  it('reads remote images with CORS by default', async () => {
    const remote = await createSticker(crossOriginURL(hand));
    const local = await createSticker(hand);
    expect(await summarizePixels(remote)).toEqual(await summarizePixels(local));
  });

  it('rejects with a clear error when the image taints the canvas', async () => {
    await expect(createSticker(crossOriginURL(hand), { crossOrigin: null })).rejects.toThrow('cross-origin image without CORS access');
  });

  it('works with data URLs when crossOrigin is null', async () => {
    const image = drawTestImage(30, 30, [[5, 5, 20]]);
    expect(await summarizePixels(await createSticker(image, { crossOrigin: null })))
      .toEqual(await summarizePixels(await createSticker(image)));
  });
});

describe('input types', () => {
  async function expectSameAsURL(source: Parameters<typeof createSticker>[0]) {
    const expected = await summarizePixels(await createSticker(react));
    expect(await summarizePixels(await createSticker(source))).toEqual(expected);
  }

  it('accepts a Blob', async () => {
    const blob = await (await fetch(react)).blob();
    await expectSameAsURL(blob);
  });

  it('accepts a File', async () => {
    const blob = await (await fetch(react)).blob();
    await expectSameAsURL(new File([blob], 'react.png', { type: 'image/png' }));
  });

  it('accepts a loaded HTMLImageElement', async () => {
    await expectSameAsURL(await decodeImage(react));
  });

  it('waits for an HTMLImageElement that is still loading', async () => {
    const img = new Image();
    img.src = react;
    await expectSameAsURL(img);
  });

  it('uses the natural size of an HTMLImageElement with display size attributes', async () => {
    const img = await decodeImage(react);
    img.width = 10;
    img.height = 10;
    await expectSameAsURL(img);
  });

  it('accepts an HTMLCanvasElement', async () => {
    const img = await decodeImage(react);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    await expectSameAsURL(canvas);
  });

  it('accepts an ImageBitmap', async () => {
    // ImageBitmaps store semi-transparent colors with slightly different
    // rounding than <img>, so allow a tiny color difference
    const bitmap = await createImageBitmap(await decodeImage(react));
    const diff = await maxPixelDifference(await createSticker(bitmap), await createSticker(react));
    expect(diff.alpha).toBe(0);
    expect(diff.color).toBeLessThanOrEqual(2);
  });

  it('accepts an OffscreenCanvas', async () => {
    const img = await decodeImage(react);
    const canvas = new OffscreenCanvas(img.width, img.height);
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    await expectSameAsURL(canvas);
  });

  it('rejects an HTMLImageElement that failed to load', async () => {
    const img = new Image();
    img.src = 'data:image/png;base64,not-an-image';
    await expect(createSticker(img)).rejects.toThrow('Error loading image');
  });

  it('rejects an HTMLImageElement without src', async () => {
    await expect(createSticker(new Image())).rejects.toThrow('Error loading image');
  });
});

describe('output types', () => {
  it('createStickerCanvas returns a canvas with the same pixels', async () => {
    const canvas = await createStickerCanvas(react);
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(await summarizePixels(canvas.toDataURL())).toEqual(await summarizePixels(await createSticker(react)));
  });

  it('createStickerBlob returns a PNG blob with the same pixels', async () => {
    const blob = await createStickerBlob(react);
    expect(blob.type).toBe('image/png');
    const url = URL.createObjectURL(blob);
    try {
      expect(await summarizePixels(url)).toEqual(await summarizePixels(await createSticker(react)));
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  it('encodes other formats with outputType and outputQuality', async () => {
    const webp = await createSticker(react, { outputType: 'image/webp', outputQuality: 0.8 });
    expect(webp.startsWith('data:image/webp;base64,')).toBe(true);
    const blob = await createStickerBlob(react, { outputType: 'image/webp', outputQuality: 0.8 });
    expect(blob.type).toBe('image/webp');
    const low = await createStickerBlob(react, { outputType: 'image/webp', outputQuality: 0.1 });
    expect(low.size).toBeLessThan(blob.size);
  });
});
