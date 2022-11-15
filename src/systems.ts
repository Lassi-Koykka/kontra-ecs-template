import { defineQuery } from "bitecs"
import { Vector } from "kontra"
import { BoxCollider, Controls, InputListener, Position, Size, Speed } from "./components"
import { keyDown, keyPress } from "./input"
import { W } from "./types"

export const movementQuery = defineQuery([Position, Speed, Controls])
export const inputListenerQuery = defineQuery([InputListener, Controls])
export const colliderQuery = defineQuery([BoxCollider, Position])

type Bounds = {
  l: number,
  r: number, 
  t: number, 
  b: number

  ol: number,
  or: number, 
  ot: number, 
  ob: number
}

type CollisionSide = null |  "left" | "right" | "top" | "bottom"

const rectCollide = (a: Bounds, b:Bounds): CollisionSide  => {
  if(a.t > b.b || a.b < b.t || a.r < b.l || a.l > b.r) return null;

  if (a.t <= b.b && a.ot > b.ob) return "top"
  else if (a.r >= b.l && a.or < b.ol) return "right";
  else if (a.l <= b.r && a.ol > b.or) return "left"
  else if (a.b >= b.t && a.ob < b.ob) return "bottom";

  return null
}

export const getColliderBounds = (eid: number): Bounds => {
    let pos = Vector(Position.x[eid], Position.y[eid])
    let oldPos = Vector(Position.ox[eid], Position.oy[eid])
    let offset = Vector(BoxCollider.offset.x[eid], BoxCollider.offset.y[eid])
    let anchor = Vector(BoxCollider.anchor.x[eid], BoxCollider.anchor.y[eid])

    let w = BoxCollider.w[eid]
    let h = BoxCollider.h[eid]

    const l = pos.x - Math.floor(w * (1 - anchor.x)) + offset.x
    const r = l + w
    const t = pos.y - Math.floor(h * (1 - anchor.y)) + offset.y
    const b = t + h

    const ol = oldPos.x - Math.floor(w * (1 - anchor.x)) + offset.x
    const or = ol + w
    const ot = oldPos.y - Math.floor(h * (1 - anchor.y)) + offset.y
    const ob = ot + h

    return {l ,r, t, b, ol, or, ot, ob}
}

const updateGameObject = (world: W, eid: number) => {
        const go = world.gameObjects[eid]
        if (!go) return;

        go.x = Position.x[eid]
        go.y = Position.y[eid]
        go.width = Size.w[eid]
        go.height = Size.h[eid]
}

// --- SYSTEMS ---
export const movementSystem = (world: W) => {
  const {delta} = world
  const entities = movementQuery(world)
  for (let eid of entities) {
      let pos = Vector(Position.x[eid], Position.y[eid])
      Position.ox[eid] = pos.x
      Position.oy[eid] = pos.y
      Position.x[eid] = pos.x + Controls.dir.x[eid] * Speed.val[eid] * delta;
      Position.y[eid] = pos.y + Controls.dir.y[eid] * Speed.val[eid] * delta;
      updateGameObject(world, eid)
  }
  return world
}

export const inputSystem = (world: W) => {
  const entities = inputListenerQuery(world)
  for (let eid of entities) {
    let dir = Vector(0, 0)
    // Static movement, no acceleration
    if (keyPress("UP") || (!keyDown("DOWN") && keyDown("UP"))) dir.y = -1;
    if (keyPress("DOWN") || (!keyDown("UP") && keyDown("DOWN"))) dir.y = 1;
    if (!keyDown("UP") && !keyDown("DOWN")) dir.y = 0;

    if (keyPress("LEFT") || (!keyDown("RIGHT") && keyDown("LEFT"))) dir.x = -1;
    if (keyPress("RIGHT") || (!keyDown("LEFT") && keyDown("RIGHT"))) dir.x = 1;
    if (!keyDown("LEFT") && !keyDown("RIGHT")) dir.x = 0;

    dir.normalize()
    Controls.dir.x[eid] = dir.x
    Controls.dir.y[eid] = dir.y
  }
  return world
}

// Naive collision system
export const collisionSystem = (world: W) => {

  const entities = colliderQuery(world)

  for(let i = 0;  i < entities.length; i++) {

    const eidA = entities[i]
    const a = getColliderBounds(eidA)

    for(let eidB of entities.slice(i + 1)) {

      const b = getColliderBounds(eidB);
      const collisionSide = rectCollide(a, b)
      if(!collisionSide) continue;

      console.log(collisionSide)

      if(collisionSide === "bottom") {
        Position.y[eidA] -= Math.abs(b.t - a.b) + 0.1
      } else if (collisionSide === "top") {
        Position.y[eidA] += Math.abs(a.t - b.b) + 0.1
      } else if (collisionSide === "right") {
        Position.x[eidA] -= Math.abs(a.r - b.l) + 0.1
      } else if (collisionSide === "left") {
        Position.x[eidA] += Math.abs(a.l - b.r) + 0.1
      }
      updateGameObject(world, eidA);
      updateGameObject(world, eidB);
    }
  }

  return world
}
