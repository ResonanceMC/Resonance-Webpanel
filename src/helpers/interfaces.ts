import {
  cartesianToSpherical,
  sphericalToCartesian,
  Vector3
} from "@/helpers/vectors";

export class PlayerPosition implements Vector3 {
  x: number; // normalized coords
  y: number;
  z: number;
  inRange: boolean;
  facing?: [number, number];
  parent?: PlayerPosition;
  _x!: number; // de-normalized coords relative to rotation
  _y!: number;
  _z!: number;
  vector: Vector3; // sets _x, _y, _z

  constructor({
    x = 0,
    y = 0,
    z = 0,
    inRange = true,
    facing = undefined,
    parent = undefined
  } = {}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.inRange = inRange;
    this.facing = facing;
    this.parent = parent;

    const self = this;
    this.vector = new Proxy({} as Vector3, {
      set(target: Vector3, p: PropertyKey, value) {
        if (!/[xyz]/g.test(p.toString())) return false;
        Reflect.set(self, "_" + p.toString(), value);
        if (!self.facing) return true;
        return true;
      },

      get(target: Vector3, p: PropertyKey): number {
        return /[xyz]/g.test(p.toString())
          ? Reflect.get(self, "_" + p.toString())
          : 0;
      }
    });
    this.registerPosition(x, y, z);
  }

  registerPosition(x: number, y: number, z: number): void {
    this.vector.x = x;
    this.vector.y = y;
    this.vector.z = z;
  }
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
  online: boolean;
}

export interface WSMessage {
  id: number;
  action: string;
  body: Record<string, never>;
}
