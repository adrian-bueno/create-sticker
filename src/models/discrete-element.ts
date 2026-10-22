import { Point2D } from "./point-2d";

export interface DiscreteElement {
  /** Outline of the element */
  points: Point2D[];
  /** Bounding box of the outline */
  bounds: { x: number; y: number; width: number; height: number };
}
