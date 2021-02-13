import {
  cartesianToSpherical,
  sphericalToCartesian,
  Vector3
} from "@/helpers/vectors";

export class PlayerPosition implements Vector3 {
  x = 0; // x!: number;
  y = 0; // y!: number;
  z = 0; // z!: number;
  inRange = true;
  facing?: [number, number];

  /**
   * Normalize speaker player position to match directionality of listener
   * @param player Listener player
   */
  normalizeCoords(player: PlayerPosition): PlayerPosition {
    if (this.inRange) throw Error("Player is not in range!");
    if (!this.facing) throw Error("Listener does not have an orientation!");

    // subtract vectors from each other
    const diffVector = { ...player } as Vector3;
    diffVector.x -= this.x;
    diffVector.y -= this.y;
    diffVector.z -= this.z;

    // convert to spherical coords and run subtraction operations
    const sphericalVector = cartesianToSpherical(diffVector);
    sphericalVector.lat -= this.facing[0];
    sphericalVector.lon -= this.facing[1];

    return sphericalToCartesian(sphericalVector) as PlayerPosition;
  }
}

export interface Player {
  pos: PlayerPosition;
  stream?: MediaStream | MediaElementAudioSourceNode;
  data: { username: string; uuid: string };
}

export interface WSMessage {
  id: number;
  action: string;
  body: Record<string, never>;
}
