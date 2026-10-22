# @devadri/create-sticker

**Library that adds a sticker effect to images with transparent backgrounds.**


![Header image](./docs/readme-header.png)

> This code was made thanks to [this Stack Overflow answer](https://stackoverflow.com/a/24091727) made by the user [markE](https://stackoverflow.com/users/411591/marke).

Tested with `.png`, `.webp` and `.jpg`.

Customize: `stroke color`, `stroke thickness`, `fill holes` and `image padding`.

It uses HTML Canvas, so it only works in the browser (and not in Node.js).


## Install

### Browser

```html
<script src="https://unpkg.com/@devadri/create-sticker@1/bundle.iife.js"></script>
```

### npm

```sh
npm install @devadri/create-sticker
```

## Usage

### Browser

```html
<script src="https://unpkg.com/@devadri/create-sticker@1/bundle.iife.js"></script>
<script>
  async function modifyImage(img) {
    const options = {
      strokeWidth: 20,
      strokeColor: "black",
      padding: 20,
      fillHoles: true
    }
    const stickerImgSrc = await CreateSticker.createSticker(img.src, options);
    img.src = stickerImgSrc;
  }
</script>
```

### ESM / TypeScript

```ts
import { createSticker, CreateStickerOptions } from '@devadri/create-sticker';

async function modifyImage(img) {
  const options: CreateStickerOptions = {
    strokeWidth: 20,
    strokeColor: "black",
    padding: 20,
    fillHoles: true
  }
  const stickerImgSrc = await createSticker(img.src, options);
  img.src = stickerImgSrc;
}
```

## API

### `createSticker(imageSrc, options?)`

- `imageSrc`: `string`. Any URL an `<img>` can load (http(s), data URL, blob URL).
- Returns `Promise<string>`: a PNG data URL of the sticker image.

### Options

All options are optional.

| Option | Type | Default | Description |
|---|---|---|---|
| `strokeWidth` | `number` | `20` | Width of the outline, in pixels. |
| `strokeColor` | `string` | `"white"` | Any CSS color. |
| `fillHoles` | `boolean` | `true` | Fill transparent holes inside an object with `strokeColor`. |
| `padding` | `number` | `Math.ceil(strokeWidth / 2)` | Transparent space added around the image, in pixels (see below). |
| `alphaThreshold` | `number` | `0` | Pixels with alpha (0-255) at or below this value are ignored when finding outlines, so faint noise or antialiasing halos do not get their own outline. They are still drawn. Try `10`-`20` for photos or lossy images. |
| `crossOrigin` | `"anonymous" \| "use-credentials" \| null` | `"anonymous"` | CORS mode used to load the image. Use `null` to not set it. |

`padding` is the transparent space added around the image, so the stroke is not clipped at the edges. The output image is `padding * 2` pixels wider and taller than the input.

- When `padding` is not set (or is less than `1`), it defaults to half the stroke width (`Math.ceil(strokeWidth / 2)`, minimum `1`).
- When `padding` is set to `1` or more, that value is used as is. A value smaller than `strokeWidth / 2` can clip the stroke at the image edges.


### Remote images (CORS)

The image pixels must be readable, so images from another origin must be served with CORS headers (`Access-Control-Allow-Origin`). Without them, `createSticker` rejects with an explanatory error. Images loaded from data URLs, blob URLs or the same origin always work.


## Demo

Run the demo with the following commands:

```sh
npm run build
npm run demo
```

### Screenshots

![Demo screenshot 1](./docs/demo-screenshot-1.png)
![Demo screenshot 2](./docs/demo-screenshot-2.png)
![Demo screenshot 6](./docs/demo-screenshot-6.png)
![Demo screenshot 5](./docs/demo-screenshot-5.png)
![Demo screenshot 3](./docs/demo-screenshot-3.png)
![Demo screenshot 4](./docs/demo-screenshot-4.png)
![Demo screenshot 7](./docs/demo-screenshot-7.png)


## License

[Unlicense license](./LICENSE.md)
