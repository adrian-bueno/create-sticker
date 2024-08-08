# @devadri/create-sticker

This code was made thanks to [this Stack Overflow answer](https://stackoverflow.com/a/24091727) made by the user [markE](https://stackoverflow.com/users/411591/marke).

## Install

### Browser

```html
<script src="https://unpkg.com/@devadri/create-sticker@{{ version }}/bundle.iife.js"></script>
```

### ESM

```sh
npm install @devadri/create-sticker
```

## Usage

### Browser

```html
<script src="create-sticker/bundle.iife.js"></script>
<script>
  async function modifyImage(img) {
    const stickerImgSrc = await CreateSticker.default.fromImage(img.src, { strokeWidth: 20, strokeColor: "black", padding: 20 });
    img.src = stickerImgSrc;
  }
</script>
```

### ESM / TypeScript

```ts
import CreateSticker from '@devadri/create-sticker';

async function modifyImage(img) {
  const stickerImgSrc = await CreateSticker.fromImage(img.src, { strokeWidth: 20, strokeColor: "black", padding: 20 });
  img.src = stickerImgSrc;
}
```

```ts
import CreateSticker from '@devadri/create-sticker';
import { CreateStickerOptions } from '@devadri/create-sticker';

async function modifyImage(img) {
  const options: CreateStickerOptions = {
    strokeWidth: 20,
    strokeColor: "black",
    padding: 20
  }
  const stickerImgSrc = await CreateSticker.fromImage(img.src, options);
  img.src = stickerImgSrc;
}
```
