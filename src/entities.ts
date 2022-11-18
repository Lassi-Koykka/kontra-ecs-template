import { addComponent, addEntity, Component } from "bitecs";
import { GameObject, Sprite, Vector } from "kontra";
import {
  BoxCollider,
  Controls,
  GameObjectComp,
  Gravity,
  Grounded,
  InputListener,
  JumpHeight,
  Position,
  Size,
  Speed,
  Static,
  Velocity,
} from "./components";
import { W } from "./types";

const addGameObject = (world: W, eid: number, go: GameObject) => {
  addComponent(world, GameObjectComp, eid);
  world.gameObjects[eid] = go;
};

const gameObjectToActor = (world: W, go: GameObject): number => {
  const eid = addEntity(world);
  const components: Component[] = [Size, Position];

  for (let c of components) addComponent(world, c, eid);

  Size.w[eid] = go.width;
  Size.h[eid] = go.height;
  Position.x[eid] = go.x;
  Position.y[eid] = go.y;
  Position.ox[eid] = go.x;
  Position.oy[eid] = go.y;

  addGameObject(world, eid, go);

  return eid;
};

// --- ENTITIES ---
export const Player = (world: W, x: number, y: number) => {
  const playerSprite = Sprite({
    x,
    y,
    width: 16 * 3,
    height: 32 * 3,
    anchor: Vector(0.5, 0.5),
    color: "red",
  });

  const eid = gameObjectToActor(world, playerSprite);

  const components: Component[] = [
    Speed, 
    Velocity,
    InputListener, 
    Controls, 
    BoxCollider,

    // JumpHeight,
    // Gravity,
    // Grounded
  ];

  for (let c of components) addComponent(world, c, eid);

  Speed.val[eid] = 400;
  BoxCollider.w[eid] = Size.w[eid];
  BoxCollider.h[eid] = Size.h[eid];
  BoxCollider.anchor.x[eid] = BoxCollider.anchor.y[eid] = 0.5;
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0;

  // Platformer physics
  // JumpHeight.val[eid] = 250;
  // Grounded.val[eid] = 0;
  // Gravity.val[eid] = 1500;

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

  const eid = gameObjectToActor(world, obstacleSprite);
  const components: Component[] = [BoxCollider, Static];

  for (let c of components) addComponent(world, c, eid);

  BoxCollider.w[eid] = Size.w[eid];
  BoxCollider.h[eid] = Size.h[eid];
  BoxCollider.anchor.x[eid] = anchor.x
  BoxCollider.anchor.y[eid] = anchor.y;
  BoxCollider.offset.x[eid] = BoxCollider.offset.y[eid] = 0;
  return eid;
};
