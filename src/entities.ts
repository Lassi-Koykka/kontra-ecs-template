import { addComponent, addEntity, Component } from "bitecs";
import { GameObject, Sprite, SpriteSheet, Vector } from "kontra";
import {
    Animations,
  BoxCollider,
  Controls,
  GameObjectComp,
  InputListener,
  Physics2D,
  Speed,
  Static,
  Transform,
  Velocity,
} from "./components";
import { W } from "./types";

const addGameObject = (world: W, eid: number, go: GameObject) => {
  addComponent(world, GameObjectComp, eid);
  world.gameObjects[eid] = go;
};

const Actor = (world: W, go: GameObject): number => {
  const eid = addEntity(world);
  const components: Component[] = [
    Transform,
    ...(go.animations ? [Animations] : [])
  ];

  for (let c of components) addComponent(world, c, eid);

  Transform.w[eid] = go.width;
  Transform.h[eid] = go.height;
  Transform.x[eid] = go.x;
  Transform.y[eid] = go.y;
  Transform.ox[eid] = go.x;
  Transform.oy[eid] = go.y;

  addGameObject(world, eid, go);

  return eid;
};

const loadImage = (uri: string) => {
  const img = new Image()
  img.src = uri
  return img
}

// --- ENTITIES ---
export const Player = (world: W, x: number, y: number) => {

  const idleImage = loadImage('images/Player_Idle.png');
  const walkImage = loadImage('images/Player_Walk.png');
  const airImage = loadImage('images/Player_Air.png');

  const idleSpriteSheet = SpriteSheet({
    image: idleImage,
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
    image: walkImage,
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
    image: airImage,
    frameWidth: 15,
    frameHeight: 20,
    animations: {
      air: {
        frames: "0..0",
        frameRate: 12
      }
    }
  })

  const playerSprite = Sprite({
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
    // color: "red",
  });

  const eid = Actor(world, playerSprite);

  const components: Component[] = [
    Speed, 
    Velocity,
    InputListener, 
    Controls, 
    BoxCollider,

    Physics2D,
  ];

  for (let c of components) addComponent(world, c, eid);

  Speed.val[eid] = 400;
  BoxCollider.w[eid] = Transform.w[eid];
  BoxCollider.h[eid] = Transform.h[eid];
  BoxCollider.anchor.x[eid] = BoxCollider.anchor.y[eid] = 0.5;
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0;

  // Platformer physics
  Physics2D.jumpHeight[eid] = 250;
  Physics2D.grounded[eid] = 0;
  Physics2D.gravity[eid] = 1500;

  return eid;
};

export const Obstacle = (
  world: W,
  x: number,
  y: number,
  w: number = 32 * 3,
  h: number = 32 * 3,
  anchor: Vector = Vector(0.5, 0.5)
): number => {
  const obstacleSprite = Sprite({
    x,
    y,
    width: w,
    height: h,
    anchor,
    color: "white",
  });

  const eid = Actor(world, obstacleSprite);
  const components: Component[] = [BoxCollider, Static];

  for (let c of components) addComponent(world, c, eid);

  BoxCollider.w[eid] = Transform.w[eid];
  BoxCollider.h[eid] = Transform.h[eid];
  BoxCollider.anchor.x[eid] = anchor.x
  BoxCollider.anchor.y[eid] = anchor.y;
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0;
  return eid;
};
