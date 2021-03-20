import {
  cartesianToSpherical,
  sphericalToCartesian,
  Vector3
} from "@/helpers/vectors";
import { Expose, Transform } from "class-transformer";
import { authInfo as auth } from "@/helpers/auth";
import store from "@/store/index";

interface _PlayerPosition {
  x?: number;
  y?: number;
  z?: number;
  inRange?: boolean;
  rotation?: [number, number];
  parent?: PlayerPosition;
}

export class PlayerPosition implements Vector3 {
  x: number; // normalized coords
  y: number;
  z: number;
  inRange: boolean;
  rotation?: [number, number]; // yaw, pitch
  parent?: PlayerPosition;
  children?: PlayerPosition[];
  _x!: number; // de-normalized coords relative to rotation
  _y!: number;
  _z!: number;
  vector: Vector3; // sets _x, _y, _z

  constructor(
    {
      x = 0,
      y = 0,
      z = 0,
      inRange = true,
      rotation = undefined,
      parent = undefined
    } = {} as _PlayerPosition
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.inRange = inRange;
    this.rotation = rotation;

    if (parent instanceof PlayerPosition) this.setParent(parent);

    const self = this;
    this.vector = new Proxy({} as Vector3, {
      set(target: Vector3, p: PropertyKey, value: number) {
        if (!/[xyz]/g.test(p.toString())) return false;
        Reflect.set(self, "_" + p.toString(), value);

        // check if normalization is possible, otherwise set xyz to inputted
        self.parent?.rotation
          ? self.parent.normalizeCoords(self)
          : Reflect.set(self, p.toString(), value);

        return true;
      },

      get(target: Vector3, p: PropertyKey): number {
        return /[xyz]/g.test(p.toString())
          ? Reflect.get(self, "_" + p.toString())
          : 0;
      }
    });
    this.registerPosition({ x, y, z });
  }

  setParent(parent: PlayerPosition): void {
    if (this.parent == parent) return;
    if (parent.children?.find(c => c == this)) return;

    this.parent = parent;
    if (!parent.children) parent.children = [];
    parent.children.push(this);

    parent.normalizeCoords(this);
  }

  registerPosition({ x, y, z, rotation }: PlayerUpdatePositionInterface): void {
    if (x != undefined) this._x = x;
    if (y != undefined) this._y = y;
    if (z != undefined) this._z = z;

    if (rotation != undefined) this.rotation = rotation;

    if (this.parent?.rotation) {
      this.parent.normalizeCoords(this);
    } else {
      if (x != undefined) this.x = x;
      if (y != undefined) this.y = y;
      if (z != undefined) this.z = z;
    }

    this.children?.forEach(child => this.normalizeCoords(child));
  }

  unMount(): void {
    if (this.parent?.children)
      this.parent.children = this.parent.children.filter(
        child => child != this
      );
    if (this.parent) this.parent = undefined;
  }

  /**
   * Normalize speaker player position to match directionality of listener
   * @param player Listener player
   */
  normalizeCoords(player: PlayerPosition): PlayerPosition {
    if (!this.inRange) throw Error("Player is not in range!");
    if (!this.rotation) throw Error("Listener does not have an orientation!");

    // subtract vectors from each other
    const diffVector = { x: -player._x, y: player._y, z: player._z } as Vector3;
    diffVector.x += this.x;
    diffVector.y -= this.y;
    diffVector.z -= this.z;

    // convert to spherical coords and run subtraction operations

    const sphericalVector = cartesianToSpherical(diffVector);
    sphericalVector.lat += this.rotation[1];
    sphericalVector.lon += this.rotation[0];

    // if (process.env.NODE_ENV === "development") console.log(sphericalVector);

    // convert back to cartesian coordinates, and update speaker player
    const normalizedVector = sphericalToCartesian(sphericalVector);
    player.x = normalizedVector.x;
    player.y = normalizedVector.y;
    player.z = normalizedVector.z;

    // We push updates to all watchers signifying that the position has changed.
    // eslint-disable-next-line
    // @ts-ignore
    if (player?.__ob__?.dep) player.__ob__.dep.notify();
    return player;
  }
}

export class Player {
  @Transform(({ value }) => new PlayerPosition({ ...value }))
  @Expose()
  pos!: PlayerPosition;
  stream?: MediaStream | MediaElementAudioSourceNode;
  connection?: RTCPeerConnection;
  @Expose() data!: { username: string; uuid: string };
  @Expose() online!: boolean;
  @Expose() dimension?: string;

  callWatchers(): void {
    // eslint-disable-next-line
    // @ts-ignore
    if (this?.__ob__?.dep) this.__ob__.dep.notify();
  }

  constructor() {
    this.instantiatePeerConnection();
  }

  instantiatePeerConnection(): void {
    this.connection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302"
          ]
        }
      ]
    });

    this.connection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate)
        auth.sendWS(
          {
            action: "peer_relayicecandidate",
            peerId: this.data.uuid,
            iceCandidate: {
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              candidate: event.candidate.candidate
            }
          },
          true,
          false
        );
    };

    this.connection.ontrack = (event: RTCTrackEvent) => {
      if (event.streams?.length > 0) this.stream = event.streams[0];
    };

    this.connection.onnegotiationneeded = () =>
      this.generateSessionDescription(true);

    store?.state?.clientStream
      ?.getAudioTracks()
      .forEach((track: MediaStreamTrack) => {
        this.connection?.addTrack(track);
      });
  }

  // if localOffer is true, then it will generate an offer, otherwise will generate a answer description.
  generateSessionDescription = async (localOffer = true) => {
    const offer = localOffer
      ? await this.connection?.createOffer()
      : await this.connection?.createAnswer();

    if (offer) {
      await this.connection?.setLocalDescription(offer);

      await auth.sendWS(
        {
          action: "peer_relaysessiondescription",
          peerId: this.data.uuid,
          body: {
            sessionDescription: this?.connection?.localDescription
          }
        },
        true,
        false
      );
    } else {
      console.error("Offer was not generated properly!");
    }
  };
}

export interface WSMessage {
  id: number;
  action: string;
  body: Record<string, never>;
}

export interface PlayerUpdatePositionInterface {
  x?: number;
  y?: number;
  z?: number;
  rotation?: [number, number];
}

export class UserUpdateAction {
  @Expose() type!: string;

  // Per type interfaces
  pos?: PlayerUpdatePositionInterface;
  dimension?: string;
  online?: boolean;
}

export class PeerUpdateAction extends UserUpdateAction {
  @Expose() data!: { username: string; uuid: string };
}

export enum LogType {
  "DEBUG" = "DEBUG",
  "ERROR" = "ERROR"
}
