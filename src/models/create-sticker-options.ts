export interface CreateStickerOptions {
  /** Default: 10 */
  strokeWidth?: number;
  /** Default: "white" */
  strokeColor?: string;
  /** Image padding. Default: 1 */
  padding?: number;
  /** If an object has transparent holes, fill the holes with the strokeColor. Default: true */
  fillHoles?: boolean;
}
