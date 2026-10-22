/**
 * Image accepted by createSticker: an image URL (http(s), data or blob URL),
 * a Blob/File, or an already loaded image, canvas or bitmap.
 */
export type StickerImageSource = string | Blob | HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas;
