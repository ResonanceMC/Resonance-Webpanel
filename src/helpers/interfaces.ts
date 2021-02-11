import { Vector3 } from "@/helpers/vectors";

export class PlayerPosition {
  x!: number;
  y!: number;
  z!: number;
  facing!: [number, number];

  normalizeCoords(): Vector3 {
    // convert xyz direction to xyz only
    return { x: 1 } as Vector3;
  }
}

export interface IncomingPosition {
  position?: PlayerPosition;
  inRange: boolean;
}
