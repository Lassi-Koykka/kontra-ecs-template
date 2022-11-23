import { imageAssets, SpriteSheet, Vector } from "kontra";
import { Actor } from "./actor";
import {
    Player as PlayerComponent,
    BoxCollider,
    Controls,
    InputListener,
    Physics2D,
    Speed,
    Static,
    Transform,
    Velocity,
} from "./components";
import { W } from "./types";
import { scaleImage } from "./utils";

// --- ENTITIES ---
export const Player = (world: W, x: number, y: number) => {

  const idleSpriteSheet = SpriteSheet({
    image: imageAssets['images/Player_Idle'],
    frameWidth: 15,
    frameHeight: 20,
    animations: {
      idle: {
        frames: "0..8",
        frameRate: 12
      }
    }
  })

  const walkSpriteSheet = SpriteSheet({
    image: imageAssets['images/Player_Walk'],
    frameWidth: 15,
    frameHeight: 20,
    animations: {
      walk: {
        frames: "0..3",
        frameRate: 12
      }
    }
  })

  const airSpriteSheet = SpriteSheet({
    image: imageAssets['images/Player_Air'],
    frameWidth: 15,
    frameHeight: 20,
    animations: {
      air: {
        frames: "0..0",
        frameRate: 12
      }
    }
  })

  const player = Actor({
    w: world,
    x,
    y,
    width: 16 * 5,
    height: 22 * 5,
    anchor: Vector(0.5, 0.5),
    animations: {
      ...idleSpriteSheet.animations, 
      ...walkSpriteSheet.animations,
      ...airSpriteSheet.animations
    },
    comps: [
      PlayerComponent,
      Speed, 
      Velocity,
      InputListener, 
      Controls, 
      BoxCollider,

      Physics2D,
    ]
    // color: "red",
  });

  console.log(player)
  const eid = player.eid;

  Speed.val[eid] = 400;
  BoxCollider.w[eid] = Transform.w[eid];
  BoxCollider.h[eid] = Transform.h[eid];
  BoxCollider.anchor.x[eid] = BoxCollider.anchor.y[eid] = 0.5;
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0;

  // Platformer physics
  Physics2D.jumpHeight[eid] = 250;
  Physics2D.grounded[eid] = 0;
  Physics2D.gravity[eid] = 1500;

  return player;
};

export const Obstacle = (
  world: W,
  x: number,
  y: number,
  w: number = 32 * 3,
  h: number = 32 * 3,
  anchor: Vector = Vector(0.5, 0.5)
) => {
  const img = scaleImage(imageAssets['images/Tileset'], 1, {x: 1, y: 1})

  const obstacle = Actor({
    w: world,
    image: img,
    x,
    y,
    width: w,
    height: h,
    anchor,
    comps: [BoxCollider, Static],
    render: function () {
      if(!this.image || !this.width || !this.height) return;
      this.context?.drawImage(this.image, 32, 64, 30, 30, 0, 0, this.width, this.height )
    },
  });

  const eid = obstacle.eid;

  BoxCollider.w[eid] = Transform.w[eid];
  BoxCollider.h[eid] = Transform.h[eid];
  BoxCollider.anchor.x[eid] = anchor.x
  BoxCollider.anchor.y[eid] = anchor.y;
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0;

  return obstacle;
};
