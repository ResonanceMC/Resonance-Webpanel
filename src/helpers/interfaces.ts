import { Vector3 } from "@/helpers/vectors";

export class PlayerPosition {
  x = 0; // x!: number;
  y = 0; // y!: number;
  z = 0; // z!: number;
  facing!: [number, number];

  normalizeCoords(): Vector3 {
    // convert xyz direction to xyz only
    return { x: 1 } as Vector3;
  }
}

export interface Player {
  pos: PlayerPosition;
  stream?: MediaStream | MediaElementAudioSourceNode;
  data: { username: string; uuid: string };
}

export interface IncomingPosition {
  position?: PlayerPosition;
  inRange: boolean;
}
