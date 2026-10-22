export interface StickerShadowOptions {
  /** Default: "rgba(0, 0, 0, 0.4)" */
  color?: string;
  /** Blur amount, like CanvasRenderingContext2D.shadowBlur. Default: 8 */
  blur?: number;
  /** Default: 0 */
  offsetX?: number;
  /** Default: 4 */
  offsetY?: number;
}

export interface StickerOutline {
  /** Width (in px) the outline adds outside the previous one */
  width: number;
  /** Any CSS color */
  color: string;
}

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
   * When `fillHoles` is false, also stroke the inner edges of transparent holes
   * and the outlines of elements inside holes. Default: false
   */
  strokeHoles?: boolean;
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
   * Extra outlines drawn around the stroke, from inner to outer,
   * e.g. a thin grey border around a white stroke: [{ width: 2, color: "#999" }].
   * Default padding grows to fit them. Default: none
   */
  outlines?: StickerOutline[];
  /**
   * Drop shadow under the whole sticker. `true` uses the default shadow.
   * The image grows as needed so the shadow is not clipped. Default: no shadow
   */
  shadow?: boolean | StickerShadowOptions;
  /**
   * Image format of the result of createSticker and createStickerBlob, e.g. "image/webp".
   * Formats the browser cannot encode fall back to PNG. Default: "image/png"
   */
  outputType?: string;
  /** Quality from 0 to 1 for lossy output formats (image/jpeg, image/webp). Default: 1 */
  outputQuality?: number;
}
