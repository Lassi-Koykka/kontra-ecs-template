import { defineQuery, hasComponent } from "bitecs"
import { Vector } from "kontra"
import { Animations, BoxCollider, Controls, InputListener, Transform, Speed, Static, Velocity, Physics2D, GameObjectComp } from "./components"
import { keyDown, keyPress } from "./input"
import { CollisionSide, W } from "./types"

export const movementQuery = defineQuery([Transform, Speed, Velocity, Controls])
export const inputListenerQuery = defineQuery([InputListener, Controls])
export const colliderQuery = defineQuery([BoxCollider, Transform])
export const gameObjectQuery = defineQuery([GameObjectComp, Transform])

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


const rectCollide = (a: Bounds, b:Bounds): CollisionSide  => {
  if(a.t > b.b || a.b < b.t || a.r < b.l || a.l > b.r) return false;

  if (a.t <= b.b && a.ot > b.ob) return "top"
  else if (a.r >= b.l && a.or < b.ol) return "right";
  else if (a.l <= b.r && a.ol > b.or) return "left"
  else if (a.b >= b.t && a.ob < b.ob) return "bottom";

  return true
}

export const getColliderBounds = (eid: number): Bounds => {
    let pos = Vector(Transform.x[eid], Transform.y[eid])
    let oldPos = Vector(Transform.ox[eid], Transform.oy[eid])
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

        go.x = Transform.x[eid]
        go.y = Transform.y[eid]
        go.width = Transform.w[eid]
        go.height = Transform.h[eid]

        const hasVel = hasComponent(world, Velocity, eid)
        const hasAnimations = hasComponent(world, Animations, eid)
        const hasPhysics = hasComponent(world, Physics2D, eid)

        if(hasVel) {
          const xVel = Velocity.x[eid]
          if(xVel > 0) go.scaleX = 1
          else if(xVel < 0) go.scaleX = -1

          if(!hasAnimations) return
          //Update animations
          if(hasPhysics && Physics2D.grounded[eid] === 0) {
            go.playAnimation("air")
          }else if(Math.abs(xVel) < 0.1) {
            go.playAnimation("idle")
          } else {
            go.playAnimation("walk")
          }
        }
}


// --- SYSTEMS ---
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

    Controls.action1[eid] = Number(keyPress("ACTION1"));
    Controls.action2[eid] = Number(keyPress("ACTION1"));
    Controls.action3[eid] = Number(keyPress("ACTION1"));
    Controls.action4[eid] = Number(keyPress("ACTION1"));

  }
  return world
}

// Movement system
export const movementSystem = (world: W) => {
  const {delta} = world
  const entities = movementQuery(world)
  for (let eid of entities) {
      let pos = Vector(Transform.x[eid], Transform.y[eid])
      let vel = Vector(Velocity.x[eid], Velocity.y[eid])
      const hasPhysics = hasComponent(world, Physics2D, eid)
      const gravity = hasPhysics ? Physics2D.gravity[eid] : 0;
      const grounded = hasPhysics && Physics2D.grounded[eid] === 1;
      Transform.ox[eid] = pos.x
      Transform.oy[eid] = pos.y

      vel.x = Controls.dir.x[eid] * Speed.val[eid];

      if(gravity) {
        let g = gravity
        Transform.y[eid] = pos.y + gravity * delta
        if(grounded && Controls.action1[eid]) {
            const jumpHeight = Physics2D.jumpHeight[eid]
            vel.y = -Math.sqrt(jumpHeight * -2 * -g); 
        }
        if(vel.y > 0)  g *= 1.5
        vel.y = vel.y + gravity * delta

      } else {
        vel.y = Controls.dir.y[eid] * Speed.val[eid]
      }
      Velocity.x[eid] = vel.x
      Velocity.y[eid] = vel.y

      Transform.x[eid] = pos.x + vel.x * delta;
      Transform.y[eid] = pos.y + vel.y * delta;


      updateGameObject(world, eid)
  }
  return world
}


// Naive collision system
export const collisionSystem = (world: W) => {

  const entities = colliderQuery(world)

  for(let i = 0;  i < entities.length; i++) {

    const eidA = entities[i]
    const a = getColliderBounds(eidA)
    const hasPhysics = hasComponent(world, Physics2D, eidA)
    let grounded = false

    for(let eidB of entities.slice(i + 1)) {

      const b = getColliderBounds(eidB);
      let collisionSide = rectCollide(a, b)

      if(!collisionSide) {
        delete world.collisions[eidA + "-" + eidB];
        continue;
      };

      if(collisionSide !== true) {
        world.collisions[eidA + "-" + eidB] = collisionSide
      } else {
        collisionSide = world.collisions[eidA + "-" + eidB] 
      }

      const isStatic = hasComponent(world, Static, eidB)
      if(isStatic) {
        if(collisionSide === "bottom") {
          Transform.y[eidA] -= Math.abs(b.t - a.b) + 0.1
          grounded = true
        } else if (collisionSide === "top") {
          Transform.y[eidA] += Math.abs(a.t - b.b) + 0.1
          Velocity.y[eidA] = 0
        } else if (collisionSide === "right") {
          Transform.x[eidA] -= Math.abs(a.r - b.l) + 0.1
        } else if (collisionSide === "left") {
          Transform.x[eidA] += Math.abs(a.l - b.r) + 0.1
        }
      }

    }

    if(hasPhysics) {
      Physics2D.grounded[eidA] = Number(grounded);
      if(grounded) Velocity.y[eidA] = 2
    }
  }

  return world
}


export const updateGameObjects = (world: W) => {
    const entities = gameObjectQuery(world)
    for (const eid of entities) {
      const go = world.gameObjects[eid]
      if(!go) continue
      go.update()
      updateGameObject(world, eid);
    }
    return world
} 
