export interface CreateStickerOptions {
  /** Default: 20 */
  strokeWidth?: number;
  /** Default: "white" */
  strokeColor?: string;
  /**
   * Transparent space (in px) added around the image so the stroke is not clipped.
   * Default: half the stroke width (`Math.ceil(strokeWidth / 2)`, minimum 1).
   * Values smaller than 1 fall back to the default.
   */
  padding?: number;
  /** If an object has transparent holes, fill the holes with the strokeColor. Default: true */
  fillHoles?: boolean;
  /**
   * Pixels with an alpha value (0-255) less than or equal to this are treated as
   * transparent when finding outlines, so faint noise or antialiasing halos do not
   * get their own sticker outline. They are still drawn in the result. Default: 0
   */
  alphaThreshold?: number;
  /**
   * CORS mode used to load the image. Remote images need CORS access so their
   * pixels can be read. Use null to not set it. Default: "anonymous"
   */
  crossOrigin?: "anonymous" | "use-credentials" | null;
  /**
   * Image format of the result of createSticker and createStickerBlob, e.g. "image/webp".
   * Formats the browser cannot encode fall back to PNG. Default: "image/png"
   */
  outputType?: string;
  /** Quality from 0 to 1 for lossy output formats (image/jpeg, image/webp). Default: 1 */
  outputQuality?: number;
}
