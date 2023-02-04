import { imageAssets, SpriteSheet, Vector } from "kontra";
import { Actor } from "../actor";
import { ColliderType } from "../enums";
import { W } from "../types";

import {
    Player as PlayerComponent,
    BoxCollider,
    Controls,
    InputListener,
    Physics2D,
    Speed,
    Transform,
    Velocity,
    TileMovement,
} from "../components";


const Player = (world: W, x: number, y: number) => {

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

      // TileMovement,
      // Physics2D,
    ]
    // color: "red",
  });

  const eid = player.eid;

  Speed.val[eid] = 400;
  BoxCollider.w[eid] = Transform.w[eid];
  BoxCollider.h[eid] = Transform.h[eid];
  BoxCollider.anchor.x[eid] = BoxCollider.anchor.y[eid] = 0.5;
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0;
  BoxCollider.type[eid] = ColliderType.KINEMATIC;

  //TileMovementData
  TileMovement.sx[eid] = player.x
  TileMovement.sy[eid] = player.y
  TileMovement.ex[eid] = player.x
  TileMovement.ey[eid] = player.y

  // Platformer physics
  Physics2D.jumpHeight[eid] = 250;
  Physics2D.grounded[eid] = 0;
  Physics2D.gravity[eid] = 1500;

  return player;
};

export default Player;
