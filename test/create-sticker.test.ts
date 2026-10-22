import { describe, expect, it } from 'vitest';
import { createSticker, CreateStickerOptions } from '../src';
import { blankImageDataURL, decodeImage, summarizePixels } from './helpers';

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
