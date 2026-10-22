import { createSticker, createStickerBlob, createStickerCanvas, CreateStickerOptions, StickerImageSource } from '../src';

export interface WorkerRequest {
  image: StickerImageSource;
  options?: CreateStickerOptions;
}

export interface WorkerResponse {
  dataURL?: string;
  blobType?: string;
  canvasError?: string;
  error?: string;
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { image, options } = event.data;
  const response: WorkerResponse = {};
  try {
    response.dataURL = await createSticker(image, options);
    response.blobType = (await createStickerBlob(image, options)).type;
    await createStickerCanvas(image, options).catch((error: Error) => response.canvasError = error.message);
  } catch (error) {
    response.error = (error as Error).message;
  }
  self.postMessage(response);
};
