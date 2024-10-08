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
<script src="https://unpkg.com/@devadri/create-sticker@{{ version }}/bundle.iife.js"></script>
```

### npm

```sh
npm install @devadri/create-sticker
```

## Usage

### Browser

```html
<script src="https://unpkg.com/@devadri/create-sticker@1.1.0/dist/bundle.iife.js"></script>
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

### Default options

```json
{
  "strokeWidth": 20,
  "strokeColor": "white",
  "padding": 1,
  "fillHoles": true
}
```

`padding` minimum values is `1`.


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
