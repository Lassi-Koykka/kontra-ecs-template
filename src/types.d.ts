import { ECS, System } from "./ecs";
import { Timer } from "./timer";

// Global types
declare global {
  var GAMESTATE: GameState;
  var KEYMAP: Keymap;
  var KEYMAP_PREV: Keymap;
  var AUDIO_MANAGER: IAudioManager;
  var SYSTEMS: { [name: string]: System };
  var IMAGES: { [label: string]: HTMLImageElement };
  var timer: Timer;
  var ecs: ECS;
  var canvas: HTMLCanvasElement;
  var ctx: CanvasRenderingContext2D;
  var restart: () => void;
}

export type CollisionSide = boolean |  "left" | "right" | "top" | "bottom"

interface W extends IWorld {
  delta: number,
  tileEngine: TileEngine,
  actors: {[eid: number]: ActorClass},
  collisions: {[eids: string]:  CollisionType}
}

export interface GameState {
  scene: "titleScreen" | "game" | "gameOver";
  paused: boolean;
}

export type Keymap = { [key: string]: boolean | undefined };

// Component types
export type soundClipType = "walk" | "attack" | "death" | "hitHurt";

export interface AudioClip {
  clip: soundClipType;
  playing: boolean;
}

export interface IAudioClipBuffers {
  [key: string]: AudioBuffer;
}
export interface IAudioManager {
  audioCtx: AudioContext;
  buffers: IAudioClipBuffers;
  playClip: (
    clip: string,
    options?: {
      volume?: number;
      when?: number;
      offset?: number;
      duration?: number;
      loop?: boolean;
      onEnded?: () => void
    }
  ) => void;
}

export type Bounds = {
  l: number,
  r: number, 
  t: number, 
  b: number

  ol: number,
  or: number, 
  ot: number, 
  ob: number
}
